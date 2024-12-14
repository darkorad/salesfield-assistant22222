import * as XLSX from "xlsx";
import { Customer, Product } from "@/types";
import { toast } from "sonner";

export const processExcelFile = (data: any, type: "customers" | "products") => {
  try {
    const workbook = XLSX.read(data, { type: "binary" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      toast.error("No user logged in");
      return;
    }

    if (type === "customers") {
      const customers = jsonData.map((row: any) => ({
        id: crypto.randomUUID(),
        name: row["Naziv kupca"] || "",
        address: row["Adresa"] || "",
        city: row["Grad"] || "",
        phone: row["Telefon"] || "",
        pib: row["PIB"] || "",
        isVatRegistered: row["PDV Obveznik"] === "DA",
        gpsCoordinates: row["GPS Koordinate"] || "",
      }));

      // Store in both user-specific and current session storage
      localStorage.setItem(`customers_${currentUser}`, JSON.stringify(customers));
      localStorage.setItem("customers", JSON.stringify(customers));
      localStorage.setItem(`lastCustomersImport_${currentUser}`, new Date().toISOString());
      toast.success("Lista kupaca je uspešno učitana");
    } else if (type === "products") {
      const products = jsonData.map((row: any) => ({
        id: crypto.randomUUID(),
        name: row["Naziv"] || "",
        manufacturer: row["Proizvođač"] || "",
        price: parseFloat(row["Cena"]) || 0,
        unit: row["Jedinica mere"] || "",
      }));

      // Store in both user-specific and current session storage
      localStorage.setItem(`products_${currentUser}`, JSON.stringify(products));
      localStorage.setItem("products", JSON.stringify(products));
      localStorage.setItem(`lastProductsImport_${currentUser}`, new Date().toISOString());
      toast.success("Cenovnik je uspešno učitan");
    }
  } catch (error) {
    console.error("Error processing Excel file:", error);
    toast.error(`Greška pri učitavanju ${type === "customers" ? "liste kupaca" : "cenovnika"}`);
  }
};