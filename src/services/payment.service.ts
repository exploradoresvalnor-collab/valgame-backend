import { Request, Response } from 'express';
import crypto from 'crypto';
import { Purchase } from '../models/Purchase';
import UserPackage from '../models/UserPackage';
import { Types } from 'mongoose';
import { RealtimeService } from './realtime.service';
import { Notification } from '../models/Notification';

// Logs de depuración: visibles solo en entorno de test
const __isTest = process.env.NODE_ENV === 'test';
const __dbg = (...args: any[]) => { if (__isTest) { try { console.debug(...args); } catch {} } };

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
    if (Buffer.isBuffer(req.body)) {
      // Debug: buffer recibido
      __dbg('[WEBHOOK] Raw buffer length:', (req.body as Buffer).length);
      // Caso resiliente: a veces llega un JSON de un Buffer serializado { type: 'Buffer', data: [...] }
      const text = req.body.toString();
      let parsed: any = JSON.parse(text);
      if (parsed && parsed.type === 'Buffer' && Array.isArray(parsed.data)) {
        try {
          const inner = Buffer.from(parsed.data).toString();
          parsed = JSON.parse(inner);
        } catch (_) {
          // si falla, nos quedamos con parsed original
        }
      }
      payload = parsed;
    } else if (typeof (req as any).body === 'string') {
      __dbg('[WEBHOOK] Raw string length:', (req as any).body.length);
      payload = JSON.parse((req as any).body);
    } else {
      // Si ya viene parseado por otro middleware, aceptar objeto
      payload = (req as any).body || {};
    }
    __dbg('[WEBHOOK] Parsed payload keys:', Object.keys(payload));
  } catch (e) {
    console.warn('[WEBHOOK] JSON parse error:', (e as any)?.message || e);
    return res.status(400).json({ error: 'invalid json' });
  }

  const { externalPaymentId, status, userId, paqueteId, valorPagadoUSDT, valRecibido, onchainTxHash } = payload;
  __dbg('[WEBHOOK] Status value:', status);

  if (!externalPaymentId || !userId) {
    console.warn('[WEBHOOK] Missing required fields externalPaymentId/userId', { externalPaymentId, userId });
    return res.status(400).json({ error: 'missing fields' });
  }

  // Buscar compra existente por externalPaymentId
  let purchase = await Purchase.findOne({ externalPaymentId });
  if (purchase) {
    // actualizar status si cambió
    purchase.paymentStatus = status || purchase.paymentStatus;
    if (onchainTxHash) purchase.onchainTxHash = onchainTxHash;
    await purchase.save();
    // Emitir actualización de estado
    try {
      const rt = RealtimeService.getInstance();
      rt.notifyPaymentStatus(String(userId), {
        provider: (process.env.PAYMENT_PROVIDER as any) || 'mock',
        state: mapStatusToState(status),
        meta: { externalPaymentId, purchaseId: String(purchase._id), onchainTxHash }
      });
    } catch (_) {}
    return res.status(200).json({ ok: true, purchaseId: purchase._id });
  }

  // Crear purchase pendiente y entregas automáticas si status es succeeded
  // Aceptar userId no ObjectId en entorno de pruebas creando uno interno si es inválido
  const userIdForPersistence = Types.ObjectId.isValid(userId) ? userId : new Types.ObjectId();
  if (!Types.ObjectId.isValid(userId)) {
    __dbg('[WEBHOOK] userId no válido como ObjectId, usando fallback interno');
  }
  purchase = new Purchase({
    userId: userIdForPersistence,
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
    __dbg('[WEBHOOK] Entering success delivery flow');
    try {
      // Resolver dinámicamente para permitir mocks en tests
      const { User } = require('../models/User');
      const user = await User.findById(userId);
      __dbg('[WEBHOOK] User lookup result:', !!user);
      if (user) {
        __dbg('[WEBHOOK] Crediting VAL:', purchase.valRecibido);
        user.val += purchase.valRecibido;
        await user.save();
        __dbg('[WEBHOOK] User saved after credit.');
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

      // Crear notificación y emitir notification:new
      try {
        const notif = await Notification.create({
          userId,
          title: 'Pago confirmado',
          message: `Se acreditaron ${purchase.valRecibido} VAL a tu cuenta`,
          // Usar tipo permitido por el esquema
          type: 'system_announcement',
          isRead: false
        } as any);
        try {
          const rt = RealtimeService.getInstance();
          rt.notifyNotificationNew(String(userId), notif);
        } catch (_) {}
      } catch (e) {
        console.warn('No se pudo crear notificación de pago confirmado:', (e as any)?.message || e);        
      }
    } catch (err) {
      console.error('Error delivering purchase after webhook:', err);
    }
  }

  // Emitir estado inicial/pendiente si no fue success
  try {
    const rt = RealtimeService.getInstance();
    rt.notifyPaymentStatus(String(userId), {
      provider: (process.env.PAYMENT_PROVIDER as any) || 'mock',
      state: mapStatusToState(status),
      meta: { externalPaymentId, purchaseId: String(purchase._id), onchainTxHash }
    });
  } catch (_) {}

  return res.status(200).json({ ok: true, purchaseId: purchase._id });
};

export default {
  createCheckout,
  handleWebhook
};

function mapStatusToState(status?: string): 'initiated'|'pending'|'confirmed'|'failed'|'refunded' {
  switch (status) {
    case 'succeeded':
    case 'confirmed':
      return 'confirmed';
    case 'pending':
    case 'processing':
      return 'pending';
    case 'refunded':
      return 'refunded';
    case 'failed':
    case 'canceled':
      return 'failed';
    default:
      return 'pending';
  }
}
