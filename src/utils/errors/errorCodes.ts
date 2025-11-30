export const ErrorCodes = {
  // Auth errors
  INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', status: 401 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND', status: 404 },
  USER_EXISTS: { code: 'USER_EXISTS', status: 409 },
  
  // Validation errors
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400 },
  INVALID_EMAIL: { code: 'INVALID_EMAIL', status: 400 },
  INVALID_PASSWORD: { code: 'INVALID_PASSWORD', status: 400 },
  
  // Resource errors
  NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
  RESOURCE_NOT_FOUND: { code: 'RESOURCE_NOT_FOUND', status: 404 },
  
  // Business logic errors
  INSUFFICIENT_VAL: { code: 'INSUFFICIENT_VAL', status: 400 },
  INSUFFICIENT_ITEMS: { code: 'INSUFFICIENT_ITEMS', status: 400 },
  INSUFFICIENT_LEVEL: { code: 'INSUFFICIENT_LEVEL', status: 400 },
  CHARACTER_NOT_FOUND: { code: 'CHARACTER_NOT_FOUND', status: 404 },
  
  // Server errors
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500 },
  DATABASE_ERROR: { code: 'DATABASE_ERROR', status: 500 },
  SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', status: 503 }
};
