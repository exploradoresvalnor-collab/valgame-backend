import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware de Validación con Zod
 * 
 * Valida el body, params o query de una petición contra un schema de Zod.
 * Si la validación falla, devuelve un error 400 con detalles.
 */

type ValidationTarget = 'body' | 'params' | 'query';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Seleccionar qué parte de la request validar
      const dataToValidate = req[target];

      // Validar con Zod
      const validated = schema.parse(dataToValidate);

      // Reemplazar los datos originales con los validados y parseados
      (req as any)[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatear errores de Zod de forma legible
        const formattedErrors = error.issues.map((err: any) => ({
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

/**
 * Middleware específico para validar body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Middleware específico para validar params
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');

/**
 * Middleware específico para validar query
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
