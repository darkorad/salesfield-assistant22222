
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        
        // First check if Supabase is reachable
        const isConnected = await checkSupabaseConnection();
        
        if (!isConnected) {
          console.log("Cannot connect to Supabase, proceeding to login");
          toast.error("Problem sa konekcijom na server. Pokušajte ponovo za par minuta.");
          navigate("/login");
          return;
        }
        
        // Check authentication if connection is good
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          toast.error("Problem sa autentikacijom. Molimo prijavite se ponovo.");
          navigate("/login");
          return;
        }
        
        // Multiple checks to verify session
        if (data.session) {
          console.log("Found session, attempting to verify it");
          
          // Force a refresh to ensure session is valid
          await supabase.auth.refreshSession();
          
          // Recheck session
          const { data: refreshData } = await supabase.auth.getSession();
          
          if (refreshData.session) {
            console.log("User is authenticated, redirecting to visit plans");
            navigate("/visit-plans", { replace: true });
          } else {
            console.log("Session invalid after refresh, redirecting to login");
            navigate("/login");
          }
        } else {
          console.log("No session found, redirecting to login");
          navigate("/login");
        }
      } catch (error) {
        console.error("Unexpected error during auth check:", error);
        toast.error("Greška pri proveri sesije. Pokušajte ponovo za par minuta.");
        navigate("/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Učitavanje aplikacije...</p>
      </div>
    );
  }

  return null;
};

export default Index;
