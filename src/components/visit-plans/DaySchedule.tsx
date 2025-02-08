
import { Customer } from "@/types";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";

interface DayScheduleProps {
  day: string;
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const DaySchedule = ({ day, customers, onCustomerSelect }: DayScheduleProps) => {
  const [completedCustomers, setCompletedCustomers] = useState<Set<string>>(new Set());

  const handleCustomerClick = (customer: Customer) => {
    onCustomerSelect(customer);
    markAsCompleted(customer.id);
  };

  const markAsCompleted = (customerId: string) => {
    setCompletedCustomers(prev => {
      const newSet = new Set(prev);
      newSet.add(customerId);
      return newSet;
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {customers.map((customer) => (
        <Card
          key={customer.id}
          className={`p-1.5 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
            completedCustomers.has(customer.id) ? 'bg-green-100' : ''
          }`}
          onClick={() => handleCustomerClick(customer)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-medium">{customer.name}</h3>
              <p className="text-[10px] text-gray-600">{customer.address}</p>
              <p className="text-[10px] text-gray-600">{customer.city}</p>
              {customer.phone && (
                <p className="text-[10px] text-gray-600">{customer.phone}</p>
              )}
            </div>
            {completedCustomers.has(customer.id) && (
              <Check className="text-green-500 h-3 w-3" />
            )}
          </div>
        </Card>
      ))}
      {customers.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-2 text-xs">
          Nema planiranih poseta za ovaj dan
        </div>
      )}
    </div>
  );
};
