"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dungeonConfigSchema = exports.transactionSchema = exports.purchaseSchema = exports.gameActionSchema = exports.characterSchema = exports.itemEffectsSchema = exports.statsSchema = exports.objectIdSchema = void 0;
const zod_1 = require("zod");
const mongodb_1 = require("mongodb");
// Esquema para validar ObjectId de MongoDB
exports.objectIdSchema = zod_1.z.string().refine((val) => mongodb_1.ObjectId.isValid(val), { message: 'ID inválido' });
// Validación de stats base del juego
exports.statsSchema = zod_1.z.object({
    atk: zod_1.z.number().min(0, 'El ataque no puede ser negativo'),
    vida: zod_1.z.number().min(1, 'La vida debe ser al menos 1'),
    defensa: zod_1.z.number().min(0, 'La defensa no puede ser negativa')
});
// Validación de efectos de items
exports.itemEffectsSchema = zod_1.z.object({
    mejora_atk: zod_1.z.number().optional(),
    mejora_defensa: zod_1.z.number().optional(),
    mejora_vida: zod_1.z.number().optional(),
    mejora_xp_porcentaje: zod_1.z.number().optional(),
    duracion_segundos: zod_1.z.number().optional()
});
// Validación de personaje
exports.characterSchema = zod_1.z.object({
    personajeId: zod_1.z.string().min(1, 'ID de personaje requerido'),
    rango: zod_1.z.enum(['D', 'C', 'B', 'A', 'S', 'SS', 'SSS']),
    nivel: zod_1.z.number().min(1).max(100),
    etapa: zod_1.z.number().min(1).max(3),
    progreso: zod_1.z.number().min(0),
    stats: exports.statsSchema,
    saludActual: zod_1.z.number().min(0),
    saludMaxima: zod_1.z.number().min(1),
    estado: zod_1.z.enum(['saludable', 'herido']),
    fechaHerido: zod_1.z.date().nullable(),
    equipamiento: zod_1.z.array(exports.objectIdSchema),
    activeBuffs: zod_1.z.array(zod_1.z.object({
        consumableId: exports.objectIdSchema,
        effects: exports.itemEffectsSchema,
        expiresAt: zod_1.z.date()
    }))
});
// Validación de acción de juego
exports.gameActionSchema = zod_1.z.object({
    characterId: zod_1.z.string().min(1, 'ID de personaje requerido'),
    targetId: zod_1.z.string().optional(),
    actionType: zod_1.z.enum([
        'attack',
        'defend',
        'use_item',
        'enter_dungeon',
        'leave_dungeon'
    ]),
    itemId: exports.objectIdSchema.optional(),
    cantidad: zod_1.z.number().min(1).optional()
});
// Validación de compra
exports.purchaseSchema = zod_1.z.object({
    itemId: exports.objectIdSchema,
    cantidad: zod_1.z.number().min(1),
    currency: zod_1.z.enum(['val', 'boletos']),
    precio: zod_1.z.number().min(0)
});
// Validación de transacción
exports.transactionSchema = zod_1.z.object({
    tipo: zod_1.z.enum(['compra', 'venta', 'uso', 'recompensa']),
    itemId: exports.objectIdSchema,
    cantidad: zod_1.z.number().min(1),
    precio: zod_1.z.number().min(0).optional(),
    currency: zod_1.z.enum(['val', 'boletos']).optional()
});
// Validación de configuración de mazmorra
exports.dungeonConfigSchema = zod_1.z.object({
    nivel_minimo: zod_1.z.number().min(1),
    nivel_recomendado: zod_1.z.number().min(1),
    dificultad: zod_1.z.enum(['facil', 'normal', 'dificil', 'pesadilla']),
    recompensas: zod_1.z.array(zod_1.z.object({
        itemId: exports.objectIdSchema,
        probabilidad: zod_1.z.number().min(0).max(100),
        cantidad_min: zod_1.z.number().min(1),
        cantidad_max: zod_1.z.number().min(1)
    })),
    tiempo_limite_minutos: zod_1.z.number().min(1).optional()
});
