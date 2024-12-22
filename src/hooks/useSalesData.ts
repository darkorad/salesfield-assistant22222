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

  useEffect(() => {
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

        // Fetch customers and products in parallel
        const [customersResponse, productsResponse] = await Promise.all([
          supabase
            .from('customers')
            .select('*')
            .eq('user_id', session.user.id),
          supabase
            .from('products')
            .select('*')
            .eq('user_id', session.user.id)
        ]);

        if (customersResponse.error) {
          console.error('Error fetching customers:', customersResponse.error);
          toast.error("Greška pri učitavanju kupaca");
          return;
        }

        if (productsResponse.error) {
          console.error('Error fetching products:', productsResponse.error);
          toast.error("Greška pri učitavanju proizvoda");
          return;
        }

        console.log("Fetched customers:", customersResponse.data);
        console.log("Fetched products:", productsResponse.data);

        setCustomers(customersResponse.data || []);
        setProducts(productsResponse.data || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Greška pri učitavanju podataka");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/login");
      } else if (event === 'SIGNED_IN') {
        fetchData();
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { customers, products, isLoading };
};