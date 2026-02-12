"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamIdParamSchema = exports.updateTeamSchema = exports.createTeamSchema = void 0;
const zod_1 = require("zod");
// Validación para crear equipo
exports.createTeamSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'El nombre del equipo es requerido')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .trim(),
    characters: zod_1.z.array(zod_1.z.string())
        .min(1, 'Debe seleccionar al menos 1 personaje')
        .max(9, 'No puede seleccionar más de 9 personajes')
});
// Validación para actualizar equipo
exports.updateTeamSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'El nombre del equipo es requerido')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .trim()
        .optional(),
    characters: zod_1.z.array(zod_1.z.string())
        .min(1, 'Debe seleccionar al menos 1 personaje')
        .max(9, 'No puede seleccionar más de 9 personajes')
        .optional(),
    isActive: zod_1.z.boolean().optional()
});
// Validación para parámetros de ruta
exports.teamIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de equipo inválido')
});
