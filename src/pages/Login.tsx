
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, checkSupabaseConnection, isBrowserOnline } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { performFullSync, storeUserSession } from "@/utils/offlineStorage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionChecking, setConnectionChecking] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const navigate = useNavigate();

  // Check connection and existing session
  useEffect(() => {
    let mounted = true;
    
    const checkConnection = async () => {
      if (!mounted) return;
      
      setConnectionChecking(true);
      
      // First check if the browser is online at all
      if (!isBrowserOnline()) {
        console.log("Browser reports device is offline");
        if (mounted) {
          setIsOffline(true);
          setConnectionChecking(false);
        }
        return;
      }
      
      // Try to connect to Supabase
      try {
        const isConnected = await checkSupabaseConnection();
        if (mounted) {
          if (!isConnected) {
            console.log("Cannot connect to Supabase");
            setIsOffline(true);
          } else {
            console.log("Successfully connected to Supabase");
            setIsOffline(false);
            
            // Only check for existing session if we have a connection
            const { data: { session } } = await supabase.auth.getSession();
            if (session && mounted) {
              navigate("/visit-plans");
            }
          }
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        if (mounted) setIsOffline(true);
      } finally {
        if (mounted) setConnectionChecking(false);
      }
    };
    
    checkConnection();
    
    // Set up a network status listener
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        // If we're back online, re-check the connection
        setConnectionAttempt(prev => prev + 1);
      } else {
        setIsOffline(true);
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Cleanup
    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [navigate, connectionAttempt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't attempt login if we're offline
    if (isOffline) {
      toast.error("Nema internet konekcije. Pokušajte ponovo.");
      return;
    }
    
    setLoading(true);

    try {
      // Verify connection before attempting login
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast.error("Problem sa konekcijom na server. Pokušajte ponovo za par minuta.");
        setIsOffline(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        
        // Handle specific error messages in a user-friendly way
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Netačan email ili lozinka");
        } else if (error.message.includes("rate limited")) {
          toast.error("Previše pokušaja prijave. Pokušajte ponovo za par minuta.");
        } else {
          toast.error(`Greška: ${error.message}`);
        }
        return;
      }

      if (data?.session) {
        toast.success("Prijava uspešna");
        
        // Store the session for offline use
        await storeUserSession(data.session);

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

        // Navigate to the app
        navigate("/visit-plans");
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast.error("Problem sa prijavom, pokušajte ponovo");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = () => {
    setConnectionAttempt(prev => prev + 1);
  };

  // Show connection error UI
  if (isOffline && !connectionChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ŽIR-MD COMPANY
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Problem sa konekcijom
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Nije moguće povezati se sa serverom
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Molimo proverite internet konekciju i pokušajte ponovo.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleRetryConnection}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while checking connection
  if (connectionChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Provera konekcije...</p>
      </div>
    );
  }

  // Show normal login form
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
              disabled={loading || syncing || isOffline}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
        </form>
      </div>
    </div>
  );
};

export default Login;
