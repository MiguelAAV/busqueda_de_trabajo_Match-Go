import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { HTTP_STATUS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface CreatePostulacionBody {
  oferta_id: string
  trabajador_id: string
  mensaje?: string
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body: CreatePostulacionBody = await req.json()

    const requiredFields = ['oferta_id', 'trabajador_id']
    for (const field of requiredFields) {
      if (!body[field as keyof CreatePostulacionBody]) {
        return createErrorResponse(`Campo requerido: ${field}`, HTTP_STATUS.BAD_REQUEST)
      }
    }

    const { data: oferta } = await supabase
      .from('Oferta')
      .select('*')
      .eq('id', body.oferta_id)
      .single()

    if (!oferta) {
      return createErrorResponse('Oferta no encontrada', HTTP_STATUS.NOT_FOUND)
    }

    if (oferta.estado !== 'ABIERTA' && oferta.estado !== 'CON_CANDIDATOS') {
      return createErrorResponse('La oferta no está abierta para postulaciones', HTTP_STATUS.BAD_REQUEST)
    }

    const { data: existingPostulacion } = await supabase
      .from('Postulacion')
      .select('id')
      .eq('oferta_id', body.oferta_id)
      .eq('trabajador_id', body.trabajador_id)
      .single()

    if (existingPostulacion) {
      return createErrorResponse('Ya postulaste a esta oferta', HTTP_STATUS.CONFLICT)
    }

    const { data: countData } = await supabase
      .from('Postulacion')
      .select('id', { count: 'exact' })
      .eq('oferta_id', body.oferta_id)

    if ((countData?.length || 0) >= 50) {
      return createErrorResponse('La oferta alcanzó el límite máximo de postulaciones', HTTP_STATUS.BAD_REQUEST)
    }

    const scoreMatch = oferta.score_promedio || 50

    const { data: postulacion, error } = await supabase
      .from('Postulacion')
      .insert({
        oferta_id: body.oferta_id,
        trabajador_id: body.trabajador_id,
        score_match: scoreMatch,
        mensaje: body.mensaje,
        estado: 'PENDIENTE'
      })
      .select()
      .single()

    if (error) {
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    return createResponse(postulacion, HTTP_STATUS.CREATED)

  } catch (error) {
    console.error('Error en create-postulacion:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
