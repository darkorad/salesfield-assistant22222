
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

    // Get all sales for today for the current user with customer data
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
        customer:customers(*),
        darko_customer:kupci_darko(*)
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
      customer_name: getCustomerName(sale.customer, sale.darko_customer),
      items: sale.items ? (sale.items as any[]).length : 0,
      itemsPaymentTypes: sale.items ? (sale.items as any[]).map(item => item.paymentType) : []
    })));

    toast.info("Obrađivanje podataka za izveštaj...");

    // Create flat array of all items from all sales
    const reportData = salesData.flatMap(sale => {
      // Get customer data safely
      const customer = extractCustomerData(sale.customer, sale.darko_customer);
      
      const items = sale.items as any[];
      if (!items || !Array.isArray(items)) {
        console.warn(`No items or invalid items for sale ${sale.id}`);
        return [];
      }

      return items.map(item => ({
        'Datum': new Date(sale.date).toLocaleString('sr-RS'),
        'Kupac': customer.name,
        'PIB': customer.pib,
        'Adresa': customer.address,
        'Grad': customer.city,
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

    // Group data by customer for customer totals
    const customerTotals = {};
    reportData.forEach(item => {
      const customerKey = item['Kupac'];
      if (!customerTotals[customerKey]) {
        customerTotals[customerKey] = {
          name: item['Kupac'],
          address: item['Adresa'],
          total: 0
        };
      }
      customerTotals[customerKey].total += item['Ukupno'];
    });

    // Add summary rows with customer names
    const summaryRows = [];
    
    // Add empty row first
    summaryRows.push([]);
    
    // Add customer totals
    Object.values(customerTotals).forEach((customer: any) => {
      summaryRows.push(['KUPAC:', customer.name, '', 'Adresa:', customer.address]);
      summaryRows.push(['UKUPNO ZA KUPCA:', '', '', '', '', '', '', '', '', '', customer.total]);
      summaryRows.push([]); // Empty row for spacing
    });
    
    // Add overall totals at the end
    summaryRows.push(['UKUPNO GOTOVINA:', '', '', '', '', '', '', '', '', '', cashTotal, '']);
    summaryRows.push(['UKUPNO RAČUN:', '', '', '', '', '', '', '', '', '', invoiceTotal, '']);
    summaryRows.push(['UKUPNO:', '', '', '', '', '', '', '', '', '', grandTotal, '']);

    // Add all summary rows to worksheet
    XLSX.utils.sheet_add_aoa(ws, summaryRows, { origin: -1 });

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

// Helper function to safely extract customer name
function getCustomerName(customer: any, darkoCustomer: any): string {
  if (customer && typeof customer === 'object' && !Array.isArray(customer) && customer.name) {
    return customer.name;
  }
  
  if (darkoCustomer && typeof darkoCustomer === 'object' && !Array.isArray(darkoCustomer) && darkoCustomer.name) {
    return darkoCustomer.name;
  }
  
  return 'Nepoznat';
}

// Helper function to safely extract customer data
function extractCustomerData(customer: any, darkoCustomer: any) {
  // Default empty customer data
  const defaultCustomer = {
    name: 'Nepoznat kupac',
    pib: '',
    address: '',
    city: ''
  };
  
  // Check if customer is a valid object with required properties
  if (customer && typeof customer === 'object' && !Array.isArray(customer) && customer.name) {
    return {
      name: customer.name || defaultCustomer.name,
      pib: customer.pib || defaultCustomer.pib,
      address: customer.address || defaultCustomer.address,
      city: customer.city || defaultCustomer.city
    };
  }
  
  // Check if darkoCustomer is a valid object with required properties
  if (darkoCustomer && typeof darkoCustomer === 'object' && !Array.isArray(darkoCustomer) && darkoCustomer.name) {
    return {
      name: darkoCustomer.name || defaultCustomer.name,
      pib: darkoCustomer.pib || defaultCustomer.pib,
      address: darkoCustomer.address || defaultCustomer.address,
      city: darkoCustomer.city || defaultCustomer.city
    };
  }
  
  // Return default if neither is valid
  return defaultCustomer;
}
