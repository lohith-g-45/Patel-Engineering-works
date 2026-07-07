import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials are missing. Please ensure window.SUPABASE_URL and window.SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
