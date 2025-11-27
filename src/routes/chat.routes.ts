import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  sendGlobalMessage,
  sendPrivateMessage,
  sendPartyMessage,
  getMessages
} from '../controllers/chat/chat.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// GET /api/chat/messages - Obtener mensajes
router.get('/messages', getMessages);

// POST /api/chat/global - Enviar mensaje global
router.post('/global', sendGlobalMessage);

// POST /api/chat/private - Enviar mensaje privado
router.post('/private', sendPrivateMessage);

// POST /api/chat/party - Enviar mensaje de party
router.post('/party', sendPartyMessage);

export default router;