import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const exportMonthlyItemsReport = async () => {
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
      .select('*')
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

    // Group items by product
    const itemSales = salesData.reduce((acc: any, sale) => {
      sale.items.forEach((item: any) => {
        const productKey = `${item.product.Naziv}-${item.product["Jedinica mere"]}`;
        
        if (!acc[productKey]) {
          acc[productKey] = {
            name: item.product.Naziv,
            manufacturer: item.product.Proizvođač,
            unit: item.product["Jedinica mere"],
            quantity: 0,
            totalValue: 0,
          };
        }
        
        acc[productKey].quantity += item.quantity;
        acc[productKey].totalValue += item.quantity * item.product.Cena;
      });
      
      return acc;
    }, {});

    // Convert to array and sort by quantity
    const sortedItems = Object.values(itemSales)
      .sort((a: any, b: any) => b.quantity - a.quantity);

    // Transform to Excel format
    const reportData = sortedItems.map((item: any) => ({
      'Artikal': item.name,
      'Proizvođač': item.manufacturer,
      'Količina': item.quantity,
      'Jedinica mere': item.unit,
      'Ukupna vrednost': `${item.totalValue} RSD`,
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, // Artikal
      { wch: 20 }, // Proizvođač
      { wch: 15 }, // Količina
      { wch: 15 }, // Jedinica mere
      { wch: 20 }, // Ukupna vrednost
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Mesečno po artiklima");

    // Generate filename
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    XLSX.writeFile(wb, `mesecna-prodaja-po-artiklima-${monthStr}.xlsx`);
    toast.success("Izveštaj je uspešno izvezen");

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Greška pri generisanju izveštaja");
  }
};