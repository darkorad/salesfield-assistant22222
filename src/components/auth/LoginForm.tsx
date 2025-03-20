
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { performFullSync, storeUserSession } from "@/utils/offlineStorage";
import { verifyConnection, verifyAuthToken } from "@/utils/connectionUtils";

interface LoginFormProps {
  setIsOffline: (isOffline: boolean) => void;
  setUserTriedLogin: (tried: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ setIsOffline, setUserTriedLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("Found existing session, redirecting to visit-plans");
        navigate("/visit-plans", { replace: true });
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set that user tried to login (for better error messages)
    setUserTriedLogin(true);
    
    setLoading(true);

    try {
      // Enhanced verification before attempting login
      console.log("Verifying connection before login attempt");
      const isConnected = await verifyConnection();
      
      if (!isConnected) {
        toast.error("Problem sa konekcijom na server. Pokušajte ponovo za par minuta.");
        setIsOffline(true);
        setLoading(false);
        return;
      }

      console.log("Connection verified, attempting login");
      
      // Make login attempt
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Process login result
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
        setLoading(false);
        return;
      }
      
      if (data?.session) {
        toast.success("Prijava uspešna");
        
        // Store the session for offline use
        await storeUserSession(data.session);
        
        // Multiple forced refresh to ensure token is fresh and properly stored
        try {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Failed to refresh session after login:", refreshError);
          }
          
          // First verification attempt
          const isValid = await verifyAuthToken();
          if (!isValid) {
            console.log("First auth verification failed, trying again after short delay");
            await new Promise(resolve => setTimeout(resolve, 500));
            await supabase.auth.refreshSession();
          }
        } catch (authError) {
          console.error("Auth verification error:", authError);
        }

        // Start data sync regardless of verification outcome
        toast.info("Sinhronizacija podataka sa ŽIR-MD servisom...");
        setSyncing(true);
        
        try {
          const syncResult = await performFullSync();
          if (syncResult.success) {
            toast.success("Podaci sinhronizovani");
          } else {
            toast.warning(`Delomična sinhronizacija: ${syncResult.error || "Neki podaci nisu preuzeti"}`);
          }
        } catch (syncError) {
          console.error("Sync error:", syncError);
          toast.warning("Delomična sinhronizacija podataka");
        } finally {
          setSyncing(false);
        }

        // Navigate to the app - ensure this happens regardless of sync
        console.log("Login successful, navigating to visit-plans");
        // Use replace:true to prevent going back to login screen
        navigate("/visit-plans", { replace: true });
        return;
      } else {
        toast.error("Neuspešna prijava. Pokušajte ponovo.");
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
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
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
