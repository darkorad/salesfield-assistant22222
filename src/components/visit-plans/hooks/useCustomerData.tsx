
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Customer } from "@/types";
import { checkOnlineStatus, getLocalCustomers } from "@/utils/offlineStorage";

export const useCustomerData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDataRefresh, setLastDataRefresh] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we're online
      const online = await checkOnlineStatus();
      setIsOffline(!online);
      
      if (!online) {
        console.log("Device is offline, loading customers from local storage");
        // Load from local storage when offline
        const localCustomers = await getLocalCustomers();
        
        if (localCustomers.length === 0) {
          console.log("No customers found in local storage");
          setError("Nema sačuvanih kupaca u offline režimu. Sinhronizujte podatke kada budete online.");
          toast.error("Nema sačuvanih kupaca u offline režimu");
          return [];
        }
        
        console.log(`Loaded ${localCustomers.length} customers from local storage`);
        toast.info("Koriste se lokalno sačuvani podaci (offline režim)");
        return localCustomers;
      }
      
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Greška pri proveri sesije. Molimo prijavite se ponovo.");
        toast.error("Greška pri proveri sesije. Molimo prijavite se ponovo.");
        return [];
      }
      
      if (!session) {
        console.log("No active session found");
        setError("Niste prijavljeni. Molimo prijavite se.");
        toast.error("Niste prijavljeni. Molimo prijavite se.");
        return [];
      }

      // Check if there was a recent data import
      const userId = session.user.id;
      const lastImport = localStorage.getItem(`lastCustomersImport_${userId}`);
      setLastDataRefresh(lastImport);

      console.log("Fetching customers");
      console.log("User ID:", userId);
      console.log("User Email:", session.user.email);

      // Create a single function to handle table access errors consistently
      const handleTableAccessError = (error: any, tableName: string) => {
        console.error(`Error accessing ${tableName} table:`, error);
        
        if (error.message.includes("permission denied")) {
          console.error(`Permission denied for ${tableName} table`);
          return true; // Indicates permission error
        }
        return false; // Not a permission error
      };

      // Collect all customers from both tables
      let customersData: Customer[] = [];
      let permissionError = false;
      
      // Try with kupci_darko table first - with better error handling
      try {
        console.log("Fetching from kupci_darko table...");
        const kupciDarkoResponse = await supabase
          .from("kupci_darko")
          .select("id, name, address, city, phone, pib, dan_posete, dan_obilaska, visit_day, group_name, naselje, email, is_vat_registered, gps_coordinates")
          .eq('user_id', userId)
          .order("name");
        
        if (kupciDarkoResponse.error) {
          permissionError = handleTableAccessError(kupciDarkoResponse.error, "kupci_darko");
        } else if (kupciDarkoResponse.data && kupciDarkoResponse.data.length > 0) {
          console.log(`Found ${kupciDarkoResponse.data.length} customers in kupci_darko`);
          customersData = [...customersData, ...kupciDarkoResponse.data as Customer[]];
        }
      } catch (error) {
        console.error("Unexpected error fetching from kupci_darko:", error);
      }
      
      // Then try with regular customers table - if we don't have a permission error already
      if (!permissionError) {
        try {
          console.log("Fetching from customers table...");
          const customersResponse = await supabase
            .from("customers")
            .select("id, name, address, city, phone, pib, visit_day, dan_obilaska, group_name, naselje, email, is_vat_registered, gps_coordinates")
            .eq('user_id', userId)
            .order("name");
          
          if (customersResponse.error) {
            permissionError = handleTableAccessError(customersResponse.error, "customers");
          } else if (customersResponse.data && customersResponse.data.length > 0) {
            console.log(`Found ${customersResponse.data.length} customers in customers table`);
            customersData = [...customersData, ...customersResponse.data as Customer[]];
          }
        } catch (error) {
          console.error("Unexpected error fetching from customers:", error);
        }
      }
      
      // If we had a permission error with either table
      if (permissionError) {
        setError("Nemate dozvolu za pregled kupaca. Molimo kontaktirajte administratora.");
        toast.error("Nemate dozvolu za pregled kupaca");
        return [];
      }
      
      // Check if we got any customers
      if (customersData.length === 0) {
        console.log("No customers found in either table");
        
        // Do one more check on permissions by trying a different approach
        try {
          // Try a simpler query to check access permissions
          const permissionCheck = await supabase.from('profiles').select('id').limit(1);
          console.log("Permission check result:", permissionCheck);
          
          if (permissionCheck.error) {
            if (permissionCheck.error.message.includes("permission denied")) {
              setError("Nemate dozvolu za pregled kupaca. Molimo kontaktirajte administratora.");
              toast.error("Nemate dozvolu za pregled kupaca");
            } else {
              setError("Nema pronađenih kupaca. Molimo uvezite listu kupaca.");
              toast.error("Nema pronađenih kupaca");
            }
          } else {
            // If we can access the DB but no customers, suggest import
            setError("Nema pronađenih kupaca. Molimo uvezite listu kupaca.");
            toast.error("Nema pronađenih kupaca");
          }
        } catch (error) {
          console.error("Error during permission check:", error);
          setError("Greška pri proveri dozvola. Molimo pokušajte ponovo kasnije.");
        }
        
        return [];
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

      return finalCustomers;
    } catch (error) {
      console.error("Unexpected error:", error);
      
      // Try to load from local storage if online fetch fails
      try {
        const localCustomers = await getLocalCustomers();
        if (localCustomers.length > 0) {
          console.log("Falling back to local data");
          toast.info("Koriste se lokalno sačuvani podaci");
          return localCustomers;
        }
      } catch (fallbackError) {
        console.error("Error loading fallback data:", fallbackError);
      }
      
      setError("Neočekivana greška pri učitavanju podataka. Molimo pokušajte ponovo.");
      toast.error("Neočekivana greška pri učitavanju podataka");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    customers,
    setCustomers,
    isLoading,
    error,
    fetchCustomers,
    lastDataRefresh,
    isOffline
  };
};
