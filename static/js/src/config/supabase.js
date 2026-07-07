import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Ensure environment variables are loaded
const supabaseUrl = window.ENV?.SUPABASE_URL;
const supabaseAnonKey = window.ENV?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials are not configured in window.ENV');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
