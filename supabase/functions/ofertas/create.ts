import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { ERROR_MESSAGES, HTTP_STATUS, PLAN_LIMITS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface CreateOfertaBody {
  empresa_id: string
  titulo: string
  categoria: string
  descripcion: string
  region: string
  comuna: string
  fecha_inicio: string
  fecha_fin?: string
  jornada: string
  horario?: string
  remuneration: { monto: number, forma_pago: string }
  tipo_contrato: 'PLAZO_FIJO' | 'HONORARIOS'
  requisitos: {
    certificaciones?: string[]
    experiencia_min?: number
    movilizacion?: boolean
    renta_max?: number
  }
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body: CreateOfertaBody = await req.json()

    const requiredFields = ['empresa_id', 'titulo', 'categoria', 'descripcion', 'region', 'comuna', 'fecha_inicio', 'jornada', 'remuneration', 'tipo_contrato', 'requisitos']
    for (const field of requiredFields) {
      if (!body[field as keyof CreateOfertaBody]) {
        return createErrorResponse(`Campo requerido: ${field}`, HTTP_STATUS.BAD_REQUEST)
      }
    }

    const { data: empresa } = await supabase
      .from('Empresa')
      .select('*')
      .eq('id', body.empresa_id)
      .single()

    if (!empresa) {
      return createErrorResponse('Empresa no encontrada', HTTP_STATUS.NOT_FOUND)
    }

    const planLimit = PLAN_LIMITS[empresa.plan as keyof typeof PLAN_LIMITS]
    if (empresa.publicaciones_usadas >= planLimit.publicaciones) {
      return createErrorResponse(ERROR_MESSAGES.PUBLICATION_LIMIT_REACHED, HTTP_STATUS.FORBIDDEN)
    }

    const { data: oferta, error } = await supabase
      .from('Oferta')
      .insert({
        empresa_id: body.empresa_id,
        titulo: body.titulo,
        categoria: body.categoria,
        descripcion: body.descripcion,
        region: body.region,
        comuna: body.comuna,
        fecha_inicio: body.fecha_inicio,
        fecha_fin: body.fecha_fin,
        jornada: body.jornada,
        horario: body.horario,
        remuneration: body.remuneration,
        tipo_contrato: body.tipo_contrato,
        requisitos: body.requisitos,
        estado: 'ABIERTA'
      })
      .select()
      .single()

    if (error) {
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    await supabase
      .from('Empresa')
      .update({ publicaciones_usadas: empresa.publicaciones_usadas + 1 })
      .eq('id', body.empresa_id)

    return createResponse(oferta, HTTP_STATUS.CREATED)

  } catch (error) {
    console.error('Error en create-oferta:', error)
    return createErrorResponse(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_ERROR)
  }
})
