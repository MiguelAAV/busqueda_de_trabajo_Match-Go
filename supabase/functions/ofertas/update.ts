import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { HTTP_STATUS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface UpdateOfertaBody {
  id: string
  titulo?: string
  categoria?: string
  descripcion?: string
  region?: string
  comuna?: string
  fecha_inicio?: string
  fecha_fin?: string
  jornada?: string
  horario?: string
  remuneration?: { monto: number, forma_pago: string }
  tipo_contrato?: 'PLAZO_FIJO' | 'HONORARIOS'
  requisitos?: {
    certificaciones?: string[]
    experiencia_min?: number
    movilizacion?: boolean
    renta_max?: number
  }
  estado?: 'ABIERTA' | 'CERRADA' | 'CON_CANDIDATOS' | 'COMPLETADA'
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body: UpdateOfertaBody = await req.json()

    if (!body.id) {
      return createErrorResponse('ID de oferta requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'titulo', 'categoria', 'descripcion', 'region', 'comuna',
      'fecha_inicio', 'fecha_fin', 'jornada', 'horario',
      'remuneration', 'tipo_contrato', 'requisitos', 'estado'
    ]

    for (const field of allowedFields) {
      if (body[field as keyof UpdateOfertaBody] !== undefined) {
        updateData[field] = body[field as keyof UpdateOfertaBody]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No hay campos para actualizar', HTTP_STATUS.BAD_REQUEST)
    }

    const { data: oferta, error } = await supabase
      .from('Oferta')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    if (!oferta) {
      return createErrorResponse('Oferta no encontrada', HTTP_STATUS.NOT_FOUND)
    }

    return createResponse(oferta)

  } catch (error) {
    console.error('Error en update-oferta:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
