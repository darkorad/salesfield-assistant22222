import { useState } from "react";
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast.error("Niste prijavljeni");
        return;
      }

      if (!selectedCustomer) {
        toast.error("Molimo izaberite kupca");
        return;
      }
      if (orderItems.length === 0) {
        toast.error("Molimo dodajte bar jedan proizvod");
        return;
      }

      const total = orderItems.reduce((sum, item) => {
        const unitSize = parseFloat(item.product.unit) || 1;
        return sum + (item.product.price * item.quantity * unitSize);
      }, 0);

      const newOrder = {
        id: crypto.randomUUID(),
        customer: selectedCustomer,
        items: orderItems,
        total,
        date: new Date().toISOString(),
        userId: session.user.id,
        paymentType,
      };

      const existingSales = localStorage.getItem("sales");
      const sales = existingSales ? JSON.parse(existingSales) : [];
      sales.push(newOrder);
      localStorage.setItem("sales", JSON.stringify(sales));

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
    <Card>
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