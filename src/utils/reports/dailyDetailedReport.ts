
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { exportWorkbook } from "@/utils/exportUtils";

export const exportDailyDetailedReport = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    // Get all sales for today for the current user
    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers (
          name,
          address,
          city,
          pib
        ),
        kupci_darko (
          name,
          address,
          city,
          pib
        )
      `)
      .eq('user_id', session.user.id)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!sales || sales.length === 0) {
      toast.error("Nema prodaje za današnji dan");
      return;
    }

    // Create flat array of all items from all sales
    const reportData = sales.map(sale => {
      const customer = sale.customer_id ? sale.customers : sale.kupci_darko;
      const items = sale.items as any[];

      return items.map(item => ({
        'Datum': new Date(sale.created_at!).toLocaleString('sr-RS'),
        'Kupac': customer?.name || '',
        'PIB': customer?.pib || '',
        'Adresa': customer?.address || '',
        'Grad': customer?.city || '',
        'Proizvod': item.product.Naziv,
        'Proizvođač': item.product.Proizvođač,
        'Količina': item.quantity,
        'Jedinica mere': item.product["Jedinica mere"],
        'Cena': item.product.Cena,
        'Ukupno': item.quantity * item.product.Cena,
        'Način plaćanja': sale.payment_type === 'cash' ? 'Gotovina' : 'Račun'
      }));
    }).flat();

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 },  // Datum
      { wch: 30 },  // Kupac
      { wch: 15 },  // PIB
      { wch: 30 },  // Adresa
      { wch: 20 },  // Grad
      { wch: 30 },  // Proizvod
      { wch: 20 },  // Proizvođač
      { wch: 10 },  // Količina
      { wch: 15 },  // Jedinica mere
      { wch: 12 },  // Cena
      { wch: 12 },  // Ukupno
      { wch: 15 }   // Način plaćanja
    ];

    // Calculate totals by payment type
    const cashTotal = reportData
      .filter(row => row['Način plaćanja'] === 'Gotovina')
      .reduce((sum, row) => sum + row['Ukupno'], 0);
    
    const invoiceTotal = reportData
      .filter(row => row['Način plaćanja'] === 'Račun')
      .reduce((sum, row) => sum + row['Ukupno'], 0);
    
    const grandTotal = cashTotal + invoiceTotal;

    // Add summary rows
    const summaryData = [
      [], // Empty row
      ['Ukupno gotovina:', cashTotal, '', '', '', '', '', '', '', '', '', ''],
      ['Ukupno račun:', invoiceTotal, '', '', '', '', '', '', '', '', '', ''],
      ['UKUPNO:', grandTotal, '', '', '', '', '', '', '', '', '', '']
    ];

    // Add summary to worksheet
    XLSX.utils.sheet_add_aoa(ws, summaryData, { origin: -1 });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Dnevni izveštaj");

    // Generate filename with current date
    const dateStr = today.toLocaleDateString('sr-RS').replace(/\./g, '_');
    const filename = `Dnevni_izvestaj_${dateStr}`;

    // Using the new exportWorkbook utility
    await exportWorkbook(wb, filename);

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Greška pri generisanju izveštaja");
  }
};
