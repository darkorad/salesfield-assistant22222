import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Order } from "@/types";

export const exportDailySalesReport = async () => {
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

    const { data: salesData, error } = await supabase
      .from('sales')
      .select('*, customer:customers(*)')
      .eq('user_id', session.user.id)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .order('date', { ascending: false });

    if (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za današnji dan");
      return;
    }

    // Prepare data for the first sheet (customer orders)
    const customerOrdersData = salesData.map((sale: Order) => ({
      'Kupac': sale.customer.name,
      'Artikli': sale.items.map(item => 
        `${item.product.Naziv} (${item.quantity} ${item.product["Jedinica mere"]})`
      ).join(', '),
      'Način plaćanja': sale.paymentType === 'cash' ? 'Gotovina' : 'Račun',
      'Ukupno (RSD)': sale.total
    }));

    // Prepare data for the second sheet (product quantities)
    const productQuantities: { [key: string]: number } = {};
    salesData.forEach((sale: Order) => {
      sale.items.forEach(item => {
        const productName = item.product.Naziv;
        productQuantities[productName] = (productQuantities[productName] || 0) + item.quantity;
      });
    });

    // Convert to array and sort by quantity in descending order
    const productQuantitiesData = Object.entries(productQuantities)
      .map(([product, quantity]) => ({
        'Artikal': product,
        'Količina': quantity
      }))
      .sort((a, b) => b.Količina - a.Količina);

    // Create workbook with two sheets
    const wb = XLSX.utils.book_new();

    // Add first sheet - Customer Orders
    const ws1 = XLSX.utils.json_to_sheet(customerOrdersData);
    XLSX.utils.book_append_sheet(wb, ws1, "Porudžbine");

    // Add second sheet - Product Quantities
    const ws2 = XLSX.utils.json_to_sheet(productQuantitiesData);
    XLSX.utils.book_append_sheet(wb, ws2, "Količine artikala");

    // Set column widths for both sheets
    ws1['!cols'] = [
      { wch: 30 }, // Kupac
      { wch: 50 }, // Artikli
      { wch: 15 }, // Način plaćanja
      { wch: 15 }, // Ukupno
    ];

    ws2['!cols'] = [
      { wch: 40 }, // Artikal
      { wch: 15 }, // Količina
    ];

    // Generate filename with current date
    const dateStr = today.toISOString().split('T')[0];
    const filename = `dnevna-prodaja-${dateStr}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);
    toast.success("Izveštaj je uspešno izvezen");

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Greška pri generisanju izveštaja");
  }
};