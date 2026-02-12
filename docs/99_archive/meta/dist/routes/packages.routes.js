"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Package_1 = __importDefault(require("../models/Package"));
const router = (0, express_1.Router)();
// GET /api/packages
router.get('/', async (req, res) => {
    try {
        const packages = await Package_1.default.find();
        res.json(packages);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los paquetes.' });
    }
});
exports.default = router;
