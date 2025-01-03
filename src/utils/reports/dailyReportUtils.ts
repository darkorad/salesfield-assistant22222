import { Order } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface DailySaleRecord {
  'Kupac': string;
  'Adresa': string;
  'Artikli': string;
  'Ukupno (RSD)': number;
}

export const generateDailyReport = async () => {
  try {
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
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .order('date', { ascending: false });

    if (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
      return null;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za današnji dan");
      return null;
    }

    const formattedSales = salesData.map((sale: Order): DailySaleRecord => ({
      'Kupac': sale.customer.name,
      'Adresa': `${sale.customer.address}, ${sale.customer.city}`,
      'Artikli': sale.items.map(item => 
        `${item.product.Naziv} (${item.quantity} ${item.product["Jedinica mere"]})`
      ).join(', '),
      'Ukupno (RSD)': sale.total
    }));

    return formattedSales;
  } catch (error) {
    toast.error("Greška pri generisanju dnevnog izveštaja");
    console.error(error);
    return null;
  }
};