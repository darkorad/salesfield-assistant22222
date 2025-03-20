
import React from "react";
import ConnectionError from "@/components/auth/ConnectionError";
import ConnectionLoading from "@/components/auth/ConnectionLoading";
import LoginForm from "@/components/auth/LoginForm";
import { useConnectionState } from "@/hooks/useConnectionState";

const Login = () => {
  const {
    connectionChecking,
    isOffline,
    userTriedLogin,
    setUserTriedLogin,
    setIsOffline,
    handleRetryConnection
  } = useConnectionState();

  // Show connection error UI
  if (isOffline && !connectionChecking) {
    return <ConnectionError onRetry={handleRetryConnection} />;
  }

  // Show loading state while checking connection
  if (connectionChecking) {
    return <ConnectionLoading />;
  }

  // Show normal login form
  return (
    <LoginForm 
      setIsOffline={setIsOffline} 
      setUserTriedLogin={setUserTriedLogin} 
    />
  );
};

export default Login;
