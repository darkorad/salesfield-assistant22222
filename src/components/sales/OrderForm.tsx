import { useState } from "react";
import { Customer, Product, OrderItem } from "@/types";
import { Button } from "@/components/ui/button";
import { CustomerSelect } from "./CustomerSelect";
import { ProductSelect } from "./ProductSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFormProps {
  customers: Customer[];
  products: Product[];
  selectedCustomer: Customer | null;
  customerSearch: string;
  orderItems: OrderItem[];
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  onOrderItemsChange: (items: OrderItem[]) => void;
  onSubmit: (paymentType: 'cash' | 'invoice') => void;
}

export const OrderForm = ({
  customers,
  products,
  selectedCustomer,
  customerSearch,
  orderItems,
  onCustomerSearchChange,
  onCustomerSelect,
  onOrderItemsChange,
  onSubmit,
}: OrderFormProps) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState<'cash' | 'invoice'>('invoice');

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
          onClick={() => onSubmit(selectedPaymentType)}
          className="w-full md:w-auto"
          disabled={!selectedCustomer || orderItems.length === 0}
        >
          Pošalji porudžbinu
        </Button>
      </div>
    </div>
  );
};