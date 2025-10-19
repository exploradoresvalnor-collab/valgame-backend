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

  // Notificar cambios en el inventario
  public notifyInventoryUpdate(userId: string, inventory: any): void {
    this.io.to(`user:${userId}`).emit('inventory:update', inventory);
  }

  // Notificar nueva recompensa o item obtenido
  public notifyReward(userId: string, reward: any): void {
    this.io.to(`user:${userId}`).emit('reward:received', reward);
  }

  // Notificar cambios en el estado del personaje
  public notifyCharacterUpdate(userId: string, characterId: string, updates: any): void {
    this.io.to(`user:${userId}`).emit('character:update', { characterId, ...updates });
  }

  // Notificar eventos del marketplace
  public notifyMarketplaceUpdate(type: 'new'|'sold'|'cancelled'|'refresh', data: any): void {
    this.io.emit('marketplace:update', { type, data });
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