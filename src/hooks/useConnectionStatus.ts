
import { useState, useEffect } from "react";
import { checkSupabaseConnectivity } from "@/integrations/supabase/client";

export type NetworkStatus = 'online' | 'offline' | 'checking';

interface UseConnectionStatusOptions {
  onStatusChange?: (isOnline: boolean) => void;
}

export const useConnectionStatus = (options?: UseConnectionStatusOptions) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  // Check connectivity status
  const checkConnection = async () => {
    setIsCheckingConnection(true);
    setNetworkStatus('checking');
    
    try {
      console.log("Checking connectivity status...");
      
      // First check if we're online at all
      if (!navigator.onLine) {
        console.log("Browser reports device is offline");
        setConnectionError("Uređaj nije povezan na internet. Proverite mrežnu konekciju.");
        setNetworkStatus('offline');
        if (options?.onStatusChange) options.onStatusChange(false);
        setIsCheckingConnection(false);
        return false;
      }
      
      // Check connectivity to Supabase
      const connectivity = await checkSupabaseConnectivity();
      if (!connectivity.connected) {
        console.log("Connection failed", connectivity.error);
        setConnectionError(connectivity.error || "Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.");
        setNetworkStatus('offline');
        if (options?.onStatusChange) options.onStatusChange(false);
        setIsCheckingConnection(false);
        return false;
      }

      setNetworkStatus('online');
      setConnectionError(null);
      if (options?.onStatusChange) options.onStatusChange(true);
      return true;
    } catch (error) {
      console.error("Error checking connection:", error);
      setConnectionError("Greška prilikom provere sesije. Molimo pokušajte ponovo kasnije.");
      setNetworkStatus('offline');
      if (options?.onStatusChange) options.onStatusChange(false);
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  };

  // Set up event listeners for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log("Device went online");
      setNetworkStatus('online');
      checkConnection();
    };
    
    const handleOffline = () => {
      console.log("Device went offline");
      setNetworkStatus('offline');
      setConnectionError("Uređaj nije povezan na internet. Proverite mrežnu konekciju.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    checkConnection();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    networkStatus,
    connectionError,
    isCheckingConnection,
    checkConnection
  };
};
