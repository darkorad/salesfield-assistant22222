import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olkyepnvfwchgkmxyqku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa3llcG52ZndjaGdrbXh5cWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ0ODg0MDAsImV4cCI6MjAyMDA2NDQwMH0.0e46DtTQoF5Qg7X_MNhXfRQF6eEqFDHPQEBi1_JRUV4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)