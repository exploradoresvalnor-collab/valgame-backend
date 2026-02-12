"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const socket_io_1 = require("socket.io");
const auth_1 = require("../middlewares/auth");
class RealtimeService {
    constructor(server) {
        // Mapeo de usuarios conectados
        this.userSockets = new Map(); // userId -> socketIds[]
        this.socketUsers = new Map(); // socketId -> userId
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "*",
                methods: ["GET", "POST"]
            }
        });
        this.setupSocketHandlers();
    }
    static initialize(server) {
        if (!RealtimeService.instance) {
            RealtimeService.instance = new RealtimeService(server);
        }
        return RealtimeService.instance;
    }
    static getInstance() {
        if (!RealtimeService.instance) {
            throw new Error('RealtimeService no ha sido inicializado');
        }
        return RealtimeService.instance;
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Nueva conexión: ${socket.id}`);
            // Autenticación del socket
            socket.on('auth', async (token) => {
                try {
                    // Aquí deberías verificar el token y obtener el userId
                    const userId = await this.verifyToken(token);
                    this.registerUserSocket(userId, socket.id);
                    // Unir al socket a la sala personal del usuario
                    socket.join(`user:${userId}`);
                    // Notificar conexión exitosa
                    socket.emit('auth:success');
                }
                catch (error) {
                    socket.emit('auth:error', { message: 'Autenticación fallida' });
                    socket.disconnect();
                }
            });
            // Manejo de desconexión
            socket.on('disconnect', () => {
                this.handleDisconnect(socket.id);
            });
        });
    }
    async verifyToken(token) {
        // Verifica el JWT y retorna el userId si es válido
        const decoded = await (0, auth_1.verifyToken)(token);
        if (!decoded || !decoded.id) {
            throw new Error('Token inválido');
        }
        return decoded.id;
    }
    registerUserSocket(userId, socketId) {
        // Registrar el socket para el usuario
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, []);
        }
        this.userSockets.get(userId)?.push(socketId);
        this.socketUsers.set(socketId, userId);
    }
    handleDisconnect(socketId) {
        const userId = this.socketUsers.get(socketId);
        if (userId) {
            // Eliminar el socket de los registros
            const userSocketIds = this.userSockets.get(userId) || [];
            this.userSockets.set(userId, userSocketIds.filter(id => id !== socketId));
            this.socketUsers.delete(socketId);
        }
    }
    // Métodos para enviar actualizaciones en tiempo real
    // Emisión cruda (para nuevos eventos específicos) - opcional
    emitRaw(event, payload) {
        this.io.emit(event, payload);
    }
    // Helper para emitir a un usuario específico por su sala
    emitToUser(userId, event, payload) {
        this.io.to(`user:${userId}`).emit(event, payload);
    }
    // Notificar cambios en el inventario
    notifyInventoryUpdate(userId, inventory) {
        this.emitToUser(userId, 'inventory:update', inventory);
    }
    // Notificar nueva recompensa o item obtenido
    notifyReward(userId, reward) {
        this.emitToUser(userId, 'reward:received', reward);
    }
    // Notificar cambios en el estado del personaje
    notifyCharacterUpdate(userId, characterId, updates) {
        this.emitToUser(userId, 'character:update', { characterId, ...updates });
    }
    // Nuevo: Notificar subida de nivel de personaje (normalizado)
    notifyCharacterLevelUp(userId, characterId, newLevel, levelsGained, statsDelta) {
        this.emitToUser(userId, 'character:level-up', {
            characterId,
            level: newLevel,
            levelsGained,
            statsDelta: statsDelta || {},
            timestamp: new Date().toISOString()
        });
    }
    // Nuevo: Notificar evolución de personaje
    notifyCharacterEvolved(userId, characterId, etapaNueva) {
        this.emitToUser(userId, 'character:evolved', {
            characterId,
            etapa: etapaNueva,
            timestamp: new Date().toISOString()
        });
    }
    // Notificar eventos del marketplace
    notifyMarketplaceUpdate(type, data) {
        this.io.emit('marketplace:update', { type, data });
    }
    // Nuevos: eventos marketplace normalizados (manteniendo legacy update)
    notifyMarketplaceItemListed(listing) {
        const payload = { listing, timestamp: new Date().toISOString() };
        this.emitRaw('marketplace:item:listed', payload);
        this.notifyMarketplaceUpdate('new', payload);
    }
    notifyMarketplaceItemSold(listingId, buyerId, priceVal) {
        const payload = { listingId, buyerId, priceVal, timestamp: new Date().toISOString() };
        this.emitRaw('marketplace:item:sold', payload);
        this.notifyMarketplaceUpdate('sold', payload);
    }
    notifyMarketplaceItemCancelled(listingId, reason) {
        const payload = { listingId, reason, timestamp: new Date().toISOString() };
        this.emitRaw('marketplace:item:cancelled', payload);
        this.notifyMarketplaceUpdate('cancelled', payload);
    }
    // Survival wave nueva
    notifySurvivalWaveNew(sessionId, waveNumber, enemiesRemaining) {
        this.io.emit('survival:wave:new', {
            sessionId,
            waveNumber,
            enemiesRemaining,
            timestamp: new Date().toISOString()
        });
    }
    // Survival end
    notifySurvivalEnd(sessionId, totalWaves, durationMs, rewards) {
        this.io.emit('survival:end', {
            sessionId,
            totalWaves,
            durationMs,
            rewards,
            timestamp: new Date().toISOString()
        });
    }
    // Chat: mensaje global normalizado (+ mantener compatibilidad si aplica desde capa de chat)
    notifyChatMessageNew(message) {
        const payload = {
            id: message.id,
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
            type: message.room || 'global',
            createdAt: message.createdAt || new Date().toISOString()
        };
        this.emitRaw('chat:message:new', payload);
    }
    // Notificaciones: nueva y leída
    notifyNotificationNew(userId, notification) {
        this.emitToUser(userId, 'notification:new', {
            notification,
            timestamp: new Date().toISOString()
        });
    }
    notifyNotificationRead(userId, notificationId) {
        this.emitToUser(userId, 'notification:read', {
            notificationId,
            timestamp: new Date().toISOString()
        });
    }
    // Pagos: estado (web2/web3)
    notifyPaymentStatus(userId, status) {
        this.emitToUser(userId, 'payments:status', {
            ...status,
            timestamp: new Date().toISOString()
        });
    }
    // Notificar eventos globales
    notifyGlobalEvent(eventData) {
        this.io.emit('game:event', eventData);
    }
    // Notificar cambios en rankings
    notifyRankingUpdate(rankings) {
        this.io.emit('rankings:update', rankings);
    }
    // Helper para obtener sockets de un usuario
    getUserSockets(userId) {
        return this.userSockets.get(userId) || [];
    }
    // Unir socket a sala de batalla
    joinBattleRoom(socketId, battleId) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
            socket.join(`battle:${battleId}`);
        }
    }
    // Notificar batalla en vivo (para espectadores)
    notifyBattleUpdate(battleId, battleState) {
        this.io.to(`battle:${battleId}`).emit('battle:update', battleState);
    }
    // Notificar daño recibido en combate (para el jugador afectado)
    notifyCombatDamage(playerId, damageData) {
        this.emitToUser(playerId, 'combat:damage', {
            ...damageData,
            timestamp: new Date().toISOString()
        });
    }
    // Notificar fin de survival con recompensas
    notifySurvivalEndToUser(userId, sessionId, totalWaves, durationMs, rewards) {
        this.emitToUser(userId, 'survival:end', {
            sessionId,
            totalWaves,
            durationMs,
            rewards,
            timestamp: new Date().toISOString()
        });
    }
}
exports.RealtimeService = RealtimeService;
