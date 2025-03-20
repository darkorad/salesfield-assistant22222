
import React from "react";
import { Customer } from "@/types";
import { CustomerListItem } from "./CustomerListItem";

interface CustomerListProps {
  customers: Customer[];
  completedCustomers: Set<string>;
  selectedCustomerId: string | null;
  onCustomerClick: (customer: Customer) => void;
}

export const CustomerList = ({
  customers,
  completedCustomers,
  selectedCustomerId,
  onCustomerClick,
}: CustomerListProps) => {
  if (customers.length === 0) {
    return (
      <div className="col-span-full text-center text-gray-500 py-2 text-xs">
        Nema kupaca koji zadovoljavaju kriterijume pretrage
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <div key={customer.id} className="space-y-2">
          <CustomerListItem
            customer={customer}
            isCompleted={completedCustomers.has(customer.id)}
            isSelected={customer.id === selectedCustomerId}
            onClick={onCustomerClick}
          />
        </div>
      ))}
    </div>
  );
};
