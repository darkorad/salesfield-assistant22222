
import { Customer, Product, OrderItem } from "@/types";
import { Button } from "@/components/ui/button";
import { CustomerSelect } from "./CustomerSelect";
import { ProductSelect } from "./ProductSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

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
  onSubmit: (note?: string) => void;
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
  const [includeNote, setIncludeNote] = useState(false);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    onSubmit(includeNote ? note : undefined);
  };

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="note"
            checked={includeNote}
            onCheckedChange={(checked) => setIncludeNote(checked as boolean)}
          />
          <label
            htmlFor="note"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Napomena
          </label>
        </div>

        {includeNote && (
          <Textarea
            placeholder="Unesite napomenu"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full resize-none"
            maxLength={100}
            rows={3}
          />
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          className="w-full md:w-auto"
          disabled={!selectedCustomer || orderItems.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Slanje..." : "Pošalji porudžbinu"}
        </Button>
      </div>
    </div>
  );
};
