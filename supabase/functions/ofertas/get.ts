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

    const { data: oferta, error } = await supabase
      .from('Oferta')
      .select(`
        *,
        empresa:Empresa(id, razon_social, region, logo_url, contacto_nombre, telefono),
        postulaciones:Postulacion(
          *,
          trabajador:Trabajador(id, nombre_completo, certificaciones, disponibilidad, region, comuna)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !oferta) {
      return createErrorResponse('Oferta no encontrada', HTTP_STATUS.NOT_FOUND)
    }

    return createResponse(oferta)

  } catch (error) {
    console.error('Error en get-oferta:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
