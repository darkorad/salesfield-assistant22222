import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Product } from "@/types";
import { toast } from "sonner";

export const useCustomerPrices = (selectedCustomer: Customer) => {
  const [customerPrices, setCustomerPrices] = useState<Record<string, { cash: number; invoice: number }>>({});

  const fetchCustomerPrices = async () => {
    try {
      const { data: prices, error } = await supabase
        .from('customer_prices')
        .select('*')
        .eq('customer_id', selectedCustomer.id);

      if (error) {
        console.error('Error fetching customer prices:', error);
        return;
      }

      const pricesMap: Record<string, { cash: number; invoice: number }> = {};
      prices?.forEach(price => {
        pricesMap[price.product_id] = {
          cash: price.cash_price,
          invoice: price.invoice_price
        };
      });

      console.log('Updated customer prices:', pricesMap);
      setCustomerPrices(pricesMap);
    } catch (error) {
      console.error('Error in fetchCustomerPrices:', error);
      toast.error('Greška pri učitavanju cena');
    }
  };

  useEffect(() => {
    if (selectedCustomer?.id) {
      fetchCustomerPrices();

      // Subscribe to real-time changes for customer_prices table
      const pricesChannel = supabase
        .channel('prices-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customer_prices',
            filter: `customer_id=eq.${selectedCustomer.id}`
          },
          (payload) => {
            console.log('Price change detected:', payload);
            fetchCustomerPrices();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(pricesChannel);
      };
    }
  }, [selectedCustomer?.id]);

  const getProductPrice = (product: Product, paymentType: 'cash' | 'invoice') => {
    const customPrice = customerPrices[product.id]?.[paymentType];
    return customPrice || product.Cena;
  };

  return {
    customerPrices,
    getProductPrice,
    fetchCustomerPrices
  };
};