
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { processCustomerData } from "@/utils/import/customerImportUtils";

export const CustomerImport = () => {
  const handleImportCustomers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const file = event.target.files?.[0];
      if (!file) return;

      toast.info("Učitavanje kupaca u toku...");
      
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
            const timestamp = new Date().toISOString();
            localStorage.setItem(`lastCustomersImport_${session.user.id}`, timestamp);
            
            // Also dispatch a storage event to notify other tabs
            window.dispatchEvent(new StorageEvent('storage', {
              key: `lastCustomersImport_${session.user.id}`,
              newValue: timestamp
            }));
            
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

  return (
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
  );
};
