import { Product, OrderItem, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { OrderItemsList } from "./OrderItemsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { ProductSearchResults } from "./ProductSearchResults";

interface ProductSelectProps {
  products: Product[];
  orderItems: OrderItem[];
  selectedCustomer: Customer;
  onOrderItemsChange: (items: OrderItem[]) => void;
}

export const ProductSelect = ({
  products,
  orderItems,
  selectedCustomer,
  onOrderItemsChange,
}: ProductSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filteredProducts = products.filter((product) =>
    product.Naziv.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product: Product, quantity: number = 1, paymentType: 'cash' | 'invoice' = 'invoice') => {
    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.Naziv === product.Naziv
    );

    if (existingItemIndex !== -1) {
      const newItems = [...orderItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: quantity,
        paymentType: paymentType
      };
      onOrderItemsChange(newItems);
    } else {
      const newItem: OrderItem = {
        product,
        quantity,
        paymentType
      };
      onOrderItemsChange([...orderItems, newItem]);
    }
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      <CustomerInfoCard customer={selectedCustomer} />

      <div className="relative">
        <Input
          type="text"
          placeholder="Pretraži proizvode..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          className="w-full"
        />
        {showResults && searchTerm && (
          <ProductSearchResults
            products={filteredProducts}
            onSelect={(product) => handleAddProduct(product)}
          />
        )}
      </div>

      {orderItems.length > 0 && (
        <div className="mt-4">
          <OrderItemsList
            items={orderItems}
            onQuantityChange={(index, quantity) => {
              const newItems = [...orderItems];
              newItems[index] = {
                ...newItems[index],
                quantity: Math.max(1, quantity)
              };
              onOrderItemsChange(newItems);
            }}
            onPaymentTypeChange={(index, paymentType) => {
              const newItems = [...orderItems];
              newItems[index] = {
                ...newItems[index],
                paymentType
              };
              onOrderItemsChange(newItems);
            }}
            onRemoveItem={(index) => {
              const newItems = orderItems.filter((_, i) => i !== index);
              onOrderItemsChange(newItems);
            }}
          />
        </div>
      )}
    </div>
  );
};