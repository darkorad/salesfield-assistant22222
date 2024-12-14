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

  const handleAddItem = () => {
    if (products.length > 0) {
      onOrderItemsChange([...orderItems, { product: products[0], quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    onOrderItemsChange(orderItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
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
            <DropdownMenuContent className="w-[200px]">
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

      {selectedCustomer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input value={selectedCustomer.address} disabled />
          <Input value={selectedCustomer.city} disabled />
        </div>
      )}

      <div className="space-y-4">
        {orderItems.map((item, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Input
                value={item.product.name}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Pretraži proizvod..."
              />
              {productSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        const newItems = [...orderItems];
                        newItems[index].product = product;
                        onOrderItemsChange(newItems);
                        setProductSearch("");
                      }}
                    >
                      {product.name} - {product.manufacturer}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => {
                const newItems = [...orderItems];
                newItems[index].quantity = parseInt(e.target.value) || 1;
                onOrderItemsChange(newItems);
              }}
              className="w-full md:w-24"
            />
            <div className="flex items-center w-full md:w-24 justify-between md:justify-center">
              <span className="md:hidden">Ukupno:</span>
              <span>{item.product.price * item.quantity} RSD</span>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemoveItem(index)}
              className="w-full md:w-auto"
            >
              ×
            </Button>
          </div>
        ))}
        <Button onClick={handleAddItem} className="w-full md:w-auto">
          Dodaj proizvod
        </Button>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSubmit} className="w-full md:w-auto">
          Pošalji porudžbinu
        </Button>
      </div>
    </div>
  );
};