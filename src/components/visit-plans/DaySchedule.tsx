
import React, { useState, useEffect, useRef } from "react";
import { Customer } from "@/types";
import { Card } from "@/components/ui/card";
import { Check, History, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerOrderForm } from "./CustomerOrderForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OrderHistory } from "../sales/OrderHistory";

interface DayScheduleProps {
  day: string;
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const DaySchedule = ({ day, customers, onCustomerSelect }: DayScheduleProps) => {
  const [completedCustomers, setCompletedCustomers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const orderFormRef = useRef<HTMLDivElement>(null);

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

      // First check completed visits
      const { data: completedVisits, error: visitsError } = await supabase
        .from('visit_plans')
        .select('customer_id')
        .eq('user_id', session.user.id)
        .eq('completed', true)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (visitsError) {
        console.error("Error loading completed visits:", visitsError);
        return;
      }

      // Then check sales
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('darko_customer_id')
        .eq('user_id', session.user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString());

      if (salesError) {
        console.error("Error loading sales:", salesError);
        return;
      }

      // Combine both completed visits and sales
      const completedIds = new Set([
        ...(completedVisits || []).map(visit => visit.customer_id),
        ...(sales || []).map(sale => sale.darko_customer_id)
      ]);

      setCompletedCustomers(completedIds);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Greška pri učitavanju podataka");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompletedCustomers();
  }, []);

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
    
    // Scroll to order form after a short delay to ensure it's rendered
    setTimeout(() => {
      orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {customers.map((customer) => (
          <div key={customer.id}>
            <Card
              className={`p-1.5 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                completedCustomers.has(customer.id) ? 'bg-green-100' : ''
              } ${selectedCustomer?.id === customer.id ? 'ring-2 ring-primary' : ''}`}
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
          </div>
        ))}
        {customers.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-2 text-xs">
            Nema planiranih poseta za ovaj dan
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div ref={orderFormRef} className="relative">
          <div className="absolute right-2 top-2 z-10 flex gap-2">
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowHistory(true)}
              >
                <History className="h-4 w-4" />
              </Button>
              <span className="text-[10px] text-gray-600 mt-1">Istorija</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSelectedCustomer(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CustomerOrderForm 
            customer={selectedCustomer}
            onOrderComplete={() => {
              setSelectedCustomer(null);
              loadCompletedCustomers();
            }}
          />
        </div>
      )}

      {selectedCustomer && (
        <OrderHistory 
          customer={selectedCustomer}
          open={showHistory}
          onOpenChange={setShowHistory}
        />
      )}
    </div>
  );
};
