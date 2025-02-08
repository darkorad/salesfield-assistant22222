
import { Customer } from "@/types";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerOrderForm } from "./CustomerOrderForm";

interface DayScheduleProps {
  day: string;
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const DaySchedule = ({ day, customers, onCustomerSelect }: DayScheduleProps) => {
  const [completedCustomers, setCompletedCustomers] = useState<Set<string>>(new Set());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const loadCompletedCustomers = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: sales } = await supabase
        .from('sales')
        .select('darko_customer_id')
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString());

      if (sales) {
        const completedIds = new Set(sales.map(sale => sale.darko_customer_id));
        setCompletedCustomers(completedIds);
      }
    };

    loadCompletedCustomers();
  }, []);

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomerId(selectedCustomerId === customer.id ? null : customer.id);
    onCustomerSelect(customer);
  };

  const markAsCompleted = (customerId: string) => {
    setCompletedCustomers(prev => {
      const newSet = new Set(prev);
      newSet.add(customerId);
      return newSet;
    });
    setSelectedCustomerId(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {customers.map((customer) => (
        <div key={customer.id}>
          <Card
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
          {selectedCustomerId === customer.id && (
            <div className="mt-1">
              <CustomerOrderForm 
                customer={customer} 
                onOrderComplete={() => markAsCompleted(customer.id)} 
              />
            </div>
          )}
        </div>
      ))}
      {customers.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-2 text-xs">
          Nema planiranih poseta za ovaj dan
        </div>
      )}
    </div>
  );
};
