import { useMemo } from "react";
import { Product } from "@/types";

export const useProductFilter = (products: Product[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    return products.filter((product) =>
      product.Naziv.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);
};