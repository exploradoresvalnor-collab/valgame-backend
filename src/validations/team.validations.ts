import { z } from 'zod';

// Validación para crear equipo
export const createTeamSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del equipo es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  characters: z.array(z.string())
    .min(1, 'Debe seleccionar al menos 1 personaje')
    .max(9, 'No puede seleccionar más de 9 personajes')
});

// Validación para actualizar equipo
export const updateTeamSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del equipo es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim()
    .optional(),
  characters: z.array(z.string())
    .min(1, 'Debe seleccionar al menos 1 personaje')
    .max(9, 'No puede seleccionar más de 9 personajes')
    .optional(),
  isActive: z.boolean().optional()
});

// Validación para parámetros de ruta
export const teamIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de equipo inválido')
});
