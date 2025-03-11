
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetches sales data from Supabase for the current month
 */
export const fetchMonthlySalesData = async (userId: string) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const { data: sales, error } = await supabase
    .from('sales')
    .select(`
      *,
      customers (
        name,
        address,
        city,
        pib
      ),
      kupci_darko (
        name,
        address,
        city,
        pib
      )
    `)
    .eq('user_id', userId)
    .gte('created_at', firstDayOfMonth.toISOString())
    .lt('created_at', firstDayOfNextMonth.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  if (!sales || sales.length === 0) {
    toast.error("Nema prodaje za tekući mesec");
    return null;
  }

  return sales;
};
