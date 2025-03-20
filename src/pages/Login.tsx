
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
  const navigate = useNavigate();

  // Check for existing session and connectivity
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check connectivity to Supabase
        const connectivity = await checkSupabaseConnectivity();
        if (!connectivity.connected) {
          setConnectionError(connectivity.error || "Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.");
          return;
        }

        // If connected, check for session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/visit-plans", { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setConnectionError("Greška prilikom provere sesije. Molimo pokušajte ponovo kasnije.");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setConnectionError(null);

    try {
      // Check connectivity first
      const connectivity = await checkSupabaseConnectivity();
      if (!connectivity.connected) {
        setConnectionError(connectivity.error || "Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.session) {
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
      console.error(error);
      toast.error("Problem sa prijavom, pokušajte ponovo");
    } finally {
      setLoading(false);
    }
  };

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
              disabled={loading || syncing}
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
