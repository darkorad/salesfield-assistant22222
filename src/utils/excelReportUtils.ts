import * as XLSX from "xlsx";
import { Order } from "@/types";

export const generateSalesReport = (sales: Order[]) => {
  const workbook = XLSX.utils.book_new();
  const salesData: any[] = [];

  sales.forEach((sale) => {
    // Add customer header
    salesData.push([]);
    salesData.push(['Šifra kupca:', sale.customer.code || '']);
    salesData.push(['Kupac:', sale.customer.name]);
    salesData.push(['Adresa:', `${sale.customer.address}, ${sale.customer.city}`]);
    salesData.push([]);
    
    // Add items header
    salesData.push(['Proizvod', 'Proizvođač', 'Količina', 'Cena', 'Ukupno']);
    
    // Add items
    sale.items.forEach((item) => {
      salesData.push([
        item.product.Naziv,
        item.product.Proizvođač,
        `${item.quantity} ${item.product["Jedinica mere"]}`,
        `${item.product.Cena} RSD`,
        `${item.product.Cena * item.quantity} RSD`
      ]);
    });
    
    // Add order total
    salesData.push([]);
    salesData.push(['Ukupno za kupca:', '', '', '', `${sale.total} RSD`]);
    salesData.push([]);
    salesData.push([]);
  });

  // Add grand total
  salesData.push([]);
  salesData.push([
    'Ukupno za danas:',
    '',
    '',
    '',
    `${sales.reduce((sum, sale) => sum + sale.total, 0)} RSD`
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(salesData);

  // Set column widths
  const colWidths = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Dnevni izveštaj");
  
  return workbook;
};