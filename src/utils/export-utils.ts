
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const exportToCSV = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const formatCustomerData = (customers: any[]) => {
  return customers.map(customer => ({
    "Šifra kupca": customer.code,
    "Naziv kupca": customer.name,
    "Adresa": customer.address,
    "Grad": customer.city,
    "Telefon": customer.phone || "",
    "PIB": customer.pib,
    "PDV Obveznik": customer.is_vat_registered ? "DA" : "NE",
    "GPS Koordinate": customer.gps_coordinates || "",
    "Dan posete": customer.dan_posete || "",
    "Dan obilaska": customer.dan_obilaska || "",
    "Grupa": customer.group_name || "",
    "Naselje": customer.naselje || "",
    "Email": customer.email || ""
  }));
};

export const formatProductData = (products: any[]) => {
  return products.map(product => ({
    "Naziv": product.Naziv,
    "Proizvođač": product.Proizvođač,
    "Cena": product.Cena,
    "Jedinica mere": product["Jedinica mere"]
  }));
};
