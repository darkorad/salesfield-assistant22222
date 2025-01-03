import { Order, OrderItem } from "@/types";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface CustomerSaleRecord {
  'Kupac': string;
  'Adresa': string;
  'Artikli': string;
  'Ukupno (RSD)': number;
}

export interface ProductSummary {
  'Naziv': string;
  'Proizvođač': string;
  'Ukupna količina': string;
  'Ukupna vrednost (RSD)': number;
}

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

export const generateMonthlyReport = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    // Get first day of the month
    const startDate = new Date(year, today.getMonth(), 1);
    // Get first day of next month
    const endDate = new Date(year, today.getMonth() + 1, 1);

    const { data: salesData, error } = await supabase
      .from('sales')
      .select('*, customer:customers(*)')
      .eq('user_id', session.user.id)
      .gte('date', startDate.toISOString())
      .lt('date', endDate.toISOString())
      .order('date', { ascending: false });

    if (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    // Create workbook with two sheets
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Customer sales
    const customerSales = salesData.map((sale: Order): CustomerSaleRecord => ({
      'Kupac': sale.customer.name,
      'Adresa': `${sale.customer.address}, ${sale.customer.city}`,
      'Artikli': sale.items.map(item => 
        `${item.product.Naziv} (${item.quantity} ${item.product["Jedinica mere"]})`
      ).join(', '),
      'Ukupno (RSD)': sale.total
    }));
    const customerSheet = XLSX.utils.json_to_sheet(customerSales);
    XLSX.utils.book_append_sheet(workbook, customerSheet, "Prodaja po kupcima");

    // Sheet 2: Product summary
    const productSummary = aggregateProductSales(salesData);
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