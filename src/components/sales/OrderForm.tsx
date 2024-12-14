import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Customer, Product, OrderItem } from "@/types";
import { ChevronDown } from "lucide-react";

interface OrderFormProps {
  customers: Customer[];
  products: Product[];
  selectedCustomer: Customer | null;
  customerSearch: string;
  orderItems: OrderItem[];
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  onOrderItemsChange: (items: OrderItem[]) => void;
  onSubmit: () => void;
}

export const OrderForm = ({
  customers,
  products,
  selectedCustomer,
  customerSearch,
  orderItems,
  onCustomerSearchChange,
  onCustomerSelect,
  onOrderItemsChange,
  onSubmit,
}: OrderFormProps) => {
  const [productSearch, setProductSearch] = useState("");

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex !== -1) {
      // If product already exists, increment quantity
      const newItems = [...orderItems];
      newItems[existingItemIndex].quantity += 1;
      onOrderItemsChange(newItems);
    } else {
      // If product is new, add it to the list
      onOrderItemsChange([...orderItems, { product, quantity: 1 }]);
    }
    setProductSearch(""); // Clear search after adding
  };

  const handleRemoveItem = (index: number) => {
    onOrderItemsChange(orderItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const newItems = [...orderItems];
    newItems[index].quantity = Math.max(1, newQuantity); // Ensure quantity is at least 1
    onOrderItemsChange(newItems);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Izbor kupca</label>
        <div className="relative">
          <div className="flex gap-2">
            <Input
              placeholder="Pretraži kupca..."
              value={customerSearch}
              onChange={(e) => onCustomerSearchChange(e.target.value)}
              className="flex-1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px] bg-white">
                {customers.map((customer) => (
                  <DropdownMenuItem
                    key={customer.id}
                    onClick={() => onCustomerSelect(customer)}
                  >
                    {customer.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {customerSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => onCustomerSelect(customer)}
                >
                  {customer.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input value={selectedCustomer.address} disabled />
            <Input value={selectedCustomer.city} disabled />
          </div>

          <div className="space-y-2">
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
                      <span>{product.name}</span>
                      <span className="text-sm text-gray-500">
                        {product.price} RSD
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
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.product.manufacturer}
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
                    <span className="w-24 text-right">
                      {item.product.price * item.quantity} RSD
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
      )}

      {selectedCustomer && orderItems.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={onSubmit} className="w-full md:w-auto">
            Pošalji porudžbinu
          </Button>
        </div>
      )}
    </div>
  );
};