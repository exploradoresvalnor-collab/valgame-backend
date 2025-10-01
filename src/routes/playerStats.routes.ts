import { Router } from 'express';
import PlayerStat from '../models/PlayerStat';

const router = Router();

// Registrar una sesión de minado
router.post('/', async (req, res) => {
  const { userId, personajeId, cantidadMinada, fecha, valAcumulado, fuente } = req.body;
  if (!userId || !personajeId || cantidadMinada == null || !fecha || valAcumulado == null || !fuente) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }
  try {
    const stat = await PlayerStat.create({ userId, personajeId, cantidadMinada, fecha, valAcumulado, fuente });
    res.json({ ok: true, stat });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar minado.' });
  }
});

// Consultar sesiones de minado por usuario
router.get('/usuario/:userId', async (req, res) => {
  try {
    const stats = await PlayerStat.find({ userId: req.params.userId });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar minados.' });
  }
});

// Consultar sesiones de minado por personaje
router.get('/personaje/:personajeId', async (req, res) => {
  try {
    const stats = await PlayerStat.find({ personajeId: req.params.personajeId });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar minados.' });
  }
});

export default router;
