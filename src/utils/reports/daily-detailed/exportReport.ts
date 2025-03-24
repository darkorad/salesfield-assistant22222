
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { exportWorkbook } from "@/utils/fileExport";
import { saveWorkbookToStorage } from "@/utils/fileStorage";
import { fetchDailySalesData } from './fetchSalesData';
import { processReportData, calculateTotals } from './processReportData';
import { createDailyReportWorkbook, generateReportFilename } from './createWorkbook';

/**
 * Main function to export daily detailed report
 */
export const exportDailyDetailedReport = async (redirectToDocuments?: () => void) => {
  try {
    // Fetch sales data
    const salesData = await fetchDailySalesData();
    if (!salesData) {
      return;
    }

    toast.info("Obrađivanje podataka za izveštaj...");

    // Process the data
    const reportData = processReportData(salesData);
    
    // Calculate totals
    const totalsData = calculateTotals(reportData);
    
    // Create workbook
    const wb = createDailyReportWorkbook(reportData, totalsData);
    
    // Generate a more descriptive filename with the current date
    const today = new Date();
    const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
    const filename = `Dnevni-Detaljan-Izvestaj-${dateStr}`;

    // Save to app storage first, then try normal export as fallback
    console.log(`Saving workbook with filename: ${filename}`);
    toast.info("Čuvanje izveštaja u toku... Sačekajte poruku o uspešnom završetku.");
    
    const storedFile = await saveWorkbookToStorage(wb, filename);
    
    if (storedFile) {
      toast.success(`Dnevni izveštaj je uspešno sačuvan`, {
        description: `Možete ga pronaći u meniju Dokumenti`,
        action: {
          label: 'Otvori Dokumenti',
          onClick: () => {
            if (redirectToDocuments) {
              redirectToDocuments();
            }
          }
        },
        duration: 10000
      });
    }
    
    // Also try regular export as fallback with explicit options
    try {
      await exportWorkbook(wb, filename);
    } catch (exportErr) {
      console.log("Regular export failed, but file is saved to app storage:", exportErr);
    }

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error(`Greška pri generisanju izveštaja: ${error instanceof Error ? error.message : String(error)}`);
  }
};
