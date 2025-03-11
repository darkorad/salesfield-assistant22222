
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { exportWorkbook } from "@/utils/fileExport";

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
    const { data: salesData, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers:customer_id(
          name,
          address,
          city,
          pib,
          is_vat_registered
        ),
        kupci_darko:darko_customer_id(
          name,
          address,
          city,
          pib,
          is_vat_registered
        )
      `)
      .eq('user_id', session.user.id)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .order('date', { ascending: true });

    if (error) {
      console.error("Error loading sales:", error);
      throw error;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za današnji dan");
      return;
    }

    console.log("All sales for selected date:", salesData.length, salesData.map(sale => ({
      id: sale.id,
      customer: (sale.customers?.name || sale.kupci_darko?.name || "Unknown"),
      items: sale.items ? (sale.items as any[]).length : 0,
      itemsPaymentTypes: sale.items ? (sale.items as any[]).map(item => item.paymentType) : []
    })));

    // Create flat array of all items from all sales
    const reportData = salesData.flatMap(sale => {
      const customer = sale.customers || sale.kupci_darko;
      if (!customer) {
        console.warn(`No customer found for sale ${sale.id}`);
        return [];
      }
      
      const items = sale.items as any[];
      if (!items || !Array.isArray(items)) {
        console.warn(`No items or invalid items for sale ${sale.id}`);
        return [];
      }

      return items.map(item => ({
        'Datum': new Date(sale.date).toLocaleString('sr-RS'),
        'Kupac': customer.name || 'Nepoznat',
        'PIB': customer.pib || '',
        'Adresa': customer.address || '',
        'Grad': customer.city || '',
        'Proizvod': item.product.Naziv,
        'Proizvođač': item.product.Proizvođač,
        'Količina': item.quantity,
        'Jedinica mere': item.product["Jedinica mere"],
        'Cena': item.price || item.product.Cena,
        'Ukupno': (item.quantity * (item.price || item.product.Cena)),
        'Način plaćanja': item.paymentType === 'cash' ? 'Gotovina' : 'Račun'
      }));
    });

    // Calculate totals
    const cashTotal = reportData
      .filter(item => item['Način plaćanja'] === 'Gotovina')
      .reduce((sum, item) => sum + item['Ukupno'], 0);
    
    const invoiceTotal = reportData
      .filter(item => item['Način plaćanja'] === 'Račun')
      .reduce((sum, item) => sum + item['Ukupno'], 0);
    
    const grandTotal = cashTotal + invoiceTotal;

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

    // Add summary rows
    XLSX.utils.sheet_add_aoa(ws, [
      [],  // Empty row
      ['UKUPNO GOTOVINA:', '', '', '', '', '', '', '', '', '', cashTotal, ''],
      ['UKUPNO RAČUN:', '', '', '', '', '', '', '', '', '', invoiceTotal, ''],
      ['UKUPNO:', '', '', '', '', '', '', '', '', '', grandTotal, '']
    ], { origin: -1 });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Dnevni izveštaj");

    // Generate filename with current date
    const dateStr = today.toLocaleDateString('sr-RS').replace(/\./g, '_');
    const filename = `Detaljan_dnevni_izvestaj_${dateStr}`;

    // Export the workbook
    await exportWorkbook(wb, filename);
    toast.success(`Izveštaj je uspešno eksportovan: ${filename}`);

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Greška pri generisanju izveštaja");
  }
};
