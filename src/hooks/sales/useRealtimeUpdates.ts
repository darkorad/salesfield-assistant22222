import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeUpdates = (onUpdate: () => void) => {
  useEffect(() => {
    const customersChannel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Real-time customer update received:', payload);
          onUpdate();
        }
      )
      .subscribe((status) => {
        console.log('Customers subscription status:', status);
      });

    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Real-time product update received:', payload);
          onUpdate();
        }
      )
      .subscribe((status) => {
        console.log('Products subscription status:', status);
      });

    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [onUpdate]);
};