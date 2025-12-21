import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { User } from '../models/User';
import { verifyToken as verifyJwtToken } from '../middlewares/auth';

export class RealtimeService {
  private static instance: RealtimeService;
  private io: SocketServer;
  
  // Mapeo de usuarios conectados
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  private constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
  }

  public static initialize(server: Server): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService(server);
    }
    return RealtimeService.instance;
  }

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      throw new Error('RealtimeService no ha sido inicializado');
    }
    return RealtimeService.instance;
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`Nueva conexión: ${socket.id}`);

      // Autenticación del socket
      socket.on('auth', async (token: string) => {
        try {
          // Aquí deberías verificar el token y obtener el userId
          const userId = await this.verifyToken(token);
          this.registerUserSocket(userId, socket.id);
          
          // Unir al socket a la sala personal del usuario
          socket.join(`user:${userId}`);
          
          // Notificar conexión exitosa
          socket.emit('auth:success');
        } catch (error) {
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

  private async verifyToken(token: string): Promise<string> {
    // Verifica el JWT y retorna el userId si es válido
    const decoded = await verifyJwtToken(token);
    if (!decoded || !decoded.id) {
      throw new Error('Token inválido');
    }
    return decoded.id;
  }

  private registerUserSocket(userId: string, socketId: string): void {
    // Registrar el socket para el usuario
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    this.userSockets.get(userId)?.push(socketId);
    this.socketUsers.set(socketId, userId);
  }

  private handleDisconnect(socketId: string): void {
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
  public emitRaw(event: string, payload: any): void {
    this.io.emit(event, payload);
  }

  // Helper para emitir a un usuario específico por su sala
  public emitToUser(userId: string, event: string, payload: any): void {
    this.io.to(`user:${userId}`).emit(event, payload);
  }

  // Notificar cambios en el inventario
  public notifyInventoryUpdate(userId: string, inventory: any): void {
    this.emitToUser(userId, 'inventory:update', inventory);
  }

  // Notificar nueva recompensa o item obtenido
  public notifyReward(userId: string, reward: any): void {
    this.emitToUser(userId, 'reward:received', reward);
  }

  // Notificar cambios en el estado del personaje
  public notifyCharacterUpdate(userId: string, characterId: string, updates: any): void {
    this.emitToUser(userId, 'character:update', { characterId, ...updates });
  }

  // Nuevo: Notificar subida de nivel de personaje (normalizado)
  public notifyCharacterLevelUp(
    userId: string,
    characterId: string,
    newLevel: number,
    levelsGained: number,
    statsDelta?: { atk?: number; defensa?: number; vida?: number }
  ): void {
    this.emitToUser(userId, 'character:level-up', {
      characterId,
      level: newLevel,
      levelsGained,
      statsDelta: statsDelta || {},
      timestamp: new Date().toISOString()
    });
  }

  // Nuevo: Notificar evolución de personaje
  public notifyCharacterEvolved(
    userId: string,
    characterId: string,
    etapaNueva: number
  ): void {
    this.emitToUser(userId, 'character:evolved', {
      characterId,
      etapa: etapaNueva,
      timestamp: new Date().toISOString()
    });
  }

  // Notificar eventos del marketplace
  public notifyMarketplaceUpdate(type: 'new'|'sold'|'cancelled'|'refresh', data: any): void {
    this.io.emit('marketplace:update', { type, data });
  }

  // Nuevos: eventos marketplace normalizados (manteniendo legacy update)
  public notifyMarketplaceItemListed(listing: any): void {
    const payload = { listing, timestamp: new Date().toISOString() };
    this.emitRaw('marketplace:item:listed', payload);
    this.notifyMarketplaceUpdate('new', payload);
  }

  public notifyMarketplaceItemSold(listingId: string, buyerId: string, priceVal: number): void {
    const payload = { listingId, buyerId, priceVal, timestamp: new Date().toISOString() };
    this.emitRaw('marketplace:item:sold', payload);
    this.notifyMarketplaceUpdate('sold', payload);
  }

  public notifyMarketplaceItemCancelled(listingId: string, reason?: string): void {
    const payload = { listingId, reason, timestamp: new Date().toISOString() };
    this.emitRaw('marketplace:item:cancelled', payload);
    this.notifyMarketplaceUpdate('cancelled', payload);
  }

  // Survival wave nueva
  public notifySurvivalWaveNew(sessionId: string, waveNumber: number, enemiesRemaining: number): void {
    this.io.emit('survival:wave:new', {
      sessionId,
      waveNumber,
      enemiesRemaining,
      timestamp: new Date().toISOString()
    });
  }

  // Survival end
  public notifySurvivalEnd(sessionId: string, totalWaves: number, durationMs: number, rewards: any): void {
    this.io.emit('survival:end', {
      sessionId,
      totalWaves,
      durationMs,
      rewards,
      timestamp: new Date().toISOString()
    });
  }

  // Chat: mensaje global normalizado (+ mantener compatibilidad si aplica desde capa de chat)
  public notifyChatMessageNew(message: { id?: string; senderId: string; senderName?: string; content: string; room?: 'global'|'party'|'private'; createdAt?: string }): void {
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
  public notifyNotificationNew(userId: string, notification: any): void {
    this.emitToUser(userId, 'notification:new', {
      notification,
      timestamp: new Date().toISOString()
    });
  }

  public notifyNotificationRead(userId: string, notificationId: string): void {
    this.emitToUser(userId, 'notification:read', {
      notificationId,
      timestamp: new Date().toISOString()
    });
  }

  // Pagos: estado (web2/web3)
  public notifyPaymentStatus(userId: string, status: { id?: string; provider: 'stripe'|'blockchain'|'manual'; state: 'initiated'|'pending'|'confirmed'|'failed'|'refunded'; meta?: any }): void {
    this.emitToUser(userId, 'payments:status', {
      ...status,
      timestamp: new Date().toISOString()
    });
  }

  // Notificar eventos globales
  public notifyGlobalEvent(eventData: any): void {
    this.io.emit('game:event', eventData);
  }

  // Notificar cambios en rankings
  public notifyRankingUpdate(rankings: any): void {
    this.io.emit('rankings:update', rankings);
  }

  // Notificar batalla en vivo (para espectadores)
  public notifyBattleUpdate(battleId: string, battleState: any): void {
    this.io.to(`battle:${battleId}`).emit('battle:update', battleState);
  }
}