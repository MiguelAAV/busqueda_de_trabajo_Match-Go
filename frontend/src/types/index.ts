export type TipoUsuario = 'EMPRESA' | 'TRABAJADOR'

export interface Usuario {
  id: string
  email: string
  nombre?: string
  avatar_url?: string
  tipo: TipoUsuario
}

export interface Empresa {
  id: string
  usuario_id: string
  razon_social: string
  rut: string
  giro?: string
  direccion: string
  telefono: string
  contacto_nombre: string
  region: string
  logo_url?: string
  plan: PlanSuscripcion
}

export interface Trabajador {
  id: string
  usuario_id: string
  nombre_completo: string
  rut: string
  fecha_nacimiento?: string
  telefono: string
  region: string
  comuna: string
  movilizacion_propia: boolean
  disponibilidad: Disponibilidad
  pretension_renta: PretensionRenta
  experiencia: Experiencia[]
  certificaciones: Certificacion[]
}

export interface Oferta {
  id: string
  empresa_id: string
  titulo: string
  categoria: string
  descripcion: string
  region: string
  comuna: string
  fecha_inicio: string
  fecha_fin?: string
  jornada: string
  horario?: string
  remuneration: Remuneracion
  tipo_contrato: string
  requisitos: Requisitos
  estado: EstadoOferta
}

export interface Postulacion {
  id: string
  oferta_id: string
  trabajador_id: string
  score_match: number
  mensaje?: string
  estado: EstadoPostulacion
}

export type PlanSuscripcion = 'BASICO' | 'PROFESIONAL' | 'ENTERPRISE' | 'TRIAL'
export type EstadoOferta = 'ABIERTA' | 'CERRADA' | 'CON_CANDIDATOS' | 'COMPLETADA'
export type EstadoPostulacion = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'

export interface Disponibilidad {
  dias: string[]
  horarios: string[]
}

export interface PretensionRenta {
  min: number
  max: number
  tipo: 'hora' | 'jornada' | 'mes'
}

export interface Experiencia {
  empresa: string
  cargo: string
  periodo: string
  descripcion: string
}

export interface Certificacion {
  nombre: string
  fecha_emision?: string
  url_certificado?: string
}

export interface Remuneracion {
  monto: number
  forma_pago: 'hora' | 'jornada' | 'mes'
}

export interface Requisitos {
  certificaciones: string[]
  experiencia_min: number
  movilizacion: boolean
}