import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CustomerSelect } from "../sales/CustomerSelect";
import { ProductSelect } from "../sales/ProductSelect";
import { Customer, OrderItem } from "@/types";
import { useSalesData } from "@/hooks/useSalesData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface AddVisitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVisitAdded?: () => void;
}

export const AddVisitDialog = ({ isOpen, onOpenChange, onVisitAdded }: AddVisitDialogProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { customers, products, isLoading } = useSalesData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error("Molimo izaberite kupca");
      return;
    }

    try {
      setIsSubmitting(true);
      const today = format(new Date(), "yyyy-MM-dd");
      
      const { error: visitError } = await supabase
        .from('visit_plans')
        .insert({
          customer_id: selectedCustomer.id,
          dan_obilaska: today,
          notes: orderItems.length > 0 ? `Planirana prodaja: ${orderItems.length} proizvoda` : undefined
        });

      if (visitError) throw visitError;

      if (orderItems.length > 0) {
        // Create sales records if products were selected
        const { error: salesError } = await supabase
          .from('sales')
          .insert({
            customer_id: selectedCustomer.id,
            items: orderItems,
            total: orderItems.reduce((sum, item) => {
              const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
              return sum + (item.product.Cena * item.quantity * unitSize);
            }, 0),
            payment_type: 'invoice',
            date: new Date().toISOString()
          });

        if (salesError) throw salesError;
      }

      toast.success("Poseta uspešno dodata");
      onVisitAdded?.();
      onOpenChange(false);
      setSelectedCustomer(null);
      setCustomerSearch("");
      setOrderItems([]);
    } catch (error) {
      console.error("Error adding visit:", error);
      toast.error("Greška pri dodavanju posete");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj posetu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Dodaj novu posetu za {format(new Date(), "dd.MM.yyyy.")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {isLoading ? (
            <div>Učitavanje...</div>
          ) : (
            <>
              <CustomerSelect
                customers={customers}
                customerSearch={customerSearch}
                onCustomerSearchChange={setCustomerSearch}
                onCustomerSelect={handleCustomerSelect}
              />

              {selectedCustomer && (
                <ProductSelect
                  products={products}
                  orderItems={orderItems}
                  selectedCustomer={selectedCustomer}
                  onOrderItemsChange={setOrderItems}
                />
              )}

              <Button 
                onClick={handleSubmit}
                disabled={!selectedCustomer || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Čuvanje..." : "Sačuvaj posetu"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};