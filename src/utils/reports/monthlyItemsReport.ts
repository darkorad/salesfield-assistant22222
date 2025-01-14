import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

export const exportMonthlyItemsReport = async () => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', firstDayOfMonth.toISOString());

    if (error) throw error;

    // Group items from all sales
    const itemsSummary = sales.reduce((acc, sale) => {
      const items = sale.items as any[];
      
      items.forEach(item => {
        const key = `${item.name}_${item.unit}`;
        
        if (!acc[key]) {
          acc[key] = {
            name: item.name,
            unit: item.unit,
            quantity: 0,
            totalValue: 0
          };
        }
        
        acc[key].quantity += item.quantity;
        acc[key].totalValue += item.quantity * item.price;
      });
      
      return acc;
    }, {});

    const reportData = Object.values(itemsSummary)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .map((item: any) => ({
        'Proizvod': item.name,
        'Jedinica mere': item.unit,
        'Količina': item.quantity,
        'Ukupna vrednost': item.totalValue
      }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(wb, ws, "Mesečna prodaja po artiklima");
    
    const fileName = `Mesecna_prodaja_po_artiklima_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success("Izveštaj je uspešno izvezen");
  } catch (error) {
    console.error('Error exporting monthly items report:', error);
    toast.error("Greška pri izvozu izveštaja");
  }
};