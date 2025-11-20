"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelListingDTO = exports.BuyItemDTO = exports.SearchFiltersDTO = exports.CreateListingDTO = exports.PRECIOS_MINIMOS = exports.MARKETPLACE_LIMITS = void 0;
exports.validatePrecioByType = validatePrecioByType;
exports.sanitizeMetadata = sanitizeMetadata;
const zod_1 = require("zod");
// Configuración de límites del marketplace
exports.MARKETPLACE_LIMITS = {
    MAX_PRECIO: 1000000,
    MIN_PRECIO_PERSONAJE: 100,
    MIN_PRECIO_EQUIPAMIENTO: 10,
    MIN_PRECIO_CONSUMIBLE: 5,
    MIN_PRECIO_ESPECIAL: 50,
    COSTO_DESTACAR: 100,
    MAX_DESCRIPCION_LENGTH: 500,
    MIN_DESCRIPCION_LENGTH: 10
};
// Precios mínimos por tipo de item
exports.PRECIOS_MINIMOS = {
    personaje: exports.MARKETPLACE_LIMITS.MIN_PRECIO_PERSONAJE,
    equipamiento: exports.MARKETPLACE_LIMITS.MIN_PRECIO_EQUIPAMIENTO,
    consumible: exports.MARKETPLACE_LIMITS.MIN_PRECIO_CONSUMIBLE,
    especial: exports.MARKETPLACE_LIMITS.MIN_PRECIO_ESPECIAL
};
// DTO para crear un listing
exports.CreateListingDTO = zod_1.z.object({
    itemId: zod_1.z.string()
        .min(1, 'ItemId es requerido')
        .regex(/^[a-f\d]{24}$/i, 'ItemId debe ser un ObjectId válido'),
    precio: zod_1.z.number()
        .int('El precio debe ser un número entero')
        .min(1, 'El precio debe ser mayor a 0')
        .max(exports.MARKETPLACE_LIMITS.MAX_PRECIO, `El precio máximo permitido es ${exports.MARKETPLACE_LIMITS.MAX_PRECIO.toLocaleString()} VAL`),
    destacar: zod_1.z.boolean()
        .optional()
        .default(false),
    // ⚠️ SEGURIDAD: El metadata NO debe venir del cliente
    // Se genera automáticamente en el backend consultando los datos reales
    metadata: zod_1.z.object({}).optional().transform(() => undefined)
});
// DTO para filtros de búsqueda
exports.SearchFiltersDTO = zod_1.z.object({
    // 🔍 Búsqueda por texto (NUEVO)
    search: zod_1.z.string()
        .min(2, 'La búsqueda debe tener al menos 2 caracteres')
        .max(50, 'La búsqueda no puede exceder 50 caracteres')
        .optional(),
    // Filtro por tipo de item
    type: zod_1.z.enum(['personaje', 'equipamiento', 'consumible', 'especial'])
        .optional(),
    // Filtro por rango
    rango: zod_1.z.enum(['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'])
        .optional(),
    // 🎮 Filtro por etapa (NUEVO - solo para personajes)
    etapa: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(1).max(3).optional()),
    // Filtros de precio
    precioMin: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(0).optional()),
    precioMax: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(0).optional()),
    // Filtros de nivel (solo para personajes)
    nivelMin: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(1).max(100).optional()),
    nivelMax: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(1).max(100).optional()),
    // ⚔️ Filtros de stats (NUEVO)
    atkMin: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(0).optional()),
    atkMax: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(0).optional()),
    vidaMin: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(0).optional()),
    vidaMax: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(0).optional()),
    defensaMin: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(0).optional()),
    defensaMax: zod_1.z.preprocess((val) => val ? Number(val) : undefined, zod_1.z.number().min(0).optional()),
    // Solo items destacados
    destacados: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean().optional()),
    // Paginación
    limit: zod_1.z.preprocess((val) => val ? Number(val) : 20, zod_1.z.number().min(1).max(100).default(20)),
    offset: zod_1.z.preprocess((val) => val ? Number(val) : 0, zod_1.z.number().min(0).default(0)),
    // Ordenamiento
    sortBy: zod_1.z.enum(['precio', 'fechaCreacion', 'destacado', 'nivel', 'atk'])
        .optional()
        .default('fechaCreacion'),
    sortOrder: zod_1.z.enum(['asc', 'desc'])
        .optional()
        .default('desc')
});
// DTO para comprar un item
exports.BuyItemDTO = zod_1.z.object({
    listingId: zod_1.z.string()
        .min(1, 'ListingId es requerido')
        .regex(/^[a-f\d]{24}$/i, 'ListingId debe ser un ObjectId válido')
});
// DTO para cancelar un listing
exports.CancelListingDTO = zod_1.z.object({
    listingId: zod_1.z.string()
        .min(1, 'ListingId es requerido')
        .regex(/^[a-f\d]{24}$/i, 'ListingId debe ser un ObjectId válido')
});
// Validador de precio según tipo de item
function validatePrecioByType(type, precio) {
    const precioMinimo = exports.PRECIOS_MINIMOS[type] || 1;
    if (precio < precioMinimo) {
        return {
            valid: false,
            error: `El precio mínimo para ${type} es ${precioMinimo} VAL`
        };
    }
    if (precio > exports.MARKETPLACE_LIMITS.MAX_PRECIO) {
        return {
            valid: false,
            error: `El precio máximo permitido es ${exports.MARKETPLACE_LIMITS.MAX_PRECIO.toLocaleString()} VAL`
        };
    }
    return { valid: true };
}
// Sanitizador de metadata (elimina campos peligrosos)
function sanitizeMetadata(metadata) {
    // Lista blanca de campos permitidos
    const allowedFields = [
        'nombre', 'imagen', 'descripcion', 'rango',
        'nivel', 'etapa', 'stats', 'progreso', 'usos',
        'durabilidad', 'saludActual', 'saludMaxima', 'estado',
        'fechaHerido', 'equipamiento', 'activeBuffs'
    ];
    const sanitized = {};
    for (const field of allowedFields) {
        if (metadata[field] !== undefined) {
            sanitized[field] = metadata[field];
        }
    }
    return sanitized;
}
