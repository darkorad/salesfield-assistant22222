import { useState, useEffect } from "react";
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
import { Customer, Product, OrderItem, Order } from "@/types";
import { toast } from "sonner";

const Sales = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    const savedCustomers = localStorage.getItem("customers");
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }

    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
      const parsedProducts = JSON.parse(savedProducts);
      if (parsedProducts.length > 0) {
        setOrderItems([{ product: parsedProducts[0], quantity: 1 }]);
      }
    }
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      setOrderItems([...orderItems, { product: products[0], quantity: 1 }]);
    } else {
      toast.error("Nema dostupnih proizvoda. Molimo prvo uvezite proizvode.");
    }
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = () => {
    if (!selectedCustomer) {
      toast.error("Molimo izaberite kupca");
      return;
    }
    if (orderItems.length === 0) {
      toast.error("Molimo dodajte bar jedan proizvod");
      return;
    }

    const total = orderItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const newOrder: Order = {
      id: crypto.randomUUID(),
      customer: selectedCustomer,
      items: orderItems,
      total: total,
      date: new Date().toISOString(),
    };

    const existingSales = localStorage.getItem("sales");
    const sales = existingSales ? JSON.parse(existingSales) : [];
    sales.push(newOrder);
    localStorage.setItem("sales", JSON.stringify(sales));

    // Reset form
    setSelectedCustomer(null);
    setCustomerSearch("");
    setOrderItems([{ product: products[0], quantity: 1 }]);
    
    toast.success("Porudžbina je uspešno poslata!");
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nova porudžbina</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Pretraži kupca..."
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
                    newItems[index].product = products.find((p) => p.id === value)!;
                    setOrderItems(newItems);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite proizvod" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
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
                  {item.product.price * item.quantity} RSD
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
            <Button onClick={handleAddItem}>Dodaj proizvod</Button>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmitOrder}>Pošalji porudžbinu</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
