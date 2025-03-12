
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { exportWorkbook } from "@/utils/fileExport";
import { saveWorkbookToStorage } from "@/utils/fileStorage";
import { CustomerSalesData, ReportItem } from "./types";

/**
 * Create report data from processed customer sales
 */
export function createReportData(customerSales: Record<string, CustomerSalesData>): ReportItem[] {
  const reportData = Object.values(customerSales).map((customerData: CustomerSalesData) => {
    const { customerInfo, cashTotal, invoiceTotal } = customerData;
    return {
      'Kupac': customerInfo.name,
      'PIB': customerInfo.pib,
      'Adresa': customerInfo.address,
      'Grad': customerInfo.city,
      'Ukupno gotovina': cashTotal,
      'Ukupno račun': invoiceTotal,
      'Ukupno': cashTotal + invoiceTotal
    };
  });

  // Sort by total amount
  return reportData.sort((a, b) => b['Ukupno'] - a['Ukupno']);
}

/**
 * Generate workbook with report data
 */
export function generateWorkbook(reportData: ReportItem[]): XLSX.WorkBook {
  // Calculate grand totals
  const cashGrandTotal = reportData.reduce((sum, item) => sum + item['Ukupno gotovina'], 0);
  const invoiceGrandTotal = reportData.reduce((sum, item) => sum + item['Ukupno račun'], 0);
  const grandTotal = cashGrandTotal + invoiceGrandTotal;

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(reportData);

  // Set column widths
  ws['!cols'] = [
    { wch: 30 },  // Kupac
    { wch: 15 },  // PIB
    { wch: 30 },  // Adresa
    { wch: 20 },  // Grad
    { wch: 15 },  // Ukupno gotovina
    { wch: 15 },  // Ukupno račun
    { wch: 15 }   // Ukupno
  ];

  // Add summary rows
  XLSX.utils.sheet_add_aoa(ws, [
    [],  // Empty row
    ['UKUPNO GOTOVINA:', '', '', '', cashGrandTotal, '', ''],
    ['UKUPNO RAČUN:', '', '', '', '', invoiceGrandTotal, ''],
    ['UKUPNO:', '', '', '', '', '', grandTotal]
  ], { origin: -1 });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Mesečni izveštaj po kupcima");

  return wb;
}

/**
 * Export workbook to file and storage
 */
export async function exportWorkbookToFileAndStorage(
  wb: XLSX.WorkBook, 
  filename: string, 
  redirectToDocuments?: () => void
): Promise<void> {
  // Save to storage
  const storedFile = await saveWorkbookToStorage(wb, filename);
  
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

  // Export the workbook
  console.log(`Exporting workbook with filename: ${filename}`);
  toast.info("Izvoz mesečnog izveštaja u toku... Sačekajte poruku o uspešnom završetku.");
  await exportWorkbook(wb, filename);
  toast.success(`Mesečni izveštaj po kupcima je uspešno izvezen`, {
    description: "Fajl se nalazi u Download/Preuzimanja folderu. Otvorite 'Files' ili 'My Files' aplikaciju da ga pronađete.",
    duration: 10000
  });
}
