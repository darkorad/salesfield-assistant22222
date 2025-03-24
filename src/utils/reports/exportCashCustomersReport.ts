
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { fetchTodayCashSales } from "@/services/salesService";
import { generateCashSalesWorksheet } from "./worksheetGenerator";
import { exportWorkbook } from "@/utils/fileExport";
import { saveWorkbookToStorage } from "@/utils/fileStorage";
import { format } from "date-fns";

export const exportCashCustomersReport = async (redirectToDocuments?: () => void) => {
  try {
    toast.info("Priprema izveštaja gotovinske prodaje...");
    
    const salesData = await fetchTodayCashSales();
    if (!salesData) return;

    const { wb, ws } = generateCashSalesWorksheet(salesData);

    // Format date for filename
    const today = new Date();
    const formattedDate = format(today, "dd-MM-yyyy");
    const filename = `Gotovinska-Prodaja-${formattedDate}`;
    
    // Save to Documents storage
    const storedFile = await saveWorkbookToStorage(wb, filename);
    
    if (storedFile) {
      toast.success(`Izveštaj gotovinske prodaje je uspešno sačuvan`, {
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

    // Export the workbook for download
    await exportWorkbook(wb, filename);

  } catch (error) {
    console.error("Error exporting cash customers report:", error);
    toast.error("Greška pri izvozu izveštaja");
  }
};
