import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthManager() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSessionError = async (error: any, context: string) => {
    console.error(`${context}:`, error);
    setIsAuthenticated(false);
    await supabase.auth.signOut();
  };

  const refreshSession = async () => {
    try {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        await handleSessionError(refreshError, "Session refresh failed");
        return false;
      }
      return !!refreshData.session;
    } catch (error) {
      await handleSessionError(error, "Session refresh error");
      return false;
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        await handleSessionError(error, "Auth error");
        return;
      }

      if (!session) {
        setIsAuthenticated(false);
        return;
      }

      const hasValidSession = await refreshSession();
      setIsAuthenticated(hasValidSession);
    } catch (error) {
      await handleSessionError(error, "Session check error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.clear();
        window.location.href = '/login';
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
      } else if (!session) {
        setIsAuthenticated(false);
        await supabase.auth.signOut();
      }
    });

    const refreshInterval = setInterval(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session || error) {
        await handleSessionError(error || new Error("No session"), "Periodic session check failed");
        return;
      }

      await refreshSession();
    }, 1000 * 60 * 4); // Refresh every 4 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  return { isAuthenticated, isLoading };
}