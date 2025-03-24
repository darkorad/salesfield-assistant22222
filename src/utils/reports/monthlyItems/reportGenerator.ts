
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { ItemSummary, ReportItem } from "./types";
import { exportWorkbook } from "@/utils/fileExport";
import { saveWorkbookToStorage } from "@/utils/fileStorage";

/**
 * Convert item summaries to report data format
 */
export function createReportData(itemsSummary: Record<string, ItemSummary>): ReportItem[] {
  // Convert to array and sort by total value
  return Object.values(itemsSummary)
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((item) => ({
      'Naziv artikla': item.name,
      'Proizvođač': item.manufacturer,
      'Jedinica mere': item.unit,
      'Ukupna količina': parseFloat(item.totalQuantity.toFixed(2)),
      'Ukupna vrednost': parseFloat(item.totalValue.toFixed(2))
    }));
}

/**
 * Add totals row to report data
 */
export function addTotalsRow(reportData: ReportItem[]): ReportItem[] {
  if (reportData.length === 0) {
    return reportData;
  }

  // Calculate total values
  const totalQuantity = reportData.reduce((sum, item) => sum + (item['Ukupna količina'] || 0), 0);
  const totalValue = reportData.reduce((sum, item) => sum + (item['Ukupna vrednost'] || 0), 0);

  // Add totals row
  reportData.push({
    'Naziv artikla': 'UKUPNO:',
    'Proizvođač': '',
    'Jedinica mere': '',
    'Ukupna količina': parseFloat(totalQuantity.toFixed(2)),
    'Ukupna vrednost': parseFloat(totalValue.toFixed(2))
  });

  return reportData;
}

/**
 * Generate Excel workbook from report data
 */
export function generateWorkbook(reportData: ReportItem[]): XLSX.WorkBook {
  toast.info("Generisanje Excel izveštaja...");

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet with specific options
  const ws = XLSX.utils.json_to_sheet(reportData, {
    cellDates: true,
    cellStyles: true
  });

  // Set column widths
  ws['!cols'] = [
    { wch: 40 }, // Naziv artikla
    { wch: 20 }, // Proizvođač
    { wch: 15 }, // Jedinica mere
    { wch: 15 }, // Ukupna količina
    { wch: 15 }  // Ukupna vrednost
  ];

  // Generate a descriptive sheet name with current date
  const today = new Date();
  const sheetName = `Artikli ${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;

  // Add worksheet to workbook with descriptive name
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  return wb;
}

/**
 * Export workbook to file and storage
 */
export async function exportWorkbookToFileAndStorage(
  wb: XLSX.WorkBook, 
  fileName: string,
  redirectToDocuments?: () => void
): Promise<void> {
  // Format filename with proper date format
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  
  // Include date in the filename if not already present
  if (!fileName.includes('-')) {
    fileName = `${fileName}-${day}-${month}-${year}`;
  }

  // Save to storage
  const storedFile = await saveWorkbookToStorage(wb, fileName);
  
  if (storedFile) {
    toast.success(`Mesečni izveštaj je uspešno sačuvan`, {
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
  
  // Export the workbook using proper options
  console.log(`Exporting monthly items report with filename: ${fileName}`);
  await exportWorkbook(wb, fileName);
}
