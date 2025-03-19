
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "./OrderForm";
import { Customer, Product } from "@/types";
import { useSplitOrders } from "./hooks/useSplitOrders";
import { useOrderState } from "@/hooks/useOrderState";

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

  return (
    <Card className="w-full max-w-5xl mx-auto border-0 shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-primary">Nova porudžbina</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <OrderForm
          customers={customers}
          products={products}
        />
        {orderItems.length > 0 && (
          <div className="mt-6">
            <OrderSummary orderItems={orderItems} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
