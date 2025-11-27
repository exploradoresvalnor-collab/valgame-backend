import { Schema, model, Document, Types } from 'mongoose';

// --- INTERFACES ---

export interface ISurvivalRun extends Document {
  userId: Types.ObjectId;
  characterId: Types.ObjectId;
  
  // Resultados finales
  finalWave: number;
  finalPoints: number;
  totalEnemiesDefeated: number;
  
  // Items obtenidos
  itemsObtained: Array<{
    itemId: Types.ObjectId;
    rareza: string;
    obtainedAtWave: number;
  }>;
  
  // Recompensas
  rewards: {
    expGained: number;
    valGained: number;
    pointsAvailable: number;
  };
  
  // Equipo usado
  equipmentUsed: {
    head?: { itemId: Types.ObjectId; rareza: string };
    body?: { itemId: Types.ObjectId; rareza: string };
    hands?: { itemId: Types.ObjectId; rareza: string };
    feet?: { itemId: Types.ObjectId; rareza: string };
  };
  
  // Ranking
  positionInRanking?: number;

  // Escenario asociado (opcional)
  scenarioSlug?: string;

  // Detalle de hitos aplicados en esta run (auditoría)
  milestoneDetails?: Array<{
    milestoneNumber: number;
    rewards: { exp: number; val: number; items: Array<any> };
    appliedAt: Date;
  }>;
  
  // Timestamps
  startedAt: Date;
  completedAt: Date;
  duration: number; // milliseconds
}

// --- SCHEMA ---

const SurvivalRunSchema = new Schema<ISurvivalRun>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  characterId: { type: Schema.Types.ObjectId, required: true },
  
  finalWave: { type: Number, required: true, min: 1 },
  finalPoints: { type: Number, required: true, min: 0 },
  totalEnemiesDefeated: { type: Number, required: true, min: 0 },
  
  itemsObtained: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    rareza: { type: String, required: true },
    obtainedAtWave: { type: Number, required: true, min: 1 }
  }],
  
  rewards: new Schema({
    expGained: { type: Number, required: true, min: 0 },
    valGained: { type: Number, required: true, min: 0 },
    pointsAvailable: { type: Number, required: true, min: 0 }
  }, { _id: false }),
  
  equipmentUsed: new Schema({
    head: new Schema({
      itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
      rareza: String
    }, { _id: false }),
    body: new Schema({
      itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
      rareza: String
    }, { _id: false }),
    hands: new Schema({
      itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
      rareza: String
    }, { _id: false }),
    feet: new Schema({
      itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
      rareza: String
    }, { _id: false })
  }, { _id: false }),
  
  positionInRanking: { type: Number },
  
  startedAt: { type: Date, required: true, index: true },
  completedAt: { type: Date, required: true },
  duration: { type: Number, required: true, min: 0 }
}, {
  timestamps: true,
  versionKey: false
});

// Campo opcional con detalles de hitos aplicados
SurvivalRunSchema.add({
  scenarioSlug: { type: String },
  milestoneDetails: [{
    milestoneNumber: { type: Number },
    rewards: new Schema({
      exp: { type: Number, default: 0 },
      val: { type: Number, default: 0 },
      items: [{
        itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
        nombre: String,
        cantidad: { type: Number, default: 1 }
      }]
    }, { _id: false }),
    appliedAt: { type: Date, default: Date.now }
  }]
});

// Índices para búsquedas comunes
SurvivalRunSchema.index({ userId: 1, completedAt: -1 });
SurvivalRunSchema.index({ finalWave: -1 });
SurvivalRunSchema.index({ finalPoints: -1 });
SurvivalRunSchema.index({ userId: 1, finalWave: -1 });

export const SurvivalRun = model<ISurvivalRun>('SurvivalRun', SurvivalRunSchema, 'survival_runs');
