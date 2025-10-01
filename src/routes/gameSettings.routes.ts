import { Router } from 'express';
// La importación por defecto desde tu modelo es correcta
import GameSetting from '../models/GameSetting'; 

const router = Router();

// GET /api/game-settings (o el prefijo que uses en app.ts)
router.get('/', async (req, res) => {
  try {
    // Usamos findOne() para obtener un solo objeto
    const settings = await GameSetting.findOne(); 

    // Buena práctica: verificar si la configuración existe
    if (!settings) {
      return res.status(404).json({ error: 'La configuración del juego no fue encontrada.' });
    }

    res.json(settings); // Ahora esto enviará el objeto directamente
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la configuración del juego.' });
  }
});

export default router;