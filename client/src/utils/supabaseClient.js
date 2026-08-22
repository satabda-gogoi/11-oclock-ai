import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// 💡 Updated variable mapping naming matrix 
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn("⚠️ Warning: Modern Supabase publishable configuration variables are missing.");
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);