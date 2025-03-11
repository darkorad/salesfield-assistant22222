
import * as XLSX from 'xlsx';

export const createDetailedReportData = (customerSalesDetails: Record<string, any>) => {
  const reportData = [];
  let customerIndex = 1;

  // Add each customer's data with index and a header row
  Object.values(customerSalesDetails).forEach((customer: any) => {
    // Add customer header with index
    reportData.push({
      'Rbr': customerIndex,
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
        'Rbr': '',
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
      'Rbr': '',
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

    customerIndex++;
  });

  return reportData;
};

export const createSummaryReportData = (customerSalesSummary: Record<string, any>) => {
  // Create an interface for the summary row to ensure type safety
  interface SummaryRow {
    'Rbr': number | string;
    'Kupac': string;
    'PIB': string;
    'Adresa': string;
    'Grad': string;
    'Ukupno gotovina': number;
    'Ukupno račun': number;
    'Ukupan iznos': number;
  }
  
  // Create customer summary data for second sheet, sorted by total amount
  const summaryData: SummaryRow[] = Object.values(customerSalesSummary)
    .sort((a: any, b: any) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0))
    .map((customer: any, index: number) => ({
      'Rbr': index + 1,
      'Kupac': customer.name,
      'PIB': customer.pib,
      'Adresa': customer.address,
      'Grad': customer.city,
      'Ukupno gotovina': Number(customer.totalCash || 0),
      'Ukupno račun': Number(customer.totalInvoice || 0),
      'Ukupan iznos': Number(customer.totalAmount || 0)
    }));

  // Calculate monthly totals ensuring numeric values
  const totalCash = summaryData.reduce((sum, item) => sum + item['Ukupno gotovina'], 0);
  const totalInvoice = summaryData.reduce((sum, item) => sum + item['Ukupno račun'], 0);
  const totalAmount = summaryData.reduce((sum, item) => sum + item['Ukupan iznos'], 0);

  // Add totals row with explicit number conversion
  summaryData.push({
    'Rbr': '',
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

export const createWorkbook = (reportData: any[], summaryData: any[]) => {
  const wb = XLSX.utils.book_new();
  
  // Create detailed worksheet
  const wsDetails = XLSX.utils.json_to_sheet(reportData);
  wsDetails['!cols'] = [
    { wch: 5 },  // Rbr
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
    { wch: 5 },  // Rbr
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
