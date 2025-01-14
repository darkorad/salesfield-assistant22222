import { Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { OrderHistory } from "./OrderHistory";
import { useState, useCallback, useMemo } from "react";
import { CustomerSearchResults } from "./CustomerSearchResults";
import { HistoryButton } from "./HistoryButton";
import { CustomerDropdown } from "./CustomerDropdown";
import { toast } from "sonner";
import { useCustomerSync } from "./hooks/useCustomerSync";
import { useSalesData } from "@/hooks/useSalesData";

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
  const { refetch } = useSalesData();

  console.log("Total customers available:", customers?.length || 0);
  console.log("Current search term:", customerSearch);

  // Use the custom hook for real-time updates
  useCustomerSync(() => {
    refetch();
  });

  const filteredCustomers = useMemo(() => {
    if (!customers || !customerSearch) return [];
    
    try {
      const searchTerm = customerSearch.toLowerCase().trim();
      if (!searchTerm) return [];

      return customers.filter((customer) => {
        if (!customer) return false;
        
        const searchableFields = [
          customer.name,
          customer.group_name,
          customer.city,
          customer.address,
          customer.naselje
        ].map(field => (field || '').toLowerCase());

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