import { Customer } from "@/types";
import { CustomerSearchInput } from "@/components/sales/CustomerSearchInput";
import { CustomerSearchResults } from "@/components/sales/CustomerSearchResults";

interface CustomerSelectionProps {
  selectedGroup: { id: string; name: string } | null;
  customers: Customer[];
  customerSearch: string;
  selectedCustomer: Customer | null;
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerSelection = ({
  selectedGroup,
  customers,
  customerSearch,
  selectedCustomer,
  onCustomerSearchChange,
  onCustomerSelect,
}: CustomerSelectionProps) => {
  if (!selectedGroup) return null;

  return (
    <div>
      <label className="text-sm font-medium">Kupac (opcionalno)</label>
      <div className="relative">
        <CustomerSearchInput
          value={customerSearch}
          onChange={onCustomerSearchChange}
        />
        {customerSearch && !selectedCustomer && (
          <CustomerSearchResults
            customers={customers.filter(c => 
              c.name.toLowerCase().includes(customerSearch.toLowerCase())
            )}
            onCustomerSelect={onCustomerSelect}
          />
        )}
      </div>
    </div>
  );
};