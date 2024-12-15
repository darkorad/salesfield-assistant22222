import * as XLSX from "xlsx";
import { Customer, Product } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const processExcelFile = async (data: any, type: "customers" | "products") => {
  try {
    const workbook = XLSX.read(data, { type: "binary" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    if (type === "customers") {
      const customers = jsonData.map((row: any) => ({
        id: crypto.randomUUID(),
        user_id: session.user.id,
        code: row["Šifra kupca"]?.toString() || "",
        name: row["Naziv kupca"] || "",
        address: row["Adresa"] || "",
        city: row["Grad"] || "",
        phone: row["Telefon"] || "",
        pib: row["PIB"] || "",
        is_vat_registered: row["PDV Obveznik"] === "DA",
        gps_coordinates: row["GPS Koordinate"] || "",
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
      // Check first row to determine which column names are used
      const firstRow = jsonData[0];
      
      // Define possible column mappings (Serbian to English)
      const nameColumn = firstRow.hasOwnProperty("Naziv") ? "Naziv" : "name";
      const manufacturerColumn = firstRow.hasOwnProperty("Proizvođač") ? "Proizvođač" : "manufacturer";
      const priceColumn = firstRow.hasOwnProperty("Cena") ? "Cena" : "price";
      const unitColumn = firstRow.hasOwnProperty("Jedinica mere") ? "Jedinica mere" : "unit";

      console.log("Found columns:", { nameColumn, manufacturerColumn, priceColumn, unitColumn });
      console.log("First row data:", firstRow);

      const products = jsonData.map((row: any) => ({
        id: crypto.randomUUID(),
        user_id: session.user.id,
        name: row[nameColumn] || "",
        manufacturer: row[manufacturerColumn] || "",
        price: parseFloat(row[priceColumn]) || 0,
        unit: row[unitColumn] || "",
      }));

      console.log("Mapped products:", products);

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