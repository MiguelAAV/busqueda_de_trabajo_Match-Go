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
    const postulacion_id = url.searchParams.get('id')

    if (!postulacion_id) {
      return createErrorResponse('ID de postulación requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: postulacion, error: fetchError } = await supabase
      .from('Postulacion')
      .select('*')
      .eq('id', postulacion_id)
      .single()

    if (fetchError || !postulacion) {
      return createErrorResponse('Postulación no encontrada', HTTP_STATUS.NOT_FOUND)
    }

    if (postulacion.estado !== 'PENDIENTE') {
      return createErrorResponse('Esta postulación ya fue procesada', HTTP_STATUS.BAD_REQUEST)
    }

    const { data: updated, error } = await supabase
      .from('Postulacion')
      .update({ estado: 'ACEPTADO' })
      .eq('id', postulacion_id)
      .select()
      .single()

    if (error) {
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    await supabase
      .from('Oferta')
      .update({ estado: 'CON_CANDIDATOS' })
      .eq('id', postulacion.oferta_id)

    return createResponse({
      postulacion: updated,
      message: 'Postulación aceptada correctamente'
    })

  } catch (error) {
    console.error('Error en accept-postulacion:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
