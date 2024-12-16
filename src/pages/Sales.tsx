import { Suspense, lazy, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer, Product, OrderItem } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Lazy load components
const OrderForm = lazy(() => import("@/components/sales/OrderForm").then(module => ({ default: module.OrderForm })));
const DailySalesSummary = lazy(() => import("@/components/sales/DailySalesSummary"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

const Sales = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        // Parallel data fetching with auth headers
        const [customersResponse, productsResponse] = await Promise.all([
          supabase
            .from('customers')
            .select('*')
            .order('name'),
          supabase
            .from('products')
            .select('*')
            .order('Naziv')
        ]);

        if (isMounted) {
          if (customersResponse.error) {
            console.error('Error fetching customers:', customersResponse.error);
            toast.error("Greška pri učitavanju kupaca");
          } else {
            setCustomers(customersResponse.data || []);
          }

          if (productsResponse.error) {
            console.error('Error fetching products:', productsResponse.error);
            toast.error("Greška pri učitavanju proizvoda");
          } else {
            const mappedProducts = (productsResponse.data || []).map(product => ({
              ...product,
              name: product.Naziv,
              manufacturer: product.Proizvođač,
              price: product.Cena,
              unit: product["Jedinica mere"]
            }));
            setProducts(mappedProducts);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("Greška pri učitavanju podataka");
      }
    };

    fetchData();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        fetchData();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleSubmitOrder = async (paymentType: 'cash' | 'invoice') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast.error("Niste prijavljeni");
        return;
      }

      if (!selectedCustomer) {
        toast.error("Molimo izaberite kupca");
        return;
      }
      if (orderItems.length === 0) {
        toast.error("Molimo dodajte bar jedan proizvod");
        return;
      }

      const total = orderItems.reduce((sum, item) => {
        const unitSize = parseFloat(item.product.unit) || 1;
        return sum + (item.product.price * item.quantity * unitSize);
      }, 0);

      const newOrder = {
        id: crypto.randomUUID(),
        customer: selectedCustomer,
        items: orderItems,
        total,
        date: new Date().toISOString(),
        userId: session.user.id,
        paymentType,
      };

      const existingSales = localStorage.getItem("sales");
      const sales = existingSales ? JSON.parse(existingSales) : [];
      sales.push(newOrder);
      localStorage.setItem("sales", JSON.stringify(sales));

      setSelectedCustomer(null);
      setCustomerSearch("");
      setOrderItems([]);
      
      toast.success("Porudžbina je uspešno poslata!");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Greška pri slanju porudžbine");
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-8">
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
    </div>
  );
};

export default Sales;