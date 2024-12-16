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
          navigate("/login");
          return;
        }

        setIsLoading(true);

        // Fetch customers and products in parallel
        const [customersResponse, productsResponse] = await Promise.all([
          supabase
            .from('customers')
            .select('*')
            .order('name'),
          supabase
            .from('products')
            .select('*')
            .order('Naziv')
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

        // Map products data to match the Product type
        const mappedProducts: Product[] = (productsResponse.data || []).map(product => ({
          id: product.id,
          user_id: product.user_id,
          name: product.Naziv,
          manufacturer: product.Proizvođač,
          price: product.Cena,
          unit: product["Jedinica mere"],
          Naziv: product.Naziv,
          Proizvođač: product.Proizvođač,
          Cena: product.Cena,
          "Jedinica mere": product["Jedinica mere"]
        }));

        setCustomers(customersResponse.data || []);
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Greška pri učitavanju podataka");
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
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