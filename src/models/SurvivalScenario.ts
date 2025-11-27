import { Schema, model, Document } from 'mongoose';

export interface IScenarioRewardItem {
  nombre: string;
  cantidad: number;
}

export interface IMilestoneReward {
  milestone: number; // e.g., 10, 15, 25, 30
  rewards: {
    exp: number;
    val: number;
    items?: IScenarioRewardItem[];
  };
}

export interface ISurvivalScenario extends Document {
  slug: string;
  name: string;
  description?: string;
  milestoneRewards: IMilestoneReward[];
}

const MilestoneRewardSchema = new Schema({
  milestone: { type: Number, required: true },
  rewards: {
    exp: { type: Number, default: 0 },
    val: { type: Number, default: 0 },
    items: [{
      nombre: String,
      cantidad: { type: Number, default: 1 }
    }]
  }
}, { _id: false });

const SurvivalScenarioSchema = new Schema<ISurvivalScenario>({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  milestoneRewards: { type: [MilestoneRewardSchema], default: [] }
}, { timestamps: true, versionKey: false });

export const SurvivalScenario = model<ISurvivalScenario>('SurvivalScenario', SurvivalScenarioSchema, 'survival_scenarios');
