import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
    console.warn('Supabase URL or Publishable Key is missing. Authentication will not work.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabasePublishableKey || '',
    {
        auth: {
            persistSession: true, // We'll manage storage strategy on sign-in if needed, or stick to default localStorage
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);
