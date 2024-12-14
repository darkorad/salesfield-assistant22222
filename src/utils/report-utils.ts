import { Order } from "@/types";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface SaleRecord {
  'Datum': string;
  'Vreme': string;
  'Kupac': string;
  'Ukupno (RSD)': number;
  'Broj stavki': number;
  'Stavke': string;
}

interface ProductSummary {
  'Proizvod': string;
  'Proizvođač': string;
  'Ukupna količina': number;
  'Ukupna vrednost (RSD)': number;
}

const formatSaleRecord = (sale: Order): SaleRecord => ({
  'Datum': sale.date.split('T')[0],
  'Vreme': sale.date.split('T')[1].substring(0, 8),
  'Kupac': sale.customer.name,
  'Ukupno (RSD)': sale.total,
  'Broj stavki': sale.items.length,
  'Stavke': sale.items.map(item => `${item.product.name} (${item.quantity})`).join(', ')
});

const getSalesForPeriod = (startDate: string): Order[] => {
  const salesData = localStorage.getItem('sales');
  const sales = salesData ? JSON.parse(salesData) : [];
  return sales.filter((sale: Order) => sale.date.startsWith(startDate));
};

const exportToExcel = (data: any[], sheetName: string, fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
};

export const generateDailyReport = () => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const todaySales = getSalesForPeriod(dateStr);

    if (todaySales.length === 0) {
      toast.error("Nema prodaje za današnji dan");
      return;
    }

    const formattedSales = todaySales.map(formatSaleRecord);
    exportToExcel(formattedSales, "Dnevni izveštaj", `dnevni-izvestaj-${dateStr}.xlsx`);
    toast.success("Dnevni izveštaj je uspešno izvezen");
  } catch (error) {
    toast.error("Greška pri izvozu dnevnog izveštaja");
    console.error(error);
  }
};

export const generateMonthlyReport = () => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const monthlySales = getSalesForPeriod(`${year}-${month}`);

    if (monthlySales.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    const formattedSales = monthlySales.map(formatSaleRecord);
    exportToExcel(formattedSales, "Mesečni izveštaj", `mesecni-izvestaj-${year}-${month}.xlsx`);
    toast.success("Mesečni izveštaj je uspešno izvezen");
  } catch (error) {
    toast.error("Greška pri izvozu mesečnog izveštaja");
    console.error(error);
  }
};

export const generateProductReport = () => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const monthlySales = getSalesForPeriod(`${year}-${month}`);

    if (monthlySales.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    const productSummary = new Map<string, ProductSummary>();
    
    monthlySales.forEach((sale: Order) => {
      sale.items.forEach(item => {
        const key = item.product.id;
        if (!productSummary.has(key)) {
          productSummary.set(key, {
            'Proizvod': item.product.name,
            'Proizvođač': item.product.manufacturer,
            'Ukupna količina': 0,
            'Ukupna vrednost (RSD)': 0
          });
        }
        const summary = productSummary.get(key)!;
        summary['Ukupna količina'] += item.quantity;
        summary['Ukupna vrednost (RSD)'] += item.quantity * item.product.price;
      });
    });

    exportToExcel(
      Array.from(productSummary.values()),
      "Pregled proizvoda",
      `pregled-proizvoda-${year}-${month}.xlsx`
    );
    toast.success("Mesečni pregled proizvoda je uspešno izvezen");
  } catch (error) {
    toast.error("Greška pri izvozu pregleda proizvoda");
    console.error(error);
  }
};