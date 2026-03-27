import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { HTTP_STATUS, PLAN_LIMITS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface SearchParams {
  region?: string
  comuna?: string
  certificaciones?: string[]
  movilizacion_propia?: boolean
  disponibilidad?: string[]
  page?: number
  limit?: number
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const url = new URL(req.url)
    const params: SearchParams = {
      region: url.searchParams.get('region') || undefined,
      comuna: url.searchParams.get('comuna') || undefined,
      certificaciones: url.searchParams.get('certificaciones')?.split(',') || undefined,
      movilizacion_propia: url.searchParams.get('movilizacion_propia') === 'true' ? true : undefined,
      disponibilidad: url.searchParams.get('disponibilidad')?.split(',') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '10')
    }

    const empresa_id = url.searchParams.get('empresa_id')
    if (!empresa_id) {
      return createErrorResponse('empresa_id es requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: empresa } = await supabase
      .from('Empresa')
      .select('*')
      .eq('id', empresa_id)
      .single()

    if (!empresa) {
      return createErrorResponse('Empresa no encontrada', HTTP_STATUS.NOT_FOUND)
    }

    if (empresa.busquedas_usadas >= PLAN_LIMITS[empresa.plan as keyof typeof PLAN_LIMITS].busquedas) {
      return createErrorResponse('Límite de búsquedas alcanzado para el plan actual', HTTP_STATUS.FORBIDDEN)
    }

    let query = supabase
      .from('Trabajador')
      .select('*', { count: 'exact' })

    if (params.region) {
      query = query.eq('region', params.region)
    }
    
    if (params.comuna) {
      query = query.eq('comuna', params.comuna)
    }
    
    if (params.movilizacion_propia !== undefined) {
      query = query.eq('movilizacion_propia', params.movilizacion_propia)
    }

    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    query = query.range(offset, offset + limit - 1)

    const { data: trabajadores, error, count } = await query

    if (error) {
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    let filtered = trabajadores || []

    if (params.certificaciones && params.certificaciones.length > 0) {
      filtered = filtered.filter(t => {
        const certs = t.certificaciones as Array<{ nombre: string }>
        return params.certificaciones!.some(c => certs.some(cert => cert.nombre === c))
      })
    }

    if (params.disponibilidad && params.disponibilidad.length > 0) {
      filtered = filtered.filter(t => {
        const disp = t.disponibilidad as { dias: string[] }
        return params.disponibilidad!.some(d => disp.dias.includes(d))
      })
    }

    await supabase
      .from('Empresa')
      .update({ busquedas_usadas: empresa.busquedas_usadas + 1 })
      .eq('id', empresa_id)

    return createResponse({
      data: filtered,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })

  } catch (error) {
    console.error('Error en search-trabajadores:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
