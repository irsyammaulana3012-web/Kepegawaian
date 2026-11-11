import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvzsudaysovzitqrqznw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8Q8csQ4meGLZGZniWJHV4w_mQwodljn';

// Initialize Supabase Client
// Note: We strictly use VITE_SUPABASE_ANON_KEY and NEVER expose service_role_key in the frontend!
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('mock_anon_key')
);
