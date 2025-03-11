
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

    // Get month name in Serbian
    const monthNames = [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
      'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ];
    const monthName = monthNames[today.getMonth()];

    toast.info("Učitavanje podataka o prodaji za tekući mesec...");

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

    toast.info("Obrada podataka...");

    // Group items from all sales
    const itemsSummary = sales.reduce((acc, sale) => {
      // Ensure items is an array
      const items = Array.isArray(sale.items) ? sale.items : [];
      
      items.forEach(item => {
        if (!item.product) return;
        const product = item.product;
        
        const key = `${product.Naziv || 'Nepoznat'}_${product.Proizvođač || 'Nepoznat'}_${product["Jedinica mere"] || '1'}`;
        
        if (!acc[key]) {
          acc[key] = {
            name: product.Naziv || 'Nepoznat',
            manufacturer: product.Proizvođač || 'Nepoznat',
            unit: product["Jedinica mere"] || '1',
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

    if (reportData.length === 0) {
      toast.error("Nema prodaje artikala za tekući mesec");
      return;
    }

    // Calculate total values
    const totalQuantity = reportData.reduce((sum, item) => sum + (item['Ukupna količina'] || 0), 0);
    const totalValue = reportData.reduce((sum, item) => sum + (item['Ukupna vrednost'] || 0), 0);

    // Add totals row
    reportData.push({
      'Naziv artikla': 'UKUPNO:',
      'Proizvođač': '',
      'Jedinica mere': '',
      'Ukupna količina': parseFloat(totalQuantity.toFixed(2)),
      'Ukupna vrednost': parseFloat(totalValue.toFixed(2))
    });

    toast.info("Generisanje Excel izveštaja...");

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
    
    // Create more descriptive filename with month name and year
    const fileName = `Prodaja_artikli_${monthName}_${today.getFullYear()}`;
    
    // Export the workbook
    try {
      await exportWorkbook(wb, fileName);
      toast.success(`Izveštaj "${fileName}" je uspešno izvezen`);
    } catch (exportError) {
      console.error('Error during export:', exportError);
      toast.error(`Greška pri izvozu: ${exportError instanceof Error ? exportError.message : String(exportError)}`);
    }
    
  } catch (error) {
    console.error('Error generating monthly items report:', error);
    toast.error("Greška pri generisanju izveštaja");
  }
};
