
import React from "react";
import { Customer } from "@/types";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface CustomerListItemProps {
  customer: Customer;
  isCompleted: boolean;
  isSelected: boolean;
  onClick: (customer: Customer) => void;
}

export const CustomerListItem = ({ 
  customer, 
  isCompleted, 
  isSelected, 
  onClick 
}: CustomerListItemProps) => {
  return (
    <Card
      className={`p-1.5 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
        isCompleted ? 'bg-green-100' : ''
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onClick(customer)}
    >
      <div className="flex justify-between items-start">
        <div className="text-left w-full">
          <h3 className="text-xs font-medium">{customer.name}</h3>
          <p className="text-[10px] text-gray-600">{customer.address}</p>
          <p className="text-[10px] text-gray-600">{customer.city}</p>
          {customer.phone && (
            <p className="text-[10px] text-gray-600">{customer.phone}</p>
          )}
        </div>
        {isCompleted && (
          <Check className="text-green-500 h-3 w-3 flex-shrink-0 ml-1" />
        )}
      </div>
    </Card>
  );
};
