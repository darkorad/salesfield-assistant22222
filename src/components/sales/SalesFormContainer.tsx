import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "./OrderForm";
import { Customer, Product, OrderItem } from "@/types";
import { toast } from "sonner";

interface SalesFormContainerProps {
  customers: Customer[];
  products: Product[];
}

export const SalesFormContainer = ({ customers, products }: SalesFormContainerProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  console.log("SalesFormContainer - Received customers:", customers);

  useEffect(() => {
    console.log("SalesFormContainer - Selected customer:", selectedCustomer);
  }, [selectedCustomer]);

  const handleCustomerSelect = (customer: Customer) => {
    console.log("SalesFormContainer - Handling customer selection:", customer);
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

      const total = orderItems.reduce((sum, item) => {
        const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
        return sum + (item.product.Cena * item.quantity * unitSize);
      }, 0);

      const newOrder = {
        id: crypto.randomUUID(),
        customer: selectedCustomer,
        items: orderItems,
        total,
        date: new Date().toISOString(),
        paymentType,
      };

      // Get existing sales from localStorage
      const existingSales = localStorage.getItem("sales");
      const sales = existingSales ? JSON.parse(existingSales) : [];
      
      // Add new order
      sales.push(newOrder);
      
      // Save back to localStorage
      localStorage.setItem("sales", JSON.stringify(sales));

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