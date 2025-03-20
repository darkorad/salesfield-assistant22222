
import { useState, useEffect } from 'react'
import { supabase, checkSupabaseConnectivity } from '@/integrations/supabase/client'

export type AuthStatus = {
  isLoading: boolean
  isAuthenticated: boolean
  connectionError: boolean
  permissionError: boolean
}

export const useAuthStatus = () => {
  const [status, setStatus] = useState<AuthStatus>({
    isLoading: true,
    isAuthenticated: false,
    connectionError: false,
    permissionError: false
  })

  useEffect(() => {
    // Add a fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (status.isLoading) {
        console.log("Auth fallback timeout triggered");
        setStatus(prev => ({ ...prev, isLoading: false }));
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
          setStatus({
            isLoading: false,
            isAuthenticated: false,
            connectionError: true,
            permissionError: false
          })
          return
        }
        
        if (connectivity.isPermissionError) {
          console.error('Permission error detected:', connectivity.error)
          setStatus(prev => ({ ...prev, permissionError: true }))
        }
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        setStatus(prev => ({
          ...prev,
          isAuthenticated: !!session,
          isLoading: false
        }))
      } catch (error) {
        console.error('Auth check error:', error)
        setStatus({
          isLoading: false,
          isAuthenticated: false,
          connectionError: true,
          permissionError: false
        })
      } finally {
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
            setStatus(prev => ({ ...prev, isAuthenticated: true }))
            // When the user signs in, check permissions again
            checkSupabaseConnectivity().then(connectivity => {
              setStatus(prev => ({ ...prev, permissionError: connectivity.isPermissionError || false }))
            })
          })
        } else {
          setStatus(prev => ({ ...prev, isAuthenticated: !!session }))
        }
        setStatus(prev => ({ ...prev, isLoading: false }))
        clearTimeout(fallbackTimeout); // Clear the fallback if auth state changes
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallbackTimeout);
    }
  }, [])

  return status
}
