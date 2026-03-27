export enum TipoUsuario {
  EMPRESA = 'EMPRESA',
  TRABAJADOR = 'TRABAJADOR'
}

export enum TipoContrato {
  PLAZO_FIJO = 'PLAZO_FIJO',
  HONORARIOS = 'HONORARIOS'
}

export enum EstadoOferta {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
  CON_CANDIDATOS = 'CON_CANDIDATOS',
  COMPLETADA = 'COMPLETADA'
}

export enum EstadoPostulacion {
  PENDIENTE = 'PENDIENTE',
  ACEPTADO = 'ACEPTADO',
  RECHAZADO = 'RECHAZADO'
}

export enum PlanSuscripcion {
  BASICO = 'BASICO',
  PROFESIONAL = 'PROFESIONAL',
  ENTERPRISE = 'ENTERPRISE',
  TRIAL = 'TRIAL'
}

export enum EstadoSuscripcion {
  ACTIVA = 'ACTIVA',
  VENCIDA = 'VENCIDA',
  CANCELADA = 'CANCELADA'
}

export interface Disponibilidad {
  dias: string[]
  horarios: ('mañana' | 'tarde' | 'noche' | 'full_time')[]
}

export interface PretensionRenta {
  min: number
  max: number
  tipo: 'hora' | 'jornada' | 'mes'
}

export interface Experiencia {
  empresa: string
  cargo: string
  periodo: {
    inicio: string
    fin: string | null
  }
  descripcion: string
}

export interface Certificacion {
  nombre: string
  fecha_emision: string
  url_certificado?: string
}

export interface Remuneracion {
  monto: number
  forma_pago: 'hora' | 'jornada' | 'mes'
}

export interface RequisitosOferta {
  certificaciones: string[]
  experiencia_min: number
  movilizacion: boolean
  renta_max?: number
}

export interface MatchResult {
  score: number
  certificacionScore: number
  disponibilidadScore: number
  ubicacionScore: number
  rentaScore: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const CATEGORIAS_TRABAJO = [
  'Guardia',
  'Conserje',
  'Temporero',
  'Carga/Descarga',
  'Niñera',
  'Aseo',
  'Electricista',
  'Otro'
] as const

export const REGIONES_CHILE = [
  'Metropolitana',
  'Valparaíso',
  'O\'Higgins'
] as const

export const COMUNAS_RM = [
  'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
  'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja',
  'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo',
  'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda',
  'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal',
  'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón',
  'Santiago', 'Vitacura'
] as const

export const COMUNAS_VALPARAISO = [
  'Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana',
  'San Antonio', 'Cartagena', 'El Quisco', 'El Tabo', 'Algarrobo'
] as const

export const COMUNAS_OHIGGINS = [
  'Rancagua', 'Machalí', 'Graneros', 'San Fernando', 'Pichilemu',
  'San Vicente', 'Santa Cruz', 'Peumo', 'Las Cabras', 'Litueche'
] as const

export const CERTIFICACIONES_DISPONIBLES = [
  { nombre: 'OS10', categorias: ['Guardia'] },
  { nombre: 'SEC', categorias: ['Electricista'] },
  { nombre: 'Primeros Auxilios', categorias: ['Guardia', 'Niñera'] },
  { nombre: 'Manejo de Alimentos', categorias: ['Aseo', 'Temporero'] }
] as const

export const PLANES_SUSCRIPCION = {
  [PlanSuscripcion.BASICO]: {
    nombre: 'Básico',
    precio: 50000,
    publicaciones_mes: 5,
    busquedas_manuales: 10,
    workers_en_match: 5
  },
  [PlanSuscripcion.PROFESIONAL]: {
    nombre: 'Profesional',
    precio: 120000,
    publicaciones_mes: 20,
    busquedas_manuales: 50,
    workers_en_match: 10
  },
  [PlanSuscripcion.ENTERPRISE]: {
    nombre: 'Enterprise',
    precio: 250000,
    publicaciones_mes: -1,
    busquedas_manuales: -1,
    workers_en_match: 20
  },
  [PlanSuscripcion.TRIAL]: {
    nombre: 'Trial',
    precio: 0,
    publicaciones_mes: 20,
    busquedas_manuales: 50,
    workers_en_match: 10
  }
} as const
