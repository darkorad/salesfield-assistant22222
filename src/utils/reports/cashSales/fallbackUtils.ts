
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { CashSale } from "@/types/reports";
import { generateCashSalesWorksheet } from "@/utils/reports/worksheet/cashSalesWorksheet";

/**
 * Handle alternative download when main export fails
 */
export const handleAlternativeDownload = async (
  formattedSales: CashSale[],
  selectedDate: Date
): Promise<void> => {
  try {
    toast.info("Pokušaj direktnog preuzimanja kroz browser...");
    
    const { wb } = generateCashSalesWorksheet(formattedSales);
    
    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([blobData], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    toast.info("Fajl je otvoren u browseru. Sačuvajte ga koristeći opciju 'Sačuvaj kao'.", {
      duration: 10000
    });
  } catch (altError) {
    console.error("Alternative download method failed:", altError);
    toast.error("Ni alternativni metod preuzimanja nije uspeo");
  }
};

/**
 * Create a direct browser download
 */
export const createDirectBrowserDownload = (selectedDate?: Date) => {
  // This will open a download dialog directly in the browser
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  
  const dateStr = selectedDate 
    ? `${selectedDate.getDate()}.${selectedDate.getMonth() + 1}.${selectedDate.getFullYear()}`
    : new Date().toLocaleDateString('sr');
  
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = '#';
  a.download = `gotovinska-prodaja-${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.dispatchEvent(event);
  document.body.removeChild(a);
};
