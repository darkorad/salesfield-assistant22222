import { Suspense, lazy } from "react";
import { SalesFormContainer } from "@/components/sales/SalesFormContainer";
import { useSalesData } from "@/hooks/useSalesData";

// Lazy load DailySalesSummary
const DailySalesSummary = lazy(() => import("@/components/sales/DailySalesSummary"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

const Sales = () => {
  const { customers, products, isLoading } = useSalesData();

  if (isLoading) {
    return (
      <div className="container mx-auto py-4 px-4 md:py-8 md:px-8">
        <LoadingFallback />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-8">
      <Suspense fallback={<LoadingFallback />}>
        <SalesFormContainer customers={customers} products={products} />
        <DailySalesSummary />
      </Suspense>
    </div>
  );
};

export default Sales;