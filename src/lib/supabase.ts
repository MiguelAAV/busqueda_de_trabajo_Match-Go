import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export function getAuthToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null
  return authHeader.replace('Bearer ', '')
}

export async function getUser(req: Request) {
  const token = getAuthToken(req)
  if (!token) return null
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  
  return user
}

export async function getUserFromToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}
