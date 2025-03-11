
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportWorkbook } from "@/utils/exportUtils";
import { fetchMonthlySalesData } from "./data";
import { processCustomerSales } from "./customerSalesProcessor";
import { createDetailedReportData, createSummaryReportData, createWorkbook } from "./reportGenerator";

export const exportMonthlyCustomerReport = async () => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    // Fetch sales data for the current month
    const sales = await fetchMonthlySalesData(session.user.id);
    if (!sales) return;

    // Process sales data into customer details and summary
    const { customerSalesDetails, customerSalesSummary } = processCustomerSales(sales);

    // Create report data
    const reportData = createDetailedReportData(customerSalesDetails);
    const summaryData = createSummaryReportData(customerSalesSummary);

    // Create workbook with both detailed and summary worksheets
    const wb = createWorkbook(reportData, summaryData);
    
    // Generate filename with current date
    const today = new Date();
    const fileName = `Mesecna_prodaja_po_kupcima_${today.getMonth() + 1}_${today.getFullYear()}`;
    
    // Export the workbook
    await exportWorkbook(wb, fileName);
    
  } catch (error) {
    console.error('Error exporting monthly customer report:', error);
    toast.error("Greška pri izvozu izveštaja");
  }
};
