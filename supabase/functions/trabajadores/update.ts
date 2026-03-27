import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { HTTP_STATUS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface UpdateTrabajadorBody {
  id: string
  nombre_completo?: string
  rut?: string
  fecha_nacimiento?: string
  telefono?: string
  region?: string
  comuna?: string
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
    const body: UpdateTrabajadorBody = await req.json()

    if (!body.id) {
      return createErrorResponse('ID de trabajador requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'nombre_completo', 'rut', 'fecha_nacimiento', 'telefono', 
      'region', 'comuna', 'movilizacion_propia', 
      'disponibilidad', 'pretension_renta', 'experiencia', 'certificaciones'
    ]
    
    for (const field of allowedFields) {
      if (body[field as keyof UpdateTrabajadorBody] !== undefined) {
        updateData[field] = body[field as keyof UpdateTrabajadorBody]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No hay campos para actualizar', HTTP_STATUS.BAD_REQUEST)
    }

    const { data: trabajador, error } = await supabase
      .from('Trabajador')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return createErrorResponse('El RUT ya está registrado', HTTP_STATUS.CONFLICT)
      }
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    if (!trabajador) {
      return createErrorResponse('Trabajador no encontrado', HTTP_STATUS.NOT_FOUND)
    }

    return createResponse(trabajador)

  } catch (error) {
    console.error('Error en update-trabajador:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
