
import { supabase, checkSupabaseConnection, tryAllConnectionMethods } from "@/integrations/supabase/client";

/**
 * Checks if the browser reports as being online
 */
export const isBrowserOnline = (): boolean => {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // Default to true if we can't check
};

/**
 * Attempts to verify connection to Supabase using all available methods
 */
export const verifyConnection = async (): Promise<boolean> => {
  // First check if browser reports we're online
  if (!isBrowserOnline()) {
    console.log("Browser reports device is offline");
    return false;
  }
  
  // Try all connection methods to see if we can reach Supabase
  try {
    console.log("Attempting connection to Supabase...");
    const isConnected = await tryAllConnectionMethods();
    
    if (!isConnected) {
      console.warn("Cannot connect to Supabase after trying all methods");
      return false;
    }
    
    console.log("Successfully connected to Supabase");
    return true;
  } catch (error) {
    console.error("Error checking connection:", error);
    return false;
  }
};

/**
 * Attempts to get the current user session
 */
export const getCurrentSession = async (): Promise<{
  session: any;
  error: any;
}> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (error) {
    console.error("Error getting session:", error);
    return { session: null, error };
  }
};
