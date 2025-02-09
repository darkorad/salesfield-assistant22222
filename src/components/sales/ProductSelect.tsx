
import { useState } from "react";
import { Product, OrderItem, Customer } from "@/types";
import { ProductSearchInput } from "./ProductSearchInput";
import { ProductSearchResults } from "./ProductSearchResults";

interface ProductSelectProps {
  products: Product[];
  orderItems: OrderItem[];
  selectedCustomer: Customer;
  onOrderItemsChange: React.Dispatch<React.SetStateAction<OrderItem[]>>;
}

export const ProductSelect = ({ 
  products, 
  orderItems, 
  selectedCustomer, 
  onOrderItemsChange 
}: ProductSelectProps) => {
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const filtered = products.filter(product =>
      product.Naziv.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleProductSelect = (product: Product) => {
    const existingItem = orderItems.find(item => item.product.id === product.id);
    if (existingItem) {
      onOrderItemsChange(orderItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      onOrderItemsChange([...orderItems, { 
        product, 
        quantity: 1,
        paymentType: 'cash'
      }]);
    }
    setSearch("");
    setFilteredProducts([]);
  };

  const getProductPrice = (product: Product) => {
    return product.Cena;
  };

  return (
    <div className="relative">
      <ProductSearchInput
        value={search}
        onChange={handleSearchChange}
      />
      {search && filteredProducts.length > 0 && (
        <ProductSearchResults
          products={filteredProducts}
          onSelect={handleProductSelect}
          getProductPrice={getProductPrice}
        />
      )}
    </div>
  );
};
