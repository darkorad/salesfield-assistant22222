
import * as XLSX from 'xlsx';

/**
 * Creates an Excel workbook with the report data
 */
export const createDailyReportWorkbook = (reportData: any[], totalsData: {
  cashTotal: number,
  invoiceTotal: number,
  grandTotal: number,
  customerTotals: Record<string, { name: string, address: string, total: number }>
}) => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(reportData);

  // Set column widths
  ws['!cols'] = [
    { wch: 20 },  // Datum
    { wch: 30 },  // Kupac
    { wch: 15 },  // PIB
    { wch: 30 },  // Adresa
    { wch: 20 },  // Grad
    { wch: 30 },  // Proizvod
    { wch: 20 },  // Proizvođač
    { wch: 10 },  // Količina
    { wch: 15 },  // Jedinica mere
    { wch: 12 },  // Cena
    { wch: 12 },  // Ukupno
    { wch: 15 }   // Način plaćanja
  ];

  // Add summary rows with customer names
  const summaryRows = [];
  
  // Add empty row first
  summaryRows.push([]);
  
  // Add customer totals
  Object.values(totalsData.customerTotals).forEach((customer) => {
    summaryRows.push(['KUPAC:', customer.name, '', 'Adresa:', customer.address]);
    summaryRows.push(['UKUPNO ZA KUPCA:', '', '', '', '', '', '', '', '', '', customer.total]);
    summaryRows.push([]); // Empty row for spacing
  });
  
  // Add overall totals at the end
  summaryRows.push(['UKUPNO GOTOVINA:', '', '', '', '', '', '', '', '', '', totalsData.cashTotal, '']);
  summaryRows.push(['UKUPNO RAČUN:', '', '', '', '', '', '', '', '', '', totalsData.invoiceTotal, '']);
  summaryRows.push(['UKUPNO:', '', '', '', '', '', '', '', '', '', totalsData.grandTotal, '']);

  // Add all summary rows to worksheet
  XLSX.utils.sheet_add_aoa(ws, summaryRows, { origin: -1 });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Dnevni izveštaj");

  return wb;
};

/**
 * Generate filename with current date
 */
export const generateReportFilename = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  
  // Format: DanasnjIzvestaj-DD-MM-YYYY
  return `Današnji izveštaj-${day}-${month}-${year}`;
};
