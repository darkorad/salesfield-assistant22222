
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { verifyConnection, getCurrentSession, isBrowserOnline } from "@/utils/connectionUtils";

export const useConnectionState = () => {
  const [connectionChecking, setConnectionChecking] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [userTriedLogin, setUserTriedLogin] = useState(false);
  const navigate = useNavigate();

  const handleRetryConnection = useCallback(() => {
    setConnectionAttempt(prev => prev + 1);
    // Reset user tried login flag to avoid showing specific errors until they try again
    setUserTriedLogin(false);
  }, []);

  // Set up enhanced network status listeners
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
      
      // Try enhanced connection methods
      const isConnected = await verifyConnection();
      
      if (mounted) {
        if (!isConnected) {
          console.warn("Cannot connect to Supabase after trying all methods");
          setIsOffline(true);
          
          // If user has tried to login, show a more specific error
          if (userTriedLogin) {
            // We handle this in the UI
          }
        } else {
          console.log("Successfully connected to Supabase");
          setIsOffline(false);
          
          // Only check for existing session if we have a connection
          try {
            const { session, error } = await getCurrentSession();
            if (session && mounted) {
              navigate("/visit-plans");
            }
          } catch (sessionError) {
            console.error("Error checking session:", sessionError);
            // Don't set offline here, as we did successfully connect to Supabase
          }
        }
      }
      
      if (mounted) {
        setConnectionChecking(false);
      }
    };
    
    // Perform the connection check
    checkConnection();
    
    // Set up enhanced network status listeners
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        // If we're back online, re-check the connection
        console.log("Browser reports back online, rechecking connection");
        setConnectionAttempt(prev => prev + 1);
      } else {
        console.log("Browser reports offline");
        setIsOffline(true);
      }
    };
    
    // Add more aggressive connection checking for network changes
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Check connection again after a delay
    const intervalId = setInterval(() => {
      if (isOffline && mounted) {
        console.log("Periodic connection check");
        setConnectionAttempt(prev => prev + 1);
      }
    }, 5000); // Check every 5 seconds if we're offline
    
    // Cleanup
    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      clearInterval(intervalId);
    };
  }, [navigate, connectionAttempt, userTriedLogin]);

  return {
    connectionChecking,
    isOffline,
    userTriedLogin,
    setUserTriedLogin,
    setIsOffline,
    handleRetryConnection
  };
};
