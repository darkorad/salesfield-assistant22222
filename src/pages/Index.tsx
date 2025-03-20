import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase, checkSupabaseConnectivity } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingState } from "@/components/visit-plans/day-schedule/LoadingState";
import { useAuth } from "@/contexts/AuthContext";

interface ConnectivityResult {
  connected: boolean;
  error?: string;
  isPermissionError?: boolean;
  isAuthError?: boolean;
  isAuthenticated?: boolean;
  code?: string;
  session?: any;
}

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        console.log("Index page: Checking authentication... Attempt:", checkAttempts + 1);
        
        if (!navigator.onLine) {
          console.log("Browser reports device is offline");
          setConnectionError(true);
          setErrorDetails("Uređaj nije povezan na internet. Proverite mrežnu konekciju.");
          setNetworkStatus('offline');
          setIsChecking(false);
          return;
        }
        
        const connectivityCheckPromise = checkSupabaseConnectivity();
        const timeoutPromise = new Promise<ConnectivityResult>((_, reject) => 
          setTimeout(() => reject(new Error("Veza je istekla - server ne odgovara")), 10000)
        );
        
        const connectivity = await Promise.race([
          connectivityCheckPromise,
          timeoutPromise
        ]).catch(error => {
          console.error('Connection timeout:', error);
          return { 
            connected: false, 
            error: "Veza je istekla - server ne odgovara",
            isPermissionError: false 
          } as ConnectivityResult;
        });
        
        if (!connectivity.connected) {
          console.error('Connection error:', connectivity.error);
          setConnectionError(true);
          setErrorDetails(connectivity.error || "");
          setNetworkStatus('offline');
          setIsChecking(false);
          toast.error("Problem sa povezivanjem na server");
          
          if (checkAttempts >= 1) {
            console.log("Multiple connectivity failures, redirecting to login");
            navigate("/login", { replace: true });
          } else {
            setCheckAttempts(prev => prev + 1);
            setTimeout(() => {
              setIsChecking(true);
              checkAuth();
            }, 2000);
          }
          return;
        }

        setNetworkStatus('online');

        if (isAuthenticated) {
          console.log("Index page: User is authenticated, navigating to app");
          navigate("/visit-plans", { replace: true });
          return;
        }

        console.log("Index page: Checking session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Index page: Session found, navigating to app");
          navigate("/visit-plans", { replace: true });
        } else {
          console.log("Index page: No session found, navigating to login");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setConnectionError(true);
        setErrorDetails(error instanceof Error ? error.message : "Unknown error");
        toast.error("Problem sa proverom autentikacije");
        navigate("/login", { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    const handleOnline = () => {
      console.log("Device went online");
      setNetworkStatus('online');
      toast.success("Povezani ste na internet");
      checkAuth();
    };
    
    const handleOffline = () => {
      console.log("Device went offline");
      setNetworkStatus('offline');
      setConnectionError(true);
      setErrorDetails("Uređaj nije povezan na internet. Proverite mrežnu konekciju.");
      toast.error("Izgubljena internet konekcija");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const fallbackTimer = setTimeout(() => {
      if (isChecking) {
        console.log("Fallback timer triggered, navigating to login");
        setIsChecking(false);
        navigate("/login", { replace: true });
      }
    }, 12000);

    checkAuth();

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate, checkAttempts, isAuthenticated]);

  if (isChecking) {
    return <LoadingState message="Učitavanje aplikacije..." />;
  }

  if (connectionError) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-600 text-2xl font-bold mb-4">Greška povezivanja</div>
        <p className="text-center max-w-md mb-6">
          {errorDetails || "Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja."}
        </p>
        <div className="bg-gray-100 p-4 rounded-md max-w-md">
          <p className="font-semibold mb-2">Status mreže: {
            networkStatus === 'online' ? 'Online' : 
            networkStatus === 'offline' ? 'Offline' : 
            'Provera konekcije...'
          }</p>
          <p className="font-semibold mb-2">Potrebni DNS zapisi:</p>
          <div className="font-mono text-sm bg-white p-2 rounded border">
            olkyepnvfwchgkmxyqku.supabase.co → CNAME → olkyepnvfwchgkmxyqku.supabase.co
          </div>
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
