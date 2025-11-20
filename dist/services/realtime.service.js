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
    // Notificar cambios en el inventario
    notifyInventoryUpdate(userId, inventory) {
        this.io.to(`user:${userId}`).emit('inventory:update', inventory);
    }
    // Notificar nueva recompensa o item obtenido
    notifyReward(userId, reward) {
        this.io.to(`user:${userId}`).emit('reward:received', reward);
    }
    // Notificar cambios en el estado del personaje
    notifyCharacterUpdate(userId, characterId, updates) {
        this.io.to(`user:${userId}`).emit('character:update', { characterId, ...updates });
    }
    // Notificar eventos del marketplace
    notifyMarketplaceUpdate(type, data) {
        this.io.emit('marketplace:update', { type, data });
    }
    // Notificar eventos globales
    notifyGlobalEvent(eventData) {
        this.io.emit('game:event', eventData);
    }
    // Notificar cambios en rankings
    notifyRankingUpdate(rankings) {
        this.io.emit('rankings:update', rankings);
    }
    // Notificar batalla en vivo (para espectadores)
    notifyBattleUpdate(battleId, battleState) {
        this.io.to(`battle:${battleId}`).emit('battle:update', battleState);
    }
}
exports.RealtimeService = RealtimeService;
