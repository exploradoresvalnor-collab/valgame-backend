import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Esquema para validar ObjectId de MongoDB
export const objectIdSchema = z.string().refine(
  (val) => ObjectId.isValid(val),
  { message: 'ID inválido' }
);

// Validación de stats base del juego
export const statsSchema = z.object({
  atk: z.number().min(0, 'El ataque no puede ser negativo'),
  vida: z.number().min(1, 'La vida debe ser al menos 1'),
  defensa: z.number().min(0, 'La defensa no puede ser negativa')
});

// Validación de efectos de items
export const itemEffectsSchema = z.object({
  mejora_atk: z.number().optional(),
  mejora_defensa: z.number().optional(),
  mejora_vida: z.number().optional(),
  mejora_xp_porcentaje: z.number().optional(),
  duracion_segundos: z.number().optional()
});

// Validación de personaje
export const characterSchema = z.object({
  personajeId: z.string().min(1, 'ID de personaje requerido'),
  rango: z.enum(['D', 'C', 'B', 'A', 'S', 'SS', 'SSS']),
  nivel: z.number().min(1).max(100),
  etapa: z.number().min(1).max(3),
  progreso: z.number().min(0),
  stats: statsSchema,
  saludActual: z.number().min(0),
  saludMaxima: z.number().min(1),
  estado: z.enum(['saludable', 'herido']),
  fechaHerido: z.date().nullable(),
  equipamiento: z.array(objectIdSchema),
  activeBuffs: z.array(z.object({
    consumableId: objectIdSchema,
    effects: itemEffectsSchema,
    expiresAt: z.date()
  }))
});

// Validación de acción de juego
export const gameActionSchema = z.object({
  characterId: z.string().min(1, 'ID de personaje requerido'),
  targetId: z.string().optional(),
  actionType: z.enum([
    'attack', 
    'defend', 
    'use_item', 
    'enter_dungeon',
    'leave_dungeon'
  ]),
  itemId: objectIdSchema.optional(),
  cantidad: z.number().min(1).optional()
});

// Validación de compra
export const purchaseSchema = z.object({
  itemId: objectIdSchema,
  cantidad: z.number().min(1),
  currency: z.enum(['val', 'boletos']),
  precio: z.number().min(0)
});

// Validación de transacción
export const transactionSchema = z.object({
  tipo: z.enum(['compra', 'venta', 'uso', 'recompensa']),
  itemId: objectIdSchema,
  cantidad: z.number().min(1),
  precio: z.number().min(0).optional(),
  currency: z.enum(['val', 'boletos']).optional()
});

// Validación de configuración de mazmorra
export const dungeonConfigSchema = z.object({
  nivel_minimo: z.number().min(1),
  nivel_recomendado: z.number().min(1),
  dificultad: z.enum(['facil', 'normal', 'dificil', 'pesadilla']),
  recompensas: z.array(z.object({
    itemId: objectIdSchema,
    probabilidad: z.number().min(0).max(100),
    cantidad_min: z.number().min(1),
    cantidad_max: z.number().min(1)
  })),
  tiempo_limite_minutos: z.number().min(1).optional()
});