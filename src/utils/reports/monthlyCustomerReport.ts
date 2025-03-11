
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { exportWorkbook } from "@/utils/exportUtils";

export const exportMonthlyCustomerReport = async () => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

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
      .gte('created_at', firstDayOfMonth.toISOString())
      .lt('created_at', firstDayOfNextMonth.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!sales || sales.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    // Group by customer with detailed purchase information
    const customerSalesDetails = {};
    const customerSalesSummary = {};
    
    // Process all sales for detailed and summary information
    sales.forEach(sale => {
      const customer = sale.customer_id ? sale.customers : sale.kupci_darko;
      const customerId = sale.customer_id || sale.darko_customer_id || 'unknown';
      const customerName = customer?.name || 'Nepoznat kupac';
      const items = sale.items as any[];
      
      // Initialize customer entries if they don't exist
      if (!customerSalesDetails[customerId]) {
        customerSalesDetails[customerId] = {
          name: customerName,
          address: customer?.address || '',
          city: customer?.city || '',
          pib: customer?.pib || '',
          items: []
        };
      }

      if (!customerSalesSummary[customerId]) {
        customerSalesSummary[customerId] = {
          name: customerName,
          address: customer?.address || '',
          city: customer?.city || '',
          pib: customer?.pib || '',
          totalCash: 0,
          totalInvoice: 0,
          totalAmount: 0
        };
      }
      
      // Add items to customer details
      items.forEach(item => {
        customerSalesDetails[customerId].items.push({
          date: new Date(sale.created_at).toLocaleDateString('sr-RS'),
          product: item.product.Naziv,
          manufacturer: item.product.Proizvođač,
          unit: item.product["Jedinica mere"],
          quantity: item.quantity,
          price: item.product.Cena,
          total: item.quantity * item.product.Cena,
          payment_type: sale.payment_type === 'cash' ? 'Gotovina' : 'Račun'
        });
      });
      
      // Update customer summary
      if (sale.payment_type === 'cash') {
        customerSalesSummary[customerId].totalCash += sale.total;
      } else {
        customerSalesSummary[customerId].totalInvoice += sale.total;
      }
      customerSalesSummary[customerId].totalAmount += sale.total;
    });

    // Create detailed report data by customer
    const reportData = [];

    // Add each customer's data with a header row and items
    Object.values(customerSalesDetails).forEach((customer: any) => {
      // Add customer header
      reportData.push({
        'Kupac': customer.name,
        'PIB': customer.pib,
        'Adresa': customer.address,
        'Grad': customer.city,
        'Datum': '',
        'Proizvod': '',
        'Proizvođač': '',
        'Količina': '',
        'Jedinica mere': '',
        'Cena': '',
        'Ukupno': '',
        'Način plaćanja': ''
      });
      
      // Add customer's items
      customer.items.forEach(item => {
        reportData.push({
          'Kupac': '',
          'PIB': '',
          'Adresa': '',
          'Grad': '',
          'Datum': item.date,
          'Proizvod': item.product,
          'Proizvođač': item.manufacturer,
          'Količina': item.quantity,
          'Jedinica mere': item.unit,
          'Cena': item.price,
          'Ukupno': item.total,
          'Način plaćanja': item.payment_type
        });
      });
      
      // Add empty row after customer
      reportData.push({
        'Kupac': '',
        'PIB': '',
        'Adresa': '',
        'Grad': '',
        'Datum': '',
        'Proizvod': '',
        'Proizvođač': '',
        'Količina': '',
        'Jedinica mere': '',
        'Cena': '',
        'Ukupno': '',
        'Način plaćanja': ''
      });
    });

    // Create customer summary data for second sheet
    const summaryData = Object.values(customerSalesSummary)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .map((customer: any) => ({
        'Kupac': customer.name,
        'PIB': customer.pib,
        'Adresa': customer.address,
        'Grad': customer.city,
        'Ukupno gotovina': customer.totalCash,
        'Ukupno račun': customer.totalInvoice,
        'Ukupan iznos': customer.totalAmount
      }));

    // Calculate monthly totals
    const totalCash = summaryData.reduce((sum, item) => sum + item['Ukupno gotovina'], 0);
    const totalInvoice = summaryData.reduce((sum, item) => sum + item['Ukupno račun'], 0);
    const totalAmount = summaryData.reduce((sum, item) => sum + item['Ukupan iznos'], 0);

    // Add totals row to summary
    summaryData.push({
      'Kupac': 'UKUPNO:',
      'PIB': '',
      'Adresa': '',
      'Grad': '',
      'Ukupno gotovina': totalCash,
      'Ukupno račun': totalInvoice,
      'Ukupan iznos': totalAmount
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create detailed worksheet
    const wsDetails = XLSX.utils.json_to_sheet(reportData);
    wsDetails['!cols'] = [
      { wch: 30 }, // Kupac
      { wch: 15 }, // PIB
      { wch: 30 }, // Adresa
      { wch: 20 }, // Grad
      { wch: 15 }, // Datum
      { wch: 30 }, // Proizvod
      { wch: 20 }, // Proizvođač
      { wch: 10 }, // Količina
      { wch: 15 }, // Jedinica mere
      { wch: 12 }, // Cena
      { wch: 12 }, // Ukupno
      { wch: 15 }  // Način plaćanja
    ];
    
    // Create summary worksheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [
      { wch: 30 }, // Kupac
      { wch: 15 }, // PIB
      { wch: 30 }, // Adresa
      { wch: 20 }, // Grad
      { wch: 15 }, // Ukupno gotovina
      { wch: 15 }, // Ukupno račun
      { wch: 15 }  // Ukupan iznos
    ];
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, wsDetails, "Detaljna prodaja");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Zbirna prodaja");
    
    const fileName = `Mesecna_prodaja_po_kupcima_${today.getMonth() + 1}_${today.getFullYear()}`;
    
    // Use the exportWorkbook utility instead of XLSX.writeFile
    await exportWorkbook(wb, fileName);
    
  } catch (error) {
    console.error('Error exporting monthly customer report:', error);
    toast.error("Greška pri izvozu izveštaja");
  }
};
