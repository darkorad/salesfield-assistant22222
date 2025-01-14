import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const exportMonthlyCustomerReport = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    // Get first day of current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);

    // Get first day of next month
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    lastDay.setHours(0, 0, 0, 0);

    const { data: salesData, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:customers(*),
        darko_customer:kupci_darko(*)
      `)
      .eq('user_id', session.user.id)
      .gte('date', firstDay.toISOString())
      .lt('date', lastDay.toISOString());

    if (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    // Group sales by customer
    const customerSales = salesData.reduce((acc: any, sale) => {
      const customer = sale.customer || sale.darko_customer;
      const customerId = customer?.id || 'unknown';
      
      if (!acc[customerId]) {
        acc[customerId] = {
          name: customer?.name || 'Nepoznat kupac',
          address: customer?.address || 'N/A',
          city: customer?.city || 'N/A',
          totalCash: 0,
          totalInvoice: 0,
          totalAmount: 0,
        };
      }
      
      if (sale.payment_type === 'cash') {
        acc[customerId].totalCash += sale.total;
      } else {
        acc[customerId].totalInvoice += sale.total;
      }
      acc[customerId].totalAmount += sale.total;
      
      return acc;
    }, {});

    // Convert to array and sort by total amount
    const sortedCustomers = Object.values(customerSales)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount);

    // Transform to Excel format
    const reportData = sortedCustomers.map((customer: any) => ({
      'Kupac': customer.name,
      'Adresa': customer.address,
      'Grad': customer.city,
      'Ukupno gotovina': `${customer.totalCash} RSD`,
      'Ukupno računi': `${customer.totalInvoice} RSD`,
      'Ukupno': `${customer.totalAmount} RSD`,
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // Kupac
      { wch: 40 }, // Adresa
      { wch: 20 }, // Grad
      { wch: 15 }, // Ukupno gotovina
      { wch: 15 }, // Ukupno računi
      { wch: 15 }, // Ukupno
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Mesečno po kupcima");

    // Generate filename
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    XLSX.writeFile(wb, `mesecna-prodaja-po-kupcima-${monthStr}.xlsx`);
    toast.success("Izveštaj je uspešno izvezen");

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Greška pri generisanju izveštaja");
  }
};