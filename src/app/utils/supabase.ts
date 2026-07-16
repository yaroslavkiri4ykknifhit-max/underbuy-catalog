import { createClient } from "@supabase/supabase-js";

// Supabase's browser key is intentionally public (RLS is the security boundary).
// Keep the production values here as a fallback because GitHub Pages builds do not
// receive local .env files. Environment variables still take precedence locally.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vwwwbndppuevwumnyvlj.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ARbHJCJKF99slgCONTD_ag_hzEWXOXf";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
