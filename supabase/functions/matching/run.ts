import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createResponse, createErrorResponse, handleCors } from '../../_shared/response.ts'
import { HTTP_STATUS, PLAN_LIMITS } from '../../_shared/constants.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface MatchResult {
  trabajador_id: string
  score: number
  certificacionScore: number
  disponibilidadScore: number
  ubicacionScore: number
  rentaScore: number
}

interface Oferta {
  id: string
  region: string
  comuna: string
  jornada: string
  requisitos: {
    certificaciones?: string[]
    experiencia_min?: number
    movilizacion?: boolean
    renta_max?: number
  }
  empresa_id: string
}

interface Trabajador {
  id: string
  region: string
  comuna: string
  disponibilidad: { dias: string[], horarios: string[] }
  certificaciones: { nombre: string }[]
  movilizacion_propia: boolean
  pretension_renta: { min: number, max: number, tipo: string }
  experiencia: unknown[]
}

function calculateCertificacionScore(reqCerts: string[], workerCerts: { nombre: string }[]): number {
  if (!reqCerts || reqCerts.length === 0) return 100
  if (!workerCerts || workerCerts.length === 0) return 0

  const matches = reqCerts.filter(rc => workerCerts.some(wc => wc.nombre === rc))
  return (matches.length / reqCerts.length) * 100
}

function calculateDisponibilidadScore(ofertaJornada: string, disponibilidad: { dias: string[], horarios: string[] }): number {
  if (!disponibilidad || !disponibilidad.dias || disponibilidad.dias.length === 0) {
    return 50
  }

  const jornadaMap: Record<string, string[]> = {
    'mañana': ['mañana', 'full_time'],
    'tarde': ['tarde', 'full_time'],
    'noche': ['noche', 'full_time'],
    'full_time': ['full_time']
  }

  const jornadaMatch = jornadaMap[ofertaJornada] || []
  const hasMatch = disponibilidad.horarios.some(h => jornadaMatch.includes(h))

  if (hasMatch && disponibilidad.dias.length >= 5) return 100
  if (hasMatch && disponibilidad.dias.length >= 3) return 75
  if (disponibilidad.dias.length >= 1) return 50
  return 25
}

function calculateUbicacionScore(ofertaRegion: string, ofertaComuna: string, workerRegion: string, workerComuna: string): number {
  if (ofertaRegion !== workerRegion) return 0
  if (ofertaComuna === workerComuna) return 100
  return 70
}

function calculateRentaScore(rentaMax: number | undefined, pretension: { min: number, max: number, tipo: string }): number {
  if (!rentaMax) return 100
  if (!pretension) return 50

  if (pretension.min <= rentaMax) return 100
  if (pretension.min <= rentaMax * 1.2) return 50
  return 0
}

function calculateMatch(oferta: Oferta, trabajador: Trabajador): MatchResult | null {
  const requisitos = oferta.requisitos || {}

  if (requisitos.movilizacion && !trabajador.movilizacion_propia) {
    return null
  }

  const certificacionScore = calculateCertificacionScore(
    requisitos.certificaciones || [],
    trabajador.certificaciones
  )

  const disponibilidadScore = calculateDisponibilidadScore(
    oferta.jornada,
    trabajador.disponibilidad
  )

  const ubicacionScore = calculateUbicacionScore(
    oferta.region,
    oferta.comuna,
    trabajador.region,
    trabajador.comuna
  )

  if (ubicacionScore === 0) {
    return null
  }

  const rentaScore = calculateRentaScore(
    requisitos.renta_max,
    trabajador.pretension_renta
  )

  const score = Math.round(
    certificacionScore * 0.40 +
    disponibilidadScore * 0.30 +
    ubicacionScore * 0.20 +
    rentaScore * 0.10
  )

  return {
    trabajador_id: trabajador.id,
    score,
    certificacionScore,
    disponibilidadScore,
    ubicacionScore,
    rentaScore
  }
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const url = new URL(req.url)
    const oferta_id = url.searchParams.get('oferta_id')

    if (!oferta_id) {
      return createErrorResponse('oferta_id es requerido', HTTP_STATUS.BAD_REQUEST)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: oferta, error: ofertaError } = await supabase
      .from('Oferta')
      .select('*')
      .eq('id', oferta_id)
      .single()

    if (ofertaError || !oferta) {
      return createErrorResponse('Oferta no encontrada', HTTP_STATUS.NOT_FOUND)
    }

    const { data: empresa } = await supabase
      .from('Empresa')
      .select('*')
      .eq('id', oferta.empresa_id)
      .single()

    const matchLimit = empresa ? PLAN_LIMITS[empresa.plan as keyof typeof PLAN_LIMITS].workers_en_match : 10

    const { data: trabajadores, error: trabajadoresError } = await supabase
      .from('Trabajador')
      .select('*')
      .eq('region', oferta.region)

    if (trabajadoresError) {
      return createErrorResponse(trabajadoresError.message, HTTP_STATUS.INTERNAL_ERROR)
    }

    const matches: MatchResult[] = []

    for (const trabajador of trabajadores || []) {
      const match = calculateMatch(oferta, trabajador as unknown as Trabajador)
      if (match && match.score >= 50) {
        matches.push(match)
      }
    }

    matches.sort((a, b) => b.score - a.score)

    const topMatches = matches.slice(0, matchLimit)

    for (const match of topMatches) {
      const { data: existing } = await supabase
        .from('Postulacion')
        .select('id')
        .eq('oferta_id', oferta_id)
        .eq('trabajador_id', match.trabajador_id)
        .single()

      if (!existing) {
        await supabase.from('Postulacion').insert({
          oferta_id,
          trabajador_id: match.trabajador_id,
          score_match: match.score,
          estado: 'PENDIENTE'
        })
      }
    }

    const avgScore = topMatches.length > 0
      ? topMatches.reduce((sum, m) => sum + m.score, 0) / topMatches.length
      : null

    if (avgScore !== null) {
      await supabase
        .from('Oferta')
        .update({ 
          score_promedio: avgScore,
          estado: topMatches.length > 0 ? 'CON_CANDIDATOS' : oferta.estado
        })
        .eq('id', oferta_id)
    }

    return createResponse({
      oferta_id,
      total_matches: matches.length,
      top_matches: topMatches,
      score_promedio: avgScore
    })

  } catch (error) {
    console.error('Error en run-matching:', error)
    return createErrorResponse('Error interno del servidor', HTTP_STATUS.INTERNAL_ERROR)
  }
})
