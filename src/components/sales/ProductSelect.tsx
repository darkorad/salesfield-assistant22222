import { useState } from "react";
import { Product, OrderItem, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const filteredProducts = products.filter((product) => {
    // Use the Naziv field which is guaranteed to exist based on the database schema
    const searchTerm = productSearch.toLowerCase();
    const productName = product.Naziv?.toLowerCase() || "";
    return productName.includes(searchTerm);
  });

  const handleAddProduct = (product: Product) => {
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

  const handleRemoveItem = (index: number) => {
    onOrderItemsChange(orderItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const newItems = [...orderItems];
    newItems[index].quantity = Math.max(1, newQuantity);
    onOrderItemsChange(newItems);
  };

  const calculateItemTotal = (product: Product, quantity: number) => {
    const unitSize = parseFloat(product.unit) || 1;
    return product.Cena * quantity * unitSize;
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
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => handleAddProduct(product)}
                >
                  <span>{product.Naziv}</span>
                  <span className="text-sm text-gray-500">
                    {product.Cena} RSD/{product["Jedinica mere"]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 mt-4">
          {orderItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-2 p-3 border rounded-md bg-gray-50"
            >
              <div className="flex-1">
                <p className="font-medium">{item.product.Naziv}</p>
                <p className="text-sm text-gray-500">
                  {item.product.Proizvođač} - {item.product.Cena} RSD/{item.product["Jedinica mere"]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(index, parseInt(e.target.value) || 1)
                  }
                  className="w-20"
                />
                <span className="whitespace-nowrap text-sm text-gray-600">
                  {item.product["Jedinica mere"]}
                </span>
                <span className="w-24 text-right">
                  {calculateItemTotal(item.product, item.quantity)} RSD
                </span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};