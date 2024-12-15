import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer, Product, OrderItem } from "@/types";
import { toast } from "sonner";
import { OrderForm } from "@/components/sales/OrderForm";
import DailySalesSummary from "@/components/sales/DailySalesSummary";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Sales = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch customers for the logged-in user
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        toast.error("Greška pri učitavanju kupaca");
      } else {
        setCustomers(customersData);
      }

      // Fetch products for the logged-in user
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('Naziv');

      if (productsError) {
        console.error('Error fetching products:', productsError);
        toast.error("Greška pri učitavanju proizvoda");
      } else {
        // Map Serbian column names to English properties
        const mappedProducts = productsData.map(product => ({
          ...product,
          name: product.Naziv,
          manufacturer: product.Proizvođač,
          price: product.Cena,
          unit: product["Jedinica mere"]
        }));
        setProducts(mappedProducts);
      }
    };

    fetchData();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => {
      const unitSize = parseFloat(item.product.unit) || 1;
      return sum + (item.product.price * item.quantity * unitSize);
    }, 0);
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

    const total = calculateTotal(orderItems);

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