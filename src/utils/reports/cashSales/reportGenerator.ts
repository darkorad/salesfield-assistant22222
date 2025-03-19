
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { CashSale } from "@/types/reports";
import { generateCashSalesWorksheet } from "@/utils/reports/worksheet/cashSalesWorksheet";
import { saveWorkbookToStorage } from "@/utils/fileStorage";
import { exportWorkbook } from "@/utils/fileExport";

/**
 * Generate and save a cash sales report
 */
export const generateCashSalesReport = async (
  formattedSales: CashSale[],
  selectedDate: Date,
  onSuccess?: () => void
): Promise<boolean> => {
  try {
    toast.info("Generisanje izveštaja...");
    
    // Generate the worksheet
    const { wb } = generateCashSalesWorksheet(formattedSales);
    
    // Format date string for filename: DD.MM.YYYY
    const dateStr = `${selectedDate.getDate()}.${selectedDate.getMonth() + 1}.${selectedDate.getFullYear()}`;
    
    // Create sheet name for better identification
    const worksheetName = `Gotovinska prodaja ${dateStr}`;
    const firstSheet = wb.SheetNames[0];
    const worksheet = wb.Sheets[firstSheet];
    
    // Create a new workbook with properly named sheet
    const namedWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(namedWb, worksheet, worksheetName);
    
    // Save the workbook to app storage
    const fileName = `Gotovinska-Prodaja-${dateStr}`;
    
    toast.info("Čuvanje izveštaja u toku...");
    
    // Save to app storage
    const storedFile = await saveWorkbookToStorage(namedWb, fileName);
    
    if (storedFile) {
      toast.success(`Izveštaj je uspešno sačuvan`, {
        description: `Možete ga pronaći u meniju Dokumenti`,
        action: {
          label: 'Otvori Dokumenti',
          onClick: onSuccess
        },
        duration: 8000
      });

      // Also try regular export as fallback
      try {
        await exportWorkbook(namedWb, fileName);
      } catch (exportErr) {
        console.log("Regular export failed, but file is saved to app storage:", exportErr);
      }
      
      return true;
    }
    
    throw new Error("Nije uspelo čuvanje fajla");
  } catch (error) {
    throw error;
  }
};
