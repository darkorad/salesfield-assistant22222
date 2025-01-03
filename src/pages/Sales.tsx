import { Suspense, lazy } from "react";
import { SalesFormContainer } from "@/components/sales/SalesFormContainer";
import { ManufacturerSidebar } from "@/components/sales/ManufacturerSidebar";
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

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <ManufacturerSidebar products={products} />
      <div className="flex-1 p-2 md:p-6 max-w-full">
        <Suspense fallback={<LoadingFallback />}>
          <SalesFormContainer customers={customers} products={products} />
          <DailySalesSummary />
        </Suspense>
      </div>
    </div>
  );
};

export default Sales;