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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  console.log("Available customers:", customers);
  console.log("Current customer search:", customerSearch);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  console.log("Filtered customers:", filteredCustomers);

  const handleCustomerSelect = (customer: Customer) => {
    console.log("Selected customer:", customer);
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
    onCustomerSearchChange(customer.name);
  };

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-medium">Izbor kupca</label>
      <div className="flex gap-2 items-start w-full">
        <div className="relative flex-1 min-w-0">
          <Input
            placeholder="Pretraži kupca..."
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