import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { processCustomerData } from "@/utils/import/customerImportUtils";
import { processProductData } from "@/utils/import/productImportUtils";

export const FileImport = () => {
  useEffect(() => {
    const checkLastImport = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const currentUser = session.user.id;
      const lastCustomersImport = localStorage.getItem(`lastCustomersImport_${currentUser}`);
      const lastProductsImport = localStorage.getItem(`lastProductsImport_${currentUser}`);

      // Auto-load if imports were done today
      const today = new Date().toDateString();
      
      if (lastCustomersImport && new Date(lastCustomersImport).toDateString() === today) {
        console.log("Customers auto-loaded from last import");
      }

      if (lastProductsImport && new Date(lastProductsImport).toDateString() === today) {
        console.log("Products auto-loaded from last import");
      }
    };

    checkLastImport();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "customers" | "products") => {
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

          if (type === "customers") {
            for (const row of jsonData) {
              const success = await processCustomerData(row, session.user.id);
              if (success) successCount++; else errorCount++;
            }
            
            if (successCount > 0) {
              localStorage.setItem(`lastCustomersImport_${session.user.id}`, new Date().toISOString());
              toast.success(`${successCount} kupaca je uspešno ažurirano`);
            }
          } else {
            for (const row of jsonData) {
              const success = await processProductData(row, session.user.id);
              if (success) successCount++; else errorCount++;
            }
            
            if (successCount > 0) {
              localStorage.setItem(`lastProductsImport_${session.user.id}`, new Date().toISOString());
              toast.success(`${successCount} proizvoda je uspešno ažurirano`);
            }
          }

          if (errorCount > 0) {
            toast.error(`Greška pri ažuriranju ${errorCount} stavki`);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error("Greška pri obradi fajla");
        }
      };

      reader.onerror = () => {
        toast.error("Greška pri čitanju fajla");
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Greška pri otpremanju fajla");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uvoz podataka</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Lista kupaca (Excel)
          </label>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "customers")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Cenovnik (Excel)
          </label>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "products")}
          />
        </div>
      </CardContent>
    </Card>
  );
};