import { useState, useEffect } from "react";
import { Order, Customer } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDailySales = () => {
  const [todaySales, setTodaySales] = useState<Order[]>([]);

  const loadTodaySales = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
      
      const formattedSales: Order[] = sales?.map(sale => ({
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
      })) || [];

      setTodaySales(formattedSales);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
    }
  };

  useEffect(() => {
    loadTodaySales();
    const interval = setInterval(loadTodaySales, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return { todaySales };
};