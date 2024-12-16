import { useState, useEffect } from "react";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useSalesData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

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

        if (isMounted) {
          if (customersResponse.error) {
            console.error('Error fetching customers:', customersResponse.error);
            toast.error("Greška pri učitavanju kupaca");
          } else {
            setCustomers(customersResponse.data || []);
          }

          if (productsResponse.error) {
            console.error('Error fetching products:', productsResponse.error);
            toast.error("Greška pri učitavanju proizvoda");
          } else {
            const mappedProducts = (productsResponse.data || []).map(product => ({
              ...product,
              name: product.Naziv,
              manufacturer: product.Proizvođač,
              price: product.Cena,
              unit: product["Jedinica mere"]
            }));
            setProducts(mappedProducts);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("Greška pri učitavanju podataka");
      }
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        fetchData();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { customers, products };
};