import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { toast } from "sonner";

export const useProductData = (userEmail: string) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async (userId: string) => {
    try {
      console.log("Fetching products from products_darko table");
      const { data: productsData, error } = await supabase
        .from('products_darko')
        .select('*')
        .order('Naziv');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log("Raw products data count:", productsData?.length);

      // Map the data to match our Product type
      const mappedProducts = productsData?.map(product => ({
        id: product.id,
        user_id: userId, // Required by Product type
        Naziv: product.Naziv,
        Proizvođač: product.Proizvođač,
        Cena: product.Cena,
        "Jedinica mere": product["Jedinica mere"],
        created_at: product.created_at
      })) || [];

      console.log("Mapped products count:", mappedProducts.length);
      setProducts(mappedProducts);
      return mappedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Greška pri učitavanju proizvoda");
      return [];
    }
  };

  return { products, fetchProducts };
};