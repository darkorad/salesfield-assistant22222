
import React, { useState, useEffect } from "react";
import { Customer } from "@/types";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerOrderForm } from "./CustomerOrderForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DayScheduleProps {
  day: string;
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const DaySchedule = ({ day, customers, onCustomerSelect }: DayScheduleProps) => {
  const [completedCustomers, setCompletedCustomers] = useState<Set<string>>(new Set());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCompletedCustomers = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Niste prijavljeni");
          return;
        }

        // Get today's date at start of day in local timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get tomorrow's date at start of day in local timezone
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: sales, error } = await supabase
          .from('sales')
          .select('darko_customer_id')
          .eq('user_id', session.user.id)
          .gte('date', today.toISOString())
          .lt('date', tomorrow.toISOString());

        if (error) {
          console.error("Error loading sales:", error);
          toast.error("Greška pri učitavanju prodaje");
          return;
        }

        if (sales) {
          const completedIds = new Set(sales.map(sale => sale.darko_customer_id));
          setCompletedCustomers(completedIds);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Greška pri učitavanju podataka");
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletedCustomers();
  }, []);

  const handleCustomerClick = (customer: Customer) => {
    navigate('/sales', { state: { selectedCustomer: customer } });
  };

  const markAsCompleted = (customerId: string) => {
    setCompletedCustomers(prev => {
      const newSet = new Set(prev);
      newSet.add(customerId);
      return newSet;
    });
    setSelectedCustomerId(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        <div className="col-span-full text-center text-gray-500 py-2 text-xs">
          Učitavanje...
        </div>
      </div>
    );
  }

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
