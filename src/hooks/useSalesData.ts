import { useState, useEffect } from "react";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useSalesData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      console.log("Fetching data for user:", session.user.id);

      // Get user email
      const userEmail = session.user.email;
      console.log("User email:", userEmail);

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id);

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        toast.error("Greška pri učitavanju kupaca");
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
        return;
      }

      console.log("Fetched customers:", customersData);
      console.log("Fetched products:", productsData);

      setCustomers(customersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Greška pri učitavanju podataka");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for products_darko table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'products_darko'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchData(); // Refresh all data when changes occur
        }
      )
      .subscribe();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/login");
      } else if (event === 'SIGNED_IN') {
        fetchData();
      }
    });

    // Cleanup subscriptions
    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  return { customers, products, isLoading };
};