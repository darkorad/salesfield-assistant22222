import { Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { OrderHistory } from "./OrderHistory";
import { useState, useCallback, useMemo } from "react";
import { CustomerSearchResults } from "./CustomerSearchResults";
import { HistoryButton } from "./HistoryButton";
import { CustomerDropdown } from "./CustomerDropdown";
import { toast } from "sonner";

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

  console.log("Available customers:", customers?.length || 0);
  console.log("Current search term:", customerSearch);
  console.log("Sample customers:", customers?.slice(0, 3).map(c => ({
    name: c.name,
    group: c.group_name,
    city: c.city
  })));

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    
    try {
      const searchTerm = customerSearch.toLowerCase().trim();
      if (!searchTerm) return [];

      const filtered = customers.filter((customer) => {
        if (!customer) return false;
        
        // Split search term into words for more flexible matching
        const searchWords = searchTerm.split(/\s+/);
        
        // Check if all search words match any of the fields
        return searchWords.every(word => {
          const nameMatch = customer.name?.toLowerCase().includes(word);
          const groupMatch = customer.group_name?.toLowerCase().includes(word);
          const addressMatch = customer.address?.toLowerCase().includes(word);
          const cityMatch = customer.city?.toLowerCase().includes(word);
          const naseljeMatch = customer.naselje?.toLowerCase().includes(word);
          
          return nameMatch || groupMatch || addressMatch || cityMatch || naseljeMatch;
        });
      });

      console.log("Filtered customers:", filtered.length);
      console.log("First few filtered customers:", filtered.slice(0, 5).map(c => ({
        name: c.name,
        group: c.group_name,
        city: c.city
      })));
      
      return filtered;
    } catch (error) {
      console.error("Error filtering customers:", error);
      toast.error("Greška pri filtriranju kupaca");
      return [];
    }
  }, [customers, customerSearch]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    if (!customer) {
      console.error("Invalid customer selected");
      return;
    }

    console.log("Selected customer:", customer.name, "Group:", customer.group_name, "City:", customer.city);
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