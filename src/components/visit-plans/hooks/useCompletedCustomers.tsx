
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCompletedCustomers = () => {
  const [completedCustomers, setCompletedCustomers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const loadCompletedCustomers = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: completedVisits, error: visitsError } = await supabase
        .from('visit_plans')
        .select('customer_id')
        .eq('user_id', session.user.id)
        .eq('completed', true)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (visitsError) {
        console.error("Error loading completed visits:", visitsError);
        return;
      }

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('darko_customer_id')
        .eq('user_id', session.user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString());

      if (salesError) {
        console.error("Error loading sales:", salesError);
        return;
      }

      const completedIds = new Set([
        ...(completedVisits || []).map(visit => visit.customer_id),
        ...(sales || []).map(sale => sale.darko_customer_id)
      ]);

      setCompletedCustomers(completedIds);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Greška pri učitavanju podataka");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompletedCustomers();
  }, []);

  return {
    completedCustomers,
    isLoading,
    loadCompletedCustomers
  };
};
