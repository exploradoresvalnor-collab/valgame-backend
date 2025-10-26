import { Router, Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { auth } from '../middlewares/auth';
import { Types } from 'mongoose';

const router = Router();

// GET /api/notifications - Listar notificaciones del usuario
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { limit = '20', skip = '0', unreadOnly = 'false' } = req.query;

    const query: any = { userId: req.userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string));

    const total = await Notification.countDocuments(query);

    return res.json({
      notifications,
      total,
      limit: parseInt(limit as string),
      skip: parseInt(skip as string)
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/notifications/unread/count - Contador de notificaciones no leídas
router.get('/unread/count', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const count = await Notification.countDocuments({
      userId: req.userId,
      isRead: false
    });

    return res.json({ count });
  } catch (error) {
    console.error('Error al contar notificaciones no leídas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/notifications/:id/read - Marcar una notificación como leída
router.put('/:id/read', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de notificación inválido' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    return res.json({ 
      message: 'Notificación marcada como leída',
      notification 
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/notifications/read-all - Marcar todas las notificaciones como leídas
router.put('/read-all', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const result = await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true }
    );

    return res.json({ 
      message: 'Todas las notificaciones marcadas como leídas',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/notifications/:id - Eliminar una notificación
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de notificación inválido' });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    return res.json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
