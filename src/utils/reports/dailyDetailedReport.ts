import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { exportWorkbook } from "@/utils/fileExport";
import { saveWorkbookToStorage } from "@/utils/fileStorage";

export const exportDailyDetailedReport = async (redirectToDocuments?: () => void) => {
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
        darko_customer_id
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
      customer_id: sale.customer_id,
      darko_customer_id: sale.darko_customer_id,
      items: sale.items ? (sale.items as any[]).length : 0,
      itemsPaymentTypes: sale.items ? (sale.items as any[]).map(item => item.paymentType) : []
    })));

    toast.info("Obrađivanje podataka za izveštaj...");

    // Create a map to store customer data
    const customerDataMap = new Map();
    
    // Fetch customer data for each sale
    for (const sale of salesData) {
      let customerData = null;
      
      // Try to get customer data from regular customers table
      if (sale.customer_id && !customerDataMap.has(sale.customer_id)) {
        const { data } = await supabase
          .from('customers')
          .select('id, name, pib, address, city')
          .eq('id', sale.customer_id)
          .maybeSingle();
          
        if (data) {
          customerDataMap.set(sale.customer_id, data);
        }
      }
      
      // Try to get customer data from darko customers table
      if (sale.darko_customer_id && !customerDataMap.has(sale.darko_customer_id)) {
        const { data } = await supabase
          .from('kupci_darko')
          .select('id, name, pib, address, city')
          .eq('id', sale.darko_customer_id)
          .maybeSingle();
          
        if (data) {
          customerDataMap.set(sale.darko_customer_id, data);
        }
      }
    }

    // Create flat array of all items from all sales
    const reportData = salesData.flatMap(sale => {
      // Get customer from map
      const customerId = sale.customer_id || sale.darko_customer_id;
      if (!customerId || !customerDataMap.has(customerId)) {
        console.warn(`No customer found for sale ${sale.id}`);
        return [];
      }
      
      const customer = customerDataMap.get(customerId);
      
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

    // Save to app storage first, then try normal export as fallback
    console.log(`Saving workbook with filename: ${filename}`);
    toast.info("Čuvanje izveštaja u toku... Sačekajte poruku o uspešnom završetku.");
    
    const storedFile = await saveWorkbookToStorage(wb, filename);
    
    if (storedFile) {
      toast.success(`Dnevni izveštaj je uspešno sačuvan`, {
        description: `Možete ga pronaći u meniju Dokumenti`,
        action: {
          label: 'Otvori Dokumenti',
          onClick: () => {
            if (redirectToDocuments) {
              redirectToDocuments();
            }
          }
        },
        duration: 10000
      });
    }
    
    // Also try regular export as fallback
    try {
      await exportWorkbook(wb, filename);
    } catch (exportErr) {
      console.log("Regular export failed, but file is saved to app storage:", exportErr);
    }

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error(`Greška pri generisanju izveštaja: ${error instanceof Error ? error.message : String(error)}`);
  }
};
