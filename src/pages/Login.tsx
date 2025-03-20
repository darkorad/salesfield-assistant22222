
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useLogin } from "@/hooks/useLogin";
import { ConnectionErrorMessage } from "@/components/login/ConnectionErrorMessage";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    networkStatus, 
    connectionError, 
    isCheckingConnection, 
    checkConnection 
  } = useConnectionStatus();
  
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    syncing,
    handleSubmit
  } = useLogin();

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // If already authenticated via context, redirect
        if (isAuthenticated) {
          console.log("Login page: Already authenticated, redirecting...");
          navigate("/visit-plans", { replace: true });
          return;
        }
        
        if (networkStatus === 'online') {
          console.log("Login page: Connection successful, checking session...");
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log("Login page: Session found, redirecting...");
            navigate("/visit-plans", { replace: true });
          }
        }
      } catch (error) {
        console.error("Login page: Error checking session:", error);
      }
    };
    
    if (!isCheckingConnection && networkStatus === 'online') {
      checkSession();
    }
  }, [navigate, networkStatus, isCheckingConnection, isAuthenticated]);

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
          <ConnectionErrorMessage 
            error={connectionError} 
            onRetry={() => {
              window.location.reload();
              checkConnection();
            }} 
          />
        </div>
        
        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          handleSubmit={handleSubmit}
          loading={loading}
          syncing={syncing}
          networkStatus={networkStatus}
        />
      </div>
    </div>
  );
};

export default Login;
