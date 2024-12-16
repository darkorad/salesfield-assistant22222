import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const ExportData = () => {
  const exportCustomers = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (error) {
        toast.error("Greška pri preuzimanju podataka");
        return;
      }

      const formattedData = customers.map(customer => ({
        "Šifra kupca": customer.code,
        "Naziv kupca": customer.name,
        "Adresa": customer.address,
        "Grad": customer.city,
        "Telefon": customer.phone || "",
        "PIB": customer.pib,
        "PDV Obveznik": customer.is_vat_registered ? "DA" : "NE",
        "GPS Koordinate": customer.gps_coordinates || ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Kupci");
      XLSX.writeFile(workbook, "kupci.xlsx");
      
      toast.success("Lista kupaca je uspešno izvezena");
    } catch (error) {
      console.error("Error exporting customers:", error);
      toast.error("Greška pri izvozu kupaca");
    }
  };

  const exportProducts = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (error) {
        toast.error("Greška pri preuzimanju podataka");
        return;
      }

      const formattedData = products.map(product => ({
        "Naziv": product.Naziv,
        "Proizvođač": product.Proizvođač,
        "Cena": product.Cena,
        "Jedinica mere": product["Jedinica mere"]
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Proizvodi");
      XLSX.writeFile(workbook, "cenovnik.xlsx");
      
      toast.success("Cenovnik je uspešno izvezen");
    } catch (error) {
      console.error("Error exporting products:", error);
      toast.error("Greška pri izvozu cenovnika");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Izvoz podataka</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={exportCustomers}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Izvezi listu kupaca
        </Button>
        <Button 
          onClick={exportProducts}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Izvezi cenovnik
        </Button>
      </CardContent>
    </Card>
  );
};