
import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerOrderForm } from "./CustomerOrderForm";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface AddVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  customers: Customer[];
  onVisitAdded: () => void;
}

export const AddVisitDialog = ({ 
  open, 
  onOpenChange, 
  date,
  customers,
  onVisitAdded 
}: AddVisitDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleOrderComplete = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const visitData = {
        user_id: session.session?.user.id,
        customer_id: selectedCustomer?.id,
        visit_day: format(new Date(), 'yyyy-MM-dd'),
        dan_obilaska: format(new Date(), 'yyyy-MM-dd'),
        visit_status: 'planned'
      };

      const { error } = await supabase
        .from('visit_plans')
        .insert([visitData]);

      if (error) throw error;

      toast.success("Poseta je uspešno dodata");
      onVisitAdded();
      onOpenChange(false);
      setSelectedCustomer(null);
      setSearchTerm("");
    } catch (error) {
      console.error("Error adding visit:", error);
      toast.error("Greška pri dodavanju posete");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Dodaj novu posetu za {date}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Pretraži kupce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          <ScrollArea className="h-[400px] rounded-md border p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className={`p-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <h3 className="text-sm font-medium">{customer.name}</h3>
                  <p className="text-xs text-gray-600">{customer.address}</p>
                  <p className="text-xs text-gray-600">{customer.city}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {selectedCustomer && (
            <div className="border-t pt-4">
              <CustomerOrderForm
                customer={selectedCustomer}
                onOrderComplete={handleOrderComplete}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
