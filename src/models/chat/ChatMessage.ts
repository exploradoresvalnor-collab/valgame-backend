import mongoose, { Document, Schema } from 'mongoose';

// Tipos de chat
export type ChatType = 'global' | 'party' | 'private';

// Interfaz para mensajes de chat
export interface IChatMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  type: ChatType;
  content: string;
  recipientId?: mongoose.Types.ObjectId; // Para mensajes privados
  partyId?: mongoose.Types.ObjectId; // Para mensajes de party
  isSystemMessage: boolean;
  createdAt: Date;
}

// Schema para mensajes de chat
const chatMessageSchema = new Schema<IChatMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  senderName: {
    type: String,
    required: true,
    maxlength: 50
  },
  type: {
    type: String,
    enum: ['global', 'party', 'private'],
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type === 'private';
    }
  },
  partyId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: function() {
      return this.type === 'party';
    }
  },
  isSystemMessage: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'chat_messages'
});

// Índices para optimización
chatMessageSchema.index({ type: 1, createdAt: -1 });
chatMessageSchema.index({ recipientId: 1, createdAt: -1 });
chatMessageSchema.index({ partyId: 1, createdAt: -1 });
chatMessageSchema.index({ createdAt: -1 }); // Para obtener mensajes recientes

// Validación personalizada
chatMessageSchema.pre('save', function(next) {
  // Validar que el contenido no esté vacío después de trim
  if (!this.content || this.content.trim().length === 0) {
    const error = new Error('El contenido del mensaje no puede estar vacío');
    return next(error);
  }

  // Validar lógica de tipos
  if (this.type === 'private' && !this.recipientId) {
    const error = new Error('Los mensajes privados requieren un destinatario');
    return next(error);
  }

  if (this.type === 'party' && !this.partyId) {
    const error = new Error('Los mensajes de party requieren un partyId');
    return next(error);
  }

  next();
});

const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);

export default ChatMessage;