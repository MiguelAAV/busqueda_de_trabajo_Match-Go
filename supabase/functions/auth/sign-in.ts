import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { CORS_HEADERS, ERROR_MESSAGES, HTTP_STATUS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { id_token } = await req.json()

    if (!id_token) {
      return createErrorResponse('Token de Google requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const { data, error: signInError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token
    })

    if (signInError) {
      return createErrorResponse('Credenciales inválidas', HTTP_STATUS.UNAUTHORIZED)
    }

    const user = data.user
    const session = data.session

    return createResponse({
      user: {
        id: user?.id,
        email: user?.email,
        nombre: user?.user_metadata?.nombre,
        avatar_url: user?.user_metadata?.avatar_url,
        tipo: user?.user_metadata?.tipo
      },
      session: {
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
        expires_in: session?.expires_in,
        expires_at: session?.expires_at
      }
    })

  } catch (error) {
    console.error('Error en sign-in:', error)
    return createErrorResponse(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_ERROR)
  }
})
