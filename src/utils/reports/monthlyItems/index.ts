
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  fetchMonthlySalesData, 
  processSalesData, 
  getMonthNameInSerbian 
} from "./helpers";
import { 
  createReportData, 
  addTotalsRow, 
  generateWorkbook,
  exportWorkbookToFileAndStorage
} from "./reportGenerator";

/**
 * Main function to export monthly items report
 */
export const exportMonthlyItemsReport = async (redirectToDocuments?: () => void) => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }
    
    // Set up date range for current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Get month name in Serbian for file naming
    const monthName = getMonthNameInSerbian(today);
    const year = today.getFullYear();

    // Fetch sales data
    const sales = await fetchMonthlySalesData(
      session.user.id, 
      firstDayOfMonth, 
      firstDayOfNextMonth
    );

    // Process sales data into item summaries
    const itemsSummary = processSalesData(sales);

    // Create report data from item summaries
    let reportData = createReportData(itemsSummary);

    if (reportData.length === 0) {
      toast.error("Nema prodaje artikala za tekući mesec");
      return;
    }

    // Add totals row
    reportData = addTotalsRow(reportData);

    // Generate Excel workbook
    const wb = generateWorkbook(reportData);
    
    // Create more descriptive filename with month name and year 
    // Format: Mesecni-Izvestaj-Artikli-Mart-2025
    const fileName = `Mesecni-Izvestaj-Artikli-${monthName}-${year}`;
    
    // Export and save workbook
    await exportWorkbookToFileAndStorage(wb, fileName, redirectToDocuments);
    
  } catch (error) {
    console.error('Error generating monthly items report:', error);
    toast.error(`Greška pri generisanju izveštaja: ${error instanceof Error ? error.message : String(error)}`);
  }
};
