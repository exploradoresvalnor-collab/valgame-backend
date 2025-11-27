import { Schema, model, Document, Types } from 'mongoose';

// --- INTERFACES ---

export interface ISurvivalLeaderboard extends Document {
  userId: Types.ObjectId;
  username: string;
  characterName: string;
  
  // Estadísticas
  totalRuns: number;
  averageWave: number;
  maxWave: number;
  totalPoints: number;
  
  // Top run
  topRunId?: Types.ObjectId;
  topRunWave: number;
  topRunPoints: number;
  
  // Ranking
  rankingPosition: number;
  seasonRankingPosition?: number;
  
  // Rewards pendientes
  pointsAvailable: number;
  
  // Últimas actualizaciones
  lastRunAt: Date;
  updatedAt: Date;
}

// --- SCHEMA ---

const SurvivalLeaderboardSchema = new Schema<ISurvivalLeaderboard>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  username: { type: String, required: true },
  characterName: { type: String, required: true },
  
  totalRuns: { type: Number, default: 0, min: 0 },
  averageWave: { type: Number, default: 0, min: 0 },
  maxWave: { type: Number, default: 0, min: 0, index: true },
  totalPoints: { type: Number, default: 0, min: 0, index: true },
  
  topRunId: { type: Schema.Types.ObjectId, ref: 'SurvivalRun' },
  topRunWave: { type: Number, default: 0, min: 0 },
  topRunPoints: { type: Number, default: 0, min: 0 },
  
  rankingPosition: { type: Number, index: true },
  seasonRankingPosition: { type: Number },
  
  pointsAvailable: { type: Number, default: 0, min: 0 },
  
  lastRunAt: { type: Date },
  updatedAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true,
  versionKey: false
});

// Índices compuestos para rankings
SurvivalLeaderboardSchema.index({ maxWave: -1, totalPoints: -1 });
SurvivalLeaderboardSchema.index({ totalRuns: -1 });
SurvivalLeaderboardSchema.index({ rankingPosition: 1 });

export const SurvivalLeaderboard = model<ISurvivalLeaderboard>(
  'SurvivalLeaderboard', 
  SurvivalLeaderboardSchema, 
  'survival_leaderboard'
);
