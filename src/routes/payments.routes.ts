import { Router } from 'express';
import paymentService from '../services/payment.service';

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

export default router;
