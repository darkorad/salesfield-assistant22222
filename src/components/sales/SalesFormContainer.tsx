import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "./OrderForm";
import { Customer, Product, OrderItem } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SalesFormContainerProps {
  customers: Customer[];
  products: Product[];
}

export const SalesFormContainer = ({ customers, products }: SalesFormContainerProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleSubmitOrder = async (paymentType: 'cash' | 'invoice') => {
    try {
      if (!selectedCustomer) {
        toast.error("Molimo izaberite kupca");
        return;
      }
      if (orderItems.length === 0) {
        toast.error("Molimo dodajte bar jedan proizvod");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const total = orderItems.reduce((sum, item) => {
        const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
        return sum + (item.product.Cena * item.quantity * unitSize);
      }, 0);

      const { data, error } = await supabase
        .from('sales')
        .insert([{
          user_id: session.user.id,
          customer_id: selectedCustomer.id,
          items: orderItems,
          total,
          payment_type: paymentType,
          date: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error("Error submitting order:", error);
        toast.error("Greška pri slanju porudžbine");
        return;
      }

      // Reset form
      setSelectedCustomer(null);
      setCustomerSearch("");
      setOrderItems([]);
      
      toast.success("Porudžbina je uspešno poslata!");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Greška pri slanju porudžbine");
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Nova porudžbina</CardTitle>
      </CardHeader>
      <CardContent>
        <OrderForm
          customers={customers}
          products={products}
          selectedCustomer={selectedCustomer}
          customerSearch={customerSearch}
          orderItems={orderItems}
          onCustomerSearchChange={setCustomerSearch}
          onCustomerSelect={handleCustomerSelect}
          onOrderItemsChange={setOrderItems}
          onSubmit={handleSubmitOrder}
        />
      </CardContent>
    </Card>
  );
};