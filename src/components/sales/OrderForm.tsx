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
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
            <h3 className="text-lg font-semibold">Proizvodi</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Način Plaćanja:</span>
              <Select 
                value={selectedPaymentType} 
                onValueChange={(value) => setSelectedPaymentType(value as 'cash' | 'invoice')}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Način plaćanja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Račun</SelectItem>
                  <SelectItem value="cash">Gotovina</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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