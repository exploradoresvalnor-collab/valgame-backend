import { Router } from 'express';
import UserPackage from '../models/UserPackage';
import { User } from '../models/User';

const router = Router();

// Agregar paquete a usuario
router.post('/agregar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId || !paqueteId) return res.status(400).json({ error: 'Faltan datos.' });

  try {
    const nuevo = await UserPackage.create({ userId, paqueteId });
    res.json({ ok: true, userPackage: nuevo });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar paquete.' });
  }
});

// Quitar paquete a usuario
router.post('/quitar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId || !paqueteId) return res.status(400).json({ error: 'Faltan datos.' });

  try {
    const eliminado = await UserPackage.findOneAndDelete({ userId, paqueteId });
    if (!eliminado) return res.status(404).json({ error: 'No encontrado.' });
    res.json({ ok: true, eliminado });
  } catch (error) {
    res.status(500).json({ error: 'Error al quitar paquete.' });
  }
});

// Consultar paquetes de un usuario por userId (GET)
router.get('/:userId', async (req, res) => {
  try {
    const paquetes = await UserPackage.find({ userId: req.params.userId });
    res.json(paquetes);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar paquetes del usuario.' });
  }
});

// Consultar paquetes de un usuario por correo (POST)
router.post('/por-correo', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Falta el correo.' });
  try {
  // Buscar el usuario por correo
  const usuario = await User.findOne({ email });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    const paquetes = await UserPackage.find({ userId: usuario._id });
    res.json(paquetes);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar paquetes por correo.' });
  }
});

export default router;
