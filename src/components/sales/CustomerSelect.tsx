import { Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { OrderHistory } from "./OrderHistory";
import { useState, useCallback, useMemo, useEffect } from "react";
import { CustomerSearchResults } from "./CustomerSearchResults";
import { HistoryButton } from "./HistoryButton";
import { CustomerDropdown } from "./CustomerDropdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CustomerSelectProps {
  customers: Customer[];
  customerSearch: string;
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerSelect = ({
  customers,
  customerSearch,
  onCustomerSearchChange,
  onCustomerSelect,
}: CustomerSelectProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  console.log("Total customers available:", customers?.length || 0);
  console.log("Current search term:", customerSearch);

  // Subscribe to real-time updates for customers table
  useEffect(() => {
    const channel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Customer change detected:', payload);
          // Refresh the page to show the new customer
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!customers || !customerSearch) return [];
    
    try {
      const searchTerm = customerSearch.toLowerCase().trim();
      if (!searchTerm) return [];

      // Simple search that matches any part of the customer data
      return customers.filter((customer) => {
        if (!customer) return false;
        
        const searchableFields = [
          customer.name,
          customer.group_name,
          customer.city,
          customer.address,
          customer.naselje
        ].map(field => (field || '').toLowerCase());

        // Return true if any field contains the search term
        return searchableFields.some(field => field.includes(searchTerm));
      });
    } catch (error) {
      console.error("Error filtering customers:", error);
      toast.error("Greška pri filtriranju kupaca");
      return [];
    }
  }, [customers, customerSearch]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    if (!customer?.name) {
      console.error("Invalid customer selected");
      return;
    }

    console.log("Selected customer:", customer.name);
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
    onCustomerSearchChange(customer.name);
  }, [onCustomerSelect, onCustomerSearchChange]);

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-medium">Izbor kupca</label>
      <div className="flex gap-2 items-start w-full">
        <div className="relative flex-1 min-w-0">
          <Input
            placeholder="Pretraži kupca po nazivu, grupi, gradu ili adresi..."
            value={customerSearch}
            onChange={(e) => onCustomerSearchChange(e.target.value)}
            className="w-full"
          />
          {customerSearch && 
           !customers.find(c => c.name === customerSearch) && 
           filteredCustomers.length > 0 && (
            <CustomerSearchResults 
              customers={filteredCustomers}
              onCustomerSelect={handleCustomerSelect}
            />
          )}
        </div>
        {selectedCustomer && (
          <div className="flex items-start">
            <HistoryButton onClick={() => setShowHistory(true)} />
          </div>
        )}
        <CustomerDropdown 
          customers={customers}
          onCustomerSelect={handleCustomerSelect}
        />
      </div>
      {showHistory && selectedCustomer && (
        <OrderHistory 
          customer={selectedCustomer} 
          open={showHistory} 
          onOpenChange={setShowHistory}
        />
      )}
    </div>
  );
};