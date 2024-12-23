import { useState } from "react";
import { Product, OrderItem, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { ProductSearchResults } from "./ProductSearchResults";
import { OrderItemCard } from "./OrderItemCard";

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
  const [productSearch, setProductSearch] = useState("");

  console.log("ProductSelect - Products:", products);
  console.log("ProductSelect - Search term:", productSearch);
  console.log("ProductSelect - Current order items:", orderItems);

  const filteredProducts = products.filter((product) => {
    const searchTerm = productSearch.toLowerCase();
    const productName = product.Naziv?.toLowerCase() || "";
    return productName.includes(searchTerm);
  });

  const handleAddProduct = (product: Product) => {
    console.log("Adding product:", product);
    console.log("Current order items:", orderItems);
    
    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.Naziv === product.Naziv
    );

    if (existingItemIndex !== -1) {
      // Create a new array with the updated quantity
      const newItems = [...orderItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + 1
      };
      console.log("Updating existing item. New items:", newItems);
      onOrderItemsChange(newItems);
    } else {
      // Add new product with quantity 1
      const newItems = [...orderItems, { product, quantity: 1 }];
      console.log("Adding new item. New items:", newItems);
      onOrderItemsChange(newItems);
    }
    setProductSearch("");
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      quantity: Math.max(1, newQuantity)
    };
    onOrderItemsChange(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    onOrderItemsChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold mb-4">Proizvodi</h2>
        
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Izabrani kupac:</h3>
          <div className="text-sm">
            <p><span className="font-medium">Ime:</span> {selectedCustomer.name}</p>
            <p><span className="font-medium">Adresa:</span> {selectedCustomer.address}</p>
            {selectedCustomer.phone && (
              <p><span className="font-medium">Telefon:</span> {selectedCustomer.phone}</p>
            )}
          </div>
        </div>

        <label className="text-sm font-medium">Izbor artikala</label>
        <div className="relative">
          <Input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Pretraži proizvod..."
            className="w-full"
          />
          {productSearch && (
            <ProductSearchResults
              products={filteredProducts}
              onSelect={handleAddProduct}
            />
          )}
        </div>

        <div className="space-y-2 mt-4">
          {orderItems.map((item, index) => (
            <OrderItemCard
              key={`${item.product.Naziv}-${index}`}
              item={item}
              onQuantityChange={(quantity) => handleQuantityChange(index, quantity)}
              onRemove={() => handleRemoveItem(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};