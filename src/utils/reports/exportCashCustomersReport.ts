import * as XLSX from "xlsx";
import { toast } from "sonner";
import { fetchTodayCashSales } from "@/services/salesService";
import { generateCashSalesWorksheet } from "./worksheetGenerator";

export const exportCashCustomersReport = async () => {
  try {
    const salesData = await fetchTodayCashSales();
    if (!salesData) return;

    const { wb, ws } = generateCashSalesWorksheet(salesData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Kupci za gotovinu');

    // Save workbook
    const today = new Date();
    XLSX.writeFile(wb, `kupci-gotovina-${today.toISOString().split('T')[0]}.xlsx`);
    toast.success("Izveštaj je uspešno izvezen");

  } catch (error) {
    console.error("Error exporting cash customers report:", error);
    toast.error("Greška pri izvozu izveštaja");
  }
};