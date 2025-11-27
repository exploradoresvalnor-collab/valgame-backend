export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  errors?: Record<string, string>;

  constructor(message: string | Record<string, string>) {
    super(
      typeof message === 'string' ? 
      message : 
      Object.values(message)[0] || 'Error de validación',
      400
    );
    if (typeof message !== 'string') {
      this.errors = message;
    }
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Demasiadas peticiones') {
    super(message, 429);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Error de base de datos') {
    super(message, 500);
  }
}

export class InsufficientFundsError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotAuthorizedError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class ConnectionError extends AppError {
  retryable: boolean;
  attemptCount: number;
  maxAttempts: number;

  constructor(
    message: string = 'Error de conexión',
    retryable: boolean = true,
    attemptCount: number = 0,
    maxAttempts: number = 3
  ) {
    super(message, 503);
    this.retryable = retryable;
    this.attemptCount = attemptCount;
    this.maxAttempts = maxAttempts;
  }
}

export class OfflineError extends AppError {
  isOffline: boolean = true;
  suggestedAction: string;

  constructor(
    message: string = 'Sin conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.',
    suggestedAction: string = 'retry'
  ) {
    super(message, 503);
    this.suggestedAction = suggestedAction;
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Tiempo de espera agotado') {
    super(message, 504);
  }
}

// Función auxiliar para manejar errores de Mongoose
export const handleMongooseError = (error: any): AppError => {
  if (error.name === 'ValidationError') {
    const errors: Record<string, string> = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
    return new ValidationError(Object.values(errors).join(', '));
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new ConflictError(`El ${field} ya está en uso`);
  }

  return new DatabaseError('Error interno de base de datos');
};