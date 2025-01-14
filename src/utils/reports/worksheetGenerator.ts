import * as XLSX from "xlsx";
import { CashSale } from "@/types/reports";

export const generateCashSalesWorksheet = (salesData: CashSale[]) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Set column widths
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
    rowIndex += 4;

    // Track the start of items for formula ranges
    const leftItemsStartRow = rowIndex;
    const rightItemsStartRow = rowIndex;
    
    // Add items
    const maxItems = Math.max(
      leftSale.items.length,
      rightSale ? rightSale.items.length : 0
    );

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

      const row = [
        leftItem.product.Naziv,
        leftItem.quantity || '',
        leftItem.product.Cena || '',
        { f: `B${rowIndex + j + 1}*C${rowIndex + j + 1}` }, // Excel formula for left total
        '',
        rightItem.product.Naziv,
        rightItem.quantity || '',
        rightItem.product.Cena || '',
        { f: `G${rowIndex + j + 1}*H${rowIndex + j + 1}` }  // Excel formula for right total
      ];

      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + j });
    }

    rowIndex += maxItems;

    // Add totals with Excel formulas
    const leftTotalRow = rowIndex;
    const rightTotalRow = rowIndex;

    const totalsRows = [
      [
        'Ukupno:', 
        '', 
        '', 
        { f: `SUM(D${leftItemsStartRow + 1}:D${leftTotalRow})` },
        '',
        'Ukupno:', 
        '', 
        '', 
        rightSale ? { f: `SUM(I${rightItemsStartRow + 1}:I${rightTotalRow})` } : ''
      ],
      [
        'Dug iz prethodnog perioda:', 
        '', 
        '', 
        leftSale.previousDebt || 0,
        '',
        'Dug iz prethodnog perioda:', 
        '', 
        '', 
        rightSale ? (rightSale.previousDebt || 0) : ''
      ],
      [
        'ZBIR:', 
        '', 
        '', 
        { f: `SUM(D${leftTotalRow + 1}:D${leftTotalRow + 2})` },
        '',
        'ZBIR:', 
        '', 
        '', 
        rightSale ? { f: `SUM(I${rightTotalRow + 1}:I${rightTotalRow + 2})` } : ''
      ],
      ['potpis kupca', 'potpis vozaca', '', '', '', 'potpis kupca', 'potpis vozaca']
    ];

    totalsRows.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
    });

    // Add page break after each pair except the last one
    if (i < salesData.length - 2) {
      pageBreaks.push(rowIndex + 4);
    }

    rowIndex += 6; // Add spacing for next pair
  }

  // Set page breaks
  ws['!rows'] = [];
  pageBreaks.forEach(breakRow => {
    ws['!rows'][breakRow] = { hidden: false, hpx: 0, level: 0 };
  });

  // Set print settings for landscape and fit to page
  ws['!print'] = {
    orientation: 'landscape',
    paper: 9, // A4
    scale: 0, // 0 means "fit to page"
    fitToPage: true,
    fitToHeight: 1,
    fitToWidth: 1,
    pageMargins: [0.25, 0.25, 0.25, 0.25] // inches
  };

  XLSX.utils.book_append_sheet(wb, ws, "Gotovinska prodaja");

  return { wb, ws };
};