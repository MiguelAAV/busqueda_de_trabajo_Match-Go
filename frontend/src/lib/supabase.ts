import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Funciones helper para tablas
export const db = {
  // Usuario
  getUser: async () => {
    if (!supabase) return null
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  getUsuario: async (userId: string) => {
    if (!supabase) return null
    const { data } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  },

  // Ofertas
  getOfertas: async (filtros?: { region?: string; categoria?: string; estado?: string }) => {
    if (!supabase) return []
    
    let query = supabase
      .from('oferta')
      .select('*, empresa(razon_social), postulaciones(count)')
      .order('created_at', { ascending: false })

    if (filtros?.region) query = query.eq('region', filtros.region)
    if (filtros?.categoria) query = query.eq('categoria', filtros.categoria)
    if (filtros?.estado) query = query.eq('estado', filtros.estado)
    else query = query.eq('estado', 'ABIERTA')

    const { data } = await query
    return data || []
  },

  createOferta: async (oferta: any) => {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('oferta')
      .insert(oferta)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Trabajador
  getPerfilTrabajador: async (userId: string) => {
    if (!supabase) return null
    const { data } = await supabase
      .from('trabajador')
      .select('*')
      .eq('usuario_id', userId)
      .single()
    return data
  },

  // Empresa
  getPerfilEmpresa: async (userId: string) => {
    if (!supabase) return null
    const { data } = await supabase
      .from('empresa')
      .select('*')
      .eq('usuario_id', userId)
      .single()
    return data
  },

  // Postulaciones
  getPostulaciones: async (userId: string, tipo: 'empresa' | 'trabajador') => {
    if (!supabase) return []

    let query = supabase
      .from('postulacion')
      .select('*, oferta(*), trabajador(nombre_completo, telefono, region)')

    if (tipo === 'trabajador') {
      const perfil = await db.getPerfilTrabajador(userId)
      if (perfil) query = query.eq('trabajador_id', perfil.id)
    }

    const { data } = await query
    return data || []
  },

  // Workers para empresa
  getWorkers: async (filtros?: { region?: string; certificacion?: string }) => {
    if (!supabase) return []

    let query = supabase
      .from('trabajador')
      .select('*')

    if (filtros?.region) query = query.eq('region', filtros.region)

    const { data } = await query

    // Filtrar por certificación en cliente
    if (filtros?.certificacion && data) {
      return data.filter((t: any) => 
        t.certificaciones?.includes(filtros.certificacion)
      )
    }

    return data || []
  },
}