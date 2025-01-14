import { Customer } from "@/types";
import { useState, useCallback } from "react";
import { CustomerSearchResults } from "./CustomerSearchResults";
import { HistoryButton } from "./HistoryButton";
import { CustomerDropdown } from "./CustomerDropdown";
import { CustomerSearchInput } from "./CustomerSearchInput";
import { useCustomerSync } from "./hooks/useCustomerSync";
import { useCustomerFilter } from "./hooks/useCustomerFilter";
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

  useCustomerSync(() => {
    refetch();
  });

  const filteredCustomers = useCustomerFilter(customers, customerSearch);

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
          <CustomerSearchInput 
            value={customerSearch}
            onChange={onCustomerSearchChange}
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