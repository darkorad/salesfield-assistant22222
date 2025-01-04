import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CashSale } from "@/types/reports";

export const fetchTodayCashSales = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast.error("Niste prijavljeni");
    return null;
  }

  // Get today's date at start of day in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get tomorrow's date at start of day in local timezone
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: salesData, error } = await supabase
    .from('sales')
    .select('*, customer:customers(*)')
    .eq('user_id', session.user.id)
    .eq('payment_type', 'cash')
    .gte('date', today.toISOString())
    .lt('date', tomorrow.toISOString())
    .order('customer_id');

  if (error) {
    console.error("Error loading sales:", error);
    toast.error("Greška pri učitavanju prodaje");
    return null;
  }

  if (!salesData || salesData.length === 0) {
    toast.error("Nema prodaje za gotovinu danas");
    return null;
  }

  return salesData as CashSale[];
};