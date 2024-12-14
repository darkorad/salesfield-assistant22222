import { createClient } from '@supabase/supabase-js';

// Direct initialization with Supabase project values
export const supabase = createClient(
  'https://YOUR_PROJECT_URL.supabase.co',  // Replace this with your actual Supabase project URL
  'YOUR_ANON_KEY'  // Replace this with your actual Supabase anon key
);