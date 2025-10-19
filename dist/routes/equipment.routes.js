"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Equipment_1 = require("../models/Equipment");
const router = (0, express_1.Router)();
// GET all equipment
router.get('/', async (_req, res) => {
    try {
        const equipment = await Equipment_1.Equipment.find({});
        res.json(equipment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching equipment' });
    }
});
exports.default = router;
