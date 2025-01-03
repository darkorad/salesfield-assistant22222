import { Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { OrderHistory } from "./OrderHistory";
import { useState } from "react";
import { CustomerSearchResults } from "./CustomerSearchResults";
import { HistoryButton } from "./HistoryButton";
import { CustomerDropdown } from "./CustomerDropdown";

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
  const [showHistory, setShowHistory] = useState(false);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSelect = (customer: Customer) => {
    console.log("Selecting customer in CustomerSelect:", customer); // Debug log
    onCustomerSelect(customer);
  };

  const selectedCustomer = customers.find(c => c.name === customerSearch);

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-medium">Izbor kupca</label>
      <div className="flex gap-2 items-start w-full">
        <div className="relative flex-1 min-w-0">
          <Input
            placeholder="Pretraži kupca..."
            value={customerSearch}
            onChange={(e) => onCustomerSearchChange(e.target.value)}
            className={`w-full ${selectedCustomer ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
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
        <div className="flex items-start gap-2">
          {selectedCustomer && (
            <HistoryButton onClick={() => setShowHistory(true)} />
          )}
          <CustomerDropdown 
            customers={customers}
            onCustomerSelect={handleCustomerSelect}
          />
        </div>
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