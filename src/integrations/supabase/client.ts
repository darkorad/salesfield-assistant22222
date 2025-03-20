
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olkyepnvfwchgkmxyqku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa3llcG52ZndjaGdrbXh5cWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMTY1MjgsImV4cCI6MjA0OTc5MjUyOH0.LQYekqo4mR-50cjm4BORpP8GdskX_m0W5YKlqkRO7_8'

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce',
    storageKey: 'zirmd-auth-token',
  }
})

// Export a function to check connectivity
export const checkSupabaseConnectivity = async () => {
  try {
    console.log('Checking Supabase connectivity...')
    
    // First try a simple ping to see if we can reach the Supabase instance
    try {
      const pingResponse = await fetch(`${supabaseUrl}/ping`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Short timeout for ping
        signal: AbortSignal.timeout(5000)
      })
      
      if (!pingResponse.ok) {
        console.error('Supabase ping failed:', pingResponse.status)
        return { 
          connected: false, 
          error: 'Server nije dostupan. Proverite internet konekciju i DNS podešavanja.' 
        }
      }
    } catch (pingError) {
      console.error('Ping error:', pingError)
      return { 
        connected: false, 
        error: 'Server nije dostupan. Proverite internet konekciju i DNS podešavanja.' 
      }
    }
    
    // Verify the session is valid
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
      error: err instanceof Error ? err.message : 'Nepoznata greška pri povezivanju'
    }
  }
}
