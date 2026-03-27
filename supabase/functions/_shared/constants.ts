export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validación',
  DUPLICATE_ENTRY: 'Ya existe un registro con estos datos',
  INTERNAL_ERROR: 'Error interno del servidor',
  SUBSCRIPTION_REQUIRED: 'Suscripción requerida',
  PUBLICATION_LIMIT_REACHED: 'Límite de publicaciones alcanzado',
  SEARCH_LIMIT_REACHED: 'Límite de búsquedas alcanzado'
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
}

export const PLAN_LIMITS = {
  BASICO: { publicaciones: 5, busquedas: 10 },
  PROFESIONAL: { publicaciones: 20, busquedas: 50 },
  ENTERPRISE: { publicaciones: -1, busquedas: -1 },
  TRIAL: { publicaciones: 20, busquedas: 50 }
}
