import { Request, Response } from 'express';
import { User } from '../models/User';
import GameSettings from '../models/GameSetting';
import { RealtimeService } from '../services/realtime.service';

// Interfaz para extender Request y que incluya el userId del middleware de auth
interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Comprar Cristales de Evolución (EVO) con VAL
 * POST /api/shop/buy-evo
 * Body: { amount: number }
 */
export const buyEvo = async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'La cantidad debe ser mayor a 0.' });
  }

  try {
    // Cargar usuario y configuración del juego
    const [user, gameSettings] = await Promise.all([
      User.findById(userId),
      GameSettings.findOne()
    ]);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Obtener tasa de cambio de la configuración (por defecto 100 VAL = 1 EVO)
    const exchangeRate = gameSettings?.costo_evo_por_val || 100;

    // Calcular costo total
    const totalCost = amount * exchangeRate;

    // Validar que el usuario tiene suficiente VAL
    if (user.val < totalCost) {
      return res.status(400).json({ 
        error: `No tienes suficiente VAL para comprar ${amount} EVO.`,
        required: totalCost,
        current: user.val,
        missing: totalCost - user.val
      });
    }

    // Realizar la transacción
    user.val -= totalCost;
    user.evo = (user.evo || 0) + amount;

    await user.save();

    // Emitir evento WebSocket para actualizar recursos en tiempo real
    try {
      const realtimeService = RealtimeService.getInstance();
      // Usar el método de notificación de recursos si existe
      if (typeof (realtimeService as any).notifyResourceUpdate === 'function') {
        (realtimeService as any).notifyResourceUpdate(userId, {
          val: user.val,
          evo: user.evo,
          type: 'BUY_EVO'
        });
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[buyEvo] RealtimeService no disponible:', err);
      }
    }

    // Respuesta
    res.json({
      message: `Has comprado ${amount} Cristal${amount > 1 ? 'es' : ''} de Evolución por ${totalCost} VAL.`,
      transaction: {
        amount,
        cost: totalCost,
        exchangeRate
      },
      resources: {
        val: user.val,
        evo: user.evo
      }
    });

  } catch (error) {
    console.error('Error al comprar EVO:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Comprar paquete de VAL (con dinero real o en-game currency)
 * POST /api/shop/buy-val
 * Body: { packageId: string }
 */
export const buyValPackage = async (req: AuthRequest, res: Response) => {
  const { packageId } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  if (!packageId) {
    return res.status(400).json({ error: 'Debes especificar el ID del paquete.' });
  }

  try {
    // TODO: Implementar lógica de compra de paquetes de VAL
    // Esto requiere integración con sistema de pagos (Stripe, PayPal, etc.)
    
    res.status(501).json({ 
      error: 'Funcionalidad no implementada aún.',
      message: 'La compra de VAL con dinero real estará disponible próximamente.'
    });

  } catch (error) {
    console.error('Error al comprar paquete de VAL:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Obtener información de la tienda (tasas de cambio, paquetes disponibles)
 * GET /api/shop/info
 */
export const getShopInfo = async (_req: AuthRequest, res: Response) => {
  try {
    const gameSettings = await GameSettings.findOne();

    const exchangeRate = gameSettings?.costo_evo_por_val || 100;

    res.json({
      exchangeRates: {
        evoPerVal: exchangeRate,
        valPerEvo: 1 / exchangeRate
      },
      packages: [
        // TODO: Obtener paquetes de la base de datos
        {
          id: 'val_small',
          name: 'Paquete Pequeño de VAL',
          amount: 500,
          price: 4.99,
          currency: 'USD'
        },
        {
          id: 'val_medium',
          name: 'Paquete Mediano de VAL',
          amount: 1200,
          price: 9.99,
          currency: 'USD'
        },
        {
          id: 'val_large',
          name: 'Paquete Grande de VAL',
          amount: 3000,
          price: 19.99,
          currency: 'USD'
        }
      ],
      note: 'La compra con dinero real estará disponible próximamente.'
    });

  } catch (error) {
    console.error('Error al obtener información de la tienda:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
