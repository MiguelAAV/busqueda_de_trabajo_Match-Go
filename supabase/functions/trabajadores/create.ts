import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { ERROR_MESSAGES, HTTP_STATUS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface CreateTrabajadorBody {
  usuario_id: string
  nombre_completo: string
  rut: string
  fecha_nacimiento?: string
  telefono: string
  region: string
  comuna: string
  movilizacion_propia?: boolean
  disponibilidad?: { dias: string[], horarios: string[] }
  pretension_renta?: { min: number, max: number, tipo: string }
  experiencia?: unknown[]
  certificaciones?: unknown[]
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body: CreateTrabajadorBody = await req.json()

    const requiredFields = ['usuario_id', 'nombre_completo', 'rut', 'telefono', 'region', 'comuna']
    for (const field of requiredFields) {
      if (!body[field as keyof CreateTrabajadorBody]) {
        return createErrorResponse(`Campo requerido: ${field}`, HTTP_STATUS.BAD_REQUEST)
      }
    }

    const { data: trabajador, error } = await supabase
      .from('Trabajador')
      .insert({
        usuario_id: body.usuario_id,
        nombre_completo: body.nombre_completo,
        rut: body.rut,
        fecha_nacimiento: body.fecha_nacimiento,
        telefono: body.telefono,
        region: body.region,
        comuna: body.comuna,
        movilizacion_propia: body.movilizacion_propia ?? false,
        disponibilidad: body.disponibilidad ?? { dias: [], horarios: [] },
        pretension_renta: body.pretension_renta ?? { min: 0, max: 0, tipo: 'jornada' },
        experiencia: body.experiencia ?? [],
        certificaciones: body.certificaciones ?? []
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return createErrorResponse(ERROR_MESSAGES.DUPLICATE_ENTRY, HTTP_STATUS.CONFLICT)
      }
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    return createResponse(trabajador, HTTP_STATUS.CREATED)

  } catch (error) {
    console.error('Error en create-trabajador:', error)
    return createErrorResponse(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_ERROR)
  }
})
