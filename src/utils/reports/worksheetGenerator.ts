import * as XLSX from "xlsx";
import { CashSale } from "@/types/reports";

export const generateCashSalesWorksheet = (salesData: CashSale[]) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Set column widths for A4 landscape layout
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

  // Process each sale one at a time (one customer per page)
  for (let i = 0; i < salesData.length; i++) {
    const sale = salesData[i];

    // Add headers for both left and right sides
    const headers = [
      [`Naziv kupca: ${sale.customer.name}`, '', '', '', '', `Naziv kupca: ${sale.customer.name}`],
      [`Adresa: ${sale.customer.address}`, '', '', '', '', `Adresa: ${sale.customer.address}`],
      [''],
      ['Proizvod', 'Kom', 'Cena', 'Ukupno', '', 'Proizvod', 'Kom', 'Cena', 'Ukupno']
    ];

    headers.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
    });
    rowIndex += 4;

    // Track the start of items for formula ranges
    const itemsStartRow = rowIndex;
    
    // Add items
    sale.items.forEach((item, j) => {
      const row = [
        item.product.Naziv,
        item.quantity,
        item.product.Cena,
        { f: `B${rowIndex + j + 1}*C${rowIndex + j + 1}` }, // Left side total
        '',
        item.product.Naziv,
        item.quantity,
        item.product.Cena,
        { f: `G${rowIndex + j + 1}*H${rowIndex + j + 1}` }  // Right side total
      ];

      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + j });
    });

    rowIndex += sale.items.length;

    // Add totals with Excel formulas
    const totalRow = rowIndex;

    const totalsRows = [
      [
        'Ukupno:', 
        '', 
        '', 
        { f: `SUM(D${itemsStartRow + 1}:D${totalRow})` },
        '',
        'Ukupno:', 
        '', 
        '', 
        { f: `SUM(I${itemsStartRow + 1}:I${totalRow})` }
      ],
      [
        'Dug iz prethodnog perioda:', 
        '', 
        '', 
        sale.previousDebt || 0,
        '',
        'Dug iz prethodnog perioda:', 
        '', 
        '', 
        sale.previousDebt || 0
      ],
      [
        'ZBIR:', 
        '', 
        '', 
        { f: `SUM(D${totalRow + 1}:D${totalRow + 2})` },
        '',
        'ZBIR:', 
        '', 
        '', 
        { f: `SUM(I${totalRow + 1}:I${totalRow + 2})` }
      ],
      ['potpis kupca', 'potpis vozaca', '', '', '', 'potpis kupca', 'potpis vozaca']
    ];

    totalsRows.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
    });

    // Add page break after each customer except the last one
    if (i < salesData.length - 1) {
      ws['!rows'] = ws['!rows'] || [];
      ws['!rows'][rowIndex + 4] = { hidden: false, hpx: 0, level: 0 };
    }

    // Add extra spacing for next customer's page
    rowIndex += 6;
  }

  // Set print settings for A4 landscape
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