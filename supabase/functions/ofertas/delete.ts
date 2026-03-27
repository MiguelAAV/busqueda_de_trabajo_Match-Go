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

    if (!id) {
      return createErrorResponse('ID de oferta requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: deletePostError } = await supabase
      .from('Postulacion')
      .delete()
      .eq('oferta_id', id)

    if (deletePostError) {
      return createErrorResponse('Error al eliminar postulaciones', HTTP_STATUS.INTERNAL_ERROR)
    }

    const { error: deleteError } = await supabase
      .from('Oferta')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return createErrorResponse(deleteError.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    return createResponse({ message: 'Oferta eliminada correctamente' })

  } catch (error) {
    console.error('Error en delete-oferta:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
