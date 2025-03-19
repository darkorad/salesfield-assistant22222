
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

  // Update online status when it changes
  useEffect(() => {
    const updateOnlineStatus = async () => {
      const status = await checkOnlineStatus();
      setIsOnline(status);
    };

    // Check initial status
    updateOnlineStatus();

    // Add event listeners for online/offline status
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Get last sync time
    getLastSyncTimestamp().then(timestamp => {
      setLastSyncTime(timestamp);
    });

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
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
    getLocalData
  };
};
