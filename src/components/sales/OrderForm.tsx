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
import { Card } from "@/components/ui/card";

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
  const [selectedPaymentType, setSelectedPaymentType] = useState<'cash' | 'invoice' | null>(null);

  return (
    <div className="space-y-12">
      <CustomerSelect
        customers={customers}
        customerSearch={customerSearch}
        onCustomerSearchChange={onCustomerSearchChange}
        onCustomerSelect={onCustomerSelect}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Svi Proizvodi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.manufacturer}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {product.price} RSD/{product.unit}
                  </span>
                  {product.cashPrice && (
                    <span className="text-sm text-green-600">
                      Gotovina: {product.cashPrice} RSD
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedCustomer && (
        <ProductSelect
          products={products}
          orderItems={orderItems}
          selectedCustomer={selectedCustomer}
          onOrderItemsChange={onOrderItemsChange}
        />
      )}

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Način Plaćanja</h3>
        <Select onValueChange={(value) => setSelectedPaymentType(value as 'cash' | 'invoice')}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Izaberite način plaćanja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="invoice">Račun</SelectItem>
            <SelectItem value="cash">Gotovina</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          onClick={() => selectedPaymentType && onSubmit(selectedPaymentType)}
          className="w-full md:w-auto"
          disabled={!selectedCustomer || orderItems.length === 0 || !selectedPaymentType}
        >
          Pošalji porudžbinu
        </Button>
      </div>
    </div>
  );
};