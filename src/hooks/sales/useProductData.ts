import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { toast } from "sonner";

export const useProductData = (userEmail: string) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async (userId: string) => {
    try {
      let productsData;
      let productsError;

      if (userEmail === 'zirmd.darko@gmail.com') {
        console.log("Fetching products from products_darko table");
        const response = await supabase
          .from('products_darko')
          .select('*')
          .not('Naziv', 'eq', '');
        
        productsData = response.data;
        productsError = response.error;
      } else {
        console.log("Fetching products from regular products table");
        const response = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .not('Naziv', 'eq', '');
        
        productsData = response.data;
        productsError = response.error;
      }

      if (productsError) {
        throw productsError;
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