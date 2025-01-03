import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "./OrderForm";
import { Customer, Product } from "@/types";
import { useSplitOrders } from "./hooks/useSplitOrders";
import { useOrderState } from "@/hooks/useOrderState";
import { OrderSummary } from "./OrderSummary";

interface SalesFormContainerProps {
  customers: Customer[];
  products: Product[];
}

export const SalesFormContainer = ({ customers, products }: SalesFormContainerProps) => {
  const {
    selectedCustomer,
    customerSearch,
    orderItems,
    setCustomerSearch,
    setOrderItems,
    handleCustomerSelect,
    resetOrder
  } = useOrderState();

  const { handleSubmitOrder, isSubmitting } = useSplitOrders(selectedCustomer);

  const handleSubmit = async () => {
    const success = await handleSubmitOrder(orderItems);
    if (success) {
      resetOrder();
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
        {orderItems.length > 0 && <OrderSummary orderItems={orderItems} />}
      </CardContent>
    </Card>
  );
};