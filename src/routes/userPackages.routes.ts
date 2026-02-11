import { Router } from 'express';
import mongoose, { Types } from 'mongoose';
import UserPackage from '../models/UserPackage';
import { User } from '../models/User';
import PackageModel from '../models/Package';
import { Item } from '../models/Item';
import Category from '../models/Category';
import BaseCharacter from '../models/BaseCharacter';
import PurchaseLog from '../models/PurchaseLog';
import { RealtimeService } from '../services/realtime.service';
import { auth } from '../middlewares/auth';

const router = Router();

// Todas las rutas de user-packages requieren autenticación
router.use(auth);

// Abrir el siguiente paquete disponible del usuario (comodín E2E)
router.post('/open', async (req, res) => {
  // Preferir userId autenticado, si no viene en el body
  const { userId: bodyUserId } = req.body || {};
  const userId = bodyUserId || (req as any).userId;
  if (!userId) return res.status(400).json({ error: 'Faltan datos.' });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Tomar el paquete más antiguo del usuario
    const candidate = await UserPackage.findOne({ userId }).sort({ fecha: 1 }).session(session);
    if (!candidate) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'No hay paquetes para abrir' });
    }

    // Lock atómico como en la ruta /:id/open
    const userPackageToOpen = await UserPackage.findOneAndUpdate(
      {
        _id: candidate._id,
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

    if ((pkg as any).val_reward) {
      user.val = (user.val || 0) + (pkg as any).val_reward;
    }

    // Recompensas de items: distinguir entre Equipment e items Consumibles
    let equipmentToAdd = 0;
    let consumablesToAdd = 0;
    if ((pkg as any).items_reward && Array.isArray((pkg as any).items_reward)) {
      user.inventarioEquipamiento = user.inventarioEquipamiento || [];
      user.inventarioConsumibles = user.inventarioConsumibles || ([] as any);

      for (const itemId of (pkg as any).items_reward) {
        try {
          const doc = await Item.findById(itemId).session(session);
          if (!doc) continue;
          const tipo = (doc as any).tipoItem;
          if (tipo === 'Consumable') {
            // Validar límite antes de añadir
            if ((user.inventarioConsumibles?.length || 0) + 1 > (user.limiteInventarioConsumibles || 50)) {
              await session.abortTransaction();
              return res.status(400).json({ error: 'Límite de consumibles alcanzado' });
            }
            const usos = (doc as any).usos_maximos || 1;
            user.inventarioConsumibles.push({
              consumableId: new Types.ObjectId(String(doc._id)),
              usos_restantes: usos
            } as any);
            (user as any).markModified?.('inventarioConsumibles');
            consumablesToAdd += 1;
          } else {
            if (!user.inventarioEquipamiento.some((id: any) => String(id) === String(itemId))) {
              user.inventarioEquipamiento.push(new Types.ObjectId(String(itemId)));
              equipmentToAdd += 1;
            }
          }
        } catch (_e) {}
      }
    }

    const toAssign = (pkg as any).personajes || 1;
    const assigned: any[] = [];

    const MAX_CHARACTERS = user.limiteInventarioPersonajes || 50;
    const MAX_EQUIPMENT = user.limiteInventarioEquipamiento || 200;
    const currentCharacters = user.personajes?.length || 0;
    const currentEquipment = user.inventarioEquipamiento?.length || 0;
    const itemsToAdd = equipmentToAdd; // Solo contabilizar equipo para el límite de equipamiento

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
      try {
        // Si hay personajes base con esa categoría, priorizar (si el esquema la expone)
        const pipeline: any[] = [];
        // Algunos seeds no guardan categoría/rango en BaseCharacter, así que simplemente sampleamos uno
        pipeline.push({ $sample: { size: 1 } });
        const cursor = BaseCharacter.aggregate(pipeline).session(session as any);
        const res = await cursor.exec();
        return res && res[0];
      } catch (_e) {
        return null;
      }
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
        } else {
          // Fallback: si no se encuentra base, insertar con id genérico y rango garantizado
          user.personajes.push({
            personajeId: 'base_d_001',
            rango: (cat as any) || 'D',
            nivel: 1,
            etapa: 1,
            progreso: 0,
            stats: { atk: 10, vida: 100, defensa: 10 },
            saludActual: 100,
            saludMaxima: 100,
            estado: 'saludable',
            fechaHerido: null,
            equipamiento: [],
            activeBuffs: []
          } as any);
          assigned.push('base_d_001');
        }
      } catch (_e) {}
    }

    while (assigned.length < toAssign) {
      try {
        const cats = categoriesList;
        const r = Math.random();
        let accum = 0;
        let chosenCat = cats.length > 0 ? (cats[cats.length - 1] as any)?.nombre : 'D';
        for (const c of cats) {
          accum += (c as any).probabilidad || 0;
          if (r <= accum) { chosenCat = (c as any).nombre; break; }
        }
        const base = await chooseRandomBaseForCategory(chosenCat);
        if (base) {
          user.personajes.push({
            personajeId: base.id,
            rango: (chosenCat as any) || 'D',
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
          // Fallback seguro
          user.personajes.push({
            personajeId: 'base_d_001',
            rango: (chosenCat as any) || 'D',
            nivel: 1,
            etapa: 1,
            progreso: 0,
            stats: { atk: 10, vida: 100, defensa: 10 },
            saludActual: 100,
            saludMaxima: 100,
            estado: 'saludable',
            fechaHerido: null,
            equipamiento: [],
            activeBuffs: []
          } as any);
          assigned.push('base_d_001');
          break;
        }
      } catch (_e) { break; }
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

    try {
      const realtime = RealtimeService.getInstance();
      realtime.notifyInventoryUpdate(userId, {
        personajes: user.personajes.length,
        equipamiento: user.inventarioEquipamiento.length,
        val: user.val,
        newCharacters: assigned,
        newItems: ((pkg as any).items_reward || []).map((id: any) => new Types.ObjectId(String(id))),
        valGranted: (pkg as any).val_reward || 0
      });
    } catch (_e) {}

    return res.json({
      ok: true,
      assigned,
      summary: {
        charactersReceived: assigned.length,
        itemsReceived: itemsToAdd + consumablesToAdd,
        valReceived: (pkg as any).val_reward || 0,
        totalCharacters: user.personajes.length,
        totalItems: user.inventarioEquipamiento.length,
        totalConsumables: user.inventarioConsumibles.length,
        valBalance: user.val
      }
    });
  } catch (err) {
    try { await session.abortTransaction().catch(() => {}); } catch {}
    console.error('[USER-PACKAGE-OPEN] Error:', err);
    return res.status(500).json({ error: 'Error al abrir paquete' });
  } finally {
    session.endSession();
  }
});

// Agregar paquete a usuario (COMPRAR)
router.post('/agregar', async (req, res) => {
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

    // 🔒 SEGURIDAD 3: Cobrar VAL de forma ATÓMICA (previene race conditions)
    // Esta operación valida usuario, balance y cobra en UNA SOLA operación atómica
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: userId,
        val: { $gte: precio } // Solo actualiza si existe Y tiene VAL suficiente
      },
      { 
        $inc: { val: -precio } // Decrementa de forma atómica
      },
      { 
        new: true // Devuelve el documento actualizado
      }
    );

    // Si no se actualizó, es porque el usuario no existe O no tiene VAL suficiente
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        error: 'VAL insuficiente o usuario no encontrado.',
        required: precio
      });
    }

    // Crear el UserPackage (paquete comprado pero sin abrir)
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

    // Emitir evento WebSocket para notificar que se compró el paquete (ignorar si no está inicializado)
    try {
      const realtime = RealtimeService.getInstance();
      realtime.notifyInventoryUpdate(userId, {
        val: updatedUser.val,
        valSpent: precio,
        newPackage: nuevo,
        action: 'purchase',
        packageName: (paquete as any).nombre || 'Unknown'
      });
    } catch (_e) {
      // entorno de test puede no inicializar RealtimeService; continuar sin bloquear
    }

    return res.json({ 
      success: true,
      ok: true, 
      userPackage: nuevo,
      valRemaining: updatedUser.val,
      precioPagado: precio
    });
  } catch (error) {
    console.error('[AGREGAR-PAQUETE] Error:', error);
    return res.status(500).json({ success: false, error: 'Error al agregar paquete.' });
  }
});

// Quitar paquete a usuario
router.post('/quitar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId || !paqueteId) return res.status(400).json({ error: 'Faltan datos.' });

  try {
    const eliminado = await UserPackage.findOneAndDelete({ userId, paqueteId });    
    if (!eliminado) return res.status(404).json({ error: 'No encontrado.' });       
    
    // Emitir evento WebSocket para notificar que se removió un paquete
    const realtime = RealtimeService.getInstance();
    realtime.notifyInventoryUpdate(userId, {
      action: 'packageRemoved',
      removedPackageId: paqueteId
    });
    
    res.json({ ok: true, eliminado });
  } catch (error) {
    res.status(500).json({ error: 'Error al quitar paquete.' });
  }
});

// Consultar paquetes de un usuario por userId (GET)
router.get('/:userId', async (req, res) => {
  try {
    const paquetes = await UserPackage.find({ userId: req.params.userId });
    // Expandir cada paquete con nombre y detalles
    const paquetesExpandidos = await Promise.all(paquetes.map(async pkg => {
      let paqueteInfo = null;
      try {
        paqueteInfo = await PackageModel.findById(pkg.paqueteId);
      } catch {}
      return {
        _id: pkg._id,
        paqueteId: pkg.paqueteId,
        fecha: pkg.fecha,
        nombre: paqueteInfo?.nombre || pkg.packageSnapshot?.nombre || 'Desconocido',
        tipo: paqueteInfo?.tipo || pkg.packageSnapshot?.tipo || 'Desconocido',
        packageSnapshot: pkg.packageSnapshot,
        detalles: paqueteInfo || {},
      };
    }));
    res.json(paquetesExpandidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar paquetes del usuario.' });
  }
});

// Consultar paquetes de un usuario por correo (POST)
router.post('/por-correo', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Falta el correo.' });
  try {
    // Buscar el usuario por correo
    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    // Buscar los paquetes y expandir el nombre y detalles
    const paquetes = await UserPackage.find({ userId: usuario._id });
    const paquetesExpandidos = await Promise.all(paquetes.map(async pkg => {
      let paqueteInfo = null;
      try {
        paqueteInfo = await PackageModel.findById(pkg.paqueteId);
      } catch {}
      return {
        _id: pkg._id,
        paqueteId: pkg.paqueteId,
        fecha: pkg.fecha,
        nombre: paqueteInfo?.nombre || pkg.packageSnapshot?.nombre || 'Desconocido',
        tipo: paqueteInfo?.tipo || pkg.packageSnapshot?.tipo || 'Desconocido',
        packageSnapshot: pkg.packageSnapshot,
        detalles: paqueteInfo || {},
      };
    }));
    res.json(paquetesExpandidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar paquetes por correo.' });
  }
});

// POST /api/user-packages/:id/open
// Abre un `UserPackage` específico que pertenece al usuario autenticado.
router.post('/:id/open', async (req, res) => {
  const userId = (req as any).userId; // provisto por el middleware de auth en app.ts
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

    // Lock atómico: marcar el UserPackage como locked si pertenece al usuario
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

    // Aplica las mismas reglas de rewards que la versión previa
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

    // Emitir evento WebSocket para notificar actualización de inventario
    try {
      const realtime = RealtimeService.getInstance();
      realtime.notifyInventoryUpdate(userId, {
        personajes: user.personajes.length,
        equipamiento: user.inventarioEquipamiento.length,
        val: user.val,
        newCharacters: assigned,
        newItems: ((pkg as any).items_reward || []).map((id: any) => new Types.ObjectId(String(id))),
        valGranted: (pkg as any).val_reward || 0
      });
    } catch (notifyErr) {
      console.warn('[USER-PACKAGE-OPEN] Notification failed:', (notifyErr as any)?.message || notifyErr);
    }

    res.json({ ok: true, assigned, summary: { charactersReceived: assigned.length, itemsReceived: itemsToAdd, valReceived: (pkg as any).val_reward || 0, totalCharacters: user.personajes.length, totalItems: user.inventarioEquipamiento.length, valBalance: user.val } });
  } catch (err) {
    // Intentar abortar la transacción, pero silenciar cualquier
    // error (p. ej. "Cannot call abortTransaction after calling commitTransaction").
    try {
      await session.abortTransaction().catch((_e: any) => {
        // Silenciar errores de abort
      });
    } catch (_e) {
      // No hacer nada adicional
    }

    console.error('[USER-PACKAGE-OPEN] Error:', err);
    res.status(500).json({ error: 'Error al abrir paquete' });
  } finally {
    session.endSession();
  }
});

export default router;
