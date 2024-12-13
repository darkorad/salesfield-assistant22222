import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Customer, Product } from "@/types";

export const processExcelFile = (data: string | ArrayBuffer | null, type: "customers" | "products"): void => {
  try {
    const workbook = XLSX.read(data, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    localStorage.setItem(type, JSON.stringify(jsonData));
    localStorage.setItem(`last${type}Import`, new Date().toISOString());
    
    toast.success(`${type === "customers" ? "Lista kupaca" : "Cenovnik"} je uspešno učitan`);
  } catch (error) {
    toast.error(`Greška pri obradi ${type === "customers" ? "liste kupaca" : "cenovnika"}`);
    console.error(error);
  }
};

export const loadSavedData = () => {
  const customers = localStorage.getItem("customers");
  const products = localStorage.getItem("products");
  return {
    customers: customers ? JSON.parse(customers) : [],
    products: products ? JSON.parse(products) : [],
  };
};