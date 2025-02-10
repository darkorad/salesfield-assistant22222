
import { Customer } from "@/types";
import { Card } from "@/components/ui/card";
import { Check, History } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerOrderForm } from "./CustomerOrderForm";
import { CustomerPurchaseHistory } from "./CustomerPurchaseHistory";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DayScheduleProps {
  day: string;
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const DaySchedule = ({ day, customers, onCustomerSelect }: DayScheduleProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [visitStatuses, setVisitStatuses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVisitStatuses = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Niste prijavljeni");
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: visits, error } = await supabase
          .from('visit_plans')
          .select('customer_id, visit_status')
          .eq('user_id', session.user.id)
          .eq('visit_day', today.toISOString().split('T')[0]);

        if (error) {
          console.error("Error loading visits:", error);
          toast.error("Greška pri učitavanju poseta");
          return;
        }

        if (visits) {
          const statuses: Record<string, string> = {};
          visits.forEach(visit => {
            statuses[visit.customer_id] = visit.visit_status;
          });
          setVisitStatuses(statuses);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Greška pri učitavanju podataka");
      } finally {
        setIsLoading(false);
      }
    };

    loadVisitStatuses();
  }, []);

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomerId(selectedCustomerId === customer.id ? null : customer.id);
    onCustomerSelect(customer);
  };

  const markAsCompleted = async (customerId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { error } = await supabase
        .from('visit_plans')
        .update({ visit_status: 'completed' })
        .eq('customer_id', customerId)
        .eq('user_id', session.user.id)
        .eq('visit_day', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      setVisitStatuses(prev => ({
        ...prev,
        [customerId]: 'completed'
      }));
      setSelectedCustomerId(null);

    } catch (error) {
      console.error("Error updating visit status:", error);
      toast.error("Greška pri ažuriranju statusa posete");
    }
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
              visitStatuses[customer.id] === 'completed' ? 'bg-green-100' : ''
            }`}
          >
            <div className="flex justify-between items-start p-2">
              <div className="flex-1" onClick={() => handleCustomerClick(customer)}>
                <h3 className="text-xs font-medium">{customer.name}</h3>
                <p className="text-[10px] text-gray-600">{customer.address}</p>
                <p className="text-[10px] text-gray-600">{customer.city}</p>
                {customer.phone && (
                  <p className="text-[10px] text-gray-600">{customer.phone}</p>
                )}
              </div>
              <div className="flex items-start gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCustomerForHistory(customer);
                  }}
                >
                  <History className="h-4 w-4" />
                </Button>
                {visitStatuses[customer.id] === 'completed' && (
                  <Check className="text-green-500 h-3 w-3" />
                )}
              </div>
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
      {selectedCustomerForHistory && (
        <CustomerPurchaseHistory
          customer={selectedCustomerForHistory}
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelectedCustomerForHistory(null);
          }}
        />
      )}
    </div>
  );
};
