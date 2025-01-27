import { Product, OrderItem, Customer } from "@/types";
import { useState } from "react";
import { useCustomerPrices } from "./hooks/useCustomerPrices";
import { ProductSearchInput } from "./ProductSearchInput";
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
  const { getProductPrice } = useCustomerPrices(selectedCustomer);

  console.log("ProductSelect - Available products:", products?.length);
  console.log("ProductSelect - Search term:", searchTerm);

  const filteredProducts = products.filter(product =>
    product.Naziv.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("ProductSelect - Filtered products:", filteredProducts?.length);

  const handleAddProduct = (product: Product) => {
    const price = getProductPrice(product, 'invoice');
    const productWithPrice = { ...product, Cena: price };

    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex !== -1) {
      const newItems = [...orderItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + 1,
        product: productWithPrice
      };
      onOrderItemsChange(newItems);
    } else {
      const newItem: OrderItem = {
        product: productWithPrice,
        quantity: 1,
        paymentType: 'invoice'
      };
      onOrderItemsChange([...orderItems, newItem]);
    }
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <ProductSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
        />
        {searchTerm && (
          <ProductSearchResults
            products={filteredProducts}
            onSelect={handleAddProduct}
            getProductPrice={getProductPrice}
          />
        )}
      </div>
    </div>
  );
};