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
  };

  const markAsCompleted = (customerId: string) => {
    setCompletedCustomers(prev => {
      const newSet = new Set(prev);
      newSet.add(customerId);
      return newSet;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <Card
          key={customer.id}
          className={`p-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
            completedCustomers.has(customer.id) ? 'bg-green-100' : ''
          }`}
          onClick={() => handleCustomerClick(customer)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{customer.name}</h3>
              <p className="text-sm text-gray-600">{customer.address}</p>
              <p className="text-sm text-gray-600">{customer.city}</p>
            </div>
            {completedCustomers.has(customer.id) && (
              <Check className="text-green-500 h-5 w-5" />
            )}
          </div>
        </Card>
      ))}
      {customers.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-8">
          Nema planiranih poseta za ovaj dan
        </div>
      )}
    </div>
  );
};