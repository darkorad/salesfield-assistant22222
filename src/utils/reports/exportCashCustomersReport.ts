import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const exportCashCustomersReport = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    // Get today's date at start of day in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date at start of day in local timezone
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all cash sales
    const { data: salesData, error } = await supabase
      .from('sales')
      .select('*, customer:customers(*)')
      .eq('user_id', session.user.id)
      .eq('payment_type', 'cash')
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .order('customer_id');

    if (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za gotovinu danas");
      return;
    }

    // Group sales by customer
    const customerSales = salesData.reduce((acc, sale) => {
      if (!acc[sale.customer.id]) {
        acc[sale.customer.id] = {
          customer: sale.customer,
          sales: []
        };
      }
      acc[sale.customer.id].sales.push(sale);
      return acc;
    }, {});

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Process each customer
    Object.values(customerSales).forEach((customerData: any) => {
      const customer = customerData.customer;
      const sales = customerData.sales;

      // Prepare customer data
      const customerInfo = [
        [`Kupac: ${customer.name}`],
        [`Adresa: ${customer.address}`],
        [`Telefon: ${customer.phone || ''}`],
        [],  // Empty row for spacing
        ['Artikal', 'Količina', 'Jedinica mere', 'Cena', 'Ukupno']
      ];

      // Add all items from all sales
      const items = sales.flatMap(sale => 
        sale.items.map(item => [
          item.product.Naziv,
          item.quantity,
          item.product["Jedinica mere"],
          item.product.Cena,
          item.quantity * item.product.Cena
        ])
      );

      // Add empty rows to fill the page (approximately 20 rows per page)
      while (items.length < 15) {
        items.push(['', '', '', '', '']);
      }

      // Combine customer info with items
      const sheetData = [...customerInfo, ...items];

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // Set column widths
      ws['!cols'] = [
        { wch: 40 }, // Article name
        { wch: 10 }, // Quantity
        { wch: 15 }, // Unit
        { wch: 15 }, // Price
        { wch: 15 }, // Total
      ];

      // Set print settings for landscape A4
      ws['!print'] = {
        orientation: 'landscape',
        paper: 9, // A4
        scale: 1
      };

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, `Kupac - ${customer.name}`);
    });

    // Save workbook
    XLSX.writeFile(wb, `kupci-gotovina-${today.toISOString().split('T')[0]}.xlsx`);
    toast.success("Izveštaj je uspešno izvezen");

  } catch (error) {
    console.error("Error exporting cash customers report:", error);
    toast.error("Greška pri izvozu izveštaja");
  }
};