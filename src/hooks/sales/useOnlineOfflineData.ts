
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Product } from "@/types";
import { 
  checkOnlineStatus,
  getLocalCustomers,
  getLocalProducts,
  storeCustomersLocally,
  storeProductsLocally,
  updateLastSyncTimestamp,
  getLastSyncTimestamp
} from "@/utils/offlineStorage";

interface FetchDataResult {
  customers: Customer[];
  products: Product[];
  isOffline: boolean;
  error: string | null;
}

export const fetchOnlineOfflineData = async (): Promise<FetchDataResult> => {
  try {
    // First check if we're online
    const online = await checkOnlineStatus();
    
    if (!online) {
      console.log("Device is offline, loading data from local storage");
      // Load from local storage when offline
      const localCustomers = await getLocalCustomers();
      const localProducts = await getLocalProducts();
      
      if (localCustomers.length === 0 && localProducts.length === 0) {
        toast.error("Nema sačuvanih podataka u offline režimu");
        return {
          customers: [],
          products: [],
          isOffline: true,
          error: "Nema sačuvanih podataka za offline režim. Sinhronizujte podatke kada budete online."
        };
      } else {
        toast.info("Koriste se lokalno sačuvani podaci (offline režim)");
        console.log(`Loaded ${localCustomers.length} customers and ${localProducts.length} products from local storage`);
      }
      
      return {
        customers: localCustomers,
        products: localProducts,
        isOffline: true,
        error: null
      };
    }

    // If we're online, continue with normal data fetching
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No session found");
      return {
        customers: [],
        products: [],
        isOffline: false,
        error: "Niste prijavljeni"
      };
    }

    console.log("Fetching data for user:", session.user.id);

    // Get user email
    const userEmail = session.user.email;
    if (!userEmail) {
      return {
        customers: [],
        products: [],
        isOffline: false,
        error: "User email not found"
      };
    }
    console.log("User email:", userEmail);

    // Fetch customers based on user email
    let customersData;
    let customersError;

    if (userEmail === 'zirmd.darko@gmail.com') {
      console.log("Fetching customers from kupci_darko table for Darko");
      const response = await supabase
        .from('kupci_darko')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (response.error) {
        throw new Error(`Error fetching customers: ${response.error.message}`);
      }

      // Transform kupci_darko data to match Customer type
      customersData = response.data?.map(customer => ({
        id: customer.id || crypto.randomUUID(),
        user_id: session.user.id,
        code: customer.code || '',
        name: customer.name || '',
        address: customer.address || '',
        city: customer.city || '',
        phone: customer.phone || '',
        pib: customer.pib || '',
        is_vat_registered: customer.is_vat_registered || false,
        gps_coordinates: customer.gps_coordinates || '',
        created_at: customer.created_at || new Date().toISOString(),
        group_name: customer.group_name || null,
        naselje: customer.naselje || null,
        email: customer.email || null,
        dan_posete: customer.dan_posete || null
      }));
    } else {
      // For any other user, use standard customer table
      console.log("Fetching customers from regular customers table");
      const response = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id);
      
      customersData = response.data;
      customersError = response.error;
    }

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      toast.error("Greška pri učitavanju kupaca");
      return {
        customers: [],
        products: [],
        isOffline: false,
        error: customersError.message
      };
    }

    // Fetch products based on user email
    let productsData;
    let productsError;

    if (userEmail === 'zirmd.darko@gmail.com') {
      console.log("Fetching products from products_darko table for Darko");
      const response = await supabase
        .from('products_darko')
        .select('*')
        .not('Naziv', 'eq', '');
      
      productsData = response.data;
      productsError = response.error;
    } else {
      console.log("Fetching products from products_darko table");
      const response = await supabase
        .from('products_darko')
        .select('*')
        .not('Naziv', 'eq', '');
      
      productsData = response.data;
      productsError = response.error;
    }

    if (productsError) {
      console.error('Error fetching products:', productsError);
      toast.error("Greška pri učitavanju proizvoda");
      return {
        customers: [],
        products: [],
        isOffline: false,
        error: productsError.message
      };
    }

    console.log("Fetched customers:", customersData?.length || 0);
    console.log("Fetched products:", productsData?.length || 0);

    // Store data locally for offline use
    if (customersData && customersData.length > 0) {
      await storeCustomersLocally(customersData);
      console.log(`Stored ${customersData.length} customers locally`);
    }
    
    if (productsData && productsData.length > 0) {
      await storeProductsLocally(productsData || []);
      console.log(`Stored ${productsData.length} products locally`);
    }
    
    await updateLastSyncTimestamp();

    return {
      customers: customersData || [],
      products: productsData || [],
      isOffline: false,
      error: null
    };
  } catch (error) {
    console.error('Error:', error);
    toast.error("Greška pri učitavanju podataka");
    
    // Try to load from local storage as fallback when online fetch fails
    try {
      const localCustomers = await getLocalCustomers();
      const localProducts = await getLocalProducts();
      
      if (localCustomers.length > 0 || localProducts.length > 0) {
        toast.info("Učitani podaci iz lokalne baze kao rezervna opcija");
        return {
          customers: localCustomers,
          products: localProducts,
          isOffline: true,
          error: null
        };
      }
    } catch (fallbackError) {
      console.error('Error loading fallback data:', fallbackError);
    }
    
    return {
      customers: [],
      products: [],
      isOffline: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
