"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Ruta simple de test
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes simple funciona' });
});
exports.default = router;
