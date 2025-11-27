import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el documento de UserCharacter
export interface IUserCharacter extends Document {
  userId: mongoose.Types.ObjectId;
  baseCharacterId: mongoose.Types.ObjectId;
  name: string;
  level: number;
  experience: number;
  stats: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  equipment: {
    weapon?: mongoose.Types.ObjectId;
    armor?: mongoose.Types.ObjectId;
    accessory?: mongoose.Types.ObjectId;
  };
  inventory: mongoose.Types.ObjectId[];
  isAlive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Esquema de UserCharacter
const userCharacterSchema = new Schema<IUserCharacter>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  baseCharacterId: {
    type: Schema.Types.ObjectId,
    ref: 'BaseCharacter',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  stats: {
    health: { type: Number, required: true, min: 1 },
    attack: { type: Number, required: true, min: 0 },
    defense: { type: Number, required: true, min: 0 },
    speed: { type: Number, required: true, min: 0 }
  },
  equipment: {
    weapon: { type: Schema.Types.ObjectId, ref: 'Item' },
    armor: { type: Schema.Types.ObjectId, ref: 'Item' },
    accessory: { type: Schema.Types.ObjectId, ref: 'Item' }
  },
  inventory: [{
    type: Schema.Types.ObjectId,
    ref: 'UserItem'
  }],
  isAlive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimización
userCharacterSchema.index({ userId: 1, isAlive: 1 });
userCharacterSchema.index({ level: -1 });

// Validación personalizada para asegurar que no haya más de 9 personajes vivos por usuario
userCharacterSchema.pre('save', async function(next) {
  if (this.isNew && this.isAlive) {
    const UserCharacter = mongoose.model('UserCharacter');
    const aliveCharactersCount = await UserCharacter.countDocuments({
      userId: this.userId,
      isAlive: true
    });

    if (aliveCharactersCount >= 9) {
      const error = new Error('No puedes tener más de 9 personajes vivos');
      return next(error);
    }
  }
  next();
});

export default mongoose.model<IUserCharacter>('UserCharacter', userCharacterSchema);