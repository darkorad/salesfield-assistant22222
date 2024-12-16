import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processExcelFile } from "@/utils/excel-utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const FileImport = () => {
  useEffect(() => {
    const checkLastImport = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const currentUser = session.user.id;
      
      // Check last import dates and auto-load if needed
      const lastCustomersImport = localStorage.getItem(`lastCustomersImport_${currentUser}`);
      const lastProductsImport = localStorage.getItem(`lastProductsImport_${currentUser}`);

      if (lastCustomersImport) {
        const lastImport = new Date(lastCustomersImport);
        const today = new Date();
        // Auto-load if last import was today
        if (lastImport.toDateString() === today.toDateString()) {
          const { data: customers } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', currentUser);
            
          if (customers) {
            console.log("Customers auto-loaded from Supabase");
          }
        }
      }

      // Same for products
      if (lastProductsImport) {
        const lastImport = new Date(lastProductsImport);
        const today = new Date();
        if (lastImport.toDateString() === today.toDateString()) {
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', currentUser);
            
          if (products) {
            console.log("Products auto-loaded from Supabase");
          }
        }
      }
    };

    checkLastImport();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "customers" | "products") => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      processExcelFile(e.target?.result, type, session.user.id);
    };

    reader.onerror = () => {
      toast.error(`Greška pri čitanju ${type === "customers" ? "liste kupaca" : "cenovnika"}`);
    };

    reader.readAsBinaryString(file);
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