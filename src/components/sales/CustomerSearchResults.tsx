import { Customer } from "@/types";

interface CustomerSearchResultsProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerSearchResults = ({ customers, onCustomerSelect }: CustomerSearchResultsProps) => {
  if (customers.length === 0) return null;

  return (
    <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
      {customers.map((customer) => (
        <div
          key={customer.id}
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
          onClick={() => onCustomerSelect(customer)}
        >
          <div className="font-medium">{customer.name}</div>
          {customer.group_name && (
            <div className="text-sm text-blue-600">
              Grupa: {customer.group_name}
            </div>
          )}
          <div className="text-sm text-gray-500">
            {customer.address}, {customer.naselje && `${customer.naselje},`} {customer.city}
          </div>
          {customer.email && (
            <div className="text-sm text-gray-500">{customer.email}</div>
          )}
        </div>
      ))}
    </div>
  );
};