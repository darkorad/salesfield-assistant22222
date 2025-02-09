
import { useState } from "react";
import { Product, OrderItem, Customer } from "@/types";
import { ProductSearchSection } from "./product-selection/ProductSearchSection";

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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product =>
    product.Naziv.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
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
    setSearchTerm(""); // Clear search after selection
  };

  const getProductPrice = (product: Product, paymentType: 'cash' | 'invoice') => {
    return product.Cena;
  };

  return (
    <div className="relative">
      <ProductSearchSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredProducts={filteredProducts}
        handleAddProduct={handleAddProduct}
        getProductPrice={getProductPrice}
      />
      {/* Display selected products */}
      <div className="mt-4">
        {orderItems.map((item) => (
          <div key={item.product.id} className="flex justify-between items-center py-2 border-b">
            <div>
              <div className="font-medium">{item.product.Naziv}</div>
              <div className="text-sm text-gray-600">Količina: {item.quantity}</div>
            </div>
            <div className="text-sm">{item.product.Cena} RSD</div>
          </div>
        ))}
      </div>
    </div>
  );
};
