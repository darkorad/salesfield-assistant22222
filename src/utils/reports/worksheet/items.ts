
import * as XLSX from "xlsx";
import { defaultCellStyle } from "./styles";
import { applyStyleToRow } from "./utils";
import { CashSale } from "@/types/reports";

export const addSaleItems = (
  ws: XLSX.WorkSheet, 
  sale: CashSale, 
  startRow: number
) => {
  // Create empty table structure first
  const tableRows = 35; // Number of rows in the table
  for (let i = 0; i < tableRows; i++) {
    const emptyRow = ['', '', '', '', '', '', '', '', ''];
    XLSX.utils.sheet_add_aoa(ws, [emptyRow], { origin: startRow + i });
    
    // Apply styles to all cells except spacing column
    const columns = Array.from({ length: emptyRow.length }, (_, i) => i).filter(i => i !== 4);
    applyStyleToRow(ws, startRow + i, columns, defaultCellStyle);
  }

  // Fill in actual items
  sale.items.forEach((item, itemIndex) => {
    const itemRow = [
      item.product.Naziv,
      item.quantity,
      item.product.Cena,
      item.total, // Pre-calculated total
      '',
      item.product.Naziv,
      item.quantity,
      item.product.Cena,
      item.total // Pre-calculated total
    ];
    XLSX.utils.sheet_add_aoa(ws, [itemRow], { origin: startRow + itemIndex });
    
    // Apply styles to all cells except spacing column
    const columns = Array.from({ length: itemRow.length }, (_, i) => i).filter(i => i !== 4);
    applyStyleToRow(ws, startRow + itemIndex, columns, defaultCellStyle);
  });

  return startRow + tableRows;
};
