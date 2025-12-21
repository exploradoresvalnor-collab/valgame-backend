import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { User } from '../models/User';

const router = Router();

// GET /api/inventory - inventario completo agrupado
router.get('/', auth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
    const user = await User.findById(req.userId).select('inventarioEquipamiento inventarioConsumibles');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({
      equipment: user.inventarioEquipamiento || [],
      consumables: user.inventarioConsumibles || []
    });
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/inventory/equipment - inventario equipamiento
router.get('/equipment', auth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
    const user = await User.findById(req.userId).select('inventarioEquipamiento');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(user.inventarioEquipamiento || []);
  } catch (error) {
    console.error('Error obteniendo equipamiento:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/inventory/consumables - inventario consumibles
router.get('/consumables', auth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
    const user = await User.findById(req.userId).select('inventarioConsumibles');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(user.inventarioConsumibles || []);
  } catch (error) {
    console.error('Error obteniendo consumibles:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
