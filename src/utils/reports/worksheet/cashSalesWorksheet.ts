
import * as XLSX from "xlsx";
import { cashSalesColumnWidths } from "./styles";
import { getA4LandscapePrintSettings } from "./utils";
import { addCustomerHeader } from "./headers";
import { addSaleItems } from "./items";
import { addSaleTotals } from "./totals";
import { CashSale } from "@/types/reports";

export const generateCashSalesWorksheet = (salesData: CashSale[]) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Set column widths
  ws['!cols'] = cashSalesColumnWidths;

  // Process each sale (one customer per page)
  salesData.forEach((sale, saleIndex) => {
    // Calculate starting row for this customer
    // Add more rows to account for the extra spacing between customers
    const startRow = saleIndex * (44 + 2); // 44 rows per page + 2 extra lines between customers

    // Add customer information and headers
    const itemsStartRow = addCustomerHeader(ws, sale, startRow);
    
    // Add table with items
    const totalsStartRow = addSaleItems(ws, sale, itemsStartRow);
    
    // Add totals at the bottom
    addSaleTotals(ws, sale, totalsStartRow - 5); // 5 rows from bottom
  });

  // Set print settings for A4 landscape
  ws['!print'] = getA4LandscapePrintSettings();

  XLSX.utils.book_append_sheet(wb, ws, "Gotovinska prodaja");

  return { wb, ws };
};
