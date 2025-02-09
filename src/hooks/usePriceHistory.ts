
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PriceChange {
  id: string;
  group_id: string | null;
  customer_id: string | null;
  product_id: string;
  invoice_price: number;
  cash_price: number;
  created_at: string;
}

export const usePriceHistory = (
  productId: string | null,
  groupId?: string | null,
  customerId?: string | null
) => {
  const [priceHistory, setPriceHistory] = useState<PriceChange[]>([]);
  const [latestPrice, setLatestPrice] = useState<PriceChange | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchPriceHistory = async () => {
      try {
        let query = supabase
          .from('price_changes')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (groupId) {
          query = query.eq('group_id', groupId);
        } else if (customerId) {
          query = query.eq('customer_id', customerId);
        }

        const { data, error } = await query;

        if (error) throw error;

        setPriceHistory(data || []);
        setLatestPrice(data?.[0] || null);
      } catch (error) {
        console.error('Error fetching price history:', error);
        toast.error("Greška pri učitavanju istorije cena");
      } finally {
        setIsLoading(false);
      }
    };

    // Set up realtime subscription
    const channel = supabase
      .channel('price-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'price_changes',
          filter: `product_id=eq.${productId}`
        },
        () => {
          fetchPriceHistory();
        }
      )
      .subscribe();

    fetchPriceHistory();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, groupId, customerId]);

  return { priceHistory, latestPrice, isLoading };
};
