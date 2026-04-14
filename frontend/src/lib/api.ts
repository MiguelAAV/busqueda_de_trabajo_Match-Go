import { supabase } from './supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const session = await getSession()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    ...options.headers,
  }
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Error en la solicitud')
  }

  return response.json()
}

export const authApi = {
  signIn: (idToken: string) => 
    fetchAPI('auth/sign-in', { method: 'POST', body: JSON.stringify({ id_token: idToken }) }),
  
  signUp: (idToken: string, tipo: string) =>
    fetchAPI('auth/sign-up', { method: 'POST', body: JSON.stringify({ id_token: idToken, tipo }) }),
  
  signOut: () =>
    fetchAPI('auth/sign-out', { method: 'POST' }),
  
  me: () =>
    fetchAPI('auth/me'),
}

export const empresaApi = {
  get: () =>
    fetchAPI('empresas/get'),
  
  create: (data: any) =>
    fetchAPI('empresas/create', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (data: any) =>
    fetchAPI('empresas/update', { method: 'PUT', body: JSON.stringify(data) }),
}

export const trabajadorApi = {
  get: () =>
    fetchAPI('trabajadores/get'),
  
  create: (data: any) =>
    fetchAPI('trabajadores/create', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (data: any) =>
    fetchAPI('trabajadores/update', { method: 'PUT', body: JSON.stringify(data) }),
  
  search: (filtros?: any) =>
    fetchAPI('trabajadores/search?' + new URLSearchParams(filtros)),
}

export const ofertaApi = {
  list: (filtros?: any) =>
    fetchAPI('ofertas/list?' + new URLSearchParams(filtros)),
  
  get: (id: string) =>
    fetchAPI(`ofertas/get?id=${id}`),
  
  create: (data: any) =>
    fetchAPI('ofertas/create', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: any) =>
    fetchAPI(`ofertas/update?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    fetchAPI(`ofertas/delete?id=${id}`, { method: 'DELETE' }),
}

export const postulacionApi = {
  list: (ofertaId?: string) =>
    fetchAPI('postulaciones/list' + (ofertaId ? `?oferta_id=${ofertaId}` : '')),
  
  create: (ofertaId: string, mensaje?: string) =>
    fetchAPI('postulaciones/create', { method: 'POST', body: JSON.stringify({ oferta_id: ofertaId, mensaje }) }),
  
  accept: (id: string) =>
    fetchAPI(`postulaciones/accept?id=${id}`, { method: 'PUT' }),
  
  reject: (id: string) =>
    fetchAPI(`postulaciones/reject?id=${id}`, { method: 'PUT' }),
}

export const matchingApi = {
  run: (ofertaId: string) =>
    fetchAPI('matching/run', { method: 'POST', body: JSON.stringify({ oferta_id: ofertaId }) }),
  
  getMatches: (ofertaId: string) =>
    fetchAPI(`matching/get-matches?oferta_id=${ofertaId}`),
}