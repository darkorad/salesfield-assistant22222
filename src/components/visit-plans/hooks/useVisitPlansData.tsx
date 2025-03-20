
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
      
      // First check if user is authenticated
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Greška pri proveri sesije. Molimo prijavite se ponovo.");
        toast.error("Greška pri proveri sesije. Molimo prijavite se ponovo.");
        return;
      }
      
      if (!session.session) {
        console.log("No active session found");
        setError("Niste prijavljeni. Molimo prijavite se.");
        toast.error("Niste prijavljeni. Molimo prijavite se.");
        return;
      }

      // Check if there was a recent data import
      const userId = session.session.user.id;
      const lastImport = localStorage.getItem(`lastCustomersImport_${userId}`);
      setLastDataRefresh(lastImport);

      console.log("Fetching customers for visit plans");
      console.log("User ID:", userId);
      console.log("User Email:", session.session?.user.email);

      // Collect all customers from both tables
      let customersData: Customer[] = [];
      
      // First try with kupci_darko table
      console.log("Fetching from kupci_darko table...");
      const kupciDarkoResponse = await supabase
        .from("kupci_darko")
        .select("id, name, address, city, phone, pib, dan_posete, dan_obilaska, visit_day, group_name, naselje, email, is_vat_registered, gps_coordinates")
        .eq('user_id', userId)
        .order("name");
      
      if (kupciDarkoResponse.error) {
        console.error("Error fetching from kupci_darko:", kupciDarkoResponse.error);
        
        if (kupciDarkoResponse.error.message.includes("permission denied")) {
          console.log("Permission denied for kupci_darko table");
        }
      } else if (kupciDarkoResponse.data && kupciDarkoResponse.data.length > 0) {
        console.log(`Found ${kupciDarkoResponse.data.length} customers in kupci_darko`);
        customersData = [...customersData, ...kupciDarkoResponse.data as Customer[]];
      }
      
      // Then try with regular customers table
      console.log("Fetching from customers table...");
      const customersResponse = await supabase
        .from("customers")
        .select("id, name, address, city, phone, pib, visit_day, dan_obilaska, group_name, naselje, email, is_vat_registered, gps_coordinates")
        .eq('user_id', userId)
        .order("name");
      
      if (customersResponse.error) {
        console.error("Error fetching from customers:", customersResponse.error);
        
        if (customersResponse.error.message.includes("permission denied")) {
          console.log("Permission denied for customers table");
        }
      } else if (customersResponse.data && customersResponse.data.length > 0) {
        console.log(`Found ${customersResponse.data.length} customers in customers table`);
        customersData = [...customersData, ...customersResponse.data as Customer[]];
      }
      
      // Check if we got any customers
      if (customersData.length === 0) {
        console.log("No customers found in either table");
        
        // Try a permission check to see if we can at least access the tables
        const permissionCheck = await supabase.rpc('check_access_permission');
        console.log("Permission check result:", permissionCheck);
        
        if (permissionCheck.error) {
          if (permissionCheck.error.message.includes("permission denied") || 
              permissionCheck.error.message.includes("function") || 
              permissionCheck.error.message.includes("does not exist")) {
            // This is likely a permissions issue
            setError("Nemate dozvolu za pregled kupaca. Molimo kontaktirajte administratora.");
            toast.error("Nemate dozvolu za pregled kupaca");
          } else {
            // Some other error
            setError("Nema pronađenih kupaca. Molimo uvezite listu kupaca.");
            toast.error("Nema pronađenih kupaca");
          }
        } else {
          // If we can access the DB but no customers, suggest import
          setError("Nema pronađenih kupaca. Molimo uvezite listu kupaca.");
          toast.error("Nema pronađenih kupaca");
        }
        
        setIsLoading(false);
        return;
      }

      console.log("Successfully fetched customers:", customersData.length);

      // Deduplicate customers by ID to prevent duplicates
      const uniqueCustomers = new Map<string, Customer>();
      
      customersData.forEach(customer => {
        if (!uniqueCustomers.has(customer.id)) {
          uniqueCustomers.set(customer.id, customer);
        }
      });
      
      const finalCustomers = Array.from(uniqueCustomers.values());
      console.log("Unique customers after deduplication:", finalCustomers.length);

      // For visit plans, we're setting it to an empty array as we deleted all records
      setVisitPlans([]);
      setCustomers(finalCustomers);
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Neočekivana greška pri učitavanju podataka. Molimo pokušajte ponovo.");
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
