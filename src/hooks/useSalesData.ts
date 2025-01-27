import { useState } from "react";
import { Customer, Product } from "@/types";
import { useAuthCheck } from "./sales/useAuthCheck";
import { useCustomerData } from "./sales/useCustomerData";
import { useProductData } from "./sales/useProductData";
import { useRealtimeUpdates } from "./sales/useRealtimeUpdates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSalesData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { checkAuth } = useAuthCheck();
  const { customers, fetchCustomers } = useCustomerData('darkotest14@gmail.com');
  const { products, fetchProducts } = useProductData('darkotest14@gmail.com');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const session = await checkAuth();
      if (!session) return;

      console.log("Fetching data for user:", session.user.id);
      console.log("Fetching data from kupci_darko and products_darko tables");

      await Promise.all([
        fetchCustomers(session.user.id),
        fetchProducts(session.user.id)
      ]);

    } catch (error) {
      console.error('Error:', error);
      toast.error("Greška pri učitavanju podataka");
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time updates
  useRealtimeUpdates(fetchData);

  return { 
    customers, 
    products, 
    isLoading, 
    error,
    refetch: fetchData 
  };
};