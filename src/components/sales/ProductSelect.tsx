
import { useState } from "react";
import { Product, OrderItem, Customer } from "@/types";
import { ProductSearchSection } from "./product-selection/ProductSearchSection";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleDeleteItem = (productId: string) => {
    onOrderItemsChange(orderItems.filter(item => item.product.id !== productId));
  };

  const handlePaymentTypeChange = (productId: string, newPaymentType: 'cash' | 'invoice') => {
    onOrderItemsChange(orderItems.map(item =>
      item.product.id === productId
        ? { ...item, paymentType: newPaymentType }
        : item
    ));
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
      <div className="mt-4 space-y-2">
        {orderItems.map((item) => (
          <div key={item.product.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border">
            <div className="flex-1">
              <div className="font-medium">{item.product.Naziv}</div>
              <div className="text-sm text-gray-600 mt-1">
                <div className="mb-2">Količina: {item.quantity}</div>
                <div className="space-y-2">
                  <button
                    className={`w-full text-left px-2 py-1 rounded ${item.paymentType === 'cash' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                    onClick={() => handlePaymentTypeChange(item.product.id, 'cash')}
                  >
                    Gotovina: {item.product.Cena} RSD
                  </button>
                  <button
                    className={`w-full text-left px-2 py-1 rounded ${item.paymentType === 'invoice' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                    onClick={() => handlePaymentTypeChange(item.product.id, 'invoice')}
                  >
                    Račun: {item.product.Cena} RSD
                  </button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-gray-500 hover:text-red-500"
              onClick={() => handleDeleteItem(item.product.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
