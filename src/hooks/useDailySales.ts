import { useState, useEffect } from "react";
import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDailySales = () => {
  const [todaySales, setTodaySales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTodaySales = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          id,
          total,
          date,
          items,
          payment_type,
          user_id,
          customer:customers (
            id,
            name,
            address,
            city,
            phone,
            pib,
            is_vat_registered,
            code,
            user_id,
            gps_coordinates
          )
        `)
        .eq('user_id', user.id)
        .gte('date', today.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        toast.error("Greška pri učitavanju prodaje");
        return;
      }

      console.log("Loaded sales:", sales);
      
      const formattedSales: Order[] = (Array.isArray(sales) ? sales : []).map((sale: any) => ({
        id: sale.id,
        customer: {
          id: sale.customer.id,
          user_id: sale.customer.user_id,
          code: sale.customer.code,
          name: sale.customer.name,
          address: sale.customer.address,
          city: sale.customer.city,
          phone: sale.customer.phone || '',
          pib: sale.customer.pib,
          is_vat_registered: sale.customer.is_vat_registered,
          gps_coordinates: sale.customer.gps_coordinates || ''
        },
        items: sale.items,
        total: sale.total,
        date: sale.date,
        paymentType: sale.payment_type,
        userId: sale.user_id
      }));

      setTodaySales(formattedSales);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const setupSalesSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Initial load
      await loadTodaySales();

      // Subscribe to changes
      const channel = supabase
        .channel('sales_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sales',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadTodaySales();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    setupSalesSubscription();

    // Cleanup subscription on unmount
    return () => {
      // Cleanup is handled in setupSalesSubscription
    };
  }, []);

  return { todaySales, isLoading };
};