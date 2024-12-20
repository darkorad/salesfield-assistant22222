import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { DataSync } from "@/components/auth/DataSync";
import { useDataSync } from "@/hooks/useDataSync";

const Login = () => {
  const navigate = useNavigate();
  const { syncData, isSyncing, syncProgress } = useDataSync(() => navigate("/sales"));

  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await syncData(session);
      }
    });

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/sales");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();

    return () => {
      subscription.data?.subscription?.unsubscribe();
    };
  }, [navigate, syncData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            ŽIR-MD COMPANY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataSync isSyncing={isSyncing} progress={syncProgress} />
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;