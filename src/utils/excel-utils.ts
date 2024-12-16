import * as XLSX from "xlsx";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const processExcelFile = async (data: any, type: "customers" | "products", userId: string) => {
  try {
    // First check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      // Create profile if it doesn't exist
      const { data: session } = await supabase.auth.getSession();
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: session.session?.user.email || 'Unknown',
          role: 'salesperson'
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        toast.error("Greška pri kreiranju profila");
        return;
      }
    }

    const workbook = XLSX.read(data, { type: "binary" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (type === "customers") {
      // Delete existing customers for this user
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing customers:', deleteError);
        toast.error("Greška pri brisanju postojećih kupaca");
        return;
      }

      // Insert new customers
      for (const row of jsonData) {
        const customerData = {
          user_id: userId,
          code: row["Šifra kupca"]?.toString() || "",
          name: row["Naziv kupca"] || "",
          address: row["Adresa"] || "",
          city: row["Grad"] || "",
          phone: row["Telefon"] || "",
          pib: row["PIB"] || "",
          is_vat_registered: row["PDV Obveznik"]?.toUpperCase() === "DA",
          gps_coordinates: row["GPS Koordinate"] || ""
        };

        const { error: insertError } = await supabase
          .from('customers')
          .insert(customerData);

        if (insertError) {
          console.error('Error inserting customer:', insertError);
          toast.error(`Greška pri dodavanju kupca ${customerData.name}`);
        }
      }
      
      localStorage.setItem(`lastCustomersImport_${userId}`, new Date().toISOString());
      toast.success("Lista kupaca je uspešno učitana");
    } else if (type === "products") {
      // Delete existing products for this user
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing products:', deleteError);
        toast.error("Greška pri brisanju postojećih proizvoda");
        return;
      }

      const products = jsonData.map((row: any) => ({
        user_id: userId,
        "Naziv": row["Naziv"] || "",
        "Proizvođač": row["Proizvođač"] || "",
        "Cena": parseFloat(row["Cena"]) || 0,
        "Jedinica mere": row["Jedinica mere"] || ""
      }));

      const { error: insertError } = await supabase
        .from('products')
        .insert(products);

      if (insertError) {
        console.error('Error inserting products:', insertError);
        toast.error("Greška pri uvozu proizvoda");
        return;
      }

      localStorage.setItem(`lastProductsImport_${userId}`, new Date().toISOString());
      toast.success("Cenovnik je uspešno učitan");
    }
  } catch (error) {
    console.error("Error processing Excel file:", error);
    toast.error("Greška pri obradi Excel fajla");
  }
};