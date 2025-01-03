import { Customer, Product, OrderItem } from "@/types";
import { Button } from "@/components/ui/button";
import { CustomerSelect } from "./CustomerSelect";
import { ProductSelect } from "./ProductSelect";

interface OrderFormProps {
  customers: Customer[];
  products: Product[];
  selectedCustomer: Customer | null;
  customerSearch: string;
  orderItems: OrderItem[];
  isSubmitting: boolean;
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  onOrderItemsChange: (items: OrderItem[]) => void;
  onSubmit: () => void;
}

export const OrderForm = ({
  customers,
  products,
  selectedCustomer,
  customerSearch,
  orderItems,
  isSubmitting,
  onCustomerSearchChange,
  onCustomerSelect,
  onOrderItemsChange,
  onSubmit,
}: OrderFormProps) => {
  return (
    <div className="space-y-12">
      <CustomerSelect
        customers={customers}
        customerSearch={customerSearch}
        onCustomerSearchChange={onCustomerSearchChange}
        onCustomerSelect={onCustomerSelect}
      />

      {selectedCustomer && (
        <div className="space-y-4">
          <ProductSelect
            products={products}
            orderItems={orderItems}
            selectedCustomer={selectedCustomer}
            onOrderItemsChange={onOrderItemsChange}
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={onSubmit}
          className="w-full md:w-auto"
          disabled={!selectedCustomer || orderItems.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Slanje..." : "Pošalji porudžbinu"}
        </Button>
      </div>
    </div>
  );
};