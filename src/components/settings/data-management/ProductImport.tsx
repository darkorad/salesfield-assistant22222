
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { processProductData, processGroupPriceData } from "@/utils/import/productImportUtils";

export const ProductImport = () => {
  const handleImportPrices = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const file = event.target.files?.[0];
      if (!file) return;

      toast.info("Učitavanje cenovnika u toku...");
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let productSuccessCount = 0;
          let productErrorCount = 0;
          let groupPriceSuccessCount = 0;
          let groupPriceErrorCount = 0;

          // Process each row in the imported file
          for (const row of jsonData) {
            // Check if this is a group pricing entry
            if ((row as any).type === "group") {
              const success = await processGroupPriceData(row, session.user.id);
              if (success) groupPriceSuccessCount++; else groupPriceErrorCount++;
            } else {
              // Standard product entry
              const success = await processProductData(row, session.user.id);
              if (success) productSuccessCount++; else productErrorCount++;
            }
          }

          // Report success and errors
          if (productSuccessCount > 0) {
            localStorage.setItem(`lastProductsImport_${session.user.id}`, new Date().toISOString());
            toast.success(`${productSuccessCount} proizvoda je uspešno ažurirano`);
          }

          if (groupPriceSuccessCount > 0) {
            toast.success(`${groupPriceSuccessCount} grupnih cena je uspešno ažurirano`);
          }

          if (productErrorCount > 0 || groupPriceErrorCount > 0) {
            toast.error(`Greška pri ažuriranju ${productErrorCount + groupPriceErrorCount} stavki`);
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
  );
};
