
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SyncButton } from "./SyncButton";

export const NavActions = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
      return;
    }
    navigate("/login");
  };

  return (
    <div className="flex items-center gap-2">
      <SyncButton />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/visit-plans")}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:inline-block">
          Plan poseta
        </span>
      </Button>
      
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
