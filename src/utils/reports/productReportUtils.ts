import { Order } from "@/types";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProductSummary } from "./monthlyReportUtils";

export const generateProductReport = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return null;
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
      .lt('date', endDate.toISOString());

    if (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
      return null;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return null;
    }

    const productMap = new Map<string, ProductSummary>();

    salesData.forEach((sale: Order) => {
      sale.items.forEach(item => {
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

    const productSummary = Array.from(productMap.values())
      .sort((a, b) => b['Ukupna vrednost (RSD)'] - a['Ukupna vrednost (RSD)']);

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
    
    return productSummary;
  } catch (error) {
    toast.error("Greška pri izvozu pregleda proizvoda");
    console.error(error);
    return null;
  }
};