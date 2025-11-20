"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const rankings_controller_1 = require("../controllers/rankings.controller");
const router = (0, express_1.Router)();
// Rutas públicas
router.get('/', rankings_controller_1.getGlobalRanking); // GET /api/rankings?limit=100&periodo=global
router.get('/period/:periodo', rankings_controller_1.getRankingByPeriod); // GET /api/rankings/period/2025-W45
router.get('/stats', rankings_controller_1.getRankingStats); // GET /api/rankings/stats?periodo=global
// Rutas protegidas (requieren autenticación)
router.get('/me', auth_1.auth, rankings_controller_1.getUserRanking); // GET /api/rankings/me
exports.default = router;
