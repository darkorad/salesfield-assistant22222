
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase, checkSupabaseConnectivity } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        
        // First check connectivity
        const connectivity = await checkSupabaseConnectivity();
        if (!connectivity.connected) {
          console.error('Connection error:', connectivity.error);
          toast.error("Problem sa povezivanjem na server");
          navigate("/login", { replace: true });
          return;
        }

        // Check session and refresh if available
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Try to refresh the session to ensure it's valid
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            console.error("Session refresh failed:", refreshError);
            toast.error("Sesija je istekla, molimo prijavite se ponovo");
            navigate("/login", { replace: true });
            return;
          }
          
          // Successfully refreshed session, navigate to app
          navigate("/visit-plans", { replace: true });
        } else {
          // No session found
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Problem sa proverom autentikacije");
        navigate("/login", { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return null;
};

export default Index;
