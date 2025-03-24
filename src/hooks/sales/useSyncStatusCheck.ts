
import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { checkOnlineStatus, getLastSyncTimestamp } from "@/utils/offlineStorage";

export const useSyncStatusCheck = () => {
  const checkSyncStatus = useCallback(async () => {
    const online = await checkOnlineStatus();
    if (online) {
      const lastSync = await getLastSyncTimestamp();
      if (!lastSync) {
        toast.info("Potrebno je sinhronizovati podatke. Kliknite na dugme za sinhronizaciju.");
      }
    }
  }, []);

  const setupReconnectionListener = useCallback((onReconnect: () => void) => {
    const handleReconnect = () => {
      console.log("Device reconnected, checking for data updates");
      onReconnect();
    };
    
    window.addEventListener('online', handleReconnect);
    
    return () => {
      window.removeEventListener('online', handleReconnect);
    };
  }, []);

  return {
    checkSyncStatus,
    setupReconnectionListener
  };
};
