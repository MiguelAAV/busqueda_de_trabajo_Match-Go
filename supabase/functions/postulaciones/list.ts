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
    const trabajador_id = url.searchParams.get('trabajador_id')
    const estado = url.searchParams.get('estado') || undefined

    if (!trabajador_id) {
      return createErrorResponse('trabajador_id es requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('Postulacion')
      .select(`
        *,
        oferta:Oferta(
          id,
          titulo,
          categoria,
          region,
          comuna,
          remuneration,
          tipo_contrato,
          empresa:Empresa(id, razon_social, logo_url)
        )
      `)
      .eq('trabajador_id', trabajador_id)

    if (estado) {
      query = query.eq('estado', estado)
    }

    query = query.order('created_at', { ascending: false })

    const { data: postulaciones, error } = await query

    if (error) {
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    return createResponse({
      data: postulaciones,
      total: postulaciones?.length || 0
    })

  } catch (error) {
    console.error('Error en list-postulaciones:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
