
import { useState } from "react";
import { Customer, Product, OrderItem } from "@/types";
import { Card } from "@/components/ui/card";
import { ProductSelect } from "../sales/ProductSelect";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSalesData } from "@/hooks/useSalesData";

interface CustomerOrderFormProps {
  customer: Customer;
  onOrderComplete: () => void;
}

export const CustomerOrderForm = ({ customer, onOrderComplete }: CustomerOrderFormProps) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { products } = useSalesData();

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      toast.error("Dodajte bar jedan proizvod");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const total = orderItems.reduce((sum, item) => {
        const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
        return sum + (item.product.Cena * item.quantity * unitSize);
      }, 0);

      const orderData = {
        user_id: session.session.user.id,
        customer_id: customer.id,
        items: orderItems,
        total,
        payment_type: 'invoice',
        date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('sales')
        .insert([orderData]);

      if (error) throw error;

      toast.success("Porudžbina je uspešno poslata!");
      onOrderComplete();
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Greška pri slanju porudžbine");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-3">
      <h3 className="text-sm font-medium mb-2">Nova porudžbina - {customer.name}</h3>
      
      <ProductSelect
        products={products}
        orderItems={orderItems}
        selectedCustomer={customer}
        onOrderItemsChange={setOrderItems}
      />

      <div className="mt-3">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || orderItems.length === 0}
          className="w-full text-sm py-1"
        >
          {isSubmitting ? "Slanje..." : "Pošalji porudžbinu"}
        </Button>
      </div>
    </Card>
  );
};
