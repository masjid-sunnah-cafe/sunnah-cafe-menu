import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * True when Supabase credentials are configured. When false, the app falls
 * back to bundled seed data (demo mode) so local development and the admin
 * panel work without a backend.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Shared Supabase client, or null when credentials are missing.
 * Callers must handle the null case (see src/data/repository.ts).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
