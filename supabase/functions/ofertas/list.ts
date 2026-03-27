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
    const params = {
      empresa_id: url.searchParams.get('empresa_id') || undefined,
      region: url.searchParams.get('region') || undefined,
      categoria: url.searchParams.get('categoria') || undefined,
      estado: url.searchParams.get('estado') || 'ABIERTA',
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '10')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('Oferta')
      .select(`
        *,
        empresa:Empresa(id, razon_social, region, logo_url)
      `, { count: 'exact' })

    if (params.empresa_id) {
      query = query.eq('empresa_id', params.empresa_id)
    }
    if (params.region) {
      query = query.eq('region', params.region)
    }
    if (params.categoria) {
      query = query.eq('categoria', params.categoria)
    }
    if (params.estado) {
      query = query.eq('estado', params.estado)
    }

    query = query.order('created_at', { ascending: false })

    const page = params.page
    const limit = params.limit
    const offset = (page - 1) * limit

    query = query.range(offset, offset + limit - 1)

    const { data: ofertas, error, count } = await query

    if (error) {
      return createErrorResponse(error.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    return createResponse({
      data: ofertas,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })

  } catch (error) {
    console.error('Error en list-ofertas:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
