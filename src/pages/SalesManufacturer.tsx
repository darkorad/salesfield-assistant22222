import { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManufacturerSidebar } from "@/components/sales/ManufacturerSidebar";
import { CustomerSelect } from "@/components/sales/CustomerSelect";
import { OrderForm } from "@/components/sales/OrderForm";
import { useSalesData } from "@/hooks/useSalesData";
import { useOrderState } from "@/hooks/useOrderState";
import { useSplitOrders } from "@/components/sales/hooks/useSplitOrders";

const DailySalesSummary = lazy(() => import("@/components/sales/DailySalesSummary"));

const LoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

const SalesManufacturer = () => {
  const { customers, products, isLoading } = useSalesData();
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

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <ManufacturerSidebar products={products} />
      <div className="flex-1 p-2 md:p-6 max-w-full">
        <Card className="w-full max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle>Nova porudžbina po proizvođaču</CardTitle>
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
        <Suspense fallback={<LoadingFallback />}>
          <DailySalesSummary />
        </Suspense>
      </div>
    </div>
  );
};

export default SalesManufacturer;