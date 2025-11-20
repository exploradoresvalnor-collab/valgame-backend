"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const socket_io_1 = require("socket.io");
const auth_1 = require("../middlewares/auth");
class ChatService {
    constructor(server) {
        this.messageHistory = new Map();
        this.userSockets = new Map();
        this.MAX_HISTORY = 100;
        this.RATE_LIMIT_WINDOW = 60000; // 1 minuto
        this.MAX_MESSAGES_PER_WINDOW = 30;
        this.messageCounter = new Map();
        this.io = new socket_io_1.Server(server, {
            path: '/chat',
            cors: {
                origin: process.env.FRONTEND_ORIGIN || '*',
                methods: ['GET', 'POST']
            }
        });
        this.setupSocketHandlers();
    }
    static initialize(server) {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService(server);
        }
        return ChatService.instance;
    }
    static getInstance() {
        if (!ChatService.instance) {
            throw new Error('ChatService no ha sido inicializado');
        }
        return ChatService.instance;
    }
    setupSocketHandlers() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('No autorizado'));
                }
                let decoded;
                try {
                    decoded = await (0, auth_1.verifyToken)(token);
                    if (!decoded || !decoded.id) {
                        return next(new Error('Token inválido'));
                    }
                }
                catch (err) {
                    return next(new Error('Error al verificar el token'));
                }
                socket.data.userId = decoded.id;
                socket.data.username = decoded.username;
                // Registrar socket para el usuario
                const userSockets = this.userSockets.get(decoded.id) || [];
                userSockets.push(socket.id);
                this.userSockets.set(decoded.id, userSockets);
                next();
            }
            catch (error) {
                next(new Error('Error de autenticación'));
            }
        });
        this.io.on('connection', (socket) => {
            console.log(`[CHAT] Usuario ${socket.data.username} conectado`);
            // Unirse al chat global
            socket.join('global');
            // Enviar historial reciente
            const globalHistory = this.messageHistory.get('global') || [];
            socket.emit('chat:history', globalHistory);
            socket.on('chat:message', (message) => {
                if (!this.checkRateLimit(socket.data.userId)) {
                    socket.emit('chat:error', 'Has excedido el límite de mensajes');
                    return;
                }
                const fullMessage = {
                    ...message,
                    from: socket.data.username,
                    timestamp: new Date()
                };
                this.handleMessage(fullMessage);
            });
            socket.on('disconnect', () => {
                console.log(`[CHAT] Usuario ${socket.data.username} desconectado`);
                // Limpiar registro de socket
                const userSockets = this.userSockets.get(socket.data.userId) || [];
                const updatedSockets = userSockets.filter(id => id !== socket.id);
                if (updatedSockets.length === 0) {
                    this.userSockets.delete(socket.data.userId);
                }
                else {
                    this.userSockets.set(socket.data.userId, updatedSockets);
                }
            });
        });
    }
    handleMessage(message) {
        // Guardar en historial
        const roomId = message.roomId || 'global';
        const history = this.messageHistory.get(roomId) || [];
        history.push(message);
        // Mantener tamaño máximo del historial
        if (history.length > this.MAX_HISTORY) {
            history.shift();
        }
        this.messageHistory.set(roomId, history);
        // Emitir mensaje
        if (message.type === 'private') {
            this.sendPrivateMessage(message);
        }
        else if (message.type === 'guild') {
            this.io.to(message.roomId).emit('chat:message', message);
        }
        else {
            this.io.to('global').emit('chat:message', message);
        }
    }
    sendPrivateMessage(message) {
        if (!message.to)
            return;
        // Obtener sockets del destinatario
        const recipientSockets = this.userSockets.get(message.to) || [];
        recipientSockets.forEach(socketId => {
            this.io.to(socketId).emit('chat:private', message);
        });
        // Enviar copia al remitente
        const senderSockets = this.userSockets.get(message.from) || [];
        senderSockets.forEach(socketId => {
            this.io.to(socketId).emit('chat:private', message);
        });
    }
    checkRateLimit(userId) {
        const now = Date.now();
        const userRate = this.messageCounter.get(userId) || { count: 0, lastReset: now };
        // Reiniciar contador si ha pasado la ventana de tiempo
        if (now - userRate.lastReset > this.RATE_LIMIT_WINDOW) {
            userRate.count = 0;
            userRate.lastReset = now;
        }
        // Verificar límite
        if (userRate.count >= this.MAX_MESSAGES_PER_WINDOW) {
            return false;
        }
        // Incrementar contador
        userRate.count++;
        this.messageCounter.set(userId, userRate);
        return true;
    }
}
exports.ChatService = ChatService;
