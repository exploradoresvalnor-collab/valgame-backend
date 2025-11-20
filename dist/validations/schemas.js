"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = exports.consumableItemSchema = exports.personajeSchema = exports.activeBuffSchema = exports.statsSchema = exports.passwordSchema = exports.usernameSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
// Esquemas de validación básicos
exports.emailSchema = zod_1.z.string().email('Email inválido');
exports.usernameSchema = zod_1.z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(30, 'El nombre de usuario no puede exceder 30 caracteres');
exports.passwordSchema = zod_1.z.string().min(8, 'La contraseña debe tener al menos 8 caracteres');
// Esquema para stats
exports.statsSchema = zod_1.z.object({
    atk: zod_1.z.number().min(0),
    vida: zod_1.z.number().min(0),
    defensa: zod_1.z.number().min(0)
});
// Esquema para buffs activos
exports.activeBuffSchema = zod_1.z.object({
    consumableId: zod_1.z.string(),
    effects: zod_1.z.object({
        mejora_atk: zod_1.z.number().optional(),
        mejora_defensa: zod_1.z.number().optional(),
        mejora_vida: zod_1.z.number().optional(),
        mejora_xp_porcentaje: zod_1.z.number().optional()
    }),
    expiresAt: zod_1.z.date()
});
// Esquema para personajes
exports.personajeSchema = zod_1.z.object({
    personajeId: zod_1.z.string(),
    rango: zod_1.z.enum(['D', 'C', 'B', 'A', 'S', 'SS', 'SSS']),
    nivel: zod_1.z.number().min(1).max(100),
    etapa: zod_1.z.number().min(1).max(3),
    progreso: zod_1.z.number().min(0),
    stats: exports.statsSchema,
    saludActual: zod_1.z.number().min(0),
    saludMaxima: zod_1.z.number().min(0),
    estado: zod_1.z.enum(['saludable', 'herido']),
    fechaHerido: zod_1.z.date().nullable(),
    equipamiento: zod_1.z.array(zod_1.z.string()),
    activeBuffs: zod_1.z.array(exports.activeBuffSchema)
});
// Esquema para consumibles en inventario
exports.consumableItemSchema = zod_1.z.object({
    consumableId: zod_1.z.string(),
    usos_restantes: zod_1.z.number().min(0)
});
// Esquema principal de usuario
exports.userSchema = zod_1.z.object({
    email: exports.emailSchema,
    username: exports.usernameSchema,
    val: zod_1.z.number().min(0),
    boletos: zod_1.z.number().min(0),
    evo: zod_1.z.number().min(0),
    invocaciones: zod_1.z.number().min(0),
    evoluciones: zod_1.z.number().min(0),
    boletosDiarios: zod_1.z.number().min(0).max(10),
    personajes: zod_1.z.array(exports.personajeSchema),
    inventarioEquipamiento: zod_1.z.array(zod_1.z.string()),
    inventarioConsumibles: zod_1.z.array(exports.consumableItemSchema),
    limiteInventarioEquipamiento: zod_1.z.number().min(1),
    limiteInventarioConsumibles: zod_1.z.number().min(1),
    personajeActivoId: zod_1.z.string().optional()
});
