// SERVER-ONLY: never import this file from browser components or client routes.
// Uses the server Supabase client (service-role key stays in process.env).
import { createServerSupabaseClient } from '../supabase/server'

export async function getSession() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}

export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
}
