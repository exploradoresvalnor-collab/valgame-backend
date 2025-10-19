import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  id: string;
  title: string;
  description: string;
  type: 'diario' | 'semanal' | 'logro';
  requirements: {
    type: 'kill' | 'collect' | 'reach_level' | 'win_battles' | 'spend_val';
    target: number;
    progress: number;
    entityId?: string; // Para misiones específicas de un monstruo/item
  };
  rewards: {
    val?: number;
    items?: string[];
    title?: string;
    evo?: number;
  };
  startDate?: Date;
  endDate?: Date;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'once';
}

const AchievementSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['diario', 'semanal', 'logro']
  },
  requirements: {
    type: { 
      type: String, 
      required: true,
      enum: ['kill', 'collect', 'reach_level', 'win_battles', 'spend_val']
    },
    target: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    entityId: { type: String }
  },
  rewards: {
    val: { type: Number },
    items: [{ type: String }],
    title: { type: String },
    evo: { type: Number }
  },
  startDate: { type: Date },
  endDate: { type: Date },
  repeatType: { 
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'once']
  }
}, {
  timestamps: true
});

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);