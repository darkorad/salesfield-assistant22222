import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Order } from "@/types";

export const exportMonthlySalesReport = async () => {
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
      .select('*, customer:customers(*)')
      .eq('user_id', session.user.id)
      .gte('date', firstDay.toISOString())
      .lt('date', lastDay.toISOString())
      .order('date', { ascending: false });

    if (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    // Prepare data for the first sheet (customer orders)
    const customerOrdersData = salesData.map((sale: Order) => ({
      'Datum': new Date(sale.date).toLocaleDateString('sr-RS'),
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
      { wch: 15 }, // Datum
      { wch: 30 }, // Kupac
      { wch: 50 }, // Artikli
      { wch: 15 }, // Način plaćanja
      { wch: 15 }, // Ukupno
    ];

    ws2['!cols'] = [
      { wch: 40 }, // Artikal
      { wch: 15 }, // Količina
    ];

    // Generate filename with current month and year
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const filename = `mesecna-prodaja-${monthStr}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);
    toast.success("Mesečni izveštaj je uspešno izvezen");

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Greška pri generisanju izveštaja");
  }
};