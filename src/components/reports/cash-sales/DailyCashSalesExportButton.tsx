
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const DailyCashSalesExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportTodayCashSales = async () => {
    try {
      if (isExporting) {
        return;
      }
      
      setIsExporting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        setIsExporting(false);
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
        .select(`
          *,
          customer:customers(*),
          darko_customer:kupci_darko(*)
        `)
        .eq('user_id', session.user.id)
        .eq('payment_type', 'cash')
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        toast.error("Greška pri učitavanju prodaje");
        setIsExporting(false);
        return;
      }

      if (!salesData || salesData.length === 0) {
        toast.error("Nema prodaje za gotovinu danas");
        setIsExporting(false);
        return;
      }

      // Transform data for Excel
      const excelData = salesData.map(sale => ({
        'Kupac': sale.customer?.name || sale.darko_customer?.name || 'Nepoznat',
        'Adresa': sale.customer?.address || sale.darko_customer?.address || 'N/A',
        'Grad': sale.customer?.city || sale.darko_customer?.city || 'N/A',
        'Telefon': sale.customer?.phone || sale.darko_customer?.phone || 'N/A',
        'Iznos': sale.total,
        'Vreme': new Date(sale.date).toLocaleTimeString('sr-RS'),
        'Broj stavki': sale.items.length
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Gotovinska prodaja");
      
      // Set column widths
      const colWidths = [
        { wch: 30 }, // Kupac
        { wch: 40 }, // Adresa
        { wch: 20 }, // Grad
        { wch: 15 }, // Telefon
        { wch: 15 }, // Iznos
        { wch: 15 }, // Vreme
        { wch: 12 }, // Broj stavki
      ];
      ws['!cols'] = colWidths;

      // Generate filename with current date
      const dateStr = new Date().toLocaleDateString('sr-RS').replace(/\./g, '-');
      XLSX.writeFile(wb, `gotovinska-prodaja-${dateStr}.xlsx`);
      toast.success("Izveštaj je uspešno izvezen");
    } catch (error) {
      console.error("Error exporting cash sales:", error);
      toast.error("Greška pri izvozu izveštaja");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        className="w-full py-4 text-base"
        onClick={handleExportTodayCashSales}
        disabled={isExporting}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        {isExporting ? "Izvoz u toku..." : "Izvezi današnju gotovinsku prodaju"}
      </Button>
    </div>
  );
};
