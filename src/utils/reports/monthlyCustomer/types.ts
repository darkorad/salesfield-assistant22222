
/**
 * Types for the monthly customer report
 */

export interface CustomerSalesData {
  customerInfo: {
    name: string;
    pib: string;
    address: string;
    city: string;
  };
  sales: any[];
  cashTotal: number;
  invoiceTotal: number;
}

export interface ReportItem {
  'Kupac': string;
  'PIB': string;
  'Adresa': string;
  'Grad': string;
  'Ukupno gotovina': number;
  'Ukupno račun': number;
  'Ukupno': number;
}

export interface ExportOptions {
  redirectToDocuments?: () => void;
}
