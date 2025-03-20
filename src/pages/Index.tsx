
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase, checkSupabaseConnectivity } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingState } from "@/components/visit-plans/day-schedule/LoadingState";

// Define the type for connectivity check result
interface ConnectivityResult {
  connected: boolean;
  error?: string;
  isPermissionError?: boolean;
  isAuthError?: boolean;
  isAuthenticated?: boolean;
  code?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        console.log("Index page: Checking authentication... Attempt:", checkAttempts + 1);
        
        // First check connectivity with a timeout
        const connectivityCheckPromise = checkSupabaseConnectivity();
        const timeoutPromise = new Promise<ConnectivityResult>((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout")), 5000)
        );
        
        // Use direct connection without Cloudflare proxy
        const connectivity = await Promise.race([
          connectivityCheckPromise,
          timeoutPromise
        ]).catch(error => {
          console.error('Connection timeout:', error);
          return { connected: false, error: "Connection timeout" } as ConnectivityResult;
        });
        
        if (!connectivity.connected) {
          console.error('Connection error:', connectivity.error);
          setConnectionError(true);
          setErrorDetails(connectivity.error || "");
          setIsChecking(false);
          toast.error("Problem sa povezivanjem na server");
          
          // If we have connectivity problems, redirect to login after multiple attempts
          if (checkAttempts >= 1) {
            console.log("Multiple connectivity failures, redirecting to login");
            navigate("/login", { replace: true });
          } else {
            // Increment attempts for next try
            setCheckAttempts(prev => prev + 1);
            // Try again after a short delay
            setTimeout(() => {
              setIsChecking(true);
              checkAuth();
            }, 2000);
          }
          return;
        }

        // Check session
        console.log("Index page: Checking session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Index page: Session found, navigating to app");
          // Navigate directly without refresh attempt to avoid potential hangs
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
        // After error, direct to login
        navigate("/login", { replace: true });
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
    }, 6000); // 6 seconds fallback

    checkAuth();

    return () => clearTimeout(fallbackTimer);
  }, [navigate, checkAttempts]);

  if (isChecking) {
    return <LoadingState message="Učitavanje aplikacije..." />;
  }

  if (connectionError) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-600 text-2xl font-bold mb-4">Greška povezivanja</div>
        <p className="text-center max-w-md mb-6">
          Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.
        </p>
        <div className="bg-gray-100 p-4 rounded-md max-w-md">
          <p className="font-semibold mb-2">Potrebni DNS zapisi bez Cloudflare-a:</p>
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
