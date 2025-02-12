
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
    if (location.state && 'selectedCustomer' in location.state) {
      const customerData = location.state.selectedCustomer as Customer;
      console.log("Setting selected customer from navigation:", customerData);
      
      // Find the customer in our customers list to ensure we have complete data
      const fullCustomerData = customers.find(c => c.id === customerData.id);
      if (fullCustomerData) {
        // First set the search term
        setCustomerSearch(fullCustomerData.name);
        // Then select the customer
        handleCustomerSelect(fullCustomerData);
        // Clear the navigation state
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, customers, handleCustomerSelect, setCustomerSearch]);

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
