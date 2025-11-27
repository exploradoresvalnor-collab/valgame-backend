"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendPartyMessage = exports.sendPrivateMessage = exports.sendGlobalMessage = void 0;
const ChatMessage_1 = __importDefault(require("../../models/chat/ChatMessage"));
const chat_validations_1 = require("../../validations/chat/chat.validations");
// Enviar mensaje global
const sendGlobalMessage = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userName = req.user?.username;
        if (!userId || !userName) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Validar datos
        const validatedData = chat_validations_1.SendGlobalMessageSchema.parse(req.body);
        // Crear mensaje
        const message = new ChatMessage_1.default({
            senderId: userId,
            senderName: userName,
            type: 'global',
            content: validatedData.content,
            isSystemMessage: false
        });
        await message.save();
        return res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        console.error('[SEND-GLOBAL-MESSAGE] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al enviar mensaje global'
        });
    }
};
exports.sendGlobalMessage = sendGlobalMessage;
// Enviar mensaje privado
const sendPrivateMessage = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userName = req.user?.username;
        if (!userId || !userName) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Validar datos
        const validatedData = chat_validations_1.SendPrivateMessageSchema.parse(req.body);
        // Crear mensaje
        const message = new ChatMessage_1.default({
            senderId: userId,
            senderName: userName,
            type: 'private',
            content: validatedData.content,
            recipientId: validatedData.recipientId,
            isSystemMessage: false
        });
        await message.save();
        return res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        console.error('[SEND-PRIVATE-MESSAGE] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al enviar mensaje privado'
        });
    }
};
exports.sendPrivateMessage = sendPrivateMessage;
// Enviar mensaje de party
const sendPartyMessage = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userName = req.user?.username;
        if (!userId || !userName) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Validar datos
        const validatedData = chat_validations_1.SendPartyMessageSchema.parse(req.body);
        // Verificar que el usuario pertenece al equipo
        // TODO: Implementar verificación de membresía del equipo
        // Crear mensaje
        const message = new ChatMessage_1.default({
            senderId: userId,
            senderName: userName,
            type: 'party',
            content: validatedData.content,
            partyId: validatedData.partyId,
            isSystemMessage: false
        });
        await message.save();
        return res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        console.error('[SEND-PARTY-MESSAGE] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al enviar mensaje de equipo'
        });
    }
};
exports.sendPartyMessage = sendPartyMessage;
// Obtener mensajes
const getMessages = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Validar parámetros de consulta
        const validatedQuery = chat_validations_1.GetMessagesSchema.parse(req.query);
        // Construir query
        const query = {};
        if (validatedQuery.type) {
            query.type = validatedQuery.type;
        }
        // Filtrar mensajes según el tipo
        if (validatedQuery.type === 'private') {
            // Para mensajes privados, el usuario debe ser sender o recipient
            query.$or = [
                { senderId: userId },
                { recipientId: userId }
            ];
        }
        else if (validatedQuery.type === 'party') {
            // Para mensajes de party, verificar membresía del equipo
            if (validatedQuery.partyId) {
                query.partyId = validatedQuery.partyId;
                // TODO: Verificar que el usuario pertenece al equipo
            }
            else {
                // Si no se especifica partyId, obtener todos los mensajes de party del usuario
                // TODO: Implementar lógica para obtener parties del usuario
                query.type = 'global'; // Fallback a global si no hay parties
            }
        }
        // Paginación
        const limit = Number(validatedQuery.limit) || 50;
        let queryBuilder = ChatMessage_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(limit);
        if (validatedQuery.before) {
            queryBuilder = queryBuilder.where('_id').lt(validatedQuery.before);
        }
        const messages = await queryBuilder
            .populate('senderId', 'username')
            .populate('recipientId', 'username');
        return res.json({
            success: true,
            data: messages.reverse() // Más antiguos primero para chat
        });
    }
    catch (error) {
        console.error('[GET-MESSAGES] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener mensajes'
        });
    }
};
exports.getMessages = getMessages;
