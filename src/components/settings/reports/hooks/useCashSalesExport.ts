
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  fetchCashSalesForDate,
  filterCashSales,
  formatCashSalesForReport
} from "@/services/cashSalesService";
import { generateCashSalesReport } from "@/utils/reports/cashSales/reportGenerator";
import { 
  handleAlternativeDownload,
  createDirectBrowserDownload
} from "@/utils/reports/cashSales/fallbackUtils";

export const useCashSalesExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [hasExportFailed, setHasExportFailed] = useState(false);
  const navigate = useNavigate();

  const exportCashSales = async (selectedDate: Date | undefined) => {
    try {
      if (isExporting) {
        toast.info("Izvoz je već u toku, sačekajte");
        return;
      }

      setIsExporting(true);
      setHasExportFailed(false);
      
      if (!selectedDate) {
        toast.error("Izaberite datum");
        setIsExporting(false);
        return;
      }

      // Fetch sales data for the selected date
      const salesData = await fetchCashSalesForDate(selectedDate);
      if (!salesData) {
        setIsExporting(false);
        return;
      }

      // Filter only cash sales
      const cashSales = filterCashSales(salesData);
      if (cashSales.length === 0) {
        setIsExporting(false);
        return;
      }

      // Format sales data for report
      const formattedSales = formatCashSalesForReport(cashSales);

      // Generate and save the report
      try {
        setHasExportFailed(false);
        await generateCashSalesReport(
          formattedSales, 
          selectedDate, 
          () => navigate('/documents')
        );
      } catch (error) {
        console.error("Error during report generation:", error);
        setHasExportFailed(true);
        toast.error(`Greška pri čuvanju: ${error instanceof Error ? error.message : String(error)}`);
        
        // Try alternative download method
        await handleAlternativeDownload(formattedSales, selectedDate);
      }
    } catch (error) {
      console.error("Error exporting cash sales:", error);
      setHasExportFailed(true);
      toast.error(`Greška pri izvozu izveštaja: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenInBrowser = (selectedDate?: Date) => {
    createDirectBrowserDownload(selectedDate);
    
    // Trigger the main export a moment later
    if (selectedDate) {
      setTimeout(() => {
        exportCashSales(selectedDate);
      }, 100);
    }
  };

  return {
    isExporting,
    hasExportFailed,
    exportCashSales,
    handleOpenInBrowser
  };
};
