
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { fetchTodayCashSales } from "@/services/salesService";
import { generateCashSalesWorksheet } from "./worksheetGenerator";
import { exportWorkbook } from "@/utils/fileExport";

export const exportCashCustomersReport = async () => {
  try {
    toast.info("Priprema izveštaja gotovinske prodaje...");
    
    const salesData = await fetchTodayCashSales();
    if (!salesData) return;

    const { wb, ws } = generateCashSalesWorksheet(salesData);

    // Export the workbook without specific tab name
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    await exportWorkbook(wb, `gotovinska-prodaja-${dateStr}`);

  } catch (error) {
    console.error("Error exporting cash customers report:", error);
    toast.error("Greška pri izvozu izveštaja");
  }
};
