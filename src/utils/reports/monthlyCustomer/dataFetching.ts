
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetch sales data for the current month with relationships
 * This uses the fixed foreign key constraints to fetch related data
 */
export async function fetchMonthlySalesData(userId: string, startDate: Date, endDate: Date) {
  toast.info("Učitavanje podataka za trenutni mesec...");

  try {
    console.log(`Fetching sales data between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    // Use the properly defined relationships to fetch data
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:customers(*),
        darko_customer:kupci_darko(*)
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
