
import { Customer } from "@/types";
import { CustomerSearchInput } from "@/components/sales/CustomerSearchInput";
import { CustomerSearchResults } from "@/components/sales/CustomerSearchResults";
import { useCustomerSearch } from "@/components/visit-plans/hooks/useCustomerSearch";

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
  
  // Use the existing useCustomerSearch hook for better search functionality
  const filteredCustomers = useCustomerSearch(customers, customerSearch);

  return (
    <div>
      <label className="text-sm font-medium">Kupac (opcionalno)</label>
      <div className="relative">
        <CustomerSearchInput
          value={customerSearch}
          onChange={onCustomerSearchChange}
        />
        {customerSearch && !selectedCustomer && filteredCustomers.length > 0 && (
          <CustomerSearchResults
            customers={filteredCustomers}
            onCustomerSelect={onCustomerSelect}
          />
        )}
      </div>
    </div>
  );
};
