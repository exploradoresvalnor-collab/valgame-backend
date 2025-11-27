import { Schema, model, Document, Types } from 'mongoose';

// --- INTERFACES ---

export interface ISurvivalSession extends Document {
  userId: Types.ObjectId;
  characterId: Types.ObjectId;
  state: 'active' | 'completed' | 'abandoned';
  // Escenario asociado (opcional, slug)
  scenarioSlug?: string;
  // Mejor ronda alcanzada durante la sesión (para métricas)
  maxRoundReached?: number;
  
  // Equipo seleccionado
  equipment: {
    head?: { itemId: Types.ObjectId; rareza: string; bonusAtaque?: number };
    body?: { itemId: Types.ObjectId; rareza: string; bonusDefensa?: number };
    hands?: { itemId: Types.ObjectId; rareza: string; bonusDefensa?: number };
    feet?: { itemId: Types.ObjectId; rareza: string; bonusVelocidad?: number };
  };
  
  // Consumibles activos
  consumables: Array<{
    itemId: Types.ObjectId;
    nombre: string;
    usos_restantes: number;
    efecto: {
      tipo: 'heal' | 'atk_boost' | 'def_boost' | 'xp_boost';
      valor: number;
    };
  }>;
  
  // Progresión actual
  currentWave: number;
  currentPoints: number;
  totalPointsAccumulated: number;
  enemiesDefeated: number;
  healthCurrent: number;
  healthMax: number;
  
  // Multiplicadores dinámicos
  multipliers: {
    waveMultiplier: number;      // Aumenta cada oleada
    survivalBonus: number;        // Bonus por tiempo vivo
    equipmentBonus: number;       // Bonus por equipo raro
  };
  
  // Drops recolectados
  dropsCollected: Array<{
    itemId: Types.ObjectId;
    nombre: string;
    rareza: string;
    timestamp: Date;
  }>;
  
  // Timeline
  startedAt: Date;
  lastActionAt: Date;
  completedAt?: Date;
  
  // Validación anti-cheat
  actionsLog: Array<{
    type: string;
    wave: number;
    timestamp: Date;
    serverTime: Date;
  }>;
}

// --- SCHEMA ---

const SurvivalSessionSchema = new Schema<ISurvivalSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  characterId: { type: Schema.Types.ObjectId, required: true },
  state: { 
    type: String, 
    enum: ['active', 'completed', 'abandoned'], 
    default: 'active',
    index: true
  },
  
  equipment: {
    type: new Schema({
      head: new Schema({
        itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
        rareza: String,
        bonusAtaque: Number
      }, { _id: false }),
      body: new Schema({
        itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
        rareza: String,
        bonusDefensa: Number
      }, { _id: false }),
      hands: new Schema({
        itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
        rareza: String,
        bonusDefensa: Number
      }, { _id: false }),
      feet: new Schema({
        itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
        rareza: String,
        bonusVelocidad: Number
      }, { _id: false })
    }, { _id: false }),
    default: () => ({})
  },
  
  consumables: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    nombre: String,
    usos_restantes: { type: Number, required: true, min: 0 },
    efecto: new Schema({
      tipo: { 
        type: String, 
        enum: ['heal', 'atk_boost', 'def_boost', 'xp_boost'],
        required: true 
      },
      valor: { type: Number, required: true }
    }, { _id: false })
  }],
  
  currentWave: { type: Number, default: 1, min: 1 },
  currentPoints: { type: Number, default: 0, min: 0 },
  totalPointsAccumulated: { type: Number, default: 0, min: 0 },
  enemiesDefeated: { type: Number, default: 0, min: 0 },
  healthCurrent: { type: Number, required: true },
  healthMax: { type: Number, required: true },
  
  multipliers: new Schema({
    waveMultiplier: { type: Number, default: 1.0, min: 0.5 },
    survivalBonus: { type: Number, default: 1.0, min: 0.5 },
    equipmentBonus: { type: Number, default: 1.0, min: 0.5 }
  }, { _id: false }),
  
  dropsCollected: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    nombre: String,
    rareza: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  startedAt: { type: Date, default: Date.now, index: true },
  lastActionAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  // Escenario y métricas
  scenarioSlug: { type: String, index: true },
  maxRoundReached: { type: Number, default: 0 },
  
  actionsLog: [{
    type: String,
    wave: Number,
    timestamp: Date,
    serverTime: Date
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Índices para optimización
SurvivalSessionSchema.index({ userId: 1, state: 1 });
SurvivalSessionSchema.index({ userId: 1, startedAt: -1 });

export const SurvivalSession = model<ISurvivalSession>('SurvivalSession', SurvivalSessionSchema, 'survival_sessions');
