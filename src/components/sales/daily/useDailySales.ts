
import { useState, useEffect } from "react";
import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfDay, endOfDay } from "date-fns";

export const useDailySales = (selectedDate: Date) => {
  const [todaySales, setTodaySales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTodaySales = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);

      console.log("Fetching sales between:", start.toISOString(), "and", end.toISOString());

      const { data: salesData, error } = await supabase
        .from('sales')
        .select('*, darko_customer:kupci_darko(*)')
        .eq('user_id', session.user.id)
        .gte('date', start.toISOString())
        .lt('date', end.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        toast.error("Greška pri učitavanju prodaje");
        return;
      }

      const transformedSales = salesData?.map(sale => ({
        ...sale,
        customer: sale.darko_customer,
      }));

      console.log("Fetched sales data:", transformedSales);
      setTodaySales(transformedSales || []);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodaySales();
    // Only set up interval if we're looking at today's date
    if (startOfDay(selectedDate).getTime() === startOfDay(new Date()).getTime()) {
      const interval = setInterval(loadTodaySales, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedDate]);

  return {
    todaySales,
    isLoading,
    loadTodaySales
  };
};
