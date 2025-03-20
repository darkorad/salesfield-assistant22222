
import { useState, useEffect, useCallback } from 'react'
import { supabase, checkSupabaseConnectivity } from '@/integrations/supabase/client'

export type AuthStatus = {
  isLoading: boolean
  isAuthenticated: boolean
  connectionError: boolean
  permissionError: boolean
  refresh: () => Promise<void>
}

export const useAuthStatus = () => {
  const [status, setStatus] = useState<AuthStatus>({
    isLoading: true,
    isAuthenticated: false,
    connectionError: false,
    permissionError: false,
    refresh: async () => {}
  })

  const checkAuth = useCallback(async () => {
    try {
      // First check connectivity
      const connectivity = await checkSupabaseConnectivity()
      console.log("Connectivity check result:", connectivity)
      
      if (!connectivity.connected) {
        console.error('Connectivity check failed:', connectivity.error)
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          connectionError: true,
          permissionError: false
        }))
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
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        connectionError: true,
        permissionError: false
      }))
    }
  }, [])

  // Create the refresh function that can be called from components
  const refresh = useCallback(async () => {
    console.log("Refreshing auth status...")
    setStatus(prev => ({ ...prev, isLoading: true }))
    await checkAuth()
    console.log("Auth status refreshed")
  }, [checkAuth])

  useEffect(() => {
    // Add a fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (status.isLoading) {
        console.log("Auth fallback timeout triggered");
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    }, 10000); // 10 seconds fallback
    
    // Initial auth check
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

    // Update the refresh function in the status
    setStatus(prev => ({ ...prev, refresh }))

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallbackTimeout);
    }
  }, [checkAuth, refresh])

  return status
}
