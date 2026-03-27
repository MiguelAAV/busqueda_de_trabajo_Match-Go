import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { HTTP_STATUS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface UpdateEmpresaBody {
  id: string
  razon_social?: string
  rut?: string
  giro?: string
  direccion?: string
  telefono?: string
  contacto_nombre?: string
  region?: string
  logo_url?: string
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body: UpdateEmpresaBody = await req.json()

    if (!body.id) {
      return createErrorResponse('ID de empresa requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['razon_social', 'rut', 'giro', 'direccion', 'telefono', 'contacto_nombre', 'region', 'logo_url']
    
    for (const field of allowedFields) {
      if (body[field as keyof UpdateEmpresaBody] !== undefined) {
        updateData[field] = body[field as keyof UpdateEmpresaBody]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No hay campos para actualizar', HTTP_STATUS.BAD_REQUEST)
    }

    const { data: empresa, error } = await supabase
      .from('Empresa')
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

    if (!empresa) {
      return createErrorResponse('Empresa no encontrada', HTTP_STATUS.NOT_FOUND)
    }

    return createResponse(empresa)

  } catch (error) {
    console.error('Error en update-empresa:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
