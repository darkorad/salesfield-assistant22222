import * as XLSX from "xlsx";

export const getColumnWidths = () => ({
  left: [
    { wch: 25 }, // Product name
    { wch: 8 },  // Quantity
    { wch: 8 },  // Price
    { wch: 10 }, // Total
  ],
  spacing: { wch: 2 },
  right: [
    { wch: 25 }, // Product name
    { wch: 8 },  // Quantity
    { wch: 8 },  // Price
    { wch: 10 }  // Total
  ]
});

export const getCellStyle = (isBold: boolean = false) => ({
  font: { bold: isBold, sz: 11 },
  alignment: { vertical: 'center', horizontal: 'left' },
  border: {
    top: { style: 'thin', color: { rgb: "000000" } },
    bottom: { style: 'thin', color: { rgb: "000000" } },
    left: { style: 'thin', color: { rgb: "000000" } },
    right: { style: 'thin', color: { rgb: "000000" } }
  }
});

export const applyStyleToRange = (
  ws: XLSX.WorkSheet, 
  startRow: number, 
  endRow: number, 
  isBold: boolean = false
) => {
  for (let i = startRow; i <= endRow; i++) {
    for (let j = 0; j < 9; j++) {
      if (j === 4) continue; // Skip spacing column
      const cell = XLSX.utils.encode_cell({ r: i, c: j });
      if (!ws[cell]) continue;
      ws[cell].s = getCellStyle(isBold);
    }
  }
};