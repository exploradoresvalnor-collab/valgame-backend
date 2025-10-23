import { Request, Response } from 'express';
import crypto from 'crypto';
import { Purchase } from '../models/Purchase';
import { User } from '../models/User';
import UserPackage from '../models/UserPackage';
import { Types } from 'mongoose';

/**
 * Servicio de pagos (MVP)
 * - Provee funciones para crear una orden/checkout (mock) y procesar webhooks del proveedor.
 * - Está preparado para integrarse con proveedores Web2 (Bold/Stripe) y para aceptar comprobantes on-chain.
 */

export const createCheckout = async (userId: Types.ObjectId, paqueteId: string, valorUSDT: number) => {
  // En MVP devolvemos un objeto de orden simulado. En integración real, llamar a la API del proveedor.
  const externalPaymentId = `MOCK-${Date.now()}`;
  return {
    externalPaymentId,
    provider: process.env.PAYMENT_PROVIDER || 'mock',
    amount: valorUSDT,
    currency: 'USDT',
    checkoutUrl: `https://checkout.mock/p/${externalPaymentId}`
  };
};

export const handleWebhook = async (req: Request, res: Response) => {
  // Recepción genérica de webhook. Este handler es idempotente y busca/create Purchase.
  // Validamos firma HMAC (si está configurada) utilizando la variable de entorno PAYMENT_WEBHOOK_SECRET.
  // Nota: la ruta debe exponer raw body (express.raw) para poder verificar la firma correctamente.
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;

  const verifySignature = () => {
    if (!secret) return true; // si no hay secreto configurado, saltamos la verificación (dev)
    const signature = (req.headers['x-signature'] || req.headers['x-webhook-signature']) as string | undefined;
    if (!signature) return false;
    const payloadBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
    const computed = crypto.createHmac('sha256', secret).update(payloadBuffer).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
    } catch (e) {
      return false;
    }
  };

  if (!verifySignature()) {
    console.warn('Webhook signature validation failed');
    return res.status(401).json({ error: 'invalid signature' });
  }

  let payload: any;
  try {
    payload = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).json({ error: 'invalid json' });
  }

  const { externalPaymentId, status, userId, paqueteId, valorPagadoUSDT, valRecibido, onchainTxHash } = payload;

  if (!externalPaymentId || !userId) {
    return res.status(400).json({ error: 'missing fields' });
  }

  // Buscar compra existente por externalPaymentId
  let purchase = await Purchase.findOne({ externalPaymentId });
  if (purchase) {
    // actualizar status si cambió
    purchase.paymentStatus = status || purchase.paymentStatus;
    if (onchainTxHash) purchase.onchainTxHash = onchainTxHash;
    await purchase.save();
    return res.status(200).json({ ok: true, purchaseId: purchase._id });
  }

  // Crear purchase pendiente y entregas automáticas si status es succeeded
  purchase = new Purchase({
    userId,
    paqueteId: paqueteId || 'unknown',
    valorPagadoUSDT: valorPagadoUSDT || 0,
    valRecibido: valRecibido || 0,
    externalPaymentId,
    paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
    paymentStatus: status || 'pending',
    onchainTxHash: onchainTxHash || undefined
  } as any);

  await purchase.save();

  // Si el pago fue exitoso, realizar la entrega (creditar VAL y asignar paquete)
  if (status === 'succeeded') {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.val += purchase.valRecibido;
        await user.save();
      }

      // Asignar el paquete al usuario (crear UserPackage)
      try {
        if (purchase.paqueteId) {
          await UserPackage.create({ userId: userId, paqueteId: purchase.paqueteId });
        }
      } catch (assignErr) {
        console.error('Error assigning package to user after purchase:', assignErr);
      }

      purchase.paymentStatus = 'succeeded';
      await purchase.save();
    } catch (err) {
      console.error('Error delivering purchase after webhook:', err);
    }
  }

  return res.status(200).json({ ok: true, purchaseId: purchase._id });
};

export default {
  createCheckout,
  handleWebhook
};
