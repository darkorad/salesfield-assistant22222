import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Product } from "@/types";
import { toast } from "sonner";

export const useCustomerPrices = (selectedCustomer: Customer) => {
  const [customerPrices, setCustomerPrices] = useState<Record<string, { cash: number; invoice: number }>>({});

  const fetchCustomerPrices = async () => {
    try {
      console.log('Fetching prices for customer:', selectedCustomer.id);
      
      // First try to get customer-specific prices
      const { data: customerSpecificPrices, error: customerError } = await supabase
        .from('customer_prices')
        .select('*')
        .eq('customer_id', selectedCustomer.id)
        .order('last_changed', { ascending: false });

      if (customerError) {
        console.error('Error fetching customer prices:', customerError);
        return;
      }

      // Then try to get group prices if the customer belongs to a group
      const { data: groupPrices, error: groupError } = await supabase
        .from('group_prices')
        .select('*')
        .eq('group_id', selectedCustomer.group_name)
        .order('last_changed', { ascending: false });

      if (groupError) {
        console.error('Error fetching group prices:', groupError);
      }

      // Combine prices, prioritizing customer-specific prices over group prices
      const pricesMap: Record<string, { cash: number; invoice: number }> = {};
      
      // First add group prices as base
      groupPrices?.forEach(price => {
        pricesMap[price.product_id] = {
          cash: price.cash_price,
          invoice: price.invoice_price
        };
      });

      // Then override with customer-specific prices
      customerSpecificPrices?.forEach(price => {
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
            console.log('Customer price change detected:', payload);
            fetchCustomerPrices();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_prices',
            filter: `group_id=eq.${selectedCustomer.group_name}`
          },
          (payload) => {
            console.log('Group price change detected:', payload);
            fetchCustomerPrices();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(pricesChannel);
      };
    }
  }, [selectedCustomer?.id, selectedCustomer?.group_name]);

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