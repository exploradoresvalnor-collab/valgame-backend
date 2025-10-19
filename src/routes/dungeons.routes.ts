import { Router } from 'express';
import Dungeon from '../models/Dungeon';
import { startDungeon } from '../controllers/dungeons.controller'; // 1. Importa la función del controlador de combate
import { auth } from '../middlewares/auth'; // 2. Importa el middleware de autenticación

const router = Router();

// GET /api/dungeons - Obtener la lista de mazmorras (Ruta Pública)
router.get('/', async (_req, res) => {
  try {
    const dungeons = await Dungeon.find({});
    res.json(dungeons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dungeons' });
  }
});

// --- 👇 RUTA NUEVA PARA INICIAR EL COMBATE (LA PELEA) 👇 ---
// POST /api/dungeons/:dungeonId/start (Ruta Protegida)
router.post('/:dungeonId/start', auth, startDungeon);


export default router;