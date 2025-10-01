"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Event_1 = __importDefault(require("../models/Event"));
const router = (0, express_1.Router)();
// GET /api/events
router.get('/', async (req, res) => {
    try {
        const events = await Event_1.default.find();
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los eventos.' });
    }
});
exports.default = router;
