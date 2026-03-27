export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

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
