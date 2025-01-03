import { useState } from "react";
import { Product } from "@/types";

export const useProductSearch = (products: Product[]) => {
  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = products.filter((product) => {
    const searchTerm = productSearch.toLowerCase();
    const productName = product.Naziv?.toLowerCase() || "";
    return productName.includes(searchTerm);
  });

  return {
    productSearch,
    setProductSearch,
    filteredProducts
  };
};