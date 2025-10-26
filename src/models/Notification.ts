import { Schema, model, Document, Types } from 'mongoose';

// Tipos de notificaciones disponibles
export type NotificationType = 
  | 'dungeon_victory' 
  | 'dungeon_defeat' 
  | 'character_healed' 
  | 'character_leveled_up'
  | 'marketplace_sale' 
  | 'marketplace_purchase'
  | 'package_opened'
  | 'system_announcement'
  | 'daily_reward';

// Interfaz para el modelo de Notificación
export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  // Datos adicionales opcionales (para referencias específicas)
  metadata?: {
    dungeonId?: string;
    characterId?: string;
    itemId?: string;
    transactionId?: string;
    amount?: number;
  };
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'dungeon_victory',
      'dungeon_defeat',
      'character_healed',
      'character_leveled_up',
      'marketplace_sale',
      'marketplace_purchase',
      'package_opened',
      'system_announcement',
      'daily_reward'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false
});

// Índice compuesto para consultas eficientes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Índice TTL para eliminar automáticamente notificaciones antiguas después de 30 días
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 días

export const Notification = model<INotification>('Notification', NotificationSchema, 'notifications');
