"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const userCharacters_controller_1 = require("../controllers/user-characters/userCharacters.controller");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.auth);
// GET /api/user-characters - Obtener todos los personajes del usuario
router.get('/', userCharacters_controller_1.getUserCharacters);
// GET /api/user-characters/:id - Obtener personaje específico del usuario
router.get('/:id', userCharacters_controller_1.getUserCharacterById);
exports.default = router;
