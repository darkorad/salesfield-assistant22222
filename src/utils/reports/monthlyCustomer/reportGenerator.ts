
import * as XLSX from 'xlsx';

/**
 * Creates detailed report data from customer sales
 */
export const createDetailedReportData = (customerSalesDetails: Record<string, any>) => {
  const reportData = [];

  // Add each customer's data with a header row and items
  Object.values(customerSalesDetails).forEach((customer: any) => {
    // Add customer header
    reportData.push({
      'Kupac': customer.name,
      'PIB': customer.pib,
      'Adresa': customer.address,
      'Grad': customer.city,
      'Datum': '',
      'Proizvod': '',
      'Proizvođač': '',
      'Količina': '',
      'Jedinica mere': '',
      'Cena': '',
      'Ukupno': '',
      'Način plaćanja': ''
    });
    
    // Add customer's items
    customer.items.forEach(item => {
      reportData.push({
        'Kupac': '',
        'PIB': '',
        'Adresa': '',
        'Grad': '',
        'Datum': item.date,
        'Proizvod': item.product,
        'Proizvođač': item.manufacturer,
        'Količina': item.quantity,
        'Jedinica mere': item.unit,
        'Cena': item.price,
        'Ukupno': item.total,
        'Način plaćanja': item.payment_type
      });
    });
    
    // Add empty row after customer
    reportData.push({
      'Kupac': '',
      'PIB': '',
      'Adresa': '',
      'Grad': '',
      'Datum': '',
      'Proizvod': '',
      'Proizvođač': '',
      'Količina': '',
      'Jedinica mere': '',
      'Cena': '',
      'Ukupno': '',
      'Način plaćanja': ''
    });
  });

  return reportData;
};

/**
 * Creates summary report data from customer sales summary
 */
export const createSummaryReportData = (customerSalesSummary: Record<string, any>) => {
  // Create customer summary data for second sheet
  const summaryData = Object.values(customerSalesSummary)
    .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
    .map((customer: any) => ({
      'Kupac': customer.name,
      'PIB': customer.pib,
      'Adresa': customer.address,
      'Grad': customer.city,
      'Ukupno gotovina': customer.totalCash,
      'Ukupno račun': customer.totalInvoice,
      'Ukupan iznos': customer.totalAmount
    }));

  // Calculate monthly totals
  const totalCash = summaryData.reduce((sum, item) => sum + item['Ukupno gotovina'], 0);
  const totalInvoice = summaryData.reduce((sum, item) => sum + item['Ukupno račun'], 0);
  const totalAmount = summaryData.reduce((sum, item) => sum + item['Ukupan iznos'], 0);

  // Add totals row to summary
  summaryData.push({
    'Kupac': 'UKUPNO:',
    'PIB': '',
    'Adresa': '',
    'Grad': '',
    'Ukupno gotovina': totalCash,
    'Ukupno račun': totalInvoice,
    'Ukupan iznos': totalAmount
  });

  return summaryData;
};

/**
 * Creates and configures worksheets for the Excel workbook
 */
export const createWorkbook = (reportData: any[], summaryData: any[]) => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create detailed worksheet
  const wsDetails = XLSX.utils.json_to_sheet(reportData);
  wsDetails['!cols'] = [
    { wch: 30 }, // Kupac
    { wch: 15 }, // PIB
    { wch: 30 }, // Adresa
    { wch: 20 }, // Grad
    { wch: 15 }, // Datum
    { wch: 30 }, // Proizvod
    { wch: 20 }, // Proizvođač
    { wch: 10 }, // Količina
    { wch: 15 }, // Jedinica mere
    { wch: 12 }, // Cena
    { wch: 12 }, // Ukupno
    { wch: 15 }  // Način plaćanja
  ];
  
  // Create summary worksheet
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 30 }, // Kupac
    { wch: 15 }, // PIB
    { wch: 30 }, // Adresa
    { wch: 20 }, // Grad
    { wch: 15 }, // Ukupno gotovina
    { wch: 15 }, // Ukupno račun
    { wch: 15 }  // Ukupan iznos
  ];
  
  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, wsDetails, "Detaljna prodaja");
  XLSX.utils.book_append_sheet(wb, wsSummary, "Zbirna prodaja");
  
  return wb;
};
