// BROWSER-SAFE: public URL + anon key only.
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY via import.meta.env.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

let browserClient: SupabaseClient<Database> | undefined

export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (
    typeof url !== 'string' ||
    url.length === 0 ||
    typeof anonKey !== 'string' ||
    anonKey.length === 0
  ) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. See docs/setup/supabase-env-checklist.md',
    )
  }

  browserClient = createClient<Database>(url, anonKey)
  return browserClient
}
