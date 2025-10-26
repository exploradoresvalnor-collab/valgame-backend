import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { auth } from '../middlewares/auth';
import { z } from 'zod';

const router = Router();

// Schema de validación para actualización de settings
const UpdateSettingsSchema = z.object({
  musicVolume: z.number().min(0).max(100).optional(),
  sfxVolume: z.number().min(0).max(100).optional(),
  language: z.enum(['es', 'en']).optional(),
  notificationsEnabled: z.boolean().optional()
});

// GET /api/user/settings - Obtener configuración del usuario
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await User.findById(req.userId).select('settings');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(user.settings);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/user/settings - Actualizar configuración del usuario
router.put('/', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Validar datos de entrada
    const settingsData = UpdateSettingsSchema.parse(req.body);

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar solo los campos proporcionados
    if (settingsData.musicVolume !== undefined) {
      user.settings.musicVolume = settingsData.musicVolume;
    }
    if (settingsData.sfxVolume !== undefined) {
      user.settings.sfxVolume = settingsData.sfxVolume;
    }
    if (settingsData.language !== undefined) {
      user.settings.language = settingsData.language;
    }
    if (settingsData.notificationsEnabled !== undefined) {
      user.settings.notificationsEnabled = settingsData.notificationsEnabled;
    }

    await user.save();

    return res.json({ 
      message: 'Configuración actualizada correctamente',
      settings: user.settings 
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error al actualizar configuración:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/user/settings/reset - Restaurar configuración a valores por defecto
router.post('/reset', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Restaurar valores por defecto
    user.settings = {
      musicVolume: 50,
      sfxVolume: 50,
      language: 'es',
      notificationsEnabled: true
    };

    await user.save();

    return res.json({ 
      message: 'Configuración restaurada a valores por defecto',
      settings: user.settings 
    });
  } catch (error) {
    console.error('Error al restaurar configuración:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
