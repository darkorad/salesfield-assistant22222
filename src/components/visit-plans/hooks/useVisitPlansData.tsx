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
  const [lastDataRefresh, setLastDataRefresh] = useState<string | null>(null);
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

      // Check if there was a recent data import
      const userId = session.session.user.id;
      const lastImport = localStorage.getItem(`lastCustomersImport_${userId}`);
      setLastDataRefresh(lastImport);

      console.log("Fetching customers for visit plans");
      console.log("User ID:", session.session?.user.id);
      console.log("User Email:", session.session?.user.email);

      // Determine which table to fetch customers from based on the user's email
      const userEmail = session.session?.user.email;
      let customersResponse;

      // First try with kupci_darko table
      console.log("Attempting to fetch from kupci_darko table");
      customersResponse = await supabase
        .from("kupci_darko")
        .select("id, name, address, city, phone, pib, dan_posete, dan_obilaska, visit_day, group_name, naselje, email, is_vat_registered, gps_coordinates")
        .not('name', 'is', null)
        .eq('user_id', session.session.user.id)
        .order("name");
          
      // If no results or error, try regular customers table
      if (!customersResponse.data || customersResponse.data.length === 0 || customersResponse.error) {
        console.log("No data in kupci_darko or error, trying customers table");
        console.log("Error from kupci_darko:", customersResponse.error);
        
        customersResponse = await supabase
          .from("customers")
          .select("id, name, address, city, phone, pib, dan_posete, dan_obilaska, visit_day, group_name, naselje, email, is_vat_registered, gps_coordinates")
          .not('name', 'is', null)
          .eq('user_id', session.session.user.id)
          .order("name");
      }
      
      if (customersResponse.error) {
        console.error("Error fetching customers:", customersResponse.error);
        setError("Greška pri učitavanju kupaca");
        toast.error("Greška pri učitavanju kupaca");
        return;
      }

      console.log("Fetched customers:", customersResponse.data?.length || 0);

      // Deduplicate customers by ID and name to prevent duplicates showing up
      // First deduplicate by ID
      const uniqueCustomers = new Map<string, Customer>();
      
      // Then check for duplicate names and use only the first one we find
      const uniqueCustomerNames = new Set<string>();
      
      customersResponse.data?.forEach(customer => {
        if (!uniqueCustomers.has(customer.id)) {
          // If this customer name is already in our set, skip it
          if (uniqueCustomerNames.has(customer.name.toLowerCase())) {
            console.log(`Skipping duplicate customer by name: ${customer.name}`);
            return;
          }
          
          // Otherwise, add it to both maps
          uniqueCustomers.set(customer.id, customer as Customer);
          uniqueCustomerNames.add(customer.name.toLowerCase());
        }
      });
      
      const finalCustomers = Array.from(uniqueCustomers.values());
      console.log("Unique customers after deduplication:", finalCustomers.length);

      // For visit plans, we're setting it to an empty array as we deleted all records
      setVisitPlans([]);
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
      .channel('customer-changes')
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

    // Setup listener for local storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('lastCustomersImport_')) {
        console.log('Customer import detected, refreshing data');
        fetchData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [today]);

  return {
    visitPlans,
    customers,
    isLoading,
    error,
    fetchData,
    today,
    lastDataRefresh
  };
};
