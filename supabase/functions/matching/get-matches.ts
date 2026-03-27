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
    const oferta_id = url.searchParams.get('oferta_id')
    const sort_by = url.searchParams.get('sort_by') || 'score_match'
    const order = url.searchParams.get('order') || 'desc'

    if (!oferta_id) {
      return createErrorResponse('oferta_id es requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('Postulacion')
      .select(`
        *,
        trabajador:Trabajador(
          id,
          nombre_completo,
          region,
          comuna,
          movilizacion_propia,
          disponibilidad,
          pretension_renta,
          certificaciones,
          telefono
        )
      `)
      .eq('oferta_id', oferta_id)

    if (sort_by === 'score_match') {
      query = query.order('score_match', { ascending: order === 'asc' })
    } else if (sort_by === 'created_at') {
      query = query.order('created_at', { ascending: order === 'asc' })
    }

    const { data: postulaciones, error } = await query

    if (error) {
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    return createResponse({
      data: postulaciones,
      total: postulaciones?.length || 0
    })

  } catch (error) {
    console.error('Error en get-matches:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
