import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { exportWorkbook } from "@/utils/fileExport";

export const exportMonthlyItemsReport = async () => {
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
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', firstDayOfMonth.toISOString())
      .lt('created_at', firstDayOfNextMonth.toISOString());

    if (error) {
      console.error('Error fetching sales:', error);
      toast.error("Greška pri učitavanju prodaje");
      return;
    }

    if (!sales || sales.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    // Group items from all sales
    const itemsSummary = sales.reduce((acc, sale) => {
      const items = sale.items as any[];
      
      items.forEach(item => {
        const product = item.product;
        if (!product) return;
        
        const key = `${product.Naziv}_${product.Proizvođač}_${product["Jedinica mere"]}`;
        
        if (!acc[key]) {
          acc[key] = {
            name: product.Naziv,
            manufacturer: product.Proizvođač,
            unit: product["Jedinica mere"],
            totalQuantity: 0,
            totalValue: 0
          };
        }
        
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(product.Cena) || 0;
        const value = quantity * price;
        
        acc[key].totalQuantity += quantity;
        acc[key].totalValue += value;
      });
      
      return acc;
    }, {});

    // Convert to array and sort by total value
    const reportData = Object.values(itemsSummary)
      .sort((a: any, b: any) => b.totalValue - a.totalValue)
      .map((item: any) => ({
        'Naziv artikla': item.name,
        'Proizvođač': item.manufacturer,
        'Jedinica mere': item.unit,
        'Ukupna količina': parseFloat(item.totalQuantity.toFixed(2)),
        'Ukupna vrednost': parseFloat(item.totalValue.toFixed(2))
      }));

    // Calculate total values
    const totalQuantity = reportData.reduce((sum, item) => sum + item['Ukupna količina'], 0);
    const totalValue = reportData.reduce((sum, item) => sum + item['Ukupna vrednost'], 0);

    // Add totals row
    reportData.push({
      'Naziv artikla': 'UKUPNO:',
      'Proizvođač': '',
      'Jedinica mere': '',
      'Ukupna količina': parseFloat(totalQuantity.toFixed(2)),
      'Ukupna vrednost': parseFloat(totalValue.toFixed(2))
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create worksheet with specific options
    const ws = XLSX.utils.json_to_sheet(reportData, {
      cellDates: true,
      cellStyles: true
    });

    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, // Naziv artikla
      { wch: 20 }, // Proizvođač
      { wch: 15 }, // Jedinica mere
      { wch: 15 }, // Ukupna količina
      { wch: 15 }  // Ukupna vrednost
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Mesečna prodaja po artiklima");
    
    const fileName = `Mesecna_prodaja_po_artiklima_${today.getMonth() + 1}_${today.getFullYear()}`;
    
    // Export the workbook
    await exportWorkbook(wb, fileName);
    
  } catch (error) {
    console.error('Error generating monthly items report:', error);
    toast.error("Greška pri generisanju izveštaja");
  }
};
