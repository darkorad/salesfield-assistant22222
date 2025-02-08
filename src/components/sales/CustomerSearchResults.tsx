
import { Customer } from "@/types";

interface CustomerSearchResultsProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerSearchResults = ({ customers, onCustomerSelect }: CustomerSearchResultsProps) => {
  if (customers.length === 0) {
    return (
      <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 p-2">
        <p className="text-sm text-gray-500">Nema rezultata</p>
      </div>
    );
  }

  return (
    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
      {customers.map((customer) => (
        <button
          key={customer.id}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
          onClick={() => onCustomerSelect(customer)}
        >
          <div className="text-sm font-medium">{customer.name}</div>
          <div className="text-xs text-gray-500">{customer.address}</div>
        </button>
      ))}
    </div>
  );
};
