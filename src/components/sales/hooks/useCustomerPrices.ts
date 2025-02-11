import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Product } from "@/types";
import { toast } from "sonner";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface GroupPrice {
  group_id: string;
  product_id: string;
  cash_price: number;
  invoice_price: number;
}

interface CustomerPrice {
  customer_id: string;
  product_id: string;
  cash_price: number;
  invoice_price: number;
}

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
          console.log('Found group:', groupData.id);
          
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

      // Then get customer-specific prices which will override group prices
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

      console.log('Setting new prices map:', pricesMap);
      setCustomerPrices(pricesMap);
    } catch (error) {
      console.error('Error in fetchCustomerPrices:', error);
      toast.error("Greška pri učitavanju cena");
    }
  };

  useEffect(() => {
    let pricesChannel: any = null;
    let groupPricesChannel: any = null;

    const setupSubscriptions = async () => {
      if (!selectedCustomer?.id) return;

      console.log('Setting up price subscriptions for customer:', selectedCustomer.id);
      await fetchCustomerPrices();

      // Subscribe to customer_prices changes
      pricesChannel = supabase
        .channel('customer-prices-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customer_prices',
            filter: `customer_id=eq.${selectedCustomer.id}`
          },
          async (payload: RealtimePostgresChangesPayload<CustomerPrice>) => {
            console.log('Customer price change detected:', payload);
            await fetchCustomerPrices();
          }
        )
        .subscribe((status) => {
          console.log('Customer prices subscription status:', status);
        });

      // Subscribe to group_prices changes if customer belongs to a group
      if (selectedCustomer.group_name) {
        const { data: groupData } = await supabase
          .from('customer_groups')
          .select('id')
          .eq('name', selectedCustomer.group_name)
          .maybeSingle();

        if (groupData) {
          console.log('Setting up group prices subscription for group:', groupData.id);
          
          groupPricesChannel = supabase
            .channel('group-prices-changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'group_prices',
                filter: `group_id=eq.${groupData.id}`
              },
              async (payload: RealtimePostgresChangesPayload<GroupPrice>) => {
                console.log('Group price change detected:', payload);
                await fetchCustomerPrices();
              }
            )
            .subscribe((status) => {
              console.log('Group prices subscription status:', status);
            });
        }
      }
    };

    setupSubscriptions();

    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up price subscriptions');
      if (pricesChannel) {
        supabase.removeChannel(pricesChannel);
      }
      if (groupPricesChannel) {
        supabase.removeChannel(groupPricesChannel);
      }
    };
  }, [selectedCustomer?.id, selectedCustomer?.group_name]);

  const getProductPrice = (product: Product, paymentType: 'cash' | 'invoice') => {
    const customPrice = customerPrices[product.id]?.[paymentType];
    console.log(`Price for product ${product.id} (${paymentType}):`, customPrice || product.Cena);
    return customPrice || product.Cena;
  };

  return {
    customerPrices,
    getProductPrice,
    fetchCustomerPrices
  };
};