
import * as XLSX from "xlsx";
import { totalRowStyle } from "./styles";
import { applyStyleToRow } from "./utils";
import { CashSale } from "@/types/reports";

export const addSaleTotals = (
  ws: XLSX.WorkSheet, 
  sale: CashSale, 
  startRow: number
) => {
  // Calculate totals
  const leftTotal = sale.items
    .slice(0, Math.ceil(sale.items.length / 2))
    .reduce((sum, item) => sum + item.total, 0);
    
  const rightTotal = sale.items
    .slice(Math.ceil(sale.items.length / 2))
    .reduce((sum, item) => sum + item.total, 0);
  
  // Add totals row
  const totalsRow = ['UKUPNO:', '', '', leftTotal, '', 'UKUPNO:', '', '', rightTotal];
  XLSX.utils.sheet_add_aoa(ws, [totalsRow], { origin: startRow });
  
  // Apply styles to total cells
  const columns = [0, 3, 5, 8]; // Total label and value cells
  applyStyleToRow(ws, startRow, columns, totalRowStyle);
  
  // Add grand total
  const grandTotal = leftTotal + rightTotal;
  const grandTotalRow = ['UKUPNO ZA KUPCA:', '', '', '', '', '', '', '', grandTotal];
  XLSX.utils.sheet_add_aoa(ws, [grandTotalRow], { origin: startRow + 2 });
  
  // Apply styles to grand total
  applyStyleToRow(ws, startRow + 2, [0, 8], totalRowStyle);
  
  return startRow + 3;
};
