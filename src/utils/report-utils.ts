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
  'Stavke': sale.items.map(item => `${item.product.Naziv} (${item.quantity})`).join(', ')
});

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

const exportToExcel = (data: any[], sheetName: string, fileName: string, sentSales: string[] = []) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  
  // Add red background style for sent sales rows
  const redStyle = { fill: { fgColor: { rgb: "FFFF0000" } } };
  
  // Apply styles to sent sales rows
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z1000');
  for (let R = range.s.r + 1; R <= range.e.r; R++) {
    const saleId = data[R - 1].id;
    if (sentSales.includes(saleId)) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell_ref]) ws[cell_ref] = { v: '' };
        ws[cell_ref].s = redStyle;
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
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

    if (previewOnly) {
      return todaySales;
    }

    const formattedSales = todaySales.map(sale => ({
      id: sale.id,
      'Šifra kupca': sale.customer.code || '',
      'Kupac': sale.customer.name,
      'Adresa': `${sale.customer.address}, ${sale.customer.city}`,
      'Ukupno (RSD)': sale.total,
      'Broj stavki': sale.items.length,
      'Stavke': sale.items.map(item => 
        `${item.product.Naziv} (${item.quantity} ${item.product["Jedinica mere"]})`
      ).join(', '),
      'Status': sale.sent ? 'Poslato' : 'Nije poslato'
    }));

    const sentSalesIds = todaySales.filter(sale => sale.sent).map(sale => sale.id);
    
    exportToExcel(
      formattedSales,
      "Dnevni izveštaj",
      `dnevni-izvestaj-${dateStr}.xlsx`,
      sentSalesIds
    );
    
    toast.success("Dnevni izveštaj je uspešno izvezen");
  } catch (error) {
    toast.error("Greška pri izvozu dnevnog izveštaja");
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
      return null;
    }

    if (previewOnly) {
      return monthlySales;
    }

    const formattedSales = monthlySales.map(formatSaleRecord);
    exportToExcel(formattedSales, "Mesečni izveštaj", `mesecni-izvestaj-${year}-${month}.xlsx`);
    toast.success("Mesečni izveštaj je uspešno izvezen");
  } catch (error) {
    toast.error("Greška pri izvozu mesečnog izveštaja");
    console.error(error);
    return null;
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

    const productSummary = new Map<string, ProductSummary>();
    
    monthlySales.forEach((sale: Order) => {
      sale.items.forEach(item => {
        const key = item.product.id;
        if (!productSummary.has(key)) {
          productSummary.set(key, {
            'Proizvod': item.product.Naziv,
            'Proizvođač': item.product.Proizvođač,
            'Ukupna količina': 0,
            'Ukupna vrednost (RSD)': 0
          });
        }
        const summary = productSummary.get(key)!;
        summary['Ukupna količina'] += item.quantity;
        summary['Ukupna vrednost (RSD)'] += item.quantity * item.product.Cena;
      });
    });

    const summaryArray = Array.from(productSummary.values());

    if (previewOnly) {
      return summaryArray;
    }

    exportToExcel(
      summaryArray,
      "Pregled proizvoda",
      `pregled-proizvoda-${year}-${month}.xlsx`
    );
    toast.success("Mesečni pregled proizvoda je uspešno izvezen");
  } catch (error) {
    toast.error("Greška pri izvozu pregleda proizvoda");
    console.error(error);
    return null;
  }
};