import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

export const exportMonthlyCustomerReport = async () => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers (
          name,
          address,
          city
        ),
        kupci_darko (
          name,
          address,
          city
        )
      `)
      .gte('created_at', firstDayOfMonth.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group sales by customer
    const customerSales = sales.reduce((acc, sale) => {
      const customer = sale.customer_id ? sale.customers : sale.kupci_darko;
      const customerId = sale.customer_id || sale.darko_customer_id;
      
      if (!acc[customerId]) {
        acc[customerId] = {
          name: customer?.name || '',
          address: customer?.address || '',
          city: customer?.city || '',
          totalAmount: 0,
          invoiceCount: 0
        };
      }
      
      acc[customerId].totalAmount += sale.total;
      acc[customerId].invoiceCount += 1;
      
      return acc;
    }, {});

    const reportData = Object.values(customerSales)
      .sort((a: any, b: any) => a.totalAmount - b.totalAmount)
      .map((customer: any) => ({
        'Kupac': customer.name,
        'Adresa': customer.address,
        'Grad': customer.city,
        'Broj računa': customer.invoiceCount,
        'Ukupan iznos': customer.totalAmount
      }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(wb, ws, "Mesečna prodaja po kupcima");
    
    const fileName = `Mesecna_prodaja_po_kupcima_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success("Izveštaj je uspešno izvezen");
  } catch (error) {
    console.error('Error exporting monthly customer report:', error);
    toast.error("Greška pri izvozu izveštaja");
  }
};