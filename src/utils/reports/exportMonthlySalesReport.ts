
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Order } from "@/types";
import { exportWorkbook } from "@/utils/fileExport";
import { saveWorkbookToStorage } from "@/utils/fileStorage";
import { format } from "date-fns";
import { Share } from "@capacitor/share";
import { useIsMobile } from "@/hooks/use-mobile";

export const exportMonthlySalesReport = async (redirectToDocuments?: () => void) => {
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

    console.log(`Fetching sales data for ${firstDay.toISOString()} to ${lastDay.toISOString()}`);

    const { data: salesData, error } = await supabase
      .from('sales')
      .select('*, customer:customers(*), kupci_darko(*)')
      .eq('user_id', session.user.id)
      .gte('date', firstDay.toISOString())
      .lt('date', lastDay.toISOString())
      .order('date', { ascending: false });

    if (error) {
      console.error("Error loading sales:", error);
      toast.error(`Greška pri učitavanju prodaje: ${error.message}`);
      return;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za tekući mesec");
      return;
    }

    console.log(`Found ${salesData.length} sales records for current month`);

    // Prepare data for the first sheet (customer orders)
    const customerOrdersData = salesData.map((sale: Order) => {
      // Get customer data from either customers or kupci_darko
      const customerName = sale.customer?.name || (sale.kupci_darko ? sale.kupci_darko.name : 'Nepoznat kupac');
      
      return {
        'Datum': new Date(sale.date).toLocaleDateString('sr-RS'),
        'Kupac': customerName,
        'Artikli': sale.items.map(item => 
          `${item.product.Naziv} (${item.quantity} ${item.product["Jedinica mere"]})`
        ).join(', '),
        'Način plaćanja': sale.payment_type === 'cash' ? 'Gotovina' : 'Račun',
        'Ukupno (RSD)': sale.total
      };
    });

    // Prepare data for the second sheet (product quantities)
    const productQuantities: { [key: string]: { quantity: number, value: number } } = {};
    salesData.forEach((sale: Order) => {
      sale.items.forEach(item => {
        const productName = item.product.Naziv;
        if (!productQuantities[productName]) {
          productQuantities[productName] = { 
            quantity: 0, 
            value: 0 
          };
        }
        productQuantities[productName].quantity += item.quantity;
        productQuantities[productName].value += item.quantity * item.product.Cena;
      });
    });

    // Convert to array and sort by quantity in descending order
    const productQuantitiesData = Object.entries(productQuantities)
      .map(([product, data]) => ({
        'Artikal': product,
        'Količina': data.quantity,
        'Ukupna vrednost (RSD)': data.value
      }))
      .sort((a, b) => b['Količina'] - a['Količina']);

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
      { wch: 20 }, // Ukupna vrednost
    ];

    // Get month name in Serbian
    const monthNames = [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
      'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ];
    const monthName = monthNames[today.getMonth()];
    const year = today.getFullYear();
    const formattedDate = format(today, "dd-MM-yyyy");
    
    // Generate descriptive filename with month, year and date
    const filename = `Mesecni-Izvestaj-Prodaje-${monthName}-${year}-${formattedDate}`;

    // Save to Documents storage first
    const storedFile = await saveWorkbookToStorage(wb, filename);
    
    if (storedFile) {
      toast.success(`Mesečni izveštaj je uspešno sačuvan`, {
        description: `Možete ga pronaći u meniju Dokumenti`,
        action: {
          label: 'Otvori Dokumenti',
          onClick: () => {
            if (redirectToDocuments) {
              redirectToDocuments();
            }
          }
        },
        duration: 5000,
        dismissible: true
      });
    }

    // Export the file for download with options for sharing
    const exportOptions = {
      showToasts: true,
      onSuccess: async () => {
        // Check if we're on mobile to offer sharing
        if ('Capacitor' in window) {
          try {
            // Try to share the file to make it more accessible
            await Share.share({
              title: 'Izvezeni izveštaj',
              text: `Izveštaj prodaje za ${monthName} ${year}`,
              dialogTitle: 'Podelite ili sačuvajte izveštaj'
            });
          } catch (shareError) {
            console.warn('Could not share file, but it was saved:', shareError);
          }
        }
      }
    };

    // Export the workbook
    await exportWorkbook(wb, filename, exportOptions);
    
  } catch (error) {
    console.error("Error generating report:", error);
    toast.error(`Greška pri generisanju izveštaja: ${error instanceof Error ? error.message : String(error)}`, {
      duration: 4000,
      dismissible: true
    });
  }
};
