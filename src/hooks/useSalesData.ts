import { useState, useEffect } from "react";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useSalesData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, redirecting to login");
        navigate("/login");
        return;
      }

      setIsLoading(true);
      setError(null);
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
        console.log("Fetching customers from kupci_darko table");
        const response = await supabase
          .from('kupci_darko')
          .select('*');
        
        // Transform kupci_darko data to match Customer type
        customersData = response.data?.map(customer => ({
          id: crypto.randomUUID(),
          user_id: session.user.id,
          code: customer['Šifra kupca'].toString(),
          name: customer['Naziv kupca'],
          address: customer['Adresa'],
          city: customer['Grad'],
          phone: customer['Telefon'] || '',
          pib: customer['PIB'] || '',
          is_vat_registered: customer['PDV Obveznik'] === 'DA',
          gps_coordinates: customer['GPS Koordinate'] || '',
          created_at: new Date().toISOString(),
          group_name: null,
          naselje: null,
          email: null
        }));
        customersError = response.error;
      } else {
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
        console.log("Fetching products from products_darko table");
        const response = await supabase
          .from('products_darko')
          .select('*')
          .not('Naziv', 'eq', '');
        
        productsData = response.data;
        productsError = response.error;
      } else {
        console.log("Fetching products from regular products table");
        const response = await supabase
          .from('products')
          .select('*')
          .eq('user_id', session.user.id)
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

      setCustomers(customersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Greška pri učitavanju podataka");
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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

    // Set up real-time subscription for products table
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
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

    // Cleanup subscriptions
    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [navigate]);

  return { 
    customers, 
    products, 
    isLoading, 
    error,
    refetch: fetchData 
  };
};