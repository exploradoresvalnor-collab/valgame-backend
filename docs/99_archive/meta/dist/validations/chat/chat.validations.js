"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyIdParamSchema = exports.MessageIdParamSchema = exports.GetMessagesSchema = exports.SendPartyMessageSchema = exports.SendPrivateMessageSchema = exports.SendGlobalMessageSchema = exports.ChatTypeSchema = void 0;
const zod_1 = require("zod");
// Tipos de chat
exports.ChatTypeSchema = zod_1.z.enum(['global', 'party', 'private']);
// Schema para enviar mensaje global
exports.SendGlobalMessageSchema = zod_1.z.object({
    content: zod_1.z.string()
        .min(1, 'El mensaje no puede estar vacío')
        .max(500, 'El mensaje no puede tener más de 500 caracteres')
        .trim()
});
// Schema para enviar mensaje privado
exports.SendPrivateMessageSchema = zod_1.z.object({
    content: zod_1.z.string()
        .min(1, 'El mensaje no puede estar vacío')
        .max(500, 'El mensaje no puede tener más de 500 caracteres')
        .trim(),
    recipientId: zod_1.z.string()
        .min(1, 'El ID del destinatario es requerido')
});
// Schema para enviar mensaje de party
exports.SendPartyMessageSchema = zod_1.z.object({
    content: zod_1.z.string()
        .min(1, 'El mensaje no puede estar vacío')
        .max(500, 'El mensaje no puede tener más de 500 caracteres')
        .trim(),
    partyId: zod_1.z.string()
        .min(1, 'El ID del equipo es requerido')
});
// Schema para obtener mensajes
exports.GetMessagesSchema = zod_1.z.object({
    type: exports.ChatTypeSchema.optional(),
    limit: zod_1.z.number()
        .min(1, 'El límite debe ser al menos 1')
        .max(100, 'El límite máximo es 100')
        .optional()
        .default(50),
    before: zod_1.z.string().optional(), // ID del mensaje para paginación
    partyId: zod_1.z.string().optional(), // Para filtrar mensajes de un party específico
    recipientId: zod_1.z.string().optional() // Para filtrar mensajes privados con un usuario específico
});
// Schema para parámetros de ruta
exports.MessageIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID de mensaje requerido')
});
exports.PartyIdParamSchema = zod_1.z.object({
    partyId: zod_1.z.string().min(1, 'ID de equipo requerido')
});
