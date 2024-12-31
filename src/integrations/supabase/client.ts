import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olkyepnvfwchgkmxyqku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa3llcG52ZndjaGdrbXh5cWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNjc1NzgsImV4cCI6MjAxOTY0MzU3OH0.XZWLzh1IXCUgPbE3tZtTrVKEqJ_1WgVGWHIE5KMXK5M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});