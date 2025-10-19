import { z } from 'zod';

// Esquemas de validación básicos
export const emailSchema = z.string().email('Email inválido');
export const usernameSchema = z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(30, 'El nombre de usuario no puede exceder 30 caracteres');
export const passwordSchema = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres');

// Esquema para stats
export const statsSchema = z.object({
  atk: z.number().min(0),
  vida: z.number().min(0),
  defensa: z.number().min(0)
});

// Esquema para buffs activos
export const activeBuffSchema = z.object({
  consumableId: z.string(),
  effects: z.object({
    mejora_atk: z.number().optional(),
    mejora_defensa: z.number().optional(),
    mejora_vida: z.number().optional(),
    mejora_xp_porcentaje: z.number().optional()
  }),
  expiresAt: z.date()
});

// Esquema para personajes
export const personajeSchema = z.object({
  personajeId: z.string(),
  rango: z.enum(['D', 'C', 'B', 'A', 'S', 'SS', 'SSS']),
  nivel: z.number().min(1).max(100),
  etapa: z.number().min(1).max(3),
  progreso: z.number().min(0),
  stats: statsSchema,
  saludActual: z.number().min(0),
  saludMaxima: z.number().min(0),
  estado: z.enum(['saludable', 'herido']),
  fechaHerido: z.date().nullable(),
  equipamiento: z.array(z.string()),
  activeBuffs: z.array(activeBuffSchema)
});

// Esquema para consumibles en inventario
export const consumableItemSchema = z.object({
  consumableId: z.string(),
  usos_restantes: z.number().min(0)
});

// Esquema principal de usuario
export const userSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  val: z.number().min(0),
  boletos: z.number().min(0),
  evo: z.number().min(0),
  invocaciones: z.number().min(0),
  evoluciones: z.number().min(0),
  boletosDiarios: z.number().min(0).max(10),
  personajes: z.array(personajeSchema),
  inventarioEquipamiento: z.array(z.string()),
  inventarioConsumibles: z.array(consumableItemSchema),
  limiteInventarioEquipamiento: z.number().min(1),
  limiteInventarioConsumibles: z.number().min(1),
  personajeActivoId: z.string().optional()
});