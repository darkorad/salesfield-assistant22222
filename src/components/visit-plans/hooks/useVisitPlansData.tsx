
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Customer } from "@/types";

interface VisitPlan {
  id: string;
  customer_id: string;
  visit_day: string;
  visit_time: string | null;
  notes: string | null;
  completed: boolean;
  customer: {
    name: string;
    address: string;
    city: string;
  };
}

export const useVisitPlansData = () => {
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Greška pri proveri sesije");
        toast.error("Greška pri proveri sesije");
        return;
      }
      
      if (!session.session) {
        console.log("No active session found");
        setError("Niste prijavljeni");
        toast.error("Niste prijavljeni");
        return;
      }

      console.log("Fetching visit plans for date:", today);
      console.log("User ID:", session.session?.user.id);

      // Fetch visit plans
      const { data: plansData, error: plansError } = await supabase
        .from("visit_plans")
        .select(`
          *,
          customer:kupci_darko!visit_plans_customer_id_fkey (
            name,
            address,
            city
          )
        `)
        .eq("user_id", session.session?.user.id)
        .eq("dan_obilaska", today)
        .order("visit_time", { ascending: true });

      if (plansError) {
        console.error("Error fetching visit plans:", plansError);
        setError("Greška pri učitavanju planova poseta");
        toast.error("Greška pri učitavanju planova poseta");
        return;
      }

      console.log("Fetched plans:", plansData?.length || 0);

      // Fetch customers - only get distinct customers to avoid duplicates
      const { data: customersData, error: customersError } = await supabase
        .from("kupci_darko")
        .select("id, name, address, city, phone, pib, dan_posete, dan_obilaska, visit_day, group_name, naselje, email, is_vat_registered, gps_coordinates")
        .order("name");

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        setError("Greška pri učitavanju kupaca");
        toast.error("Greška pri učitavanju kupaca");
        return;
      }

      console.log("Fetched customers:", customersData?.length || 0);

      // Deduplicate customers by ID and name+address
      const uniqueCustomers = new Map<string, Customer>();
      
      // First add all customers by ID
      customersData?.forEach(customer => {
        if (!uniqueCustomers.has(customer.id)) {
          uniqueCustomers.set(customer.id, customer as Customer);
        }
      });
      
      // Get unique customers array
      const finalCustomers = Array.from(uniqueCustomers.values());
      console.log("Unique customers after deduplication:", finalCustomers.length);

      setVisitPlans(plansData || []);
      setCustomers(finalCustomers);
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Neočekivana greška pri učitavanju podataka");
      toast.error("Neočekivana greška pri učitavanju podataka");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for customer updates
    const channel = supabase
      .channel('kupci_darko-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kupci_darko'
        },
        (payload) => {
          console.log('Real-time customer update received:', payload);
          toast.success("Podaci o kupcima su ažurirani");
          fetchData(); // Reload all data when customer changes are detected
        }
      )
      .subscribe((status) => {
        console.log('Customer changes subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [today]);

  return {
    visitPlans,
    customers,
    isLoading,
    error,
    fetchData,
    today
  };
};
