"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Consumable_1 = __importDefault(require("../models/Consumable"));
const router = (0, express_1.Router)();
// GET all consumables
router.get('/', async (_req, res) => {
    try {
        const consumables = await Consumable_1.default.find({});
        res.json(consumables);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching consumables' });
    }
});
exports.default = router;
