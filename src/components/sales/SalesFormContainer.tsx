
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "./OrderForm";
import { Customer, Product } from "@/types";
import { useSplitOrders } from "./hooks/useSplitOrders";
import { useOrderState } from "@/hooks/useOrderState";
import { CustomerSelect } from "./CustomerSelect";
import { ProductSelect } from "./ProductSelect";
import { OrderSummary } from './OrderSummary';
import { SalesActions } from "./SalesActions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

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

  return (
    <Card className="w-full max-w-5xl mx-auto border-0 shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-primary">Nova porudžbina</CardTitle>
        {customers.length === 1 && (
          <Alert className="mt-2 bg-amber-50 border-amber-200">
            <InfoIcon className="h-4 w-4 text-amber-500 mr-2" />
            <AlertDescription>
              Samo jedan kupac je pronađen u sistemu. Koristite opciju "Plan poseta" da vidite kupce po danima posete.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <CustomerSelect 
          customers={customers}
          customerSearch={customerSearch}
          onCustomerSearchChange={setCustomerSearch}
          onCustomerSelect={handleCustomerSelect}
        />
        
        {selectedCustomer && (
          <>
            <ProductSelect
              products={products}
              orderItems={orderItems}
              selectedCustomer={selectedCustomer}
              onOrderItemsChange={setOrderItems}
            />
            
            {orderItems.length > 0 && (
              <div className="mt-6">
                <OrderSummary orderItems={orderItems} />
                <SalesActions 
                  selectedCustomer={selectedCustomer} 
                  orderItems={orderItems} 
                  onReset={resetOrder}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
