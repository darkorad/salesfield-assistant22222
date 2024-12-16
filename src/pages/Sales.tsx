import { Suspense, lazy } from "react";
import { SalesFormContainer } from "@/components/sales/SalesFormContainer";
import { Customer, Product } from "@/types";

// Lazy load DailySalesSummary
const DailySalesSummary = lazy(() => import("@/components/sales/DailySalesSummary"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "1",
    user_id: "1",
    code: "001",
    name: "Test Kupac",
    address: "Test Adresa 1",
    city: "Beograd",
    phone: "123-456-789",
    pib: "123456789",
    is_vat_registered: true,
    gps_coordinates: "44.787197,20.457273"
  }
];

const mockProducts: Product[] = [
  {
    id: "1",
    user_id: "1",
    name: "Test Proizvod",
    manufacturer: "Test Proizvođač",
    price: 100,
    unit: "kom",
    Naziv: "Test Proizvod",
    Proizvođač: "Test Proizvođač",
    Cena: 100,
    "Jedinica mere": "kom"
  }
];

const Sales = () => {
  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-8">
      <Suspense fallback={<LoadingFallback />}>
        <SalesFormContainer customers={mockCustomers} products={mockProducts} />
        <DailySalesSummary />
      </Suspense>
    </div>
  );
};

export default Sales;