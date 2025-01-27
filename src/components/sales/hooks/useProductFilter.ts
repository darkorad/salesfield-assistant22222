import { useMemo } from "react";
import { Product } from "@/types";

export const useProductFilter = (products: Product[], searchTerm: string) => {
  return useMemo(() => {
    if (!products || products.length === 0) {
      console.log("No products available to filter");
      return [];
    }

    const trimmedTerm = searchTerm.trim().toLowerCase();
    if (!trimmedTerm) {
      console.log("No search term, returning all products:", products.length);
      return products;
    }
    
    console.log("Filtering products:", products.length, "with term:", trimmedTerm);
    
    const filtered = products.filter((product) => {
      const productName = product.Naziv.toLowerCase();
      const manufacturer = product.Proizvođač.toLowerCase();
      return productName.includes(trimmedTerm) || manufacturer.includes(trimmedTerm);
    });

    console.log("Filtered products count:", filtered.length);
    return filtered;
  }, [products, searchTerm]);
};