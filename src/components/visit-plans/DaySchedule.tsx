
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {customers.map((customer) => (
        <Card
          key={customer.id}
          className={`p-2 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
            completedCustomers.has(customer.id) ? 'bg-green-100' : ''
          }`}
          onClick={() => handleCustomerClick(customer)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium">{customer.name}</h3>
              <p className="text-xs text-gray-600">{customer.address}</p>
              <p className="text-xs text-gray-600">{customer.city}</p>
              {customer.phone && (
                <p className="text-xs text-gray-600">{customer.phone}</p>
              )}
            </div>
            {completedCustomers.has(customer.id) && (
              <Check className="text-green-500 h-4 w-4" />
            )}
          </div>
        </Card>
      ))}
      {customers.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-4 text-sm">
          Nema planiranih poseta za ovaj dan
        </div>
      )}
    </div>
  );
};
