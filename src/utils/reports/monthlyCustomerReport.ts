
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { exportWorkbook } from "@/utils/fileExport";

export const exportMonthlyCustomerReport = async () => {
  try {
    // Get the current month date range
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    console.log(`Generating report for month: ${firstDayOfMonth.toLocaleDateString('sr-RS')} to ${firstDayOfNextMonth.toLocaleDateString('sr-RS')}`);

    // Format date for the filename (current month)
    const monthFormatted = firstDayOfMonth.toLocaleDateString('sr-RS', {
      month: '2-digit',
      year: 'numeric'
    }).replace(/\./g, '_');

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    toast.info("Učitavanje podataka za trenutni mesec...");

    // Get all sales for the current month for the current user
    // Fix the query format for proper nested object handling
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
        customers:customers(id, name, pib, address, city),
        kupci_darko:kupci_darko(id, name, pib, address, city)
      `)
      .eq('user_id', session.user.id)
      .gte('date', firstDayOfMonth.toISOString())
      .lt('date', firstDayOfNextMonth.toISOString())
      .order('date', { ascending: true });

    if (error) {
      console.error("Error loading sales:", error);
      toast.error(`Greška pri učitavanju prodaje: ${error.message}`);
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za trenutni mesec");
      return;
    }

    console.log(`Found ${salesData.length} sales for current month`);

    toast.info("Obrađivanje podataka za mesečni izveštaj...");

    // Group sales by customer
    const customerSales = {};
    
    salesData.forEach(sale => {
      // Get customer from either table
      const customer = sale.customers || sale.kupci_darko;
      if (!customer) {
        console.warn(`No customer found for sale ${sale.id}`);
        return;
      }
      
      const customerId = customer.id;
      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          customerInfo: {
            name: customer.name || 'Nepoznat',
            pib: customer.pib || '',
            address: customer.address || '',
            city: customer.city || ''
          },
          sales: [],
          cashTotal: 0,
          invoiceTotal: 0
        };
      }
      
      // Add the sale
      customerSales[customerId].sales.push(sale);
      
      // Update totals
      if (sale.payment_type === 'cash') {
        customerSales[customerId].cashTotal += sale.total;
      } else {
        customerSales[customerId].invoiceTotal += sale.total;
      }
    });

    // Create report data array
    const reportData = Object.values(customerSales).map((customerData: any) => {
      const { customerInfo, cashTotal, invoiceTotal } = customerData;
      return {
        'Kupac': customerInfo.name,
        'PIB': customerInfo.pib,
        'Adresa': customerInfo.address,
        'Grad': customerInfo.city,
        'Ukupno gotovina': cashTotal,
        'Ukupno račun': invoiceTotal,
        'Ukupno': cashTotal + invoiceTotal
      };
    });

    // Sort by total amount
    reportData.sort((a, b) => b['Ukupno'] - a['Ukupno']);

    // Calculate grand totals
    const cashGrandTotal = reportData.reduce((sum, item) => sum + item['Ukupno gotovina'], 0);
    const invoiceGrandTotal = reportData.reduce((sum, item) => sum + item['Ukupno račun'], 0);
    const grandTotal = cashGrandTotal + invoiceGrandTotal;

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },  // Kupac
      { wch: 15 },  // PIB
      { wch: 30 },  // Adresa
      { wch: 20 },  // Grad
      { wch: 15 },  // Ukupno gotovina
      { wch: 15 },  // Ukupno račun
      { wch: 15 }   // Ukupno
    ];

    // Add summary rows
    XLSX.utils.sheet_add_aoa(ws, [
      [],  // Empty row
      ['UKUPNO GOTOVINA:', '', '', '', cashGrandTotal, '', ''],
      ['UKUPNO RAČUN:', '', '', '', '', invoiceGrandTotal, ''],
      ['UKUPNO:', '', '', '', '', '', grandTotal]
    ], { origin: -1 });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Mesečni izveštaj po kupcima");

    // Generate more descriptive filename
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    
    // Format: MesecniIzvestajKupci-MM-YYYY
    const filename = `MesecniIzvestajKupci-${month}-${year}`;

    // Export the workbook
    console.log(`Exporting workbook with filename: ${filename}`);
    await exportWorkbook(wb, filename);
    toast.success(`Mesečni izveštaj po kupcima je uspešno izvezen i nalazi se u Download folderu`);

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error(`Greška pri generisanju izveštaja: ${error instanceof Error ? error.message : String(error)}`);
  }
};
