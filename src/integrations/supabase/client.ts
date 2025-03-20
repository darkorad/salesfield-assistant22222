
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olkyepnvfwchgkmxyqku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa3llcG52ZndjaGdrbXh5cWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMTY1MjgsImV4cCI6MjA0OTc5MjUyOH0.LQYekqo4mR-50cjm4BORpP8GdskX_m0W5YKlqkRO7_8'

// Initialize the Supabase client with retry logic and better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce',
    storageKey: 'zirmd-auth-token',
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey, // Explicitly set the API key in headers
    },
    fetch: async (url, options: RequestInit = {}) => {
      const timeout = 30000 // 30 seconds timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      try {
        // Get the current session token to include in headers
        const { data } = await supabase.auth.getSession()
        const sessionToken = data.session?.access_token
        
        // Create a new headers object by properly merging existing headers
        const headers = new Headers(options.headers || {})
        
        // Add required headers
        headers.set('apikey', supabaseAnonKey)
        
        // Only add Authorization header if we have a session token
        if (sessionToken) {
          headers.set('Authorization', `Bearer ${sessionToken}`)
        } else {
          headers.set('Authorization', `Bearer ${supabaseAnonKey}`)
        }
        
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        headers.set('Pragma', 'no-cache')

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
        // Log status and URL for debugging
        if (!response.ok) {
          console.error(`Supabase request failed: ${response.status} ${response.statusText} for ${url}`)
        }
        
        return response
      } catch (error) {
        clearTimeout(timeoutId)
        console.error('Supabase fetch error:', error)
        
        // For network errors, provide more helpful information
        if (error instanceof Error) {
          if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.error('Network error connecting to Supabase. This might be due to DNS configuration issues.')
            // Create a custom response to avoid breaking the app
            return new Response(JSON.stringify({
              error: {
                message: 'Network error connecting to Supabase. Please check your internet connection and DNS configuration.'
              }
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          
          if (error.name === 'AbortError') {
            console.error('Request timed out after 30 seconds')
            return new Response(JSON.stringify({
              error: {
                message: 'Request timed out after 30 seconds'
              }
            }), {
              status: 408,
              headers: { 'Content-Type': 'application/json' }
            })
          }
        }
        
        throw error
      }
    }
  }
})

// Export a function to check connectivity
export const checkSupabaseConnectivity = async () => {
  try {
    console.log('Checking Supabase connectivity...')
    
    // First verify the session is valid
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Supabase session check failed:', sessionError)
      return { connected: false, error: sessionError.message, isAuthError: true }
    }
    
    if (!session) {
      console.log('No active session found')
      return { connected: true, isAuthenticated: false }
    }
    
    console.log('Session valid, checking database access...')
    
    // Make a simple query that shouldn't require authentication
    const { data, error } = await supabase.from('customers').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connectivity check failed:', error)
      return { 
        connected: false, 
        error: error.message, 
        isPermissionError: error.message.includes('permission denied'),
        code: error.code
      }
    }
    
    console.log('Supabase connectivity check succeeded')
    return { connected: true, isAuthenticated: true }
  } catch (err) {
    console.error('Supabase connectivity check exception:', err)
    return { 
      connected: false, 
      error: err instanceof Error ? err.message : 'Unknown connection error'
    }
  }
}
