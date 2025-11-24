/**
 * Alias Routes - Rutas Alternativas para Endpoints Principales
 * 
 * Este archivo proporciona alias/atajos para endpoints existentes
 * para estandarizar nomenclatura y facilitar integración frontend.
 * 
 * Ejemplos:
 * - POST /api/purchase → POST /api/user-packages/agregar (comprar paquete)
 * - POST /api/open-package → POST /api/user-packages/:id/open (abrir paquete)
 */

import { Router, Request, Response } from 'express';
import { auth } from '../middlewares/auth';
import UserPackage from '../models/UserPackage';
import { User } from '../models/User';
import PackageModel from '../models/Package';
import Category from '../models/Category';
import BaseCharacter from '../models/BaseCharacter';
import PurchaseLog from '../models/PurchaseLog';
import { RealtimeService } from '../services/realtime.service';
import mongoose, { Types } from 'mongoose';

const router = Router();

/**
 * POST /api/purchase
 * Alias para: POST /api/user-packages/agregar
 * 
 * Compra un paquete con VAL del usuario.
 * Esta ruta es un alias estandarizado para facilitar integración frontend.
 */
router.post('/purchase', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId || !paqueteId) {
    return res.status(400).json({ success: false, error: 'Faltan datos.' });
  }

  try {
    // 🔒 SEGURIDAD 1: Validar que el paquete existe y obtener su precio
    const paquete = await PackageModel.findById(paqueteId);
    if (!paquete) {
      return res.status(404).json({ success: false, error: 'Paquete no encontrado.' });
    }

    const precio = (paquete as any).precio_val || 0;

    // 🔒 SEGURIDAD 2: Validar límites de inventario
    const currentPackages = await UserPackage.countDocuments({ userId });
    const MAX_PACKAGES = 50;

    if (currentPackages >= MAX_PACKAGES) {
      return res.status(400).json({
        success: false,
        error: 'Límite de paquetes alcanzado. Abre algunos paquetes primero.',
        limit: MAX_PACKAGES,
        current: currentPackages
      });
    }

    // 🔒 SEGURIDAD 3: Cobrar VAL de forma ATÓMICA
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        val: { $gte: precio }
      },
      {
        $inc: { val: -precio }
      },
      {
        new: true
      }
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        error: 'VAL insuficiente o usuario no encontrado.',
        required: precio
      });
    }

    // Crear el UserPackage
    const nuevo = await UserPackage.create({ userId, paqueteId });

    // 📝 AUDITORÍA: Registrar la compra
    await PurchaseLog.create({
      userId: new Types.ObjectId(userId),
      packageId: new Types.ObjectId(paqueteId),
      action: 'purchase',
      valSpent: precio,
      timestamp: new Date(),
      metadata: {
        currentVal: updatedUser.val,
        packageName: (paquete as any).nombre || 'Unknown',
        packagePrice: precio
      }
    });

    // Emitir evento WebSocket
    const realtime = RealtimeService.getInstance();
    realtime.notifyInventoryUpdate(userId, {
      val: updatedUser.val,
      valSpent: precio,
      newPackage: nuevo,
      action: 'purchase',
      packageName: (paquete as any).nombre || 'Unknown'
    });

    return res.json({
      success: true,
      ok: true,
      userPackage: nuevo,
      valRemaining: updatedUser.val,
      precioPagado: precio
    });
  } catch (error) {
    console.error('[PURCHASE-ALIAS] Error:', error);
    return res.status(500).json({ success: false, error: 'Error al comprar paquete.' });
  }
});

/**
 * POST /api/open-package/:id
 * Alias para: POST /api/user-packages/:id/open
 * 
 * Abre un paquete del usuario y asigna los rewards (personajes, items, VAL).
 * Esta ruta es un alias estandarizado para facilitar integración frontend.
 */
router.post('/open-package/:id', async (req, res) => {
  const userId = (req as any).userId; // si usa auth
  const userIdFromBody = req.body.userId; // o desde body
  const actualUserId = userId || userIdFromBody;

  const userPackageId = req.params.id;

  if (!actualUserId) return res.status(401).json({ error: 'No autorizado' });
  if (!Types.ObjectId.isValid(userPackageId)) return res.status(400).json({ error: 'userPackageId inválido' });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(actualUserId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Lock atómico
    const userPackageToOpen = await UserPackage.findOneAndUpdate(
      {
        _id: userPackageId,
        userId: actualUserId,
        $or: [
          { locked: { $exists: false } },
          { locked: false },
          { locked: true, lockedAt: { $lt: new Date(Date.now() - 30000) } }
        ]
      },
      { $set: { locked: true, lockedAt: new Date() } },
      { new: true, session }
    ).select('+locked');

    if (!userPackageToOpen) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'UserPackage no encontrado o ya en proceso' });
    }

    const pkg = await PackageModel.findById(userPackageToOpen.paqueteId).session(session);
    if (!pkg) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Paquete base no encontrado' });
    }

    // Aplicar rewards
    if ((pkg as any).val_reward) {
      user.val = (user.val || 0) + (pkg as any).val_reward;
    }

    if ((pkg as any).items_reward && Array.isArray((pkg as any).items_reward)) {
      user.inventarioEquipamiento = user.inventarioEquipamiento || [];
      for (const itemId of (pkg as any).items_reward) {
        try {
          if (!user.inventarioEquipamiento.some((id: any) => String(id) === String(itemId))) {
            user.inventarioEquipamiento.push(new Types.ObjectId(String(itemId)));
          }
        } catch (itemError) {
          console.error('[OPEN-PACKAGE-ALIAS] Error agregando item:', itemError);
        }
      }
    }

    const toAssign = (pkg as any).personajes || 1;
    const assigned: any[] = [];

    const MAX_CHARACTERS = user.limiteInventarioPersonajes || 50;
    const MAX_EQUIPMENT = user.limiteInventarioEquipamiento || 200;
    const currentCharacters = user.personajes?.length || 0;
    const currentEquipment = user.inventarioEquipamiento?.length || 0;
    const itemsToAdd = ((pkg as any).items_reward || []).length;

    if (currentCharacters + toAssign > MAX_CHARACTERS) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Límite de personajes alcanzado' });
    }

    if (currentEquipment + itemsToAdd > MAX_EQUIPMENT) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Límite de inventario alcanzado' });
    }

    const guaranteed = (pkg as any).categorias_garantizadas || [];
    const categoriesList = await Category.find().session(session);

    async function chooseRandomBaseForCategory(_catName: string) {
      return BaseCharacter.aggregate([{ $sample: { size: 1 } }]).then((res: any[]) => res[0]);
    }

    // Asignar personajes garantizados
    for (const cat of guaranteed) {
      if (assigned.length >= toAssign) break;
      try {
        const base = await chooseRandomBaseForCategory(cat);
        if (base) {
          user.personajes.push({
            personajeId: base.id,
            rango: cat,
            nivel: 1,
            etapa: 1,
            progreso: 0,
            stats: base.stats,
            saludActual: base.stats.vida,
            saludMaxima: base.stats.vida,
            estado: 'saludable',
            fechaHerido: null,
            equipamiento: [],
            activeBuffs: []
          } as any);
          assigned.push(base.id);
        }
      } catch (charError) {
        console.error('[OPEN-PACKAGE-ALIAS] Error asignando personaje garantizado:', charError);
      }
    }

    // Asignar personajes aleatorios
    while (assigned.length < toAssign) {
      try {
        const cats = categoriesList;
        const r = Math.random();
        let accum = 0;
        let chosenCat = cats[cats.length - 1]?.nombre;
        for (const c of cats) {
          accum += (c as any).probabilidad || 0;
          if (r <= accum) { chosenCat = (c as any).nombre; break; }
        }
        const base = await chooseRandomBaseForCategory(chosenCat);
        if (base) {
          user.personajes.push({
            personajeId: base.id,
            rango: chosenCat,
            nivel: 1,
            etapa: 1,
            progreso: 0,
            stats: base.stats,
            saludActual: base.stats.vida,
            saludMaxima: base.stats.vida,
            estado: 'saludable',
            fechaHerido: null,
            equipamiento: [],
            activeBuffs: []
          } as any);
          assigned.push(base.id);
        } else {
          break;
        }
      } catch (randomCharError) {
        console.error('[OPEN-PACKAGE-ALIAS] Error asignando personaje aleatorio:', randomCharError);
        break;
      }
    }

    await user.save({ session });
    await UserPackage.findByIdAndDelete(userPackageToOpen._id, { session });

    await PurchaseLog.create([{
      userId: new Types.ObjectId(actualUserId),
      packageId: pkg._id,
      action: 'open',
      itemsReceived: ((pkg as any).items_reward || []).map((id: any) => new Types.ObjectId(String(id))),
      charactersReceived: assigned,
      valReceived: (pkg as any).val_reward || 0,
      timestamp: new Date(),
      metadata: {
        currentCharacters: user.personajes.length,
        currentItems: user.inventarioEquipamiento.length,
        currentVal: user.val,
        packageName: (pkg as any).nombre || 'Unknown'
      }
    }], { session });

    await session.commitTransaction();

    // Emitir evento WebSocket
    const realtime = RealtimeService.getInstance();
    realtime.notifyInventoryUpdate(actualUserId, {
      personajes: user.personajes.length,
      equipamiento: user.inventarioEquipamiento.length,
      val: user.val,
      newCharacters: assigned,
      newItems: ((pkg as any).items_reward || []).map((id: any) => new Types.ObjectId(String(id))),
      valGranted: (pkg as any).val_reward || 0
    });

    res.json({ 
      ok: true, 
      assigned, 
      summary: { 
        charactersReceived: assigned.length, 
        itemsReceived: itemsToAdd, 
        valReceived: (pkg as any).val_reward || 0, 
        totalCharacters: user.personajes.length, 
        totalItems: user.inventarioEquipamiento.length, 
        valBalance: user.val 
      } 
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('[OPEN-PACKAGE-ALIAS] Error:', err);
    res.status(500).json({ error: 'Error al abrir paquete' });
  } finally {
    session.endSession();
  }
});

export default router;
