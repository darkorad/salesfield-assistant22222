
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './App.css'
import { Toaster } from './components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import Login from './pages/Login'
import Sales from './pages/Sales'
import Prodaja2 from './pages/Prodaja2'
import { Layout } from './components/Layout'
import Settings from './pages/Settings'
import DailyOrders from './pages/DailyOrders'
import VisitPlans from './pages/VisitPlans'
import Documents from './pages/Documents'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { supabase, checkSupabaseConnection, isBrowserOnline, tryAllConnectionMethods } from '@/integrations/supabase/client'

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), // exponential backoff with max 30s
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [connectionAttempt, setConnectionAttempt] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let mounted = true;
    let checkRetryTimeout: NodeJS.Timeout | null = null;
    
    // Check if user is authenticated with enhanced connection handling
    const checkAuth = async () => {
      if (!mounted) return;
      
      try {
        // First check if browser reports we're online
        if (!isBrowserOnline()) {
          console.log("Browser reports device is offline");
          if (mounted) {
            setConnectionError(true);
            setIsLoading(false);
          }
          return;
        }
        
        // Try all connection methods to see if we can reach Supabase
        console.log(`Connection attempt ${connectionAttempt}, retry ${retryCount}`);
        const isConnected = await tryAllConnectionMethods();
        
        if (!isConnected) {
          console.warn("Cannot connect to Supabase");
          if (mounted) {
            setConnectionError(true);
            setIsLoading(false);
            
            // Schedule a retry if we haven't tried too many times
            if (retryCount < 5 && mounted) {
              const delay = Math.min(1000 * (retryCount + 1), 5000);
              console.log(`Scheduling retry in ${delay}ms`);
              
              checkRetryTimeout = setTimeout(() => {
                if (mounted) {
                  setRetryCount(prev => prev + 1);
                  setConnectionAttempt(prev => prev + 1);
                }
              }, delay);
            }
          }
          return;
        }
        
        // If we get here, we have a connection to Supabase
        if (mounted) {
          setConnectionError(false);
          setRetryCount(0); // Reset retry count
        }
        
        // Try to get the session
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth check error:', error);
            if (mounted) {
              setIsAuthenticated(false);
              setIsLoading(false);
            }
          } else if (mounted) {
            setIsAuthenticated(!!session);
            setIsLoading(false);
          }
        } catch (sessionError) {
          console.error('Session check error:', sessionError);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Unexpected error during auth check:', error);
        if (mounted) {
          setConnectionError(true);
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    // Subscribe to auth changes with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        if (mounted) {
          setIsAuthenticated(!!session);
          setIsLoading(false);
          
          // Reset connection error if we get a valid event
          if (event) {
            setConnectionError(false);
            setRetryCount(0);
          }
        }
      }
    );
    
    // Set up a network status listener
    const handleOnlineStatus = () => {
      if (navigator.onLine && mounted) {
        console.log("Browser reports online - triggering connection check");
        setConnectionAttempt(prev => prev + 1);
        setRetryCount(0); // Reset retry count when we go online
      } else if (mounted) {
        console.log("Browser reports offline");
        setConnectionError(true);
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Set up periodic check if we have connection error
    const periodicCheckId = setInterval(() => {
      if (connectionError && mounted) {
        console.log("Periodic connection check");
        setConnectionAttempt(prev => prev + 1);
      }
    }, 10000); // Check every 10s if we have connection error

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      clearInterval(periodicCheckId);
      if (checkRetryTimeout) clearTimeout(checkRetryTimeout);
    }
  }, [connectionAttempt, retryCount]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Učitavanje aplikacije...</p>
      </div>
    )
  }

  if (connectionError) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Problem sa konekcijom</p>
          <p>Nije moguće povezati se sa serverom. Molimo proverite internet konekciju i pokušajte ponovo.</p>
        </div>
        <button 
          onClick={() => {
            setConnectionAttempt(prev => prev + 1);
            setRetryCount(0); // Reset retry count on manual retry
          }} 
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Pokušaj ponovo
        </button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SonnerToaster richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          {isAuthenticated ? (
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/visit-plans" replace />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/prodaja2" element={<Prodaja2 />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/daily-orders" element={<DailyOrders />} />
              <Route path="/visit-plans" element={<VisitPlans />} />
              <Route path="*" element={<Navigate to="/visit-plans" replace />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
