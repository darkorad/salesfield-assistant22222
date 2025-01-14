import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const exportDailyDetailedReport = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    // Get today's date at start of day in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date at start of day in local timezone
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: salesData, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:customers(*),
        darko_customer:kupci_darko(*)
      `)
      .eq('user_id', session.user.id)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .order('date', { ascending: false });

    if (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za današnji dan");
      return;
    }

    // Transform data for Excel
    const reportData: any[] = [];

    salesData.forEach((sale) => {
      const customer = sale.customer || sale.darko_customer;
      
      // Add customer header
      reportData.push([]);
      reportData.push(['Kupac:', customer?.name || 'Nepoznat']);
      reportData.push(['Adresa:', `${customer?.address || 'N/A'}, ${customer?.city || 'N/A'}`]);
      reportData.push(['Način plaćanja:', sale.payment_type === 'cash' ? 'Gotovina' : 'Račun']);
      reportData.push(['Vreme:', new Date(sale.date).toLocaleTimeString('sr-RS')]);
      reportData.push([]);
      
      // Add items header
      reportData.push(['Artikal', 'Količina', 'Jedinica mere', 'Cena', 'Ukupno']);
      
      // Add items
      sale.items.forEach((item: any) => {
        reportData.push([
          item.product.Naziv,
          item.quantity,
          item.product["Jedinica mere"],
          `${item.product.Cena} RSD`,
          `${item.quantity * item.product.Cena} RSD`
        ]);
      });
      
      // Add sale total
      reportData.push([]);
      reportData.push(['', '', '', 'Ukupno:', `${sale.total} RSD`]);
      reportData.push([]);
      reportData.push(['---']);
    });

    // Create workbook and add the data
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(reportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, // Artikal
      { wch: 10 }, // Količina
      { wch: 15 }, // Jedinica mere
      { wch: 15 }, // Cena
      { wch: 15 }, // Ukupno
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Dnevni detaljan izveštaj");

    // Generate filename with current date
    const dateStr = today.toISOString().split('T')[0];
    XLSX.writeFile(wb, `dnevni-detaljan-izvestaj-${dateStr}.xlsx`);
    toast.success("Izveštaj je uspešno izvezen");

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Greška pri generisanju izveštaja");
  }
};