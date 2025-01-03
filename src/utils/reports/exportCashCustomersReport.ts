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

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);  // Start with empty worksheet

    // Set column widths for both sides
    ws['!cols'] = [
      { wch: 35 }, // Article name (left)
      { wch: 10 }, // Quantity (left)
      { wch: 12 }, // Unit (left)
      { wch: 12 }, // Price (left)
      { wch: 12 }, // Total (left)
      { wch: 2 },  // Spacing
      { wch: 35 }, // Article name (right)
      { wch: 10 }, // Quantity (right)
      { wch: 12 }, // Unit (right)
      { wch: 12 }, // Price (right)
      { wch: 12 }, // Total (right)
    ];

    let rowIndex = 0;

    // Process each sale
    salesData.forEach((sale) => {
      const customer = sale.customer;
      
      // Headers for both sides
      const headers = [
        [`Kupac: ${customer.name}`, '', '', '', '', '', `Kupac: ${customer.name}`],
        [`Adresa: ${customer.address}`, '', '', '', '', '', `Adresa: ${customer.address}`],
        [`Telefon: ${customer.phone || ''}`, '', '', '', '', '', `Telefon: ${customer.phone || ''}`],
        [''], // Empty row
        ['Artikal', 'Količina', 'Jed. mere', 'Cena', 'Ukupno', '', 'Artikal', 'Količina', 'Jed. mere', 'Cena', 'Ukupno']
      ];

      // Add headers to worksheet
      headers.forEach((row, index) => {
        XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });
      });

      // Style the headers
      for (let i = rowIndex; i < rowIndex + 5; i++) {
        for (let j = 0; j < 11; j++) {
          const cell = XLSX.utils.encode_cell({ r: i, c: j });
          if (!ws[cell]) continue;
          
          ws[cell].s = {
            font: { bold: true, sz: 12 },
            alignment: { vertical: 'center', horizontal: 'left' },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }
      }

      rowIndex += 5;

      // Process items
      const items = sale.items.map(item => [
        item.product.Naziv,
        item.quantity,
        item.product["Jedinica mere"],
        item.product.Cena,
        item.quantity * item.product.Cena
      ]);

      // Add empty rows to fill the page (approximately 15 rows per page)
      while (items.length < 15) {
        items.push(['', '', '', '', '']);
      }

      // Add items to both sides of the worksheet
      items.forEach((item, index) => {
        const row = [...item, '', ...item];
        XLSX.utils.sheet_add_aoa(ws, [row], { origin: rowIndex + index });

        // Style the cells
        for (let j = 0; j < 11; j++) {
          const cell = XLSX.utils.encode_cell({ r: rowIndex + index, c: j });
          if (!ws[cell]) continue;

          ws[cell].s = {
            font: { sz: 11 },
            alignment: { vertical: 'center', horizontal: 'left' },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }
      });

      rowIndex += 20; // Add extra spacing between customers
    });

    // Set print settings for landscape A4
    ws['!print'] = {
      orientation: 'landscape',
      paper: 9, // A4
      scale: 1,
      fitToPage: true
    };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Kupci za gotovinu');

    // Save workbook
    XLSX.writeFile(wb, `kupci-gotovina-${today.toISOString().split('T')[0]}.xlsx`);
    toast.success("Izveštaj je uspešno izvezen");

  } catch (error) {
    console.error("Error exporting cash customers report:", error);
    toast.error("Greška pri izvozu izveštaja");
  }
};