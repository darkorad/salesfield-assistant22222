
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Calendar, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SyncButton } from "./SyncButton";
import { useAuth } from "@/contexts/AuthContext";

export const NavActions = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
      return;
    }
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/sales")}
        className="gap-2 mr-2"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="not-sr-only inline-block font-medium">
          Prodaja
        </span>
      </Button>
      
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
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:inline-block">Odjavi se</span>
      </Button>
    </div>
  );
};
