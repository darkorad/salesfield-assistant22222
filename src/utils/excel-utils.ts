import * as XLSX from "xlsx";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ensureUserProfile = async (userId: string) => {
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (!profiles || profiles.length === 0) {
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email || 'Unknown';
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: userEmail,
          role: 'salesperson'
        });

      if (insertError) {
        throw new Error(`Error creating profile: ${insertError.message}`);
      }
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    throw error;
  }
};

const processCustomers = async (jsonData: any[], userId: string) => {
  try {
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(`Error deleting existing customers: ${deleteError.message}`);
    }

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
        throw new Error(`Error inserting customer ${customerData.name}: ${insertError.message}`);
      }
    }

    localStorage.setItem(`lastCustomersImport_${userId}`, new Date().toISOString());
    toast.success("Lista kupaca je uspešno učitana");
  } catch (error) {
    console.error('Error processing customers:', error);
    throw error;
  }
};

const processProducts = async (jsonData: any[], userId: string) => {
  try {
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(`Error deleting existing products: ${deleteError.message}`);
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
      throw new Error(`Error inserting products: ${insertError.message}`);
    }

    localStorage.setItem(`lastProductsImport_${userId}`, new Date().toISOString());
    toast.success("Cenovnik je uspešno učitan");
  } catch (error) {
    console.error('Error processing products:', error);
    throw error;
  }
};

export const processExcelFile = async (data: any, type: "customers" | "products", userId: string) => {
  try {
    await ensureUserProfile(userId);

    const workbook = XLSX.read(data, { type: "binary" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (type === "customers") {
      await processCustomers(jsonData, userId);
    } else if (type === "products") {
      await processProducts(jsonData, userId);
    }
  } catch (error) {
    console.error("Error processing Excel file:", error);
    toast.error("Greška pri obradi Excel fajla");
  }
};