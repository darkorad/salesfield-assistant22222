import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SyncPricesButtonProps {
  customerId: string;
  onSyncComplete: () => void;
}

export const SyncPricesButton = ({ customerId, onSyncComplete }: SyncPricesButtonProps) => {
  const [isSyncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!customerId) return;
    
    setSyncing(true);
    try {
      // Fetch latest customer prices
      const { data: prices, error: pricesError } = await supabase
        .from('customer_prices')
        .select('*')
        .eq('customer_id', customerId);

      if (pricesError) throw pricesError;

      // Fetch latest products
      const { data: products, error: productsError } = await supabase
        .from('products_darko')
        .select('*')
        .not('Naziv', 'eq', '');

      if (productsError) throw productsError;

      toast.success("Cene su uspešno sinhronizovane");
      onSyncComplete();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error("Greška pri sinhronizaciji cena");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? "Sinhronizacija..." : "Sinhronizuj cene"}
    </Button>
  );
};