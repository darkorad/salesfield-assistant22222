import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  'https://YOUR_PROJECT_URL.supabase.co',  // Replace this with your actual Supabase project URL
  'YOUR_ANON_KEY'  // Replace this with your actual Supabase anon key
);