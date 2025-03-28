
import React from "react";
import { Customer } from "@/types";
import { CustomerListItem } from "./CustomerListItem";

interface CustomerGridProps {
  customers: Customer[];
  completedCustomers: Set<string>;
  selectedCustomerId: string | null;
  searchTerm: string;
  onCustomerClick: (customer: Customer) => void;
}

export const CustomerGrid = ({ 
  customers, 
  completedCustomers, 
  selectedCustomerId,
  searchTerm,
  onCustomerClick 
}: CustomerGridProps) => {
  
  if (customers.length === 0) {
    return (
      <div className="col-span-full text-center text-gray-500 py-2 text-xs">
        {searchTerm 
          ? `Nema rezultata za "${searchTerm}"`
          : "Nema planiranih poseta za ovaj dan"
        }
      </div>
    );
  }

  // We're not using this component's grid layout anymore, as we've moved
  // the grid layout to the DaySchedule component for better control
  // of the order form positioning
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 gap-1.5">
      {customers.map((customer) => (
        <div key={customer.id}>
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
