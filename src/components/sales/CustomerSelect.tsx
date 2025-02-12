
import { Customer } from "@/types";
import { useState, useCallback, useEffect } from "react";
import { CustomerSearchResults } from "./CustomerSearchResults";
import { HistoryButton } from "./HistoryButton";
import { CustomerDropdown } from "./CustomerDropdown";
import { CustomerSearchInput } from "./CustomerSearchInput";
import { useCustomerSync } from "./hooks/useCustomerSync";
import { useCustomerFilter } from "./hooks/useCustomerFilter";
import { useSalesData } from "@/hooks/useSalesData";
import { OrderHistory } from "./OrderHistory";

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

  console.log("CustomerSelect: Current customer search:", customerSearch);

  useCustomerSync(() => {
    refetch();
  });

  const filteredCustomers = useCustomerFilter(customers, customerSearch);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    if (!customer?.name) {
      console.error("Invalid customer selected");
      return;
    }

    console.log("CustomerSelect: Selected customer:", customer.name);
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
  }, [onCustomerSelect]);

  // Update local state when customerSearch changes from parent
  useEffect(() => {
    if (customerSearch) {
      const matchingCustomer = customers.find(c => c.name === customerSearch);
      if (matchingCustomer && (!selectedCustomer || selectedCustomer.name !== customerSearch)) {
        console.log("Found matching customer for search:", matchingCustomer.name);
        setSelectedCustomer(matchingCustomer);
        onCustomerSelect(matchingCustomer);
      }
    }
  }, [customerSearch, customers, selectedCustomer, onCustomerSelect]);

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
