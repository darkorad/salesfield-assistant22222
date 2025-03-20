
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SyncButton } from "./SyncButton";
import { useState } from "react";

export const NavActions = () => {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      // First, check if we actually have a session to sign out from
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // No active session, just redirect to login
        toast.info("Nema aktivne sesije");
        navigate("/login");
        return;
      }
      
      // Try to sign out with scope: 'local' (more reliable than 'global')
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error("Signout error:", error);
        // Even if there's an error, attempt to clear local storage and redirect
        if (error.message.includes("session_not_found") || error.message.includes("No API key found")) {
          toast.info("Sesija je istekla");
        } else {
          toast.error(`Greška pri odjavljivanju: ${error.message}`);
        }
      } else {
        toast.success("Uspešno ste se odjavili");
      }
      
      // Force clear auth-related data from localStorage
      try {
        localStorage.removeItem('zirmd-auth-token');
        localStorage.removeItem('supabase.auth.token');
        // Clear any other auth-related storage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('auth'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (storageError) {
        console.error("Error clearing storage:", storageError);
      }
      
      // Always redirect to login regardless of errors
      navigate("/login");
    } catch (unexpectedError) {
      console.error("Unexpected error during signout:", unexpectedError);
      toast.error("Neočekivana greška pri odjavljivanju");
      navigate("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/visit-plans")}
        className="gap-2 mr-2"
      >
        <Calendar className="h-4 w-4" />
        <span className="not-sr-only inline-block font-medium">
          Plan poseta
        </span>
      </Button>
      
      <SyncButton />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/settings")}
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:inline-block">
          Podešavanja
        </span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:inline-block">
          {isSigningOut ? "Odjavljivanje..." : "Odjavi se"}
        </span>
      </Button>
    </div>
  );
};
