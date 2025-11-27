"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const chat_controller_1 = require("../controllers/chat/chat.controller");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.auth);
// GET /api/chat/messages - Obtener mensajes
router.get('/messages', chat_controller_1.getMessages);
// POST /api/chat/global - Enviar mensaje global
router.post('/global', chat_controller_1.sendGlobalMessage);
// POST /api/chat/private - Enviar mensaje privado
router.post('/private', chat_controller_1.sendPrivateMessage);
// POST /api/chat/party - Enviar mensaje de party
router.post('/party', chat_controller_1.sendPartyMessage);
exports.default = router;
