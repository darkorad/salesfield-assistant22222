import { useMemo } from "react";
import { Product } from "@/types";

export const useProductFilter = (products: Product[], searchTerm: string) => {
  return useMemo(() => {
    if (!products) return [];
    const trimmedTerm = searchTerm.trim().toLowerCase();
    if (!trimmedTerm) return products; // Return all products if no search term
    
    console.log("Filtering products:", products.length, "with term:", trimmedTerm);
    
    return products.filter((product) => {
      const productName = product.Naziv.toLowerCase();
      const manufacturer = product.Proizvođač.toLowerCase();
      return productName.includes(trimmedTerm) || manufacturer.includes(trimmedTerm);
    });
  }, [products, searchTerm]);
};