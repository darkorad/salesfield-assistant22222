
import * as XLSX from "xlsx";

// Apply styles to a range of cells in a worksheet
export const applyStyleToRange = (
  ws: XLSX.WorkSheet, 
  startRow: number, 
  endRow: number, 
  columns: number[], 
  style: any
) => {
  for (let row = startRow; row <= endRow; row++) {
    for (const col of columns) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellRef]) continue;
      ws[cellRef].s = style;
    }
  }
};

// Apply styles to a specific row in a worksheet
export const applyStyleToRow = (
  ws: XLSX.WorkSheet, 
  row: number, 
  columns: number[], 
  style: any
) => {
  applyStyleToRange(ws, row, row, columns, style);
};

// Get print settings for A4 landscape
export const getA4LandscapePrintSettings = () => ({
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
});
