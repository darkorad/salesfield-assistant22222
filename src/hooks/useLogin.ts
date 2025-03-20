
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { performFullSync, storeUserSession } from "@/utils/offlineStorage";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting login...");
      
      // Check if we're online
      if (!navigator.onLine) {
        toast.error("Uređaj nije povezan na internet. Proverite mrežnu konekciju.");
        setLoading(false);
        return;
      }

      console.log("Signing in...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error", error);
        toast.error(error.message);
        return;
      }

      if (data?.session) {
        console.log("Sign in successful");
        toast.success("Prijava uspešna");
        
        // Store the session for offline use
        await storeUserSession(data.session);

        // Refresh the session to ensure it's properly stored
        await supabase.auth.refreshSession();

        // Start data sync
        setSyncing(true);
        toast.info("Sinhronizacija podataka sa ŽIR-MD servisom...");
        
        try {
          const syncResult = await performFullSync();
          if (syncResult.success) {
            toast.success("Podaci sinhronizovani");
          } else {
            toast.error(`Greška pri sinhronizaciji: ${syncResult.error}`);
          }
        } catch (syncError) {
          console.error("Sync error:", syncError);
          toast.error("Greška pri sinhronizaciji podataka");
        } finally {
          setSyncing(false);
        }

        // Navigate to the app using replace to prevent back navigation to login
        navigate("/visit-plans", { replace: true });
      }
    } catch (error) {
      console.error("Unexpected error", error);
      toast.error("Problem sa prijavom, pokušajte ponovo");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    syncing,
    handleSubmit
  };
};
