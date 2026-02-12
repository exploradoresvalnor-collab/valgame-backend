"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCharacterSchema = exports.HealCharacterSchema = exports.EvolveCharacterSchema = exports.CharacterIdParamSchema = exports.UseConsumableSchema = exports.AddExperienceSchema = void 0;
const zod_1 = require("zod");
/**
 * Esquemas de Validación para Rutas de Personajes
 *
 * Estos esquemas validan los datos de entrada para las operaciones
 * relacionadas con personajes (experiencia, curación, resurrección, etc.)
 */
// Schema para añadir experiencia
exports.AddExperienceSchema = zod_1.z.object({
    amount: zod_1.z.number()
        .int('La cantidad de experiencia debe ser un número entero')
        .positive('La cantidad de experiencia debe ser mayor a 0')
        .max(10000, 'La cantidad máxima de experiencia por operación es 10000')
});
// Schema para usar consumibles
exports.UseConsumableSchema = zod_1.z.object({
    itemId: zod_1.z.string()
        .min(1, 'El ID del item es requerido')
        .regex(/^[0-9a-fA-F]{24}$/, 'El ID del item debe ser un ObjectId válido de MongoDB')
});
// Schema para parámetros de ruta (characterId)
exports.CharacterIdParamSchema = zod_1.z.object({
    characterId: zod_1.z.string()
        .min(1, 'El ID del personaje es requerido')
});
// Schema para evolucionar personaje (sin body, solo validación de params)
exports.EvolveCharacterSchema = zod_1.z.object({
// No requiere body, solo el characterId en params
});
// Schema para curar personaje (sin body, solo validación de params)
exports.HealCharacterSchema = zod_1.z.object({
// No requiere body, solo el characterId en params
});
// Schema para añadir personaje
exports.AddCharacterSchema = zod_1.z.object({
    personajeId: zod_1.z.string()
        .min(1, 'El ID del personaje es requerido'),
    rango: zod_1.z.enum(['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'])
});
