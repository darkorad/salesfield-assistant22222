
import * as XLSX from "xlsx";
import { defaultCellStyle } from "./styles";
import { applyStyleToRange } from "./utils";
import { CashSale } from "@/types/reports";

export const addSaleItems = (
  ws: XLSX.WorkSheet, 
  sale: CashSale, 
  startRow: number
) => {
  const items = sale.items;
  const leftItems = items.slice(0, Math.ceil(items.length / 2));
  const rightItems = items.slice(Math.ceil(items.length / 2));
  
  const maxRows = Math.max(leftItems.length, rightItems.length);
  
  for (let i = 0; i < maxRows; i++) {
    const row = ['', '', '', '', '', '', '', '', ''];
    
    if (i < leftItems.length) {
      const item = leftItems[i];
      row[0] = item.product.name;
      row[1] = item.quantity;
      row[2] = item.product.price;
      row[3] = item.total;
    }
    
    if (i < rightItems.length) {
      const item = rightItems[i];
      row[5] = item.product.name;
      row[6] = item.quantity;
      row[7] = item.product.price;
      row[8] = item.total;
    }
    
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: startRow + i });
  }
  
  // Apply styles to all item cells
  const columns = [0, 1, 2, 3, 5, 6, 7, 8]; // Skip the spacing column
  applyStyleToRange(ws, startRow, startRow + maxRows - 1, columns, defaultCellStyle);
  
  return startRow + maxRows;
};
