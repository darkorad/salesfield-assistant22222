import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

export const exportDailyDetailedReport = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers (
          name,
          address,
          city
        ),
        kupci_darko (
          name,
          address,
          city
        )
      `)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const reportData = sales.map(sale => {
      const customer = sale.customer_id ? sale.customers : sale.kupci_darko;
      const items = sale.items as any[];

      return items.map(item => ({
        'Datum': new Date(sale.created_at).toLocaleDateString('sr-RS'),
        'Kupac': customer?.name || '',
        'Adresa': customer?.address || '',
        'Grad': customer?.city || '',
        'Proizvod': item.name,
        'Količina': item.quantity,
        'Jedinica mere': item.unit,
        'Cena': item.price,
        'Ukupno': item.quantity * item.price,
        'Način plaćanja': sale.payment_type
      }));
    }).flat();

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(wb, ws, "Dnevni izveštaj");
    
    const fileName = `Dnevni_izvestaj_${new Date().toLocaleDateString('sr-RS').replace(/\./g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success("Izveštaj je uspešno izvezen");
  } catch (error) {
    console.error('Error exporting daily report:', error);
    toast.error("Greška pri izvozu izveštaja");
  }
};