
import * as XLSX from "xlsx";
import { headerCellStyle } from "./styles";
import { applyStyleToRow } from "./utils";
import { CashSale } from "@/types/reports";

export const addCustomerHeader = (
  ws: XLSX.WorkSheet, 
  sale: CashSale, 
  startRow: number
) => {
  const headers = [
    [`Naziv kupca: ${sale.customer.name}`, '', '', '', '', `Naziv kupca: ${sale.customer.name}`],
    [`Adresa: ${sale.customer.address}`, '', '', '', '', `Adresa: ${sale.customer.address}`],
    [''],
    ['Proizvod', 'Kom', 'Cena', 'Ukupno', '', 'Proizvod', 'Kom', 'Cena', 'Ukupno']
  ];

  headers.forEach((row, index) => {
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: startRow + index });
    
    // Skip styling for empty row
    if (index === 2) return;
    
    // Apply styles to all cells except spacing column
    const columns = Array.from({ length: row.length }, (_, i) => i).filter(i => i !== 4);
    applyStyleToRow(ws, startRow + index, columns, headerCellStyle);
  });

  return startRow + headers.length;
};
