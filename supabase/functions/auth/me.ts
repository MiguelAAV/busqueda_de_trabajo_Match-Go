import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { HTTP_STATUS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return createErrorResponse('Token de autorización requerido', HTTP_STATUS.UNAUTHORIZED)
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return createErrorResponse('Usuario no encontrado', HTTP_STATUS.UNAUTHORIZED)
    }

    return createResponse({
      user: {
        id: user.id,
        email: user.email,
        nombre: user.user_metadata?.nombre,
        avatar_url: user.user_metadata?.avatar_url,
        tipo: user.user_metadata?.tipo,
        created_at: user.created_at
      }
    })

  } catch (error) {
    console.error('Error en me:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
