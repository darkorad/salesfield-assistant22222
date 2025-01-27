import { Customer, Product, OrderItem } from "@/types";
import { CustomerSelect } from "./CustomerSelect";
import { ProductSelect } from "./ProductSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface OrderFormProps {
  customers: Customer[];
  products: Product[];
  selectedCustomer: Customer | null;
  customerSearch: string;
  orderItems: OrderItem[];
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  onOrderItemsChange: (items: OrderItem[]) => void;
  onSubmit: (note?: string) => void;
  isSubmitting?: boolean;
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
  isSubmitting
}: OrderFormProps) => {
  const [note, setNote] = useState("");

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <CustomerSelect
          customers={customers}
          customerSearch={customerSearch}
          onCustomerSearchChange={onCustomerSearchChange}
          onCustomerSelect={onCustomerSelect}
        />

        {selectedCustomer && (
          <div className="space-y-4 mt-6">
            <div className="text-lg font-medium">Izbor artikala</div>
            <ProductSelect
              products={products}
              orderItems={orderItems}
              selectedCustomer={selectedCustomer}
              onOrderItemsChange={onOrderItemsChange}
            />
          </div>
        )}
      </div>

      {orderItems.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Napomena</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Unesite napomenu..."
              className="mt-1"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => onSubmit(note)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Slanje..." : "Potvrdi porudžbinu"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};