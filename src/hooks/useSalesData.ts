import { useState, useEffect, useCallback } from "react";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  checkOnlineStatus,
  getLocalCustomers,
  getLocalProducts,
  storeCustomersLocally,
  storeProductsLocally,
  updateLastSyncTimestamp
} from "@/utils/offlineStorage";

export const useSalesData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      // First check if we're online
      const online = await checkOnlineStatus();
      setIsOffline(!online);

      setIsLoading(true);
      setError(null);

      if (!online) {
        console.log("Device is offline, loading data from local storage");
        // Load from local storage when offline
        const localCustomers = await getLocalCustomers();
        const localProducts = await getLocalProducts();
        
        if (localCustomers.length === 0 && localProducts.length === 0) {
          toast.error("Nema sačuvanih podataka u offline režimu");
          setError("Nema sačuvanih podataka za offline režim. Sinhronizujte podatke kada budete online.");
        } else {
          toast.info("Koriste se lokalno sačuvani podaci (offline režim)");
          console.log(`Loaded ${localCustomers.length} customers and ${localProducts.length} products from local storage`);
        }
        
        setCustomers(localCustomers);
        setProducts(localProducts);
        setIsLoading(false);
        return;
      }

      // If we're online, continue with normal data fetching
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("Fetching data for user:", session.user.id);

      // Get user email
      const userEmail = session.user.email;
      if (!userEmail) {
        throw new Error("User email not found");
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
        setError(customersError.message);
        return;
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
        setError(productsError.message);
        return;
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

      setCustomers(customersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Greška pri učitavanju podataka");
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      
      // Try to load from local storage as fallback when online fetch fails
      try {
        const localCustomers = await getLocalCustomers();
        const localProducts = await getLocalProducts();
        
        if (localCustomers.length > 0 || localProducts.length > 0) {
          toast.info("Učitani podaci iz lokalne baze kao rezervna opcija");
          setCustomers(localCustomers);
          setProducts(localProducts);
        }
      } catch (fallbackError) {
        console.error('Error loading fallback data:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for customers table
    const customersChannel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Real-time customer update received:', payload);
          fetchData();
        }
      )
      .subscribe((status) => {
        console.log('Customers subscription status:', status);
      });

    // Set up real-time subscription for kupci_darko table
    const kupciDarkoChannel = supabase
      .channel('kupci-darko-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kupci_darko'
        },
        (payload) => {
          console.log('Real-time kupci_darko update received:', payload);
          fetchData();
        }
      )
      .subscribe((status) => {
        console.log('kupci_darko subscription status:', status);
      });

    // Set up real-time subscription for products table
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products_darko'
        },
        (payload) => {
          console.log('Real-time product update received:', payload);
          fetchData();
        }
      )
      .subscribe((status) => {
        console.log('Products subscription status:', status);
      });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        navigate("/login");
      } else if (event === 'SIGNED_IN') {
        fetchData();
      }
    });

    // Set up periodic sync check when app is online
    const checkSyncStatus = async () => {
      const online = await checkOnlineStatus();
      if (online) {
        const lastSync = await getLastSyncTimestamp();
        if (!lastSync) {
          toast.info("Potrebno je sinhronizovati podatke. Kliknite na dugme za sinhronizaciju.");
        }
      }
    };
    
    checkSyncStatus();
    
    // Handle reconnection events
    const handleReconnect = () => {
      console.log("Device reconnected, checking for data updates");
      checkSyncStatus();
    };
    
    window.addEventListener('online', handleReconnect);
    
    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(kupciDarkoChannel);
      supabase.removeChannel(productsChannel);
      window.removeEventListener('online', handleReconnect);
    };
  }, [navigate, fetchData]);

  return { 
    customers, 
    products, 
    isLoading,
    isOffline, 
    error,
    refetch: fetchData 
  };
};
