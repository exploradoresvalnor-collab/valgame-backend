"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Dungeon_1 = __importDefault(require("../models/Dungeon"));
const router = (0, express_1.Router)();
// GET all dungeons
router.get('/', async (_req, res) => {
    try {
        const dungeons = await Dungeon_1.default.find({});
        res.json(dungeons);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dungeons' });
    }
});
exports.default = router;
