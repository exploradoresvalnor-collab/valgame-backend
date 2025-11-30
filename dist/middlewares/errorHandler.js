"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/errors/AppError");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json(err.toJSON());
    }
    // Handle unknown errors
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString()
    });
};
exports.errorHandler = errorHandler;
