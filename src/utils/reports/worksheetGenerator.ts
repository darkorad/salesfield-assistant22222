import * as XLSX from "xlsx";
import { CashSale } from "@/types/reports";

export const generateCashSalesWorksheet = (salesData: CashSale[]) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Set column widths for A4 landscape layout (297mm width)
  const columnWidths = [
    { wch: 35 }, // Product name (wider for better readability)
    { wch: 10 }, // Quantity
    { wch: 10 }, // Price
    { wch: 12 }, // Total
    { wch: 3 },  // Spacing
    { wch: 35 }, // Product name (right side)
    { wch: 10 }, // Quantity (right side)
    { wch: 10 }, // Price (right side)
    { wch: 12 }  // Total (right side)
  ];
  ws['!cols'] = columnWidths;

  // Initialize row tracking
  let rowIndex = 0;

  // Process each sale (one customer per page)
  salesData.forEach((sale, saleIndex) => {
    // Start each customer at the beginning of a new page
    if (saleIndex > 0) {
      rowIndex = (Math.ceil(rowIndex / 44) * 44); // 44 rows per page in landscape
    }

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
        { f: `B${rowIndex + j + 1}*C${rowIndex + j + 1}` },
        '',
        item.product.Naziv,
        item.quantity,
        item.product.Cena,
        { f: `G${rowIndex + j + 1}*H${rowIndex + j + 1}` }
      ];

      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + j });
    });

    rowIndex += sale.items.length;

    // Add totals
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
      [''],
      ['potpis kupca', '', 'potpis vozaca', '', '', 'potpis kupca', '', 'potpis vozaca']
    ];

    totalsRows.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
    });
    
    rowIndex += totalsRows.length;
  });

  // Set print settings for A4 landscape
  ws['!print'] = {
    orientation: 'landscape',
    paper: 9, // A4
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    scale: 65, // Adjusted scale to fit content better
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    },
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToWidth: 1,
      fitToHeight: 1
    }
  };

  // Set page breaks
  ws['!rows'] = [];
  salesData.forEach((_, index) => {
    if (index < salesData.length - 1) {
      ws['!rows'][(index + 1) * 44 - 1] = { hidden: false, hpx: 1, level: 0, pageBreak: true };
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, "Gotovinska prodaja");

  return { wb, ws };
};