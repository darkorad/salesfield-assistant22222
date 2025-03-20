
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
import { supabase } from '@/integrations/supabase/client'

// Create a client
const queryClient = new QueryClient()

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
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
