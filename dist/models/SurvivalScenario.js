"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurvivalScenario = void 0;
const mongoose_1 = require("mongoose");
const MilestoneRewardSchema = new mongoose_1.Schema({
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
const SurvivalScenarioSchema = new mongoose_1.Schema({
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    milestoneRewards: { type: [MilestoneRewardSchema], default: [] }
}, { timestamps: true, versionKey: false });
exports.SurvivalScenario = (0, mongoose_1.model)('SurvivalScenario', SurvivalScenarioSchema, 'survival_scenarios');
