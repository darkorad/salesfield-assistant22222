import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer, Product, OrderItem } from "@/types";
import { toast } from "sonner";

// Temporary mock data
const mockCustomers: Customer[] = [
  { id: "1", name: "John Doe", address: "123 Main St", city: "Belgrade" },
  { id: "2", name: "Jane Smith", address: "456 Oak St", city: "Novi Sad" },
];

const mockProducts: Product[] = [
  { id: "1", name: "Product 1", manufacturer: "Manufacturer A", price: 100, unit: "pcs" },
  { id: "2", name: "Product 2", manufacturer: "Manufacturer B", price: 200, unit: "kg" },
];

const Sales = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ product: mockProducts[0], quantity: 1 }]);

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product: mockProducts[0], quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    if (orderItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    // TODO: Implement order submission
    toast.success("Order submitted successfully!");
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>New Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search customer..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              {customerSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCustomerSelect(customer)}
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
          </div>

          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-4">
                <Select
                  value={item.product.id}
                  onValueChange={(value) => {
                    const newItems = [...orderItems];
                    newItems[index].product = mockProducts.find((p) => p.id === value)!;
                    setOrderItems(newItems);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.manufacturer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...orderItems];
                    newItems[index].quantity = parseInt(e.target.value) || 1;
                    setOrderItems(newItems);
                  }}
                  className="w-24"
                />
                <div className="flex items-center w-24">
                  ${item.product.price * item.quantity}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button onClick={handleAddItem}>Add Product</Button>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmitOrder}>Submit Order</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;