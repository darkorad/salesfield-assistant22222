import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "./OrderForm";
import { Customer, Product, OrderItem } from "@/types";
import { useSplitOrders } from "./hooks/useSplitOrders";

interface SalesFormContainerProps {
  customers: Customer[];
  products: Product[];
}

export const SalesFormContainer = ({ customers, products }: SalesFormContainerProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const { handleSubmitOrder, isSubmitting } = useSplitOrders(selectedCustomer);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleSubmit = async () => {
    const success = await handleSubmitOrder(orderItems);
    if (success) {
      setSelectedCustomer(null);
      setCustomerSearch("");
      setOrderItems([]);
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
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
};