
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetch sales data for the current month with relationships
 * This uses the correct foreign key names based on Supabase relationship
 */
export async function fetchMonthlySalesData(userId: string, startDate: Date, endDate: Date) {
  toast.info("Učitavanje podataka za trenutni mesec...");

  try {
    console.log(`Fetching sales data between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    // Use the default foreign key names in the Supabase schema
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers!sales_customer_id_fkey(*),
        kupci_darko!sales_darko_customer_id_fkey(*)
      `)
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lt('date', endDate.toISOString());

    if (error) {
      console.error("Error fetching sales data:", error);
      throw new Error(`Greška pri učitavanju prodaje: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("Nema prodaje za trenutni mesec");
    }

    console.log(`Found ${data.length} sales for current month`);
    return data;
  } catch (error) {
    console.error("Error in fetchMonthlySalesData:", error);
    throw error;
  }
}
