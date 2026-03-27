import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { HTTP_STATUS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const usuario_id = url.searchParams.get('usuario_id')

    if (!id && !usuario_id) {
      return createErrorResponse('Se requiere id o usuario_id', HTTP_STATUS.BAD_REQUEST)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase.from('Trabajador').select('*')
    
    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('usuario_id', usuario_id!)
    }

    const { data: trabajador, error } = await query.single()

    if (error || !trabajador) {
      return createErrorResponse('Trabajador no encontrado', HTTP_STATUS.NOT_FOUND)
    }

    return createResponse(trabajador)

  } catch (error) {
    console.error('Error en get-trabajador:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
