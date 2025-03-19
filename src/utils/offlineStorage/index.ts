
import { Storage } from '@capacitor/storage';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Customer, Product, Order } from "@/types";

// Keys for storing data locally
const STORAGE_KEYS = {
  CUSTOMERS: 'offline_customers',
  PRODUCTS: 'offline_products',
  PENDING_SALES: 'offline_pending_sales',
  LAST_SYNC: 'last_sync_timestamp',
  USER_SESSION: 'user_session'
};

/**
 * Stores customers data locally
 */
export const storeCustomersLocally = async (customers: Customer[]): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.CUSTOMERS,
      value: JSON.stringify(customers)
    });
    console.log(`Stored ${customers.length} customers locally`);
  } catch (error) {
    console.error('Error storing customers locally:', error);
  }
};

/**
 * Stores products data locally
 */
export const storeProductsLocally = async (products: Product[]): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.PRODUCTS,
      value: JSON.stringify(products)
    });
    console.log(`Stored ${products.length} products locally`);
  } catch (error) {
    console.error('Error storing products locally:', error);
  }
};

/**
 * Retrieves locally stored customers
 */
export const getLocalCustomers = async (): Promise<Customer[]> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.CUSTOMERS });
    if (!value) return [];
    return JSON.parse(value);
  } catch (error) {
    console.error('Error retrieving local customers:', error);
    return [];
  }
};

/**
 * Retrieves locally stored products
 */
export const getLocalProducts = async (): Promise<Product[]> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.PRODUCTS });
    if (!value) return [];
    return JSON.parse(value);
  } catch (error) {
    console.error('Error retrieving local products:', error);
    return [];
  }
};

/**
 * Stores a pending sale for sync when online
 */
export const storePendingSale = async (sale: Order): Promise<void> => {
  try {
    // Get existing pending sales
    const { value } = await Storage.get({ key: STORAGE_KEYS.PENDING_SALES });
    const pendingSales: Order[] = value ? JSON.parse(value) : [];
    
    // Add new sale and store
    pendingSales.push(sale);
    await Storage.set({
      key: STORAGE_KEYS.PENDING_SALES,
      value: JSON.stringify(pendingSales)
    });
    
    console.log('Stored pending sale locally');
  } catch (error) {
    console.error('Error storing pending sale:', error);
    throw error;
  }
};

/**
 * Retrieves all pending sales
 */
export const getPendingSales = async (): Promise<Order[]> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.PENDING_SALES });
    if (!value) return [];
    return JSON.parse(value);
  } catch (error) {
    console.error('Error retrieving pending sales:', error);
    return [];
  }
};

/**
 * Clears all pending sales after successful sync
 */
export const clearPendingSales = async (): Promise<void> => {
  try {
    await Storage.remove({ key: STORAGE_KEYS.PENDING_SALES });
    console.log('Cleared pending sales');
  } catch (error) {
    console.error('Error clearing pending sales:', error);
  }
};

/**
 * Stores user session locally
 */
export const storeUserSession = async (session: any): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.USER_SESSION,
      value: JSON.stringify(session)
    });
    console.log('User session stored locally');
  } catch (error) {
    console.error('Error storing user session:', error);
  }
};

/**
 * Retrieves locally stored user session
 */
export const getLocalUserSession = async (): Promise<any | null> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.USER_SESSION });
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    console.error('Error retrieving local user session:', error);
    return null;
  }
};

/**
 * Updates last sync timestamp
 */
export const updateLastSyncTimestamp = async (): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.LAST_SYNC,
      value: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating last sync timestamp:', error);
  }
};

/**
 * Gets last sync timestamp
 */
export const getLastSyncTimestamp = async (): Promise<string | null> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.LAST_SYNC });
    return value;
  } catch (error) {
    console.error('Error getting last sync timestamp:', error);
    return null;
  }
};

/**
 * Syncs pending sales to the server
 */
export const syncPendingSales = async (): Promise<number> => {
  try {
    // Get the session from local storage
    const localSession = await getLocalUserSession();
    if (!localSession) {
      throw new Error('No local session found');
    }
    
    // Get pending sales
    const pendingSales = await getPendingSales();
    if (pendingSales.length === 0) return 0;
    
    let successCount = 0;
    
    // Process each pending sale
    for (const sale of pendingSales) {
      try {
        // Add user_id from the stored session
        const saleWithUserId = {
          ...sale,
          user_id: localSession.user.id,
          date: sale.date || new Date().toISOString()
        };
        
        // Send to server
        const { error } = await supabase
          .from('sales')
          .insert([saleWithUserId]);
          
        if (error) {
          console.error('Error syncing sale:', error);
        } else {
          successCount++;
        }
      } catch (saleError) {
        console.error('Error processing individual sale:', saleError);
      }
    }
    
    // If we synced any sales successfully, clear the pending list
    if (successCount > 0) {
      await clearPendingSales();
    }
    
    return successCount;
  } catch (error) {
    console.error('Error syncing pending sales:', error);
    throw error;
  }
};

/**
 * Fetch and sync all data
 */
export const performFullSync = async (): Promise<{ 
  success: boolean;
  syncedSales?: number;
  customersCount?: number;
  productsCount?: number; 
  error?: string;
}> => {
  try {
    // First try to sync any pending offline sales
    const syncedSales = await syncPendingSales();
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { 
        success: false, 
        error: "Niste prijavljeni",
        syncedSales 
      };
    }

    // Store session locally
    await storeUserSession(session);
    
    // User email determines which tables to fetch from
    const userEmail = session.user.email;

    // Fetch customers
    let customersData = [];
    if (userEmail === 'zirmd.darko@gmail.com') {
      const { data } = await supabase
        .from('kupci_darko')
        .select('*')
        .eq('user_id', session.user.id);
      customersData = data || [];
    } else {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id);
      customersData = data || [];
    }
    
    // Fetch products
    const { data: productsData } = await supabase
      .from('products_darko')
      .select('*')
      .not('Naziv', 'eq', '');
    
    // Store data locally
    await storeCustomersLocally(customersData);
    await storeProductsLocally(productsData || []);
    
    // Update last sync timestamp
    await updateLastSyncTimestamp();
    
    return { 
      success: true, 
      syncedSales,
      customersCount: customersData?.length || 0,
      productsCount: productsData?.length || 0
    };
  } catch (error) {
    console.error('Sync error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Nepoznata greška" 
    };
  }
};

// Check if we have internet connection
export const checkOnlineStatus = async (): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  
  // Fallback: Try to fetch a small resource from Supabase
  try {
    const response = await fetch('https://olkyepnvfwchgkmxyqku.supabase.co/ping');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
