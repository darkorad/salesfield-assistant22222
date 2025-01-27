import { Suspense, lazy } from "react";
import { SalesFormContainer } from "@/components/sales/SalesFormContainer";
import { useSalesData } from "@/hooks/useSalesData";

const DailySalesSummary = lazy(() => import("@/components/sales/DailySalesSummary"));

const LoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

const Sales = () => {
  const { customers, products, isLoading } = useSalesData();
  
  console.log("Sales page - Products loaded:", products?.length);
  console.log("Sales page - Customers loaded:", customers?.length);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<LoadingFallback />}>
        <SalesFormContainer customers={customers} products={products} />
        <DailySalesSummary />
      </Suspense>
    </div>
  );
};

export default Sales;