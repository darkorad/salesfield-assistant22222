
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  getMonthDateRange, 
  processCustomerSalesData,
  formatFilename 
} from "./helpers";
import { 
  createReportData, 
  generateWorkbook, 
  exportWorkbookToFileAndStorage 
} from "./reportGenerator";

/**
 * Main function to export monthly customer report for Veljko
 * This ensures identical functionality but with user-specific data
 */
export const exportMonthlyCustomerReport = async (redirectToDocuments?: () => void) => {
  try {
    // Get the current month date range
    const { firstDayOfMonth, firstDayOfNextMonth } = getMonthDateRange();

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    toast.info("Učitavanje podataka za trenutni mesec...");

    // Get all sales for the current month for the current user
    const { data: salesData, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers!sales_customer_id_fkey(*),
        kupci_darko!sales_darko_customer_id_fkey(*)
      `)
      .eq('user_id', session.user.id)
      .gte('date', firstDayOfMonth.toISOString())
      .lt('date', firstDayOfNextMonth.toISOString());

    if (error) {
      console.error("Error fetching sales data:", error);
      toast.error(`Greška pri učitavanju prodaje: ${error.message}`);
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za trenutni mesec");
      return;
    }

    console.log(`Found ${salesData.length} sales for current month`);

    // Process sales data into customer sales summary
    const customerSales = await processCustomerSalesData(salesData);

    // Create report data
    const reportData = createReportData(customerSales);

    // Generate workbook with report data
    const wb = generateWorkbook(reportData);

    // Generate more descriptive filename
    const filename = formatFilename();

    // Export and save workbook
    await exportWorkbookToFileAndStorage(wb, filename, redirectToDocuments);

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error(`Greška pri generisanju izveštaja: ${error instanceof Error ? error.message : String(error)}`);
  }
};
