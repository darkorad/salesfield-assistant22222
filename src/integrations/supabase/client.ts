
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olkyepnvfwchgkmxyqku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa3llcG52ZndjaGdrbXh5cWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMTY1MjgsImV4cCI6MjA0OTc5MjUyOH0.LQYekqo4mR-50cjm4BORpP8GdskX_m0W5YKlqkRO7_8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce',
    // Improved security settings
    storageKey: 'zirmd-auth-token',
    // Note: autoRefreshTime is not a valid property in the current API
    // Using the standard configuration for token refresh
  },
  global: {
    // Add request timeout to prevent hanging requests
    fetch: (url, options) => {
      const timeout = 30000 // 30 seconds timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))
    }
  }
})
