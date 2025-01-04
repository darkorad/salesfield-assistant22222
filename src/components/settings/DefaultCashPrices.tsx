import { useState, useEffect } from "react";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PriceForm } from "./default-cash-prices/PriceForm";
import { PricesList } from "./default-cash-prices/PricesList";

export const DefaultCashPrices = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [defaultPrices, setDefaultPrices] = useState<any[]>([]);

  useEffect(() => {
    fetchProductsAndPrices();
  }, []);

  const fetchProductsAndPrices = async () => {
    try {
      // Get user email to determine which products table to use
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Fetch products based on user email
      let productsData;
      if (session.user.email === 'zirmd.darko@gmail.com') {
        const { data, error } = await supabase
          .from('products_darko')
          .select('*')
          .not('Naziv', 'eq', '');
        
        if (error) throw error;
        productsData = data;
      } else {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', session.user.id)
          .not('Naziv', 'eq', '');
        
        if (error) throw error;
        productsData = data;
      }

      // Fetch default cash prices
      const { data: pricesData, error: pricesError } = await supabase
        .from('default_cash_prices')
        .select('*')
        .eq('user_id', session.user.id);

      if (pricesError) throw pricesError;

      setProducts(productsData || []);
      setDefaultPrices(pricesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Greška pri učitavanju podataka");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Podrazumevane cene za gotovinu</h2>
      
      <div className="space-y-4">
        <PriceForm 
          products={products}
          onSave={fetchProductsAndPrices}
        />
        
        {defaultPrices.length > 0 && (
          <PricesList 
            defaultPrices={defaultPrices}
            products={products}
          />
        )}
      </div>
    </div>
  );
};