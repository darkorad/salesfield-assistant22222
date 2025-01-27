import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Product } from "@/types";
import { toast } from "sonner";

export const useCustomerPrices = (selectedCustomer: Customer) => {
  const [customerPrices, setCustomerPrices] = useState<Record<string, { cash: number; invoice: number }>>({});

  const fetchCustomerPrices = async () => {
    try {
      console.log('Fetching prices for customer:', selectedCustomer.id);
      
      let pricesMap: Record<string, { cash: number; invoice: number }> = {};

      // If customer belongs to a group, first get group prices
      if (selectedCustomer.group_name) {
        console.log('Customer belongs to group:', selectedCustomer.group_name);
        
        const { data: groupData, error: groupError } = await supabase
          .from('customer_groups')
          .select('id')
          .eq('name', selectedCustomer.group_name)
          .maybeSingle();

        if (groupError) {
          console.error('Error fetching group ID:', groupError);
        } else if (groupData) {
          // Get group prices
          const { data: groupPrices, error: pricesError } = await supabase
            .from('group_prices')
            .select('*')
            .eq('group_id', groupData.id);

          if (pricesError) {
            console.error('Error fetching group prices:', pricesError);
          } else if (groupPrices) {
            console.log('Found group prices:', groupPrices.length);
            groupPrices.forEach(price => {
              pricesMap[price.product_id] = {
                cash: price.cash_price,
                invoice: price.invoice_price
              };
            });
          }
        }
      }

      // Then get customer-specific prices which will override group prices if they exist
      const { data: customerPrices, error: customerError } = await supabase
        .from('customer_prices')
        .select('*')
        .eq('customer_id', selectedCustomer.id);

      if (customerError) {
        console.error('Error fetching customer prices:', customerError);
      } else if (customerPrices) {
        console.log('Found customer-specific prices:', customerPrices.length);
        customerPrices.forEach(price => {
          pricesMap[price.product_id] = {
            cash: price.cash_price,
            invoice: price.invoice_price
          };
        });
      }

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

      // Subscribe to changes in customer_prices
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
          () => {
            console.log('Customer price change detected, refreshing prices');
            fetchCustomerPrices();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_prices'
          },
          async (payload) => {
            console.log('Group price change detected');
            if (selectedCustomer.group_name) {
              const { data: groupData } = await supabase
                .from('customer_groups')
                .select('id')
                .eq('name', selectedCustomer.group_name)
                .maybeSingle();

              if (groupData && payload.new.group_id === groupData.id) {
                console.log('Group price change affects current customer, refreshing prices');
                fetchCustomerPrices();
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Price subscription status:', status);
        });

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