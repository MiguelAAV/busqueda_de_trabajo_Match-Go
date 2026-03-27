import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { ERROR_MESSAGES, HTTP_STATUS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface CreateEmpresaBody {
  usuario_id: string
  razon_social: string
  rut: string
  giro?: string
  direccion: string
  telefono: string
  contacto_nombre: string
  region: string
  logo_url?: string
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body: CreateEmpresaBody = await req.json()

    const requiredFields = ['usuario_id', 'razon_social', 'rut', 'direccion', 'telefono', 'contacto_nombre', 'region']
    for (const field of requiredFields) {
      if (!body[field as keyof CreateEmpresaBody]) {
        return createErrorResponse(`Campo requerido: ${field}`, HTTP_STATUS.BAD_REQUEST)
      }
    }

    const { data: empresa, error } = await supabase
      .from('Empresa')
      .insert({
        usuario_id: body.usuario_id,
        razon_social: body.razon_social,
        rut: body.rut,
        giro: body.giro,
        direccion: body.direccion,
        telefono: body.telefono,
        contacto_nombre: body.contacto_nombre,
        region: body.region,
        logo_url: body.logo_url,
        plan: 'TRIAL',
        fecha_trial_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return createErrorResponse(ERROR_MESSAGES.DUPLICATE_ENTRY, HTTP_STATUS.CONFLICT)
      }
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    await supabase.from('Suscripcion').insert({
      empresa_id: empresa.id,
      plan: 'TRIAL',
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      estado: 'ACTIVA'
    })

    return createResponse(empresa, HTTP_STATUS.CREATED)

  } catch (error) {
    console.error('Error en create-empresa:', error)
    return createErrorResponse(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_ERROR)
  }
})
