
import { useState, useEffect, useCallback } from "react";
import { Customer, Product } from "@/types";
import { useNavigate } from "react-router-dom";
import { fetchOnlineOfflineData } from "./sales/useOnlineOfflineData";
import { useRealtimeSubscriptions } from "./sales/useRealtimeSubscriptions";
import { useSyncStatusCheck } from "./sales/useSyncStatusCheck";
import { useAuthStateListener } from "./sales/useAuthStateListener";
import { supabase } from "@/integrations/supabase/client";

export const useSalesData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchOnlineOfflineData();
      
      setCustomers(result.customers);
      setProducts(result.products);
      setIsOffline(result.isOffline);
      setError(result.error);
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { setupSubscriptions } = useRealtimeSubscriptions({ 
    onDataChange: fetchData 
  });
  
  const { checkSyncStatus, setupReconnectionListener } = useSyncStatusCheck();
  
  const { setupAuthListener } = useAuthStateListener({
    navigate,
    onSignIn: fetchData
  });

  useEffect(() => {
    fetchData();
    
    // Set up subscriptions and get cleanup functions
    const { customersChannel, kupciDarkoChannel, productsChannel } = setupSubscriptions();
    
    // Set up auth state listener
    const subscription = setupAuthListener();
    
    // Check sync status
    checkSyncStatus();
    
    // Set up reconnection listener
    const cleanupReconnectionListener = setupReconnectionListener(checkSyncStatus);
    
    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(kupciDarkoChannel);
      supabase.removeChannel(productsChannel);
      cleanupReconnectionListener();
    };
  }, [fetchData, setupSubscriptions, setupAuthListener, checkSyncStatus, setupReconnectionListener, navigate]);

  return { 
    customers, 
    products, 
    isLoading,
    isOffline, 
    error,
    refetch: fetchData 
  };
};
