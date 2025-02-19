
import { useState, useEffect } from "react";
import { Order, OrderItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDailySales = () => {
  const [todaySales, setTodaySales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        customer: order.darko_customer // Use darko_customer directly instead of circular reference
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
        customer: order.darko_customer // Use darko_customer directly instead of circular reference
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log("Fetching sales between:", today.toISOString(), "and", tomorrow.toISOString());

      const { data: salesData, error } = await supabase
        .from('sales')
        .select(`
          *,
          darko_customer:kupci_darko!fk_sales_kupci_darko(
            id,
            name,
            address,
            city,
            phone,
            pib,
            is_vat_registered,
            email,
            code,
            dan_posete,
            group_name,
            naselje,
            gps_coordinates
          )
        `)
        .eq('user_id', session.user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        toast.error("Greška pri učitavanju prodaje");
        return;
      }

      // Transform and split orders with mixed payment types
      const transformedSales = salesData?.flatMap(sale => {
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
    loadTodaySales
  };
};
