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
    
    console.log("Filtering", products.length, "products with term:", trimmedTerm);
    
    const filtered = products.filter((product) => 
      product.Naziv.toLowerCase().includes(trimmedTerm)
    );

    console.log("Found", filtered.length, "matching products");
    return filtered;
  }, [products, searchTerm]);
};