import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer, Product, OrderItem } from "@/types";
import { toast } from "sonner";
import { OrderForm } from "@/components/sales/OrderForm";
import DailySalesSummary from "@/components/sales/DailySalesSummary";

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
    }
  }, []);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
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

    const newOrder = {
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

    setSelectedCustomer(null);
    setCustomerSearch("");
    setOrderItems([]);
    
    toast.success("Porudžbina je uspešno poslata!");
  };

  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Nova porudžbina</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm
            customers={customers}
            products={products}
            selectedCustomer={selectedCustomer}
            customerSearch={customerSearch}
            orderItems={orderItems}
            onCustomerSearchChange={setCustomerSearch}
            onCustomerSelect={handleCustomerSelect}
            onOrderItemsChange={setOrderItems}
            onSubmit={handleSubmitOrder}
          />
        </CardContent>
      </Card>
      <DailySalesSummary />
    </div>
  );
};

export default Sales;