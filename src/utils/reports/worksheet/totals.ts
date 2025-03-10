
import * as XLSX from "xlsx";
import { defaultCellStyle, totalRowStyle } from "./styles";
import { applyStyleToRow } from "./utils";
import { CashSale } from "@/types/reports";

export const addSaleTotals = (
  ws: XLSX.WorkSheet, 
  sale: CashSale, 
  startRow: number
) => {
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
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: startRow + index });
    
    // Skip styling for empty row
    if (index === 3) return;
    
    // Apply styles to all cells except spacing column
    const columns = Array.from({ length: row.length }, (_, i) => i).filter(i => i !== 4);
    
    // Use bold style for the ZBIR row
    const style = index === 2 ? totalRowStyle : defaultCellStyle;
    applyStyleToRow(ws, startRow + index, columns, style);
  });

  return startRow + totalsRows.length;
};
