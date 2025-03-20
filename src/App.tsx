
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
import { supabase, checkSupabaseConnection, isBrowserOnline } from '@/integrations/supabase/client'

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
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

  useEffect(() => {
    let mounted = true;
    
    // Check if user is authenticated
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
        
        // Check if we can connect to Supabase
        const isConnected = await checkSupabaseConnection();
        
        if (!isConnected) {
          console.log("Cannot connect to Supabase");
          if (mounted) {
            setConnectionError(true);
            setIsLoading(false);
          }
          return;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth check error:', error)
          if (mounted) setConnectionError(true);
        } else if (mounted) {
          setIsAuthenticated(!!session)
          setConnectionError(false);
        }
      } catch (error) {
        console.error('Unexpected error during auth check:', error)
        if (mounted) setConnectionError(true);
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        if (mounted) {
          setIsAuthenticated(!!session)
          setIsLoading(false)
          
          // Reset connection error if we get a valid event
          if (event) {
            setConnectionError(false);
          }
        }
      }
    )
    
    // Set up a network status listener
    const handleOnlineStatus = () => {
      if (navigator.onLine && mounted) {
        setConnectionAttempt(prev => prev + 1);
      } else if (mounted) {
        setConnectionError(true);
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    }
  }, [connectionAttempt])

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
          onClick={() => setConnectionAttempt(prev => prev + 1)} 
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
