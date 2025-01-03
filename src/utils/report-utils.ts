import { Order, OrderItem } from "@/types";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface SaleRecord {
  'Kupac': string;
  'Adresa': string;
  'Artikli': string;
  'Ukupno (RSD)': number;
}

interface ProductSummary {
  'Naziv': string;
  'Proizvođač': string;
  'Ukupna količina': string;
  'Ukupna vrednost (RSD)': number;
}

const getCurrentUserSales = () => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return [];
  
  const salesData = localStorage.getItem(`sales_${currentUser}`);
  return salesData ? JSON.parse(salesData) : [];
};

const getSalesForPeriod = (startDate: string): Order[] => {
  const sales = getCurrentUserSales();
  return sales.filter((sale: Order) => sale.date.startsWith(startDate));
};

const formatSaleRecord = (sale: Order): SaleRecord => ({
  'Kupac': sale.customer.name,
  'Adresa': `${sale.customer.address}, ${sale.customer.city}`,
  'Artikli': sale.items.map(item => 
    `${item.product.Naziv} (${item.quantity} ${item.product["Jedinica mere"]})`
  ).join(', '),
  'Ukupno (RSD)': sale.total
});

const aggregateProductSales = (sales: Order[]): ProductSummary[] => {
  const productMap = new Map<string, ProductSummary>();

  sales.forEach(sale => {
    sale.items.forEach((item: OrderItem) => {
      const key = `${item.product.Naziv}-${item.product.Proizvođač}`;
      const existing = productMap.get(key);
      
      if (!existing) {
        productMap.set(key, {
          'Naziv': item.product.Naziv,
          'Proizvođač': item.product.Proizvođač,
          'Ukupna količina': `${item.quantity} ${item.product["Jedinica mere"]}`,
          'Ukupna vrednost (RSD)': item.quantity * item.product.Cena
        });
      } else {
        const currentQty = parseFloat(existing['Ukupna količina'].split(' ')[0]);
        existing['Ukupna količina'] = `${currentQty + item.quantity} ${item.product["Jedinica mere"]}`;
        existing['Ukupna vrednost (RSD)'] += item.quantity * item.product.Cena;
      }
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b['Ukupna vrednost (RSD)'] - a['Ukupna vrednost (RSD)']);
};

export const generateDailyReport = (previewOnly: boolean = false) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const todaySales = getSalesForPeriod(dateStr);

    if (todaySales.length === 0) {
      toast.error("Nema prodaje za današnji dan");
      return null;
    }

    const formattedSales = todaySales.map(formatSaleRecord);
    return formattedSales;
  } catch (error) {
    toast.error("Greška pri generisanju dnevnog izveštaja");
    console.error(error);
    return null;
  }
};

export const generateMonthlyReport = (previewOnly: boolean = false) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const monthlySales = getSalesForPeriod(`${year}-${month}`);

    if (monthlySales.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    // Create workbook with two sheets
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Customer sales
    const customerSales = monthlySales.map(formatSaleRecord);
    const customerSheet = XLSX.utils.json_to_sheet(customerSales);
    XLSX.utils.book_append_sheet(workbook, customerSheet, "Prodaja po kupcima");

    // Sheet 2: Product summary
    const productSummary = aggregateProductSales(monthlySales);
    const productSheet = XLSX.utils.json_to_sheet(productSummary);
    XLSX.utils.book_append_sheet(workbook, productSheet, "Prodaja po artiklima");

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Kupac/Naziv
      { wch: 40 }, // Adresa/Proizvođač
      { wch: 50 }, // Artikli/Ukupna količina
      { wch: 15 }, // Ukupno
    ];
    customerSheet['!cols'] = colWidths;
    productSheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `mesecni-izvestaj-${year}-${month}.xlsx`);
    toast.success("Mesečni izveštaj je uspešno izvezen");
  } catch (error) {
    toast.error("Greška pri izvozu mesečnog izveštaja");
    console.error(error);
  }
};

export const generateProductReport = (previewOnly: boolean = false) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const monthlySales = getSalesForPeriod(`${year}-${month}`);

    if (monthlySales.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return null;
    }

    const productSummary = aggregateProductSales(monthlySales);
    
    if (!previewOnly) {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(productSummary);
      
      const colWidths = [
        { wch: 30 }, // Naziv
        { wch: 20 }, // Proizvođač
        { wch: 15 }, // Količina
        { wch: 15 }, // Vrednost
      ];
      worksheet['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pregled proizvoda");
      XLSX.writeFile(workbook, `pregled-proizvoda-${year}-${month}.xlsx`);
      toast.success("Mesečni pregled proizvoda je uspešno izvezen");
    }
    
    return productSummary;
  } catch (error) {
    toast.error("Greška pri izvozu pregleda proizvoda");
    console.error(error);
    return null;
  }
};