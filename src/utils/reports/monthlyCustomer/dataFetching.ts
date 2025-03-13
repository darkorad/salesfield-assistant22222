
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetch sales data for the current month without using relationships
 * This avoids the "Could not embed" error by using a flat query
 */
export async function fetchMonthlySalesData(userId: string, startDate: Date, endDate: Date) {
  toast.info("Učitavanje podataka za trenutni mesec...");

  try {
    console.log(`Fetching sales data between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    // Use a basic query without any joins or relationships
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

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
