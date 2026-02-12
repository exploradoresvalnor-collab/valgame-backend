"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const combat_controller_1 = require("../controllers/combat.controller");
const router = (0, express_1.Router)();
/**
 * Iniciar combate en un dungeon
 * POST /api/dungeons/:dungeonId/start
 */
router.post('/dungeons/:dungeonId/start', auth_1.auth, combat_controller_1.startDungeonCombat);
/**
 * Realizar ataque en combate
 * POST /api/combat/attack
 */
router.post('/attack', auth_1.auth, combat_controller_1.performAttack);
/**
 * Defender en combate
 * POST /api/combat/defend
 */
router.post('/defend', auth_1.auth, combat_controller_1.performDefend);
/**
 * Finalizar combate
 * POST /api/combat/end
 */
router.post('/end', auth_1.auth, combat_controller_1.endCombat);
exports.default = router;
