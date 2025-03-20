
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  performFullSync,
  checkOnlineStatus,
  getLastSyncTimestamp,
  getLocalCustomers,
  getLocalProducts
} from '@/utils/offlineStorage';
import { formatDistanceToNow } from 'date-fns';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [hasLocalData, setHasLocalData] = useState<boolean>(false);

  // Update online status and check for local data
  useEffect(() => {
    const updateStatus = async () => {
      const status = await checkOnlineStatus();
      setIsOnline(status);
      
      // Check if we have local data
      const [customers, products] = await Promise.all([
        getLocalCustomers(),
        getLocalProducts()
      ]);
      
      setHasLocalData(customers.length > 0 && products.length > 0);
      
      // Get last sync time
      const timestamp = await getLastSyncTimestamp();
      setLastSyncTime(timestamp);
    };

    // Check initial status
    updateStatus();

    // Add event listeners for online/offline status
    const handleOnline = async () => {
      setIsOnline(true);
      await updateStatus();
    };
    
    const handleOffline = async () => {
      setIsOnline(false);
      await updateStatus();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up an interval to periodically check status
    const interval = setInterval(updateStatus, 60000); // Check every minute

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Format the last sync time in a human-readable format
  const formattedLastSync = useCallback(() => {
    if (!lastSyncTime) return 'Nikad';
    
    try {
      const date = new Date(lastSyncTime);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Nepoznato';
    }
  }, [lastSyncTime]);

  // Sync function
  const syncData = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const online = await checkOnlineStatus();
      if (!online) {
        toast.error('Nema internet konekcije. Sinhronizacija nije moguća.');
        setIsSyncing(false);
        return;
      }
      
      toast.info('Sinhronizacija podataka u toku...');
      const result = await performFullSync();
      
      if (result.success) {
        const message = [
          'Sinhronizacija uspešna',
          result.syncedSales ? `Sinhronizovano ${result.syncedSales} porudžbina` : '',
          result.customersCount ? `Preuzeto ${result.customersCount} kupaca` : '',
          result.productsCount ? `Preuzeto ${result.productsCount} proizvoda` : '',
        ].filter(Boolean).join('. ');
        
        toast.success(message);
        
        // Update last sync time
        const newTimestamp = new Date().toISOString();
        setLastSyncTime(newTimestamp);
        
        // Update hasLocalData state
        setHasLocalData(true);
      } else {
        toast.error(`Greška pri sinhronizaciji: ${result.error || 'Nepoznata greška'}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Greška pri sinhronizaciji');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Get local data (used when offline)
  const getLocalData = useCallback(async () => {
    try {
      const [customers, products] = await Promise.all([
        getLocalCustomers(),
        getLocalProducts()
      ]);
      
      setHasLocalData(customers.length > 0 && products.length > 0);
      return { customers, products };
    } catch (error) {
      console.error('Error getting local data:', error);
      return { customers: [], products: [] };
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    formattedLastSync,
    syncData,
    getLocalData,
    hasLocalData
  };
};
