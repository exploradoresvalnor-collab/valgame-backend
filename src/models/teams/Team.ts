import { Schema, model, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  userId: Types.ObjectId;
  name: string;
  characters: Types.ObjectId[]; // IDs de personajes del usuario
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true,
    maxlength: 50,
    trim: true
  },
  characters: [{
    type: Schema.Types.ObjectId,
    ref: 'User.characters', // Referencia a subdocumento
    required: true
  }],
  isActive: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para rendimiento
TeamSchema.index({ userId: 1, isActive: 1 });
TeamSchema.index({ userId: 1, updatedAt: -1 });

// Validación: máximo 9 personajes por equipo
TeamSchema.pre('save', function(next) {
  if (this.characters.length > 9) {
    next(new Error('Un equipo no puede tener más de 9 personajes'));
  }
  next();
});

export const Team = model<ITeam>('Team', TeamSchema, 'teams');
