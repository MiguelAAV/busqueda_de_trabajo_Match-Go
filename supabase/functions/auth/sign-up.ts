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
    const { email, nombre, avatar_url, tipo } = await req.json()

    if (!email || !tipo) {
      return createErrorResponse('Email y tipo son requeridos', HTTP_STATUS.BAD_REQUEST)
    }

    if (tipo !== 'EMPRESA' && tipo !== 'TRABAJADOR') {
      return createErrorResponse('Tipo debe ser EMPRESA o TRABAJADOR', HTTP_STATUS.BAD_REQUEST)
    }

    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        nombre,
        avatar_url,
        tipo
      }
    })

    if (signUpError) {
      if (signUpError.message.includes('already')) {
        return createErrorResponse('El email ya está registrado', HTTP_STATUS.CONFLICT)
      }
      return createErrorResponse(signUpError.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    return createResponse({
      user: {
        id: user?.id,
        email: user?.email,
        tipo
      }
    }, HTTP_STATUS.CREATED)

  } catch (error) {
    console.error('Error en signup:', error)
    return createErrorResponse(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_ERROR)
  }
})
