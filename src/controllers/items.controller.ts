import { Request, Response } from 'express';
import { Item } from '../models/Item';
import { User } from '../models/User';
import { ItemService } from '../services/item.service';

interface AuthRequest extends Request {
  userId?: string;
}

export const buyItem = async (req: AuthRequest, res: Response) => {
  const { id: itemId } = req.params;
  const { cantidad = 1, currency = 'val' } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: 'Usuario no autenticado.' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Item no encontrado.' });

    const purchased = await ItemService.buyItem(user as any, itemId, Number(cantidad), currency === 'boletos' ? 'boletos' : 'val');

    return res.json({ ok: true, purchased });
  } catch (err: any) {
    if (err.name === 'InsufficientFundsError' || err.message?.toLowerCase().includes('insuf') ) {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'ValidationError' || err.message?.toLowerCase().includes('espacio')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'NotFoundError') {
      return res.status(404).json({ error: err.message });
    }
    console.error('Error buyItem:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
