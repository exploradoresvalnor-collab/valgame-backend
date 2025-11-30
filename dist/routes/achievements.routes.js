"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const achievements_controller_1 = require("../controllers/achievements.controller");
const router = (0, express_1.Router)();
// Rutas públicas
router.get('/', achievements_controller_1.listAchievements); // GET /api/achievements?categoria=combate&limit=50&page=0
// Rutas con datos de usuario específico (públicas)
router.get('/:userId', achievements_controller_1.getUserAchievements); // GET /api/achievements/:userId
// Rutas protegidas (requieren autenticación - admin)
router.post('/:userId/unlock', auth_1.auth, achievements_controller_1.unlockAchievement); // POST /api/achievements/:userId/unlock (body: { achievementId })
exports.default = router;
