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
        .not('Naziv', 'eq', '');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log("Fetched products:", productsData?.length || 0);
      setProducts(productsData || []);
      return productsData;
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Greška pri učitavanju proizvoda");
      return [];
    }
  };

  return { products, fetchProducts };
};