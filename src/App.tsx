
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
import { supabase, checkSupabaseConnectivity } from '@/integrations/supabase/client'
import Index from './pages/Index'

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (
          error instanceof Error && 
          'status' in error && 
          (error.status === 401 || error.status === 403)
        ) {
          return false
        }
        // Limit retries to 3
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Add shorter timeout to prevent infinite loading
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [permissionError, setPermissionError] = useState(false)

  useEffect(() => {
    // Add a fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("App fallback timeout triggered");
        setIsLoading(false);
      }
    }, 10000); // 10 seconds fallback
    
    // Check connectivity and authentication
    const checkAuth = async () => {
      try {
        // First check connectivity
        const connectivity = await checkSupabaseConnectivity()
        console.log("Connectivity check result:", connectivity)
        
        if (!connectivity.connected) {
          console.error('Connectivity check failed:', connectivity.error)
          setConnectionError(true)
          setIsLoading(false)
          return
        }
        
        if (connectivity.isPermissionError) {
          console.error('Permission error detected:', connectivity.error)
          setPermissionError(true)
        }
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error('Auth check error:', error)
        setConnectionError(true)
      } finally {
        setIsLoading(false)
        clearTimeout(fallbackTimeout); // Clear the fallback if completed normally
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          // When signed in, refresh the session to ensure it's properly stored
          supabase.auth.refreshSession().then(() => {
            setIsAuthenticated(true)
            // When the user signs in, check permissions again
            checkSupabaseConnectivity().then(connectivity => {
              setPermissionError(connectivity.isPermissionError || false)
            })
          })
        } else {
          setIsAuthenticated(!!session)
        }
        setIsLoading(false)
        clearTimeout(fallbackTimeout); // Clear the fallback if auth state changes
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallbackTimeout);
    }
  }, [])

  // Show a simpler loading state that won't get stuck
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Učitavanje aplikacije...</p>
      </div>
    )
  }

  if (connectionError) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-600 text-2xl font-bold mb-4">Greška povezivanja</div>
        <p className="text-center max-w-md mb-6">
          Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.
        </p>
        <div className="bg-gray-100 p-4 rounded-md max-w-md">
          <p className="font-semibold mb-2">Potrebni DNS zapisi:</p>
          <div className="font-mono text-sm bg-white p-2 rounded border">
            olkyepnvfwchgkmxyqku.supabase.co → CNAME → olkyepnvfwchgkmxyqku.supabase.co
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    )
  }

  if (permissionError && isAuthenticated) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-600 text-2xl font-bold mb-4">Greška pristupa</div>
        <div className="bg-gray-100 p-4 rounded-md max-w-md">
          <p className="text-center mb-4">
            Nemate odgovarajuće dozvole za pristup podacima. Molimo kontaktirajte administratora sistema.
          </p>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => supabase.auth.signOut().then(() => window.location.reload())} 
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Odjava
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Pokušaj ponovo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SonnerToaster richColors position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          {isAuthenticated ? (
            <Route element={<Layout />}>
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
