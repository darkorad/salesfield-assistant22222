
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
    
    console.log(`Generating report for date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);

    // Format date for the filename (today's date)
    const dateFormatted = today.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\./g, '_');

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    toast.info("Učitavanje podataka za današnji dan...");

    // Get all sales for today for the current user
    // Use specific relationship name to avoid ambiguity
    const { data: salesData, error } = await supabase
      .from('sales')
      .select(`
        id,
        date,
        total,
        items,
        payment_type,
        payment_status,
        manufacturer,
        customer_id,
        darko_customer_id,
        customers(id, name, pib, address, city),
        kupci_darko(id, name, pib, address, city)
      `)
      .eq('user_id', session.user.id)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .order('date', { ascending: true });

    if (error) {
      console.error("Error loading sales:", error);
      toast.error(`Greška pri učitavanju prodaje: ${error.message}`);
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za današnji dan");
      return;
    }

    console.log("All sales for selected date:", salesData.length, salesData.map(sale => ({
      id: sale.id,
      customer: sale.customers ? sale.customers.name : (sale.kupci_darko ? sale.kupci_darko.name : "Unknown"),
      items: sale.items ? (sale.items as any[]).length : 0,
      itemsPaymentTypes: sale.items ? (sale.items as any[]).map(item => item.paymentType) : []
    })));

    toast.info("Obrađivanje podataka za izveštaj...");

    // Create flat array of all items from all sales
    const reportData = salesData.flatMap(sale => {
      // Get customer data from either table
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

    // Generate more descriptive filename with current date
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    
    // Format: DnevniIzvestaj-DD-MM-YYYY
    const filename = `DnevniIzvestaj-${day}-${month}-${year}`;

    // Export the workbook
    console.log(`Exporting workbook with filename: ${filename}`);
    await exportWorkbook(wb, filename);
    toast.success(`Dnevni izveštaj je uspešno izvezen i nalazi se u Download folderu`);

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error(`Greška pri generisanju izveštaja: ${error instanceof Error ? error.message : String(error)}`);
  }
};
