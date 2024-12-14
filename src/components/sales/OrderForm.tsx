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
  return (
    <div className="space-y-12">
      <CustomerSelect
        customers={customers}
        customerSearch={customerSearch}
        onCustomerSearchChange={onCustomerSearchChange}
        onCustomerSelect={onCustomerSelect}
      />

      {selectedCustomer && (
        <ProductSelect
          products={products}
          orderItems={orderItems}
          selectedCustomer={selectedCustomer}
          onOrderItemsChange={onOrderItemsChange}
        />
      )}

      {selectedCustomer && orderItems.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Select onValueChange={(value) => onSubmit(value as 'cash' | 'invoice')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Izaberite način plaćanja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invoice">Račun</SelectItem>
              <SelectItem value="cash">Gotovina</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};