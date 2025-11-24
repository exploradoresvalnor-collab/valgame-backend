/**
 * ALIAS ROUTES - Rutas alternativas/simplificadas para endpoints populares
 * 
 * Propósito: Proporcionar nombres más intuitivos o cortos para operaciones comunes
 * Todos los alias redirigen a sus endpoints reales correspondientes
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

// ============================================================================
// ALIAS: /api/purchase (alias para /api/user-packages/agregar)
// ============================================================================
// Comprar un paquete con nombre más corto/intuitivo
router.post('/purchase', auth, async (req, res) => {
  // Redirigir a userPackages/agregar manteniendo el contexto
  const { paqueteId } = req.body;
  const userId = (req as any).userId;

  if (!userId || !paqueteId) {
    return res.status(400).json({ success: false, error: 'Faltan datos.' });
  }

  try {
    const paquete = await PackageModel.findById(paqueteId);
    if (!paquete) {
      return res.status(404).json({ success: false, error: 'Paquete no encontrado.' });
    }

    const precio = (paquete as any).precio_val || 0;

    // Validar límites de inventario
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

    // Cobrar VAL de forma atómica
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

    // Auditoría
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

// ============================================================================
// ALIAS: /api/open-package/:id (alias para /api/user-packages/:id/open)
// ============================================================================
// Abrir un paquete con nombre más descriptivo
router.post('/open-package/:id', auth, async (req, res) => {
  const userId = (req as any).userId;
  const userPackageId = req.params.id;

  if (!userId) return res.status(401).json({ error: 'No autorizado' });
  if (!Types.ObjectId.isValid(userPackageId)) return res.status(400).json({ error: 'userPackageId inválido' });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Lock atómico
    const userPackageToOpen = await UserPackage.findOneAndUpdate(
      {
        _id: userPackageId,
        userId,
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
          console.error('[OPEN-PACKAGE] Error agregando item:', itemError);
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
        console.error('[OPEN-PACKAGE] Error asignando personaje garantizado:', charError);
      }
    }

    while (assigned.length < toAssign) {
      try {
        const cats = categoriesList;
        const r = Math.random();
        let accum = 0;
        let chosenCat = cats[cats.length - 1]?.nombre;
        for (const c of cats) {
          accum += (c as any).probabilidad || 0;
          if (r <= accum) {
            chosenCat = (c as any).nombre;
            break;
          }
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
        console.error('[OPEN-PACKAGE] Error asignando personaje aleatorio:', randomCharError);
        break;
      }
    }

    await user.save({ session });
    await UserPackage.findByIdAndDelete(userPackageToOpen._id, { session });

    await PurchaseLog.create([{
      userId: new Types.ObjectId(userId),
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
    realtime.notifyInventoryUpdate(userId, {
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

// ============================================================================
// ALIAS: /api/sell-item (alias para /api/marketplace/list)
// ============================================================================
// Vender un item de forma simplificada (alias descriptivo)
router.post('/sell-item', auth, async (req, res) => {
  // Este es solo un alias que documenta la intención
  // La lógica real está en marketplace.routes.ts
  res.status(400).json({
    error: 'Use POST /api/marketplace/list en su lugar',
    alternativeEndpoint: 'POST /api/marketplace/list',
    description: 'Cree un listing en el marketplace para vender items'
  });
});

export default router;
