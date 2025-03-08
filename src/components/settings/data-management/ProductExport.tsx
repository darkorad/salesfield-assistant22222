
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

export const ProductExport = () => {
  const handleExportPrices = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const userEmail = session.user.email;
      let products;
      let error;

      if (userEmail === 'zirmd.darko@gmail.com') {
        const response = await supabase
          .from('products_darko')
          .select('*')
          .not('Naziv', 'eq', '');
        products = response.data;
        error = response.error;
      } else {
        const response = await supabase
          .from('products_darko')
          .select('*')
          .eq('user_id', session.user.id)
          .not('Naziv', 'eq', '');
        products = response.data;
        error = response.error;
      }

      if (error) {
        console.error('Error fetching products:', error);
        toast.error("Greška pri preuzimanju podataka");
        return;
      }

      if (!products || products.length === 0) {
        toast.error("Nema podataka o proizvodima");
        return;
      }

      // Format data in the exact same format expected by import
      const exportData = products.map(product => ({
        name: product.Naziv,
        manufacturer: product.Proizvođač,
        price: product.Cena,
        unit: product["Jedinica mere"]
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
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
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error("Greška pri izvozu cenovnika");
    }
  };

  return (
    <Button
      className="w-full py-6 text-lg font-medium"
      onClick={handleExportPrices}
    >
      <FileSpreadsheet className="mr-2 h-5 w-5" />
      Izvezi cenovnik
    </Button>
  );
};
