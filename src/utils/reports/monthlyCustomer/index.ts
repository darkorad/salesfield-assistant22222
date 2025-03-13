
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  getMonthDateRange, 
  fetchMonthlySalesData, 
  processCustomerSalesData,
  formatFilename 
} from "./helpers";
import { 
  createReportData, 
  generateWorkbook, 
  exportWorkbookToFileAndStorage 
} from "./reportGenerator";

/**
 * Main function to export monthly customer report
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

    // Get all sales for the current month for the current user
    const salesData = await fetchMonthlySalesData(
      session.user.id, 
      firstDayOfMonth, 
      firstDayOfNextMonth
    );

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
