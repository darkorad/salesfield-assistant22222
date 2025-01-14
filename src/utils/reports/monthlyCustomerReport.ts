import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

export const exportMonthlyCustomerReport = async () => {
  try {
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
      .gte('created_at', firstDayOfMonth.toISOString())
      .lt('created_at', firstDayOfNextMonth.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!sales || sales.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    // Group sales by customer
    const customerSales = sales.reduce((acc, sale) => {
      const customer = sale.customer_id ? sale.customers : sale.kupci_darko;
      const customerId = sale.customer_id || sale.darko_customer_id;
      
      if (!acc[customerId]) {
        acc[customerId] = {
          name: customer?.name || '',
          address: customer?.address || '',
          city: customer?.city || '',
          pib: customer?.pib || '',
          totalCash: 0,
          totalInvoice: 0,
          totalAmount: 0
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

    const reportData = Object.values(customerSales)
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

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // Kupac
      { wch: 15 }, // PIB
      { wch: 30 }, // Adresa
      { wch: 20 }, // Grad
      { wch: 15 }, // Ukupno gotovina
      { wch: 15 }, // Ukupno račun
      { wch: 15 }  // Ukupan iznos
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Mesečna prodaja po kupcima");
    
    const fileName = `Mesecna_prodaja_po_kupcima_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success("Izveštaj je uspešno izvezen");
  } catch (error) {
    console.error('Error exporting monthly customer report:', error);
    toast.error("Greška pri izvozu izveštaja");
  }
};