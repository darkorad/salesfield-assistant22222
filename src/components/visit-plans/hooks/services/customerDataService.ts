
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import { toast } from "sonner";
import { checkOnlineStatus, getLocalCustomers } from "@/utils/offlineStorage";

// Utility function to handle table access errors consistently
export const handleTableAccessError = (error: any, tableName: string) => {
  console.error(`Error accessing ${tableName} table:`, error);
  
  if (error.message.includes("permission denied")) {
    console.error(`Permission denied for ${tableName} table`);
    return true; // Indicates permission error
  }
  return false; // Not a permission error
};

// Function to fetch customers from the kupci_darko table
export const fetchKupciDarko = async (userId: string) => {
  console.log("Fetching from kupci_darko table...");
  try {
    const kupciDarkoResponse = await supabase
      .from("kupci_darko")
      .select("id, name, address, city, phone, pib, dan_posete, dan_obilaska, visit_day, group_name, naselje, email, is_vat_registered, gps_coordinates")
      .eq('user_id', userId)
      .order("name");
    
    if (kupciDarkoResponse.error) {
      return { 
        data: [], 
        permissionError: handleTableAccessError(kupciDarkoResponse.error, "kupci_darko") 
      };
    }
    
    console.log(`Found ${kupciDarkoResponse.data?.length || 0} customers in kupci_darko`);
    return { 
      data: kupciDarkoResponse.data || [], 
      permissionError: false 
    };
  } catch (error) {
    console.error("Unexpected error fetching from kupci_darko:", error);
    return { data: [], permissionError: false };
  }
};

// Function to fetch customers from the customers table
export const fetchCustomers = async (userId: string) => {
  console.log("Fetching from customers table...");
  try {
    const customersResponse = await supabase
      .from("customers")
      .select("id, name, address, city, phone, pib, visit_day, dan_obilaska, group_name, naselje, email, is_vat_registered, gps_coordinates")
      .eq('user_id', userId)
      .order("name");
    
    if (customersResponse.error) {
      return { 
        data: [], 
        permissionError: handleTableAccessError(customersResponse.error, "customers") 
      };
    }
    
    console.log(`Found ${customersResponse.data?.length || 0} customers in customers table`);
    return { 
      data: customersResponse.data || [], 
      permissionError: false 
    };
  } catch (error) {
    console.error("Unexpected error fetching from customers:", error);
    return { data: [], permissionError: false };
  }
};

// Function to check user permissions
export const checkUserPermissions = async () => {
  try {
    // Try a simpler query to check access permissions
    const permissionCheck = await supabase.from('profiles').select('id').limit(1);
    console.log("Permission check result:", permissionCheck);
    
    if (permissionCheck.error) {
      if (permissionCheck.error.message.includes("permission denied")) {
        return "permission";
      }
    }
    return "no_customers";
  } catch (error) {
    console.error("Error during permission check:", error);
    return "error";
  }
};

// Function to fetch all customer data
export const fetchAllCustomerData = async () => {
  try {
    // Check if we're online
    const online = await checkOnlineStatus();
    
    if (!online) {
      console.log("Device is offline, loading customers from local storage");
      // Load from local storage when offline
      const localCustomers = await getLocalCustomers();
      
      if (localCustomers.length === 0) {
        console.log("No customers found in local storage");
        return { 
          customers: [], 
          error: "Nema sačuvanih kupaca u offline režimu. Sinhronizujte podatke kada budete online.", 
          isOffline: true 
        };
      }
      
      console.log(`Loaded ${localCustomers.length} customers from local storage`);
      toast.info("Koriste se lokalno sačuvani podaci (offline režim)");
      return { 
        customers: localCustomers, 
        error: null, 
        isOffline: true 
      };
    }
    
    // First check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return { 
        customers: [], 
        error: "Greška pri proveri sesije. Molimo prijavite se ponovo.", 
        isOffline: false 
      };
    }
    
    if (!session) {
      console.log("No active session found");
      return { 
        customers: [], 
        error: "Niste prijavljeni. Molimo prijavite se.", 
        isOffline: false 
      };
    }

    const userId = session.user.id;
    console.log("Fetching customers");
    console.log("User ID:", userId);
    console.log("User Email:", session.user.email);

    // Collect all customers from both tables
    let customersData: Customer[] = [];
    let permissionError = false;
    
    // Try with kupci_darko table first
    const kupciDarkoResult = await fetchKupciDarko(userId);
    customersData = [...customersData, ...kupciDarkoResult.data as Customer[]];
    permissionError = kupciDarkoResult.permissionError;
    
    // Then try with regular customers table - if we don't have a permission error already
    if (!permissionError) {
      const customersResult = await fetchCustomers(userId);
      customersData = [...customersData, ...customersResult.data as Customer[]];
      permissionError = customersResult.permissionError;
    }
    
    // If we had a permission error with either table
    if (permissionError) {
      return { 
        customers: [], 
        error: "Nemate dozvolu za pregled kupaca. Molimo kontaktirajte administratora.", 
        isOffline: false 
      };
    }
    
    // Check if we got any customers
    if (customersData.length === 0) {
      console.log("No customers found in either table");
      
      // Do one more check on permissions
      const permissionStatus = await checkUserPermissions();
      
      if (permissionStatus === "permission") {
        return { 
          customers: [], 
          error: "Nemate dozvolu za pregled kupaca. Molimo kontaktirajte administratora.", 
          isOffline: false 
        };
      } else if (permissionStatus === "no_customers") {
        return { 
          customers: [], 
          error: "Nema pronađenih kupaca. Molimo uvezite listu kupaca.", 
          isOffline: false 
        };
      } else {
        return { 
          customers: [], 
          error: "Greška pri proveri dozvola. Molimo pokušajte ponovo kasnije.", 
          isOffline: false 
        };
      }
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

    // Check if there was a recent data import
    const lastImport = localStorage.getItem(`lastCustomersImport_${userId}`);

    return { 
      customers: finalCustomers, 
      error: null, 
      isOffline: false,
      lastDataRefresh: lastImport
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    
    // Try to load from local storage if online fetch fails
    try {
      const localCustomers = await getLocalCustomers();
      if (localCustomers.length > 0) {
        console.log("Falling back to local data");
        toast.info("Koriste se lokalno sačuvani podaci");
        return { 
          customers: localCustomers, 
          error: null, 
          isOffline: true 
        };
      }
    } catch (fallbackError) {
      console.error("Error loading fallback data:", fallbackError);
    }
    
    return { 
      customers: [], 
      error: "Neočekivana greška pri učitavanju podataka. Molimo pokušajte ponovo.", 
      isOffline: false 
    };
  }
};
