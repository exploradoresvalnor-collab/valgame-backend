"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        try {
            // Seleccionar qué parte de la request validar
            const dataToValidate = req[target];
            // Validar con Zod
            const validated = schema.parse(dataToValidate);
            // Reemplazar los datos originales con los validados y parseados
            req[target] = validated;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Formatear errores de Zod de forma legible
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
                return res.status(400).json({
                    error: 'Validación fallida',
                    details: formattedErrors
                });
            }
            // Error inesperado
            console.error('[VALIDATION] Error inesperado:', error);
            return res.status(500).json({
                error: 'Error interno del servidor durante la validación'
            });
        }
    };
};
exports.validate = validate;
/**
 * Middleware específico para validar body
 */
const validateBody = (schema) => (0, exports.validate)(schema, 'body');
exports.validateBody = validateBody;
/**
 * Middleware específico para validar params
 */
const validateParams = (schema) => (0, exports.validate)(schema, 'params');
exports.validateParams = validateParams;
/**
 * Middleware específico para validar query
 */
const validateQuery = (schema) => (0, exports.validate)(schema, 'query');
exports.validateQuery = validateQuery;
