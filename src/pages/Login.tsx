
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, checkSupabaseConnectivity } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { performFullSync, storeUserSession } from "@/utils/offlineStorage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const navigate = useNavigate();

  // Check for connectivity and existing session
  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingConnection(true);
      setNetworkStatus('checking');
      
      try {
        console.log("Login page: Checking Supabase connectivity...");
        
        // First check if we're online at all
        if (!navigator.onLine) {
          console.log("Browser reports device is offline");
          setConnectionError("Uređaj nije povezan na internet. Proverite mrežnu konekciju.");
          setNetworkStatus('offline');
          setIsCheckingConnection(false);
          return;
        }
        
        // First check connectivity to Supabase
        const connectivity = await checkSupabaseConnectivity();
        if (!connectivity.connected) {
          console.log("Login page: Connection failed", connectivity.error);
          setConnectionError(connectivity.error || "Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.");
          setNetworkStatus('offline');
          setIsCheckingConnection(false);
          return;
        }

        setNetworkStatus('online');
        
        // If connected, check for session
        console.log("Login page: Connection successful, checking session...");
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Login page: Session found, redirecting...");
          navigate("/visit-plans", { replace: true });
        }
      } catch (error) {
        console.error("Login page: Error checking connection:", error);
        setConnectionError("Greška prilikom provere sesije. Molimo pokušajte ponovo kasnije.");
        setNetworkStatus('offline');
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    checkConnection();
    
    // Add event listeners for online/offline events
    const handleOnline = () => {
      console.log("Device went online");
      setNetworkStatus('online');
      toast.success("Povezani ste na internet");
      checkConnection();
    };
    
    const handleOffline = () => {
      console.log("Device went offline");
      setNetworkStatus('offline');
      setConnectionError("Uređaj nije povezan na internet. Proverite mrežnu konekciju.");
      toast.error("Izgubljena internet konekcija");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setConnectionError(null);

    try {
      console.log("Login page: Attempting login...");
      
      // Check if we're online
      if (!navigator.onLine) {
        setConnectionError("Uređaj nije povezan na internet. Proverite mrežnu konekciju.");
        setLoading(false);
        return;
      }
      
      // Check connectivity first
      const connectivity = await checkSupabaseConnectivity();
      if (!connectivity.connected) {
        console.log("Login page: Connection failed during login", connectivity.error);
        setConnectionError(connectivity.error || "Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.");
        setLoading(false);
        return;
      }

      console.log("Login page: Connection successful, signing in...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login page: Sign in error", error);
        toast.error(error.message);
        return;
      }

      if (data?.session) {
        console.log("Login page: Sign in successful");
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
      console.error("Login page: Unexpected error", error);
      toast.error("Problem sa prijavom, pokušajte ponovo");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingConnection) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ŽIR-MD COMPANY
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Prijava na sistem za komercijaliste
          </p>
          
          {/* Display connection error if any */}
          {connectionError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                <strong>Greška povezivanja:</strong> {connectionError}
              </p>
              <p className="text-xs text-red-500 mt-1">
                Potrebno je da imate pravilno podešene DNS zapise i pristup internetu.
              </p>
              <div className="mt-2 p-2 bg-white rounded text-xs font-mono border border-red-100">
                olkyepnvfwchgkmxyqku.supabase.co → CNAME → olkyepnvfwchgkmxyqku.supabase.co
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 w-full py-1 bg-red-100 text-red-700 text-xs rounded-md hover:bg-red-200"
              >
                Pokušaj ponovo
              </button>
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email adresa
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email adresa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Lozinka
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Lozinka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || syncing || networkStatus === 'offline'}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                networkStatus === 'offline' ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading || syncing ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : null}
              {loading ? "Prijavljivanje..." : syncing ? "Sinhronizacija..." : "Prijavi se"}
            </button>
          </div>
          
          {/* Network status info */}
          <div className="mt-2 text-center">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              networkStatus === 'online' ? 'bg-green-100 text-green-800' : 
              networkStatus === 'offline' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {networkStatus === 'online' ? '✓ Online' : 
               networkStatus === 'offline' ? '✗ Offline' : 
               '⟳ Provera konekcije...'}
            </span>
          </div>
          
          {/* DNS troubleshooting info */}
          <div className="mt-4 text-xs text-gray-500">
            <p className="font-semibold mb-1">Ako imate problem sa povezivanjem:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Proverite da li imate internet konekciju</li>
              <li>Uverite se da su DNS podešavanja ispravna</li>
              <li>Dodajte sledeće DNS zapise u vaš DNS sistem:</li>
            </ol>
            <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs">
              <p>olkyepnvfwchgkmxyqku.supabase.co → CNAME → olkyepnvfwchgkmxyqku.supabase.co</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
