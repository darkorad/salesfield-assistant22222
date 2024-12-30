import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SyncDataButtonProps {
  onSyncComplete: () => void;
}

export const SyncDataButton = ({ onSyncComplete }: SyncDataButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncData = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Fetch today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', today.toISOString());

      if (salesError) throw salesError;

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.user.id);

      if (productsError) throw productsError;

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id);

      if (customersError) throw customersError;

      toast.success("Podaci su uspešno sinhronizovani");
      onSyncComplete();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error("Greška pri sinhronizaciji");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={syncData}
      disabled={isSyncing}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? "Sinhronizacija..." : "Sinhronizuj"}
    </Button>
  );
};