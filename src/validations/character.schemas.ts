import { z } from 'zod';

/**
 * Esquemas de Validación para Rutas de Personajes
 * 
 * Estos esquemas validan los datos de entrada para las operaciones
 * relacionadas con personajes (experiencia, curación, resurrección, etc.)
 */

// Schema para añadir experiencia
export const AddExperienceSchema = z.object({
  amount: z.number()
    .int('La cantidad de experiencia debe ser un número entero')
    .positive('La cantidad de experiencia debe ser mayor a 0')
    .max(10000, 'La cantidad máxima de experiencia por operación es 10000')
});

// Schema para usar consumibles
export const UseConsumableSchema = z.object({
  itemId: z.string()
    .min(1, 'El ID del item es requerido')
    .regex(/^[0-9a-fA-F]{24}$/, 'El ID del item debe ser un ObjectId válido de MongoDB')
});

// Schema para parámetros de ruta (characterId)
export const CharacterIdParamSchema = z.object({
  characterId: z.string()
    .min(1, 'El ID del personaje es requerido')
});

// Schema para evolucionar personaje (sin body, solo validación de params)
export const EvolveCharacterSchema = z.object({
  // No requiere body, solo el characterId en params
});

// Schema para curar personaje (sin body, solo validación de params)
export const HealCharacterSchema = z.object({
  // No requiere body, solo el characterId en params
});

// Schema para revivir personaje (sin body, solo validación de params)
export const ReviveCharacterSchema = z.object({
  // No requiere body, solo el characterId en params
});

// Tipos TypeScript derivados de los schemas
export type AddExperienceInput = z.infer<typeof AddExperienceSchema>;
export type UseConsumableInput = z.infer<typeof UseConsumableSchema>;
export type CharacterIdParam = z.infer<typeof CharacterIdParamSchema>;
