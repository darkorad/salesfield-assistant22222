
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

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
            cashQuantity: 0,
            invoiceQuantity: 0,
            totalQuantity: 0,
            cashValue: 0,
            invoiceValue: 0,
            totalValue: 0
          };
        }
        
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(product.Cena) || 0;
        const value = quantity * price;
        
        if (sale.payment_type === 'cash') {
          acc[key].cashQuantity += quantity;
          acc[key].cashValue += value;
        } else {
          acc[key].invoiceQuantity += quantity;
          acc[key].invoiceValue += value;
        }
        
        acc[key].totalQuantity = acc[key].cashQuantity + acc[key].invoiceQuantity;
        acc[key].totalValue = acc[key].cashValue + acc[key].invoiceValue;
      });
      
      return acc;
    }, {});

    const reportData = Object.values(itemsSummary)
      .sort((a: any, b: any) => b.totalValue - a.totalValue)
      .map((item: any) => ({
        'Naziv artikla': item.name,
        'Proizvođač': item.manufacturer,
        'Jedinica mere': item.unit,
        'Količina (gotovina)': parseFloat(item.cashQuantity.toFixed(2)),
        'Vrednost (gotovina)': parseFloat(item.cashValue.toFixed(2)),
        'Količina (račun)': parseFloat(item.invoiceQuantity.toFixed(2)),
        'Vrednost (račun)': parseFloat(item.invoiceValue.toFixed(2)),
        'Ukupna količina': parseFloat(item.totalQuantity.toFixed(2)),
        'Ukupna vrednost': parseFloat(item.totalValue.toFixed(2))
      }));

    // Calculate total values
    const totalCashQuantity = reportData.reduce((sum, item) => sum + item['Količina (gotovina)'], 0);
    const totalCashValue = reportData.reduce((sum, item) => sum + item['Vrednost (gotovina)'], 0);
    const totalInvoiceQuantity = reportData.reduce((sum, item) => sum + item['Količina (račun)'], 0);
    const totalInvoiceValue = reportData.reduce((sum, item) => sum + item['Vrednost (račun)'], 0);
    const totalQuantity = reportData.reduce((sum, item) => sum + item['Ukupna količina'], 0);
    const totalValue = reportData.reduce((sum, item) => sum + item['Ukupna vrednost'], 0);

    // Add totals row
    reportData.push({
      'Naziv artikla': 'UKUPNO:',
      'Proizvođač': '',
      'Jedinica mere': '',
      'Količina (gotovina)': parseFloat(totalCashQuantity.toFixed(2)),
      'Vrednost (gotovina)': parseFloat(totalCashValue.toFixed(2)),
      'Količina (račun)': parseFloat(totalInvoiceQuantity.toFixed(2)),
      'Vrednost (račun)': parseFloat(totalInvoiceValue.toFixed(2)),
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

    // Format numbers
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && typeof cell.v === 'number') {
          cell.t = 'n'; // Set cell type to number
          cell.z = '#,##0.00'; // Set number format
        }
      }
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, // Naziv artikla
      { wch: 20 }, // Proizvođač
      { wch: 15 }, // Jedinica mere
      { wch: 18 }, // Količina (gotovina)
      { wch: 18 }, // Vrednost (gotovina)
      { wch: 18 }, // Količina (račun)
      { wch: 18 }, // Vrednost (račun)
      { wch: 15 }, // Ukupna količina
      { wch: 15 }  // Ukupna vrednost
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Mesečna prodaja po artiklima");
    
    const fileName = `Mesecna_prodaja_po_artiklima_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success("Izveštaj je uspešno izvezen");
  } catch (error) {
    console.error('Error generating monthly items report:', error);
    toast.error("Greška pri generisanju izveštaja");
  }
};
