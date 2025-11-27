import { Schema, model, Document } from 'mongoose';

// Interfaz para el token en blacklist
export interface ITokenBlacklist extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false
});

// Índice TTL para que MongoDB elimine automáticamente los tokens expirados
// TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = model<ITokenBlacklist>('TokenBlacklist', TokenBlacklistSchema, 'token_blacklist');
