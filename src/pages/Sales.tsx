
import { Suspense, lazy, useEffect } from "react";
import { SalesFormContainer } from "@/components/sales/SalesFormContainer";
import { ManufacturerSidebar } from "@/components/sales/ManufacturerSidebar";
import { useSalesData } from "@/hooks/useSalesData";
import { useOrderState } from "@/hooks/useOrderState";
import { useLocation } from "react-router-dom";
import { Customer } from "@/types";

const LoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

const Sales = () => {
  const { customers, products, isLoading } = useSalesData();
  const { handleCustomerSelect, setCustomerSearch } = useOrderState();
  const location = useLocation();

  useEffect(() => {
    const selectedCustomer = location.state?.selectedCustomer as Customer | undefined;
    if (selectedCustomer) {
      console.log("Setting selected customer from navigation:", selectedCustomer);
      
      // Update customer search first
      setCustomerSearch(selectedCustomer.name);
      
      // Then select the customer after a short delay to ensure state is updated
      setTimeout(() => {
        handleCustomerSelect(selectedCustomer);
      }, 0);
    }
  }, [location.state, handleCustomerSelect, setCustomerSearch]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <ManufacturerSidebar products={products} />
      <div className="flex-1 p-4 md:p-6 max-w-full bg-white rounded-lg shadow-sm">
        <Suspense fallback={<LoadingFallback />}>
          <SalesFormContainer customers={customers} products={products} />
        </Suspense>
      </div>
    </div>
  );
};

export default Sales;
