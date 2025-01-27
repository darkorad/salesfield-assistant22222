import { Product, OrderItem, Customer } from "@/types";
import { OrderItemsList } from "./OrderItemsList";
import { useState } from "react";
import { useCustomerPrices } from "./hooks/useCustomerPrices";
import { ProductSearchSection } from "./product-selection/ProductSearchSection";
import { CustomerInfoSection } from "./product-selection/CustomerInfoSection";

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
  const { getProductPrice, fetchCustomerPrices } = useCustomerPrices(selectedCustomer);
  const [localProducts, setLocalProducts] = useState(products);

  const filteredProducts = localProducts.filter((product) =>
    product.Naziv.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product: Product, quantity: number = 1, paymentType: 'cash' | 'invoice' = 'invoice') => {
    const price = getProductPrice(product, paymentType);
    const productWithPrice = { ...product, Cena: price };

    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.Naziv === product.Naziv && item.paymentType === paymentType
    );

    if (existingItemIndex !== -1) {
      const newItems = [...orderItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: quantity,
        paymentType: paymentType,
        product: productWithPrice
      };
      onOrderItemsChange(newItems);
    } else {
      const newItem: OrderItem = {
        product: productWithPrice,
        quantity,
        paymentType
      };
      onOrderItemsChange([...orderItems, newItem]);
    }
    setSearchTerm("");
  };

  const handleCustomerUpdate = () => {
    // Refresh prices after customer update
    fetchCustomerPrices();
  };

  return (
    <div className="space-y-4">
      <CustomerInfoSection 
        customer={selectedCustomer}
        onSyncComplete={fetchCustomerPrices}
        onCustomerUpdate={handleCustomerUpdate}
      />

      <div className="relative">
        <ProductSearchSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProducts={filteredProducts}
          handleAddProduct={handleAddProduct}
          getProductPrice={getProductPrice}
        />
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
              const item = newItems[index];
              const newPrice = getProductPrice(item.product, paymentType);
              newItems[index] = {
                ...item,
                paymentType,
                product: { ...item.product, Cena: newPrice }
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