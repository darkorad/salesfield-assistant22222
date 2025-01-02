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

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
    onCustomerSearchChange(customer.name);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Izbor kupca</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
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
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">Istorija</span>
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