import { Router, Request, Response } from 'express';
import paymentService from '../services/payment.service';
import { auth } from '../middlewares/auth';
import { User } from '../models/User';
import { Types } from 'mongoose';
import { RealtimeService } from '../services/realtime.service';

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

// Crear una orden/checkout (MVP mock)
router.post('/checkout', async (req, res) => {
  const { userId, paqueteId, valorUSDT } = req.body;
  try {
    const result = await paymentService.createCheckout(userId, paqueteId, valorUSDT);
    res.json(result);
  } catch (err) {
    console.error('Error creating checkout:', err);
    res.status(500).json({ error: 'error creating checkout' });
  }
});

// Webhook para recibir notificaciones del proveedor (idempotente)
// IMPORTANT: este endpoint debe montarse con express.raw({ type: 'application/json' }) en app.ts
router.post('/webhook', async (req, res) => {
  return paymentService.handleWebhook(req, res);
});

// POST /api/payments/blockchain/initiate - iniciar pago Web3
router.post('/blockchain/initiate', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { packageId, chain = 'evm', amountUSDT, walletAddress } = req.body;
    if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress requerido' });
    // Si existe lógica en paymentService, usarla; si no, stub temporal
    if (typeof (paymentService as any).initiateBlockchainPayment === 'function') {
      const tx = await (paymentService as any).initiateBlockchainPayment({
        userId: req.userId,
        packageId,
        chain,
        amountUSDT,
        walletAddress
      });
      // Emitir evento de inicio de pago blockchain
      try {
        const rt = RealtimeService.getInstance();
        rt.notifyPaymentStatus(req.userId, {
          provider: 'blockchain',
          state: 'initiated',
          meta: { packageId, chain, amountUSDT, walletAddress, tx }
        });
      } catch (_) {}
      return res.json({ success: true, data: tx });
    }
    // Emitir evento en stub también
    try {
      const rt = RealtimeService.getInstance();
      rt.notifyPaymentStatus(req.userId, {
        provider: 'blockchain',
        state: 'initiated',
        meta: { packageId, chain, amountUSDT, walletAddress }
      });
    } catch (_) {}
    return res.json({ success: true, stub: true, message: 'Blockchain initiate pendiente de lógica', data: { packageId, chain, amountUSDT, walletAddress } });
  } catch (error) {
    console.error('Error blockchain initiate:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/payments/wallet/connect - asociar wallet al usuario
router.post('/wallet/connect', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { walletAddress } = req.body;
    if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress requerido' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    user.walletAddress = walletAddress;
    await user.save();
    return res.json({ success: true, walletAddress });
  } catch (error) {
    console.error('Error connect wallet:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/payments/history - historial de pagos (Stripe + Blockchain)
router.get('/history', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
    // Si existe método especializado
    if (typeof (paymentService as any).getPaymentHistory === 'function') {
      const history = await (paymentService as any).getPaymentHistory(Types.ObjectId.createFromHexString(req.userId));
      return res.json({ success: true, data: history });
    }
    // Fallback stub
    return res.json({ success: true, stub: true, data: [], message: 'Implementar persistencia de historial' });
  } catch (error) {
    console.error('Error obteniendo payment history:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
