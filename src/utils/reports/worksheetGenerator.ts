import * as XLSX from "xlsx";
import { CashSale } from "@/types/reports";
import { applyStyleToRange, getColumnWidths } from "./worksheetStyles";

export const generateCashSalesWorksheet = (salesData: CashSale[]) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Set column widths
  const columnWidths = getColumnWidths();
  ws['!cols'] = [...columnWidths.left, columnWidths.spacing, ...columnWidths.right];

  let rowIndex = 0;
  let pageBreaks = [];

  // Process each sale
  salesData.forEach((sale, saleIndex) => {
    const customer = sale.customer;
    
    // Add headers
    const headers = [
      [`Kupac: ${customer.name}`, '', '', '', '', '', `Kupac: ${customer.name}`],
      [`Adresa: ${customer.address}`, '', '', '', '', '', `Adresa: ${customer.address}`],
      [`Telefon: ${customer.phone || ''}`, '', '', '', '', '', `Telefon: ${customer.phone || ''}`],
      [''],
      ['Artikal', 'Količina', 'Jed.mere', 'Cena', 'Ukupno', '', 'Artikal', 'Količina', 'Jed.mere', 'Cena', 'Ukupno']
    ];

    headers.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
    });

    // Style headers
    applyStyleToRange(ws, rowIndex, rowIndex + 4, true);
    rowIndex += 5;

    // Add and style items
    const items = sale.items.map(item => [
      item.product.Naziv,
      item.quantity,
      item.product["Jedinica mere"],
      item.product.Cena,
      item.quantity * item.product.Cena
    ]);

    // Fill to 12 rows
    while (items.length < 12) {
      items.push(['', '', '', '', '']);
    }

    items.forEach((item, index) => {
      const row = [...item, '', ...item];
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
    });

    applyStyleToRange(ws, rowIndex, rowIndex + 11);
    rowIndex += 12;

    // Add totals
    const totalsRows = [
      ['Dugovanje iz prethodnog računa:', '', '', '', sale.previousDebt || 0, '', 'Dugovanje iz prethodnog računa:', '', '', '', sale.previousDebt || 0],
      ['Ukupno artikli:', '', '', '', sale.total, '', 'Ukupno artikli:', '', '', '', sale.total],
      ['Ostalo dugovanje:', '', '', '', { f: `SUM(E${rowIndex+1}:E${rowIndex+2})` }, '', 'Ostalo dugovanje:', '', '', '', { f: `SUM(K${rowIndex+1}:K${rowIndex+2})` }]
    ];

    totalsRows.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
    });

    applyStyleToRange(ws, rowIndex, rowIndex + 2, true);

    // Add page break after each customer except the last one
    if (saleIndex < salesData.length - 1) {
      pageBreaks.push(rowIndex + totalsRows.length);
    }

    rowIndex += 15; // Add spacing for next customer
  });

  // Set page breaks
  ws['!rows'] = [];
  pageBreaks.forEach(breakRow => {
    ws['!rows'][breakRow] = { hidden: false, hpx: 0, level: 0 };
  });

  // Set print settings
  ws['!print'] = {
    orientation: 'landscape',
    paper: 9, // A4
    scale: 1,
    fitToPage: true,
    pageMargins: [0.05, 0.05, 0.05, 0.05]
  };

  return { wb, ws };
};