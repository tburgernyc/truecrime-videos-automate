import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client with graceful fallback
let supabase: SupabaseClient | null = null;
let supabaseEnabled = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    supabaseEnabled = true;
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase client:', error);
    console.warn('Application will run in local-only mode without cloud features');
  }
} else {
  console.warn('⚠️ Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
  console.warn('Application will run in local-only mode. Cloud features (render jobs, cloud storage) will be disabled.');
  console.warn('To enable Supabase, add the required environment variables to your .env file');
}

export { supabase, supabaseEnabled };