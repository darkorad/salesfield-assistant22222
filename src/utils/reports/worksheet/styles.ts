
// Defines common styles for worksheet cells
export const defaultCellStyle = {
  font: { sz: 20 },  // Increased from 16 to 20 for better mobile viewing
  border: {
    top: { style: 'thin' },
    right: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' }
  }
};

export const headerCellStyle = {
  ...defaultCellStyle,
  font: { sz: 20, bold: true },  // Increased from 16 to 20
  alignment: { horizontal: 'left', vertical: 'center' }
};

export const totalRowStyle = {
  ...defaultCellStyle,
  font: { sz: 20, bold: true }  // Increased from 16 to 20
};

// Column width definitions for A4 landscape layout
export const cashSalesColumnWidths = [
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
