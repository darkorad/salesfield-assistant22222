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

      // Store in both tables for backward compatibility
      const { error: customersError } = await supabase
        .from('customers')
        .upsert(customerData, {
          onConflict: 'user_id,code'
        });

      const { error: importedCustomersError } = await supabase
        .from('imported_customers')
        .upsert(customerData, {
          onConflict: 'user_id,code'
        });

      if (customersError || importedCustomersError) {
        throw new Error(`Error upserting customer ${customerData.name}`);
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
    // First, collect all products and deduplicate them
    const productsMap = new Map();
    
    for (const row of jsonData) {
      const key = `${row["Naziv"]}_${row["Proizvođač"]}`;
      productsMap.set(key, {
        user_id: userId,
        "Naziv": row["Naziv"] || "",
        "Proizvođač": row["Proizvođač"] || "",
        "Cena": parseFloat(row["Cena"]) || 0,
        "Jedinica mere": row["Jedinica mere"] || ""
      });
    }

    const products = Array.from(productsMap.values());

    // Store in products table
    const { error: productsError } = await supabase
      .from('products')
      .upsert(products, {
        onConflict: 'user_id,Naziv,Proizvođač'
      });

    // Store in imported_products table
    const importedProducts = products.map(product => ({
      user_id: userId,
      name: product["Naziv"],
      manufacturer: product["Proizvođač"],
      price: product["Cena"],
      unit: product["Jedinica mere"]
    }));

    const { error: importedProductsError } = await supabase
      .from('imported_products')
      .upsert(importedProducts, {
        onConflict: 'user_id,name,manufacturer'
      });

    if (productsError || importedProductsError) {
      console.error('Products error:', productsError);
      console.error('Imported products error:', importedProductsError);
      throw new Error(`Error inserting products`);
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