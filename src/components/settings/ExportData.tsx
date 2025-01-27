import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { processCustomerData } from "@/utils/import/customerImportUtils";
import { processProductData } from "@/utils/import/productImportUtils";

export const ExportData = () => {
  const handleExportBuyers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id);

      if (customersError) {
        console.error('Error fetching customers:', customersError);
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

  const handleImportCustomers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let successCount = 0;
          let errorCount = 0;

          for (const row of jsonData) {
            const success = await processCustomerData(row, session.user.id);
            if (success) successCount++; else errorCount++;
          }

          if (successCount > 0) {
            localStorage.setItem(`lastCustomersImport_${session.user.id}`, new Date().toISOString());
            toast.success(`${successCount} kupaca je uspešno ažurirano`);
          }

          if (errorCount > 0) {
            toast.error(`Greška pri ažuriranju ${errorCount} kupaca`);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error("Greška pri obradi fajla");
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error importing customers:', error);
      toast.error("Greška pri uvozu kupaca");
    }
  };

  const handleImportPrices = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let successCount = 0;
          let errorCount = 0;

          for (const row of jsonData) {
            const success = await processProductData(row, session.user.id);
            if (success) successCount++; else errorCount++;
          }

          if (successCount > 0) {
            localStorage.setItem(`lastProductsImport_${session.user.id}`, new Date().toISOString());
            toast.success(`${successCount} proizvoda je uspešno ažurirano`);
          }

          if (errorCount > 0) {
            toast.error(`Greška pri ažuriranju ${errorCount} proizvoda`);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error("Greška pri obradi fajla");
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error("Greška pri uvozu proizvoda");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Izvoz i uvoz podataka</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Izvoz podataka</h3>
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
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Uvoz podataka</h3>
            <div className="relative">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportCustomers}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button className="w-full py-6 text-lg font-medium">
                <Upload className="mr-2 h-5 w-5" />
                Uvezi listu kupaca
              </Button>
            </div>
            <div className="relative">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportPrices}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button className="w-full py-6 text-lg font-medium">
                <Upload className="mr-2 h-5 w-5" />
                Uvezi cenovnik
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};