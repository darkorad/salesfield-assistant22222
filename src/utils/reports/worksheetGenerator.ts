import * as XLSX from "xlsx";
import { CashSale } from "@/types/reports";
import { applyStyleToRange, getColumnWidths } from "./worksheetStyles";

export const generateCashSalesWorksheet = (salesData: CashSale[]) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Set column widths for the dual-column layout
  const columnWidths = [
    { wch: 30 }, // Product name
    { wch: 8 },  // Quantity
    { wch: 8 },  // Price
    { wch: 10 }, // Total
    { wch: 2 },  // Spacing
    { wch: 30 }, // Product name (right side)
    { wch: 8 },  // Quantity (right side)
    { wch: 8 },  // Price (right side)
    { wch: 10 }  // Total (right side)
  ];
  ws['!cols'] = columnWidths;

  let rowIndex = 0;
  let pageBreaks = [];

  // Process each sale in pairs
  for (let i = 0; i < salesData.length; i += 2) {
    const leftSale = salesData[i];
    const rightSale = salesData[i + 1];

    // Add headers
    const headers = [
      [`Naziv kupca: ${leftSale.customer.name}`, '', '', '', '', rightSale ? `Naziv kupca: ${rightSale.customer.name}` : ''],
      [`Adresa: ${leftSale.customer.address}`, '', '', '', '', rightSale ? `Adresa: ${rightSale.customer.address}` : ''],
      [''],
      ['Proizvod', 'Kom', 'Cena', 'Ukupno', '', 'Proizvod', 'Kom', 'Cena', 'Ukupno']
    ];

    headers.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
    });

    // Style headers
    applyStyleToRange(ws, rowIndex, rowIndex + 3, true);
    rowIndex += 4;

    // Add items
    const maxItems = Math.max(
      leftSale.items.length,
      rightSale ? rightSale.items.length : 0
    );

    let leftTotal = 0;
    let rightTotal = 0;

    for (let j = 0; j < maxItems; j++) {
      const leftItem = leftSale.items[j] || { 
        product: { 
          Naziv: '', 
          Cena: 0, 
          "Jedinica mere": ''
        }, 
        quantity: 0, 
        total: 0 
      };
      const rightItem = rightSale?.items[j] || { 
        product: { 
          Naziv: '', 
          Cena: 0, 
          "Jedinica mere": ''
        }, 
        quantity: 0, 
        total: 0 
      };

      // Calculate row totals
      const leftRowTotal = leftItem.quantity * leftItem.product.Cena;
      const rightRowTotal = rightItem.quantity * rightItem.product.Cena;
      
      // Add to running totals
      leftTotal += leftRowTotal;
      rightTotal += rightRowTotal;

      const row = [
        leftItem.product.Naziv,
        leftItem.quantity || '',
        leftItem.product.Cena || '',
        leftRowTotal || '',
        '',
        rightItem.product.Naziv,
        rightItem.quantity || '',
        rightItem.product.Cena || '',
        rightRowTotal || ''
      ];

      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + j });
      applyStyleToRange(ws, rowIndex + j, rowIndex + j);
    }

    rowIndex += maxItems;

    // Add totals with proper number parsing
    const leftPreviousDebt = parseFloat(leftSale.previousDebt?.toString() || '0');
    const rightPreviousDebt = rightSale ? parseFloat(rightSale.previousDebt?.toString() || '0') : 0;

    const totalsRows = [
      ['Ukupno:', '', '', leftTotal || '', '', 'Ukupno:', '', '', rightSale ? rightTotal : ''],
      ['Dug iz prethodnog perioda:', '', '', leftPreviousDebt || '', '', 'Dug iz prethodnog perioda:', '', '', rightSale ? rightPreviousDebt : ''],
      ['ZBIR:', '', '', (leftTotal + leftPreviousDebt) || '', '', 'ZBIR:', '', '', rightSale ? (rightTotal + rightPreviousDebt) : ''],
      ['potpis kupca', 'potpis vozaca', '', '', '', 'potpis kupca', 'potpis vozaca']
    ];

    totalsRows.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
    });

    applyStyleToRange(ws, rowIndex, rowIndex + 3, true);

    // Add page break after each pair except the last one
    if (i < salesData.length - 2) {
      pageBreaks.push(rowIndex + 4);
    }

    rowIndex += 6; // Add some spacing for next pair
  }

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
    pageMargins: [0.25, 0.25, 0.25, 0.25]
  };

  XLSX.utils.book_append_sheet(wb, ws, "Gotovinska prodaja");

  return { wb, ws };
};