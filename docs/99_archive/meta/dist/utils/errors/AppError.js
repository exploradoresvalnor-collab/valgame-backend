"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            error: this.message,
            code: this.code,
            statusCode: this.statusCode,
            timestamp: new Date().toISOString()
        };
    }
}
exports.AppError = AppError;
