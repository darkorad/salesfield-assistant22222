
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

          console.log("Parsed customer data:", jsonData);
          
          // Check for day columns
          const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
          console.log("Excel headers found:", headers);
          
          const dayColumns = headers.filter(h => 
            h && typeof h === 'string' && 
            h.toLowerCase().includes('dan') || 
            h.toLowerCase().includes('day')
          );
          
          if (dayColumns.length > 0) {
            console.log("Found day columns:", dayColumns);
            toast.info(`Pronađene kolone za dane posete: ${dayColumns.join(', ')}`);
          } else {
            toast.warning("Nisu pronađene kolone za dane posete u Excel fajlu");
          }

          // Clear all existing customer data
          try {
            toast.info("Brisanje postojećih podataka...");
            
            // First, delete related sales data
            const { error: salesDeleteError } = await supabase
              .from('sales')
              .delete()
              .eq('user_id', session.user.id);
              
            if (salesDeleteError) {
              console.error("Error deleting old sales data:", salesDeleteError);
            }
            
            // Then delete visit plans
            const { error: visitPlansDeleteError } = await supabase
              .from('visit_plans')
              .delete()
              .eq('user_id', session.user.id);
              
            if (visitPlansDeleteError) {
              console.error("Error deleting old visit plans:", visitPlansDeleteError);
            }
          } catch (err) {
            console.error("Error during data cleanup:", err);
          }

          let successCount = 0;
          let errorCount = 0;
          const userEmail = session.user.email;

          // Display what days are found in the import
          const visitDaysFound = new Set();
          
          // Process each row from the Excel file
          for (const row of jsonData) {
            // Check if there's a dan_posete field
            if ((row as any)["dan_posete"]) {
              (row as any)["dan_posete"] = ((row as any)["dan_posete"]).toString().trim();
              visitDaysFound.add((row as any)["dan_posete"]);
              console.log(`Row has dan_posete: ${(row as any)["dan_posete"]}`);
            }
            
            // Also check Dan posete with capital letter
            if ((row as any)["Dan posete"]) {
              (row as any)["Dan posete"] = ((row as any)["Dan posete"]).toString().trim();
              visitDaysFound.add((row as any)["Dan posete"]);
              console.log(`Row has Dan posete: ${(row as any)["Dan posete"]}`);
            }
            
            // Check for dan_obilaska
            if ((row as any)["dan_obilaska"]) {
              (row as any)["dan_obilaska"] = ((row as any)["dan_obilaska"]).toString().trim();
              visitDaysFound.add((row as any)["dan_obilaska"]);
            }
            
            // Check for Dan obilaska
            if ((row as any)["Dan obilaska"]) {
              (row as any)["Dan obilaska"] = ((row as any)["Dan obilaska"]).toString().trim();
              visitDaysFound.add((row as any)["Dan obilaska"]);
            }
            
            // For Veljko, we use the regular customers table
            if (userEmail === 'zirmd.veljko@gmail.com') {
              try {
                const { error } = await supabase
                  .from('customers')
                  .upsert({
                    user_id: session.user.id,
                    code: (row as any).code || Date.now().toString().slice(-6),
                    name: (row as any).name,
                    address: (row as any).address || '',
                    city: (row as any).city || '',
                    phone: (row as any).phone || '',
                    pib: (row as any).pib || '',
                    is_vat_registered: (row as any).is_vat_registered === 'DA' || (row as any).is_vat_registered === true,
                    gps_coordinates: (row as any).gps_coordinates || '',
                    dan_obilaska: (row as any).Dan_obilaska || (row as any).dan_obilaska || '',
                    visit_day: (row as any).visit_day || (row as any).Dan_posete || '',
                    naselje: (row as any).naselje || '',
                    group_name: (row as any).group_name || '',
                    email: (row as any).email || '',
                    dan_posete: (row as any).dan_posete || (row as any)["Dan posete"] || ''
                  });

                if (error) {
                  console.error("Error processing customer:", error);
                  errorCount++;
                } else {
                  successCount++;
                }
              } catch (error) {
                console.error("Error processing customer:", error);
                errorCount++;
              }
            } else {
              // For Darko or other users, use the standard process
              const success = await processCustomerData(row, session.user.id);
              if (success) successCount++; else errorCount++;
            }
          }

          console.log("Visit days found in import:", Array.from(visitDaysFound));
          if (visitDaysFound.size === 0) {
            toast.warning("Nisu pronađeni dani posete u uvezenoj datoteci. Molimo proverite format.");
          } else {
            toast.info(`Pronađeni dani posete: ${Array.from(visitDaysFound).join(', ')}`);
          }

          // Set the timestamp for the data import
          const timestamp = new Date().toISOString();
          localStorage.setItem(`lastCustomersImport_${session.user.id}`, timestamp);
          
          // Trigger a storage event to notify other tabs
          window.dispatchEvent(new StorageEvent('storage', {
            key: `lastCustomersImport_${session.user.id}`,
            newValue: timestamp
          }));
          
          if (successCount > 0) {
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
