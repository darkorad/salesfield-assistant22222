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

    // First, ensure profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          name: session.user.email || 'Unknown',
          role: 'salesperson'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast.error("Greška pri kreiranju profila");
        return;
      }
    }

    const workbook = XLSX.read(data, { type: "binary" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (type === "customers") {
      const customers = jsonData.map((row: any) => ({
        user_id: session.user.id,
        code: row["Šifra kupca"]?.toString() || "",
        name: row["Naziv kupca"] || "",
        address: row["Adresa"] || "",
        city: row["Grad"] || "",
        phone: row["Telefon"] || "",
        pib: row["PIB"] || "",
        is_vat_registered: row["PDV Obveznik"]?.toUpperCase() === "DA",
        gps_coordinates: row["GPS Koordinate"] || ""
      }));

      const { error } = await supabase
        .from('customers')
        .insert(customers);

      if (error) {
        console.error('Error inserting customers:', error);
        toast.error("Greška pri uvozu kupaca");
        return;
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