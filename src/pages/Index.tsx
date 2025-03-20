
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase, checkSupabaseConnectivity } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        console.log("Index page: Checking authentication...");
        
        // First check connectivity with a timeout
        const connectivityCheckPromise = checkSupabaseConnectivity();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout")), 10000)
        );
        
        const connectivity = await Promise.race([
          connectivityCheckPromise,
          timeoutPromise
        ]).catch(error => {
          console.error('Connection timeout:', error);
          return { connected: false, error: "Connection timeout" };
        });
        
        if (!connectivity.connected) {
          console.error('Connection error:', connectivity.error);
          setConnectionError(true);
          setErrorDetails(connectivity.error || "");
          setIsChecking(false);
          toast.error("Problem sa povezivanjem na server");
          return;
        }

        // Check session and refresh if available
        console.log("Index page: Checking session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Index page: Session found, refreshing...");
          // Try to refresh the session to ensure it's valid
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            console.error("Session refresh failed:", refreshError);
            toast.error("Sesija je istekla, molimo prijavite se ponovo");
            navigate("/login", { replace: true });
            return;
          }
          
          // Successfully refreshed session, navigate to app
          console.log("Index page: Session refreshed, navigating to app");
          navigate("/visit-plans", { replace: true });
        } else {
          // No session found
          console.log("Index page: No session found, navigating to login");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setConnectionError(true);
        setErrorDetails(error instanceof Error ? error.message : "Unknown error");
        toast.error("Problem sa proverom autentikacije");
      } finally {
        setIsChecking(false);
      }
    };

    // Add a fallback timer in case something gets stuck
    const fallbackTimer = setTimeout(() => {
      if (isChecking) {
        console.log("Fallback timer triggered, navigating to login");
        setIsChecking(false);
        navigate("/login", { replace: true });
      }
    }, 15000); // 15 seconds fallback

    checkAuth();

    return () => clearTimeout(fallbackTimer);
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Učitavanje aplikacije...</p>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-600 text-2xl font-bold mb-4">Greška povezivanja</div>
        <p className="text-center max-w-md mb-6">
          Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.
        </p>
        <div className="bg-gray-100 p-4 rounded-md max-w-md">
          <p className="font-semibold mb-2">Potrebni DNS zapisi:</p>
          <div className="font-mono text-sm bg-white p-2 rounded border">
            olkyepnvfwchgkmxyqku.supabase.co → CNAME → olkyepnvfwchgkmxyqku.supabase.co
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Detalji greške: {errorDetails}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
