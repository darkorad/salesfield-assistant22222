import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

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

          if (type === "customers") {
            // Process each customer
            for (const customer of jsonData) {
              const customerData = {
                id: customer.id || crypto.randomUUID(),
                user_id: session.user.id,
                code: customer.code || Date.now().toString().slice(-6),
                name: customer.name,
                address: customer.address,
                city: customer.city,
                phone: customer.phone || '',
                pib: customer.pib,
                is_vat_registered: customer.is_vat_registered || false,
                gps_coordinates: customer.gps_coordinates || '',
                group_name: customer.group_name || null,
                naselje: customer.naselje || null,
                email: customer.email || null
              };

              // Upsert customer data
              const { error } = await supabase
                .from('customers')
                .upsert(customerData, {
                  onConflict: 'id'
                });

              if (error) {
                console.error('Error upserting customer:', error);
                toast.error(`Greška pri ažuriranju kupca: ${customerData.name}`);
              }
            }

            localStorage.setItem(`lastCustomersImport_${session.user.id}`, new Date().toISOString());
            toast.success("Kupci su uspešno ažurirani");
          } else {
            // Process each product
            for (const product of jsonData) {
              const productData = {
                id: product.id || crypto.randomUUID(),
                user_id: session.user.id,
                name: product.name,
                manufacturer: product.manufacturer || '',
                price: product.price || 0,
                unit: product.unit || '',
                created_at: new Date().toISOString()
              };

              const { error } = await supabase
                .from('products')
                .upsert(productData, {
                  onConflict: 'id'
                });

              if (error) {
                console.error('Error upserting product:', error);
                toast.error(`Greška pri ažuriranju proizvoda: ${productData.name}`);
              }
            }

            localStorage.setItem(`lastProductsImport_${session.user.id}`, new Date().toISOString());
            toast.success("Proizvodi su uspešno ažurirani");
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