
import * as XLSX from "xlsx";
import { CashSale } from "@/types/reports";

export const generateCashSalesWorksheet = (salesData: CashSale[]) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Set column widths for A4 landscape layout
  const columnWidths = [
    { wch: 30 }, // Product name
    { wch: 8 },  // Quantity
    { wch: 10 }, // Price
    { wch: 12 }, // Total
    { wch: 3 },  // Spacing
    { wch: 30 }, // Product name (right side)
    { wch: 8 },  // Quantity (right side)
    { wch: 10 }, // Price (right side)
    { wch: 12 }  // Total (right side)
  ];
  ws['!cols'] = columnWidths;

  // Process each sale (one customer per page)
  salesData.forEach((sale, saleIndex) => {
    // Calculate starting row for this customer
    const startRow = saleIndex * 44; // 44 rows per page in landscape

    // Add customer information
    const headers = [
      [`Naziv kupca: ${sale.customer.name}`, '', '', '', '', `Naziv kupca: ${sale.customer.name}`],
      [`Adresa: ${sale.customer.address}`, '', '', '', '', `Adresa: ${sale.customer.address}`],
      [''],
      ['Proizvod', 'Kom', 'Cena', 'Ukupno', '', 'Proizvod', 'Kom', 'Cena', 'Ukupno']
    ];

    headers.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: startRow + index });
    });

    // Add table structure (empty rows for the full page)
    const tableRows = 35; // Number of rows in the table
    for (let i = 0; i < tableRows; i++) {
      const emptyRow = ['', '', '', '', '', '', '', '', ''];
      XLSX.utils.sheet_add_aoa(ws, [emptyRow], { origin: startRow + 4 + i });
    }

    // Fill in actual items with correct formulas that include unit size
    sale.items.forEach((item, itemIndex) => {
      const itemRow = [
        item.product.Naziv,
        item.quantity,
        item.product.Cena,
        item.total, // Pre-calculated total with correct unit size
        '',
        item.product.Naziv,
        item.quantity,
        item.product.Cena,
        item.total // Pre-calculated total with correct unit size
      ];
      XLSX.utils.sheet_add_aoa(ws, [itemRow], { origin: startRow + 4 + itemIndex });
    });

    // Add totals at the bottom
    const totalsStartRow = startRow + 39; // 5 rows from bottom
    const totalsRows = [
      [
        'Ukupno:', 
        '', 
        '', 
        sale.total, // Pre-calculated total for all items
        '',
        'Ukupno:', 
        '', 
        '', 
        sale.total // Pre-calculated total for all items
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
        sale.total + (sale.previousDebt || 0),
        '',
        'ZBIR:', 
        '', 
        '', 
        sale.total + (sale.previousDebt || 0)
      ],
      [''],
      ['potpis kupca', '', 'potpis vozaca', '', '', 'potpis kupca', '', 'potpis vozaca']
    ];

    totalsRows.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: totalsStartRow + index });
    });
  });

  // Set print settings for A4 landscape
  ws['!print'] = {
    orientation: 'landscape',
    paper: 9, // A4
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    scale: 70,
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

  XLSX.utils.book_append_sheet(wb, ws, "Gotovinska prodaja");

  return { wb, ws };
};
