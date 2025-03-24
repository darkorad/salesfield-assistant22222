
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Order } from "@/types";
import { exportWorkbook } from "@/utils/fileExport";
import { saveWorkbookToStorage } from "@/utils/fileStorage";
import { format } from "date-fns";

export const exportDailySalesReport = async (redirectToDocuments?: () => void) => {
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

    // Group sales by payment type
    const salesByType = salesData.reduce((acc: { invoice: Order[], cash: Order[] }, sale: Order) => {
      if (sale.payment_type === 'cash') {
        acc.cash.push(sale);
      } else {
        acc.invoice.push(sale);
      }
      return acc;
    }, { invoice: [], cash: [] });

    // Prepare worksheet data
    const wsData: any[] = [];

    // Helper function to add sales data
    const addSalesData = (sales: Order[], type: string) => {
      if (sales.length > 0) {
        wsData.push([`${type.toUpperCase()}`]);
        wsData.push([]);

        sales.forEach((sale) => {
          wsData.push([`Kupac: ${sale.customer.name}`]);
          wsData.push(['Artikal', 'Proizvođač', 'Količina', 'Cena', 'Ukupno']);
          
          sale.items.forEach((item) => {
            wsData.push([
              item.product.Naziv,
              item.product.Proizvođač,
              `${item.quantity} ${item.product["Jedinica mere"]}`,
              `${item.product.Cena} RSD`,
              `${item.product.Cena * item.quantity} RSD`
            ]);
          });
          
          wsData.push(['', '', '', 'Ukupno:', `${sale.total} RSD`]);
          wsData.push([]);
        });

        // Add total for this payment type
        const typeTotal = sales.reduce((sum, sale) => sum + sale.total, 0);
        wsData.push(['', '', '', `Ukupno ${type}:`, `${typeTotal} RSD`]);
        wsData.push([]);
        wsData.push([]);
      }
    };

    // Add invoice sales first
    addSalesData(salesByType.invoice, 'Račun');
    
    // Then add cash sales
    addSalesData(salesByType.cash, 'Gotovina');

    // Add grand total
    const grandTotal = salesData.reduce((sum, sale) => sum + sale.total, 0);
    wsData.push([]);
    wsData.push(['', '', '', 'UKUPNO:', `${grandTotal} RSD`]);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // Artikal
      { wch: 20 }, // Proizvođač
      { wch: 15 }, // Količina
      { wch: 15 }, // Cena
      { wch: 15 }, // Ukupno
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Dnevni izveštaj");

    // Generate filename with a more descriptive name and formatted date
    const formattedDate = format(today, "dd-MM-yyyy");
    const fileName = `Dnevni-Izvestaj-Prodaje-${formattedDate}`;

    // Save to Documents storage first
    const storedFile = await saveWorkbookToStorage(wb, fileName);
    
    if (storedFile) {
      toast.success(`Dnevni izveštaj je uspešno sačuvan`, {
        description: `Možete ga pronaći u meniju Dokumenti`,
        action: {
          label: 'Otvori Dokumenti',
          onClick: () => {
            if (redirectToDocuments) {
              redirectToDocuments();
            }
          }
        },
        duration: 10000
      });
    }

    // Export the workbook for download
    await exportWorkbook(wb, fileName);

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Greška pri generisanju izveštaja");
  }
};
