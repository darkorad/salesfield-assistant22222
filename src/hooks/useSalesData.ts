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

        // Fetch customers from both tables in parallel
        const [customersResponse, kupciDarkoResponse, productsResponse] = await Promise.all([
          supabase
            .from('customers')
            .select('*')
            .eq('user_id', session.user.id)
            .order('name'),
          supabase
            .from('Kupci Darko')
            .select('*')
            .order('Naziv kupca'),
          supabase
            .from('products')
            .select('*')
            .eq('user_id', session.user.id)
            .order('Naziv')
        ]);

        if (customersResponse.error) {
          console.error('Error fetching customers:', customersResponse.error);
          toast.error("Greška pri učitavanju kupaca");
          return;
        }

        if (kupciDarkoResponse.error) {
          console.error('Error fetching Kupci Darko:', kupciDarkoResponse.error);
          toast.error("Greška pri učitavanju Kupci Darko");
          return;
        }

        if (productsResponse.error) {
          console.error('Error fetching products:', productsResponse.error);
          toast.error("Greška pri učitavanju proizvoda");
          return;
        }

        // Map Kupci Darko data to match Customer type
        const kupciDarkoCustomers: Customer[] = (kupciDarkoResponse.data || []).map(kupac => ({
          id: kupac["Šifra kupca"].toString(),
          user_id: session.user.id,
          code: kupac["Šifra kupca"].toString(),
          name: kupac["Naziv kupca"],
          address: kupac.Adresa,
          city: kupac.Grad,
          phone: kupac.Telefon,
          pib: kupac.PIB,
          is_vat_registered: kupac["PDV Obveznik"] === "DA",
          gps_coordinates: kupac["GPS Koordinate"] || null
        }));

        // Combine customers from both tables
        const allCustomers = [
          ...(customersResponse.data || []),
          ...kupciDarkoCustomers
        ];

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

        setCustomers(allCustomers);
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