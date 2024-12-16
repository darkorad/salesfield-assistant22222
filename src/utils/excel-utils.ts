import * as XLSX from "xlsx";
import { Customer, Product } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const processExcelFile = async (data: any, type: "customers" | "products") => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    const workbook = XLSX.read(data, { type: "binary" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (type === "customers") {
      for (const row of jsonData) {
        const customerData = {
          user_id: session.user.id,
          code: row["Šifra kupca"]?.toString() || "",
          name: row["Naziv kupca"] || "",
          address: row["Adresa"] || "",
          city: row["Grad"] || "",
          phone: row["Telefon"] || "",
          pib: row["PIB"] || "",
          is_vat_registered: row["PDV Obveznik"]?.toUpperCase() === "DA",
          gps_coordinates: row["GPS Koordinate"] || ""
        };

        // Check if customer already exists
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select()
          .eq('user_id', session.user.id)
          .eq('code', customerData.code)
          .maybeSingle();

        if (existingCustomer) {
          // Update existing customer
          const { error: updateError } = await supabase
            .from('customers')
            .update(customerData)
            .eq('id', existingCustomer.id);

          if (updateError) {
            console.error('Error updating customer:', updateError);
            toast.error(`Greška pri ažuriranju kupca ${customerData.name}`);
          }
        } else {
          // Insert new customer
          const { error: insertError } = await supabase
            .from('customers')
            .insert(customerData);

          if (insertError) {
            console.error('Error inserting customer:', insertError);
            toast.error(`Greška pri dodavanju kupca ${customerData.name}`);
          }
        }
      }
      toast.success("Lista kupaca je uspešno učitana");
    } else if (type === "products") {
      const products = jsonData.map((row: any) => ({
        user_id: session.user.id,
        "Naziv": row["Naziv"] || "",
        "Proizvođač": row["Proizvođač"] || "",
        "Cena": parseFloat(row["Cena"]) || 0,
        "Jedinica mere": row["Jedinica mere"] || ""
      }));

      const { error } = await supabase
        .from('products')
        .insert(products);

      if (error) {
        console.error('Error inserting products:', error);
        toast.error("Greška pri uvozu proizvoda");
        return;
      }

      toast.success("Cenovnik je uspešno učitan");
    }
  } catch (error) {
    console.error("Error processing Excel file:", error);
    toast.error("Greška pri obradi Excel fajla");
  }
};