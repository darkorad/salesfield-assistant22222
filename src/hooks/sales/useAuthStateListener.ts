
import { useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

interface UseAuthStateListenerProps {
  navigate: NavigateFunction;
  onSignIn: () => void;
}

export const useAuthStateListener = ({ navigate, onSignIn }: UseAuthStateListenerProps) => {
  const setupAuthListener = useCallback(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        navigate("/login");
      } else if (event === 'SIGNED_IN') {
        onSignIn();
      }
    });

    return subscription;
  }, [navigate, onSignIn]);

  return { setupAuthListener };
};
