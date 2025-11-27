import { z } from 'zod';

// Tipos de chat
export const ChatTypeSchema = z.enum(['global', 'party', 'private']);

// Schema para enviar mensaje global
export const SendGlobalMessageSchema = z.object({
  content: z.string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(500, 'El mensaje no puede tener más de 500 caracteres')
    .trim()
});

// Schema para enviar mensaje privado
export const SendPrivateMessageSchema = z.object({
  content: z.string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(500, 'El mensaje no puede tener más de 500 caracteres')
    .trim(),
  recipientId: z.string()
    .min(1, 'El ID del destinatario es requerido')
});

// Schema para enviar mensaje de party
export const SendPartyMessageSchema = z.object({
  content: z.string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(500, 'El mensaje no puede tener más de 500 caracteres')
    .trim(),
  partyId: z.string()
    .min(1, 'El ID del equipo es requerido')
});

// Schema para obtener mensajes
export const GetMessagesSchema = z.object({
  type: ChatTypeSchema.optional(),
  limit: z.number()
    .min(1, 'El límite debe ser al menos 1')
    .max(100, 'El límite máximo es 100')
    .optional()
    .default(50),
  before: z.string().optional(), // ID del mensaje para paginación
  partyId: z.string().optional(), // Para filtrar mensajes de un party específico
  recipientId: z.string().optional() // Para filtrar mensajes privados con un usuario específico
});

// Schema para parámetros de ruta
export const MessageIdParamSchema = z.object({
  id: z.string().min(1, 'ID de mensaje requerido')
});

export const PartyIdParamSchema = z.object({
  partyId: z.string().min(1, 'ID de equipo requerido')
});