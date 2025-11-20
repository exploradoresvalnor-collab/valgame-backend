"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMongooseError = exports.NotAuthorizedError = exports.InsufficientFundsError = exports.DatabaseError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(typeof message === 'string' ?
            message :
            Object.values(message)[0] || 'Error de validación', 400);
        if (typeof message !== 'string') {
            this.errors = message;
        }
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'No autenticado') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} no encontrado`, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends AppError {
    constructor(message = 'Demasiadas peticiones') {
        super(message, 429);
    }
}
exports.RateLimitError = RateLimitError;
class DatabaseError extends AppError {
    constructor(message = 'Error de base de datos') {
        super(message, 500);
    }
}
exports.DatabaseError = DatabaseError;
class InsufficientFundsError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.InsufficientFundsError = InsufficientFundsError;
class NotAuthorizedError extends AppError {
    constructor(message) {
        super(message, 403);
    }
}
exports.NotAuthorizedError = NotAuthorizedError;
// Función auxiliar para manejar errores de Mongoose
const handleMongooseError = (error) => {
    if (error.name === 'ValidationError') {
        const errors = {};
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
exports.handleMongooseError = handleMongooseError;
