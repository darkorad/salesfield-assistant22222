
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseRealtimeSubscriptionsProps {
  onDataChange: () => void;
}

export const useRealtimeSubscriptions = ({ onDataChange }: UseRealtimeSubscriptionsProps) => {
  const setupSubscriptions = useCallback(() => {
    // Set up real-time subscription for customers table
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
          onDataChange();
        }
      )
      .subscribe((status) => {
        console.log('Customers subscription status:', status);
      });

    // Set up real-time subscription for kupci_darko table
    const kupciDarkoChannel = supabase
      .channel('kupci-darko-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kupci_darko'
        },
        (payload) => {
          console.log('Real-time kupci_darko update received:', payload);
          onDataChange();
        }
      )
      .subscribe((status) => {
        console.log('kupci_darko subscription status:', status);
      });

    // Set up real-time subscription for products table
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products_darko'
        },
        (payload) => {
          console.log('Real-time product update received:', payload);
          onDataChange();
        }
      )
      .subscribe((status) => {
        console.log('Products subscription status:', status);
      });

    return { customersChannel, kupciDarkoChannel, productsChannel };
  }, [onDataChange]);

  return { setupSubscriptions };
};
