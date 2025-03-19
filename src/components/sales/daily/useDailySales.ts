
import { useState, useEffect } from "react";
import { Order, OrderItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDailySales = () => {
  const [todaySales, setTodaySales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const splitOrderByPaymentType = (order: any): Order[] => {
    // Group items by payment type
    const cashItems = order.items.filter((item: OrderItem) => item.paymentType === 'cash');
    const invoiceItems = order.items.filter((item: OrderItem) => item.paymentType === 'invoice');

    const orders: Order[] = [];

    // Create cash order if there are cash items
    if (cashItems.length > 0) {
      const cashTotal = cashItems.reduce((sum: number, item: OrderItem) => 
        sum + (item.product.Cena * item.quantity), 0);
      
      orders.push({
        ...order,
        id: `${order.id}-cash`,
        items: cashItems,
        total: cashTotal,
        payment_status: 'gotovina',
        payment_type: 'cash',
        customer: order.customer || order.darko_customer
      });
    }

    // Create invoice order if there are invoice items
    if (invoiceItems.length > 0) {
      const invoiceTotal = invoiceItems.reduce((sum: number, item: OrderItem) => 
        sum + (item.product.Cena * item.quantity), 0);
      
      orders.push({
        ...order,
        id: `${order.id}-invoice`,
        items: invoiceItems,
        total: invoiceTotal,
        payment_status: 'racun',
        payment_type: 'invoice',
        customer: order.customer || order.darko_customer
      });
    }

    return orders;
  };

  const loadTodaySales = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Store user email for conditional rendering
      setUserEmail(session.user.email);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log("Fetching sales between:", today.toISOString(), "and", tomorrow.toISOString());
      console.log("User email:", session.user.email);

      // Fix: Don't use the explicit foreign key reference that doesn't exist
      // Instead, fetch the customer data separately based on user
      const { data: salesData, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        toast.error("Greška pri učitavanju prodaje");
        return;
      }

      if (!salesData || salesData.length === 0) {
        setTodaySales([]);
        setIsLoading(false);
        return;
      }
      
      // Now fetch customer data separately based on the user email
      let customerData = [];
      
      if (session.user.email === 'zirmd.darko@gmail.com') {
        // Fetch Darko's customers
        const { data: darkoCustomers, error: darkoError } = await supabase
          .from('kupci_darko')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (darkoError) {
          console.error("Error loading Darko's customers:", darkoError);
        } else {
          customerData = darkoCustomers || [];
        }
      } else {
        // Fetch regular customers
        const { data: customers, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (customerError) {
          console.error("Error loading customers:", customerError);
        } else {
          customerData = customers || [];
        }
      }
      
      // Create a customer lookup map
      const customerMap = new Map();
      customerData.forEach(customer => {
        customerMap.set(customer.id, customer);
      });
      
      // Attach customer data to sales
      const salesWithCustomers = salesData.map(sale => {
        let customer = null;
        
        if (sale.customer_id) {
          customer = customerMap.get(sale.customer_id);
        } else if (sale.darko_customer_id) {
          customer = customerMap.get(sale.darko_customer_id);
        }
        
        return {
          ...sale,
          customer: customer || { name: 'Nepoznat kupac' }
        };
      });

      // Transform and split orders with mixed payment types
      const transformedSales = salesWithCustomers.flatMap(sale => {
        if (!sale) return [];
        return splitOrderByPaymentType(sale);
      }) || [];

      console.log("Processed sales data:", transformedSales);
      setTodaySales(transformedSales);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodaySales();
    const interval = setInterval(loadTodaySales, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    todaySales,
    isLoading,
    loadTodaySales,
    userEmail
  };
};
