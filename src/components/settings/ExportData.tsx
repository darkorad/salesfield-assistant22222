import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

export const ExportData = () => {
  const handleExportBuyers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching customers:', error);
        toast.error("Greška pri preuzimanju podataka");
        return;
      }

      if (!customers || customers.length === 0) {
        toast.error("Nema podataka o kupcima");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(customers);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Kupci");
      
      const colWidths = [
        { wch: 15 }, // code
        { wch: 30 }, // name
        { wch: 40 }, // address
        { wch: 20 }, // city
        { wch: 15 }, // phone
        { wch: 15 }, // pib
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `lista-kupaca.xlsx`);
      toast.success("Lista kupaca je uspešno izvezena");
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error("Greška pri izvozu kupaca");
    }
  };

  const handleExportPrices = () => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      toast.error("No user logged in");
      return;
    }

    const products = localStorage.getItem(`products_${currentUser}`);
    if (!products) {
      toast.error("Nema podataka o cenama");
      return;
    }

    const productsData = JSON.parse(products);
    const ws = XLSX.utils.json_to_sheet(productsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cenovnik");
    
    const colWidths = [
      { wch: 30 }, // name
      { wch: 20 }, // manufacturer
      { wch: 15 }, // price
      { wch: 10 }, // unit
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `cenovnik.xlsx`);
    toast.success("Cenovnik je uspešno izvezen");
  };

  const handleExportTodayCashSales = async () => {
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
        return;
      }

      if (!salesData || salesData.length === 0) {
        toast.error("Nema prodaje za gotovinu danas");
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Izvoz podataka</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={handleExportBuyers}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Izvezi listu kupaca
        </Button>
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={handleExportPrices}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Izvezi cenovnik
        </Button>
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={handleExportTodayCashSales}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Export keš kupovina
        </Button>
      </CardContent>
    </Card>
  );
};