import { z } from 'zod';

// Configuración de límites del marketplace
export const MARKETPLACE_LIMITS = {
  MAX_PRECIO: 1_000_000,
  MIN_PRECIO_PERSONAJE: 100,
  MIN_PRECIO_EQUIPAMIENTO: 10,
  MIN_PRECIO_CONSUMIBLE: 5,
  MIN_PRECIO_ESPECIAL: 50,
  COSTO_DESTACAR: 100,
  MAX_DESCRIPCION_LENGTH: 500,
  MIN_DESCRIPCION_LENGTH: 10
} as const;

// Precios mínimos por tipo de item
export const PRECIOS_MINIMOS: Record<string, number> = {
  personaje: MARKETPLACE_LIMITS.MIN_PRECIO_PERSONAJE,
  equipamiento: MARKETPLACE_LIMITS.MIN_PRECIO_EQUIPAMIENTO,
  consumible: MARKETPLACE_LIMITS.MIN_PRECIO_CONSUMIBLE,
  especial: MARKETPLACE_LIMITS.MIN_PRECIO_ESPECIAL
};

// DTO para crear un listing
export const CreateListingDTO = z.object({
  itemId: z.string()
    .min(1, 'ItemId es requerido')
    .regex(/^[a-f\d]{24}$/i, 'ItemId debe ser un ObjectId válido'),
  
  precio: z.number()
    .int('El precio debe ser un número entero')
    .min(1, 'El precio debe ser mayor a 0')
    .max(MARKETPLACE_LIMITS.MAX_PRECIO, `El precio máximo permitido es ${MARKETPLACE_LIMITS.MAX_PRECIO.toLocaleString()} VAL`),
  
  destacar: z.boolean()
    .optional()
    .default(false),
  
  // ⚠️ SEGURIDAD: El metadata NO debe venir del cliente
  // Se genera automáticamente en el backend consultando los datos reales
  metadata: z.object({}).optional().transform(() => undefined)
});

export type CreateListingInput = z.infer<typeof CreateListingDTO>;

// DTO para filtros de búsqueda
export const SearchFiltersDTO = z.object({
  // 🔍 Búsqueda por texto (NUEVO)
  search: z.string()
    .min(2, 'La búsqueda debe tener al menos 2 caracteres')
    .max(50, 'La búsqueda no puede exceder 50 caracteres')
    .optional(),
  
  // Filtro por tipo de item
  type: z.enum(['personaje', 'equipamiento', 'consumible', 'especial'])
    .optional(),
  
  // Filtro por rango
  rango: z.enum(['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'])
    .optional(),
  
  // 🎮 Filtro por etapa (NUEVO - solo para personajes)
  etapa: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(1).max(3).optional()
  ),
  
  // Filtros de precio
  precioMin: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
  precioMax: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
  
  // Filtros de nivel (solo para personajes)
  nivelMin: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(1).max(100).optional()
  ),
  nivelMax: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(1).max(100).optional()
  ),
  
  // ⚔️ Filtros de stats (NUEVO)
  atkMin: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
  atkMax: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
  vidaMin: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
  vidaMax: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
  defensaMin: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
  defensaMax: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
  
  // Solo items destacados
  destacados: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional()
  ),
  
  // Paginación
  limit: z.preprocess(
    (val) => val ? Number(val) : 20,
    z.number().min(1).max(100).default(20)
  ),
  offset: z.preprocess(
    (val) => val ? Number(val) : 0,
    z.number().min(0).default(0)
  ),
  
  // Ordenamiento
  sortBy: z.enum(['precio', 'fechaCreacion', 'destacado', 'nivel', 'atk'])
    .optional()
    .default('fechaCreacion'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc')
});

export type SearchFilters = z.infer<typeof SearchFiltersDTO>;

// DTO para comprar un item
export const BuyItemDTO = z.object({
  listingId: z.string()
    .min(1, 'ListingId es requerido')
    .regex(/^[a-f\d]{24}$/i, 'ListingId debe ser un ObjectId válido')
});

export type BuyItemInput = z.infer<typeof BuyItemDTO>;

// DTO para cancelar un listing
export const CancelListingDTO = z.object({
  listingId: z.string()
    .min(1, 'ListingId es requerido')
    .regex(/^[a-f\d]{24}$/i, 'ListingId debe ser un ObjectId válido')
});

export type CancelListingInput = z.infer<typeof CancelListingDTO>;

// Validador de precio según tipo de item
export function validatePrecioByType(type: string, precio: number): { valid: boolean; error?: string } {
  const precioMinimo = PRECIOS_MINIMOS[type] || 1;
  
  if (precio < precioMinimo) {
    return {
      valid: false,
      error: `El precio mínimo para ${type} es ${precioMinimo} VAL`
    };
  }
  
  if (precio > MARKETPLACE_LIMITS.MAX_PRECIO) {
    return {
      valid: false,
      error: `El precio máximo permitido es ${MARKETPLACE_LIMITS.MAX_PRECIO.toLocaleString()} VAL`
    };
  }
  
  return { valid: true };
}

// Sanitizador de metadata (elimina campos peligrosos)
export function sanitizeMetadata(metadata: any): any {
  // Lista blanca de campos permitidos
  const allowedFields = [
    'nombre', 'imagen', 'descripcion', 'rango',
    'nivel', 'etapa', 'stats', 'progreso', 'usos',
    'durabilidad', 'saludActual', 'saludMaxima', 'estado',
    'fechaHerido', 'equipamiento', 'activeBuffs'
  ];
  
  const sanitized: any = {};
  
  for (const field of allowedFields) {
    if (metadata[field] !== undefined) {
      sanitized[field] = metadata[field];
    }
  }
  
  return sanitized;
}
