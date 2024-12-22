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

  const filteredProducts = products.filter((product) => {
    const searchTerm = productSearch.toLowerCase();
    // Use the correct field name "Naziv" instead of "name"
    const productName = product.Naziv?.toLowerCase() || "";
    return productName.includes(searchTerm);
  });

  const handleAddProduct = (product: Product) => {
    console.log("Adding product:", product);
    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex !== -1) {
      const newItems = [...orderItems];
      newItems[existingItemIndex].quantity += 1;
      onOrderItemsChange(newItems);
    } else {
      onOrderItemsChange([...orderItems, { product, quantity: 1 }]);
    }
    setProductSearch("");
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const newItems = [...orderItems];
    newItems[index].quantity = Math.max(1, newQuantity);
    onOrderItemsChange(newItems);
  };

  const handleRemoveItem = (index: number) => {
    onOrderItemsChange(orderItems.filter((_, i) => i !== index));
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
              key={item.product.id}
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