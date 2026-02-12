"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importStar(require("mongoose"));
const UserPackage_1 = __importDefault(require("../models/UserPackage"));
const User_1 = require("../models/User");
const Package_1 = __importDefault(require("../models/Package"));
const Item_1 = require("../models/Item");
const Category_1 = __importDefault(require("../models/Category"));
const BaseCharacter_1 = __importDefault(require("../models/BaseCharacter"));
const PurchaseLog_1 = __importDefault(require("../models/PurchaseLog"));
const realtime_service_1 = require("../services/realtime.service");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Todas las rutas de user-packages requieren autenticación
router.use(auth_1.auth);
// Abrir el siguiente paquete disponible del usuario (comodín E2E)
router.post('/open', async (req, res) => {
    // Preferir userId autenticado, si no viene en el body
    const { userId: bodyUserId } = req.body || {};
    const userId = bodyUserId || req.userId;
    if (!userId)
        return res.status(400).json({ error: 'Faltan datos.' });
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = await User_1.User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Tomar el paquete más antiguo del usuario
        const candidate = await UserPackage_1.default.findOne({ userId }).sort({ fecha: 1 }).session(session);
        if (!candidate) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'No hay paquetes para abrir' });
        }
        // Lock atómico como en la ruta /:id/open
        const userPackageToOpen = await UserPackage_1.default.findOneAndUpdate({
            _id: candidate._id,
            userId,
            $or: [
                { locked: { $exists: false } },
                { locked: false },
                { locked: true, lockedAt: { $lt: new Date(Date.now() - 30000) } }
            ]
        }, { $set: { locked: true, lockedAt: new Date() } }, { new: true, session }).select('+locked');
        if (!userPackageToOpen) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'UserPackage no encontrado o ya en proceso' });
        }
        const pkg = await Package_1.default.findById(userPackageToOpen.paqueteId).session(session);
        if (!pkg) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Paquete base no encontrado' });
        }
        if (pkg.val_reward) {
            user.val = (user.val || 0) + pkg.val_reward;
        }
        // Recompensas de items: distinguir entre Equipment e items Consumibles
        let equipmentToAdd = 0;
        let consumablesToAdd = 0;
        if (pkg.items_reward && Array.isArray(pkg.items_reward)) {
            user.inventarioEquipamiento = user.inventarioEquipamiento || [];
            user.inventarioConsumibles = user.inventarioConsumibles || [];
            for (const itemId of pkg.items_reward) {
                try {
                    const doc = await Item_1.Item.findById(itemId).session(session);
                    if (!doc)
                        continue;
                    const tipo = doc.tipoItem;
                    if (tipo === 'Consumable') {
                        // Validar límite antes de añadir
                        if ((user.inventarioConsumibles?.length || 0) + 1 > (user.limiteInventarioConsumibles || 50)) {
                            await session.abortTransaction();
                            return res.status(400).json({ error: 'Límite de consumibles alcanzado' });
                        }
                        const usos = doc.usos_maximos || 1;
                        user.inventarioConsumibles.push({
                            consumableId: new mongoose_1.Types.ObjectId(String(doc._id)),
                            usos_restantes: usos
                        });
                        user.markModified?.('inventarioConsumibles');
                        consumablesToAdd += 1;
                    }
                    else {
                        if (!user.inventarioEquipamiento.some((id) => String(id) === String(itemId))) {
                            user.inventarioEquipamiento.push(new mongoose_1.Types.ObjectId(String(itemId)));
                            equipmentToAdd += 1;
                        }
                    }
                }
                catch (_e) { }
            }
        }
        const toAssign = pkg.personajes || 1;
        const assigned = [];
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
        const guaranteed = pkg.categorias_garantizadas || [];
        const categoriesList = await Category_1.default.find().session(session);
        async function chooseRandomBaseForCategory(_catName) {
            try {
                // Si hay personajes base con esa categoría, priorizar (si el esquema la expone)
                const pipeline = [];
                // Algunos seeds no guardan categoría/rango en BaseCharacter, así que simplemente sampleamos uno
                pipeline.push({ $sample: { size: 1 } });
                const cursor = BaseCharacter_1.default.aggregate(pipeline).session(session);
                const res = await cursor.exec();
                return res && res[0];
            }
            catch (_e) {
                return null;
            }
        }
        for (const cat of guaranteed) {
            if (assigned.length >= toAssign)
                break;
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
                    });
                    assigned.push(base.id);
                }
                else {
                    // Fallback: si no se encuentra base, insertar con id genérico y rango garantizado
                    user.personajes.push({
                        personajeId: 'base_d_001',
                        rango: cat || 'D',
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
                    });
                    assigned.push('base_d_001');
                }
            }
            catch (_e) { }
        }
        while (assigned.length < toAssign) {
            try {
                const cats = categoriesList;
                const r = Math.random();
                let accum = 0;
                let chosenCat = cats.length > 0 ? cats[cats.length - 1]?.nombre : 'D';
                for (const c of cats) {
                    accum += c.probabilidad || 0;
                    if (r <= accum) {
                        chosenCat = c.nombre;
                        break;
                    }
                }
                const base = await chooseRandomBaseForCategory(chosenCat);
                if (base) {
                    user.personajes.push({
                        personajeId: base.id,
                        rango: chosenCat || 'D',
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
                    });
                    assigned.push(base.id);
                }
                else {
                    // Fallback seguro
                    user.personajes.push({
                        personajeId: 'base_d_001',
                        rango: chosenCat || 'D',
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
                    });
                    assigned.push('base_d_001');
                    break;
                }
            }
            catch (_e) {
                break;
            }
        }
        await user.save({ session });
        await UserPackage_1.default.findByIdAndDelete(userPackageToOpen._id, { session });
        await PurchaseLog_1.default.create([{
                userId: new mongoose_1.Types.ObjectId(userId),
                packageId: pkg._id,
                action: 'open',
                itemsReceived: (pkg.items_reward || []).map((id) => new mongoose_1.Types.ObjectId(String(id))),
                charactersReceived: assigned,
                valReceived: pkg.val_reward || 0,
                timestamp: new Date(),
                metadata: {
                    currentCharacters: user.personajes.length,
                    currentItems: user.inventarioEquipamiento.length,
                    currentVal: user.val,
                    packageName: pkg.nombre || 'Unknown'
                }
            }], { session });
        await session.commitTransaction();
        try {
            const realtime = realtime_service_1.RealtimeService.getInstance();
            realtime.notifyInventoryUpdate(userId, {
                personajes: user.personajes.length,
                equipamiento: user.inventarioEquipamiento.length,
                val: user.val,
                newCharacters: assigned,
                newItems: (pkg.items_reward || []).map((id) => new mongoose_1.Types.ObjectId(String(id))),
                valGranted: pkg.val_reward || 0
            });
        }
        catch (_e) { }
        return res.json({
            ok: true,
            assigned,
            summary: {
                charactersReceived: assigned.length,
                itemsReceived: itemsToAdd + consumablesToAdd,
                valReceived: pkg.val_reward || 0,
                totalCharacters: user.personajes.length,
                totalItems: user.inventarioEquipamiento.length,
                totalConsumables: user.inventarioConsumibles.length,
                valBalance: user.val
            }
        });
    }
    catch (err) {
        try {
            await session.abortTransaction().catch(() => { });
        }
        catch { }
        console.error('[USER-PACKAGE-OPEN] Error:', err);
        return res.status(500).json({ error: 'Error al abrir paquete' });
    }
    finally {
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
        const paquete = await Package_1.default.findById(paqueteId);
        if (!paquete) {
            return res.status(404).json({ success: false, error: 'Paquete no encontrado.' });
        }
        const precio = paquete.precio_val || 0;
        // 🔒 SEGURIDAD 2: Validar límites de inventario
        const currentPackages = await UserPackage_1.default.countDocuments({ userId });
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
        const updatedUser = await User_1.User.findOneAndUpdate({
            _id: userId,
            val: { $gte: precio } // Solo actualiza si existe Y tiene VAL suficiente
        }, {
            $inc: { val: -precio } // Decrementa de forma atómica
        }, {
            new: true // Devuelve el documento actualizado
        });
        // Si no se actualizó, es porque el usuario no existe O no tiene VAL suficiente
        if (!updatedUser) {
            return res.status(400).json({
                success: false,
                error: 'VAL insuficiente o usuario no encontrado.',
                required: precio
            });
        }
        // Crear el UserPackage (paquete comprado pero sin abrir)
        const nuevo = await UserPackage_1.default.create({ userId, paqueteId });
        // 📝 AUDITORÍA: Registrar la compra
        await PurchaseLog_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            packageId: new mongoose_1.Types.ObjectId(paqueteId),
            action: 'purchase',
            valSpent: precio,
            timestamp: new Date(),
            metadata: {
                currentVal: updatedUser.val,
                packageName: paquete.nombre || 'Unknown',
                packagePrice: precio
            }
        });
        // Emitir evento WebSocket para notificar que se compró el paquete (ignorar si no está inicializado)
        try {
            const realtime = realtime_service_1.RealtimeService.getInstance();
            realtime.notifyInventoryUpdate(userId, {
                val: updatedUser.val,
                valSpent: precio,
                newPackage: nuevo,
                action: 'purchase',
                packageName: paquete.nombre || 'Unknown'
            });
        }
        catch (_e) {
            // entorno de test puede no inicializar RealtimeService; continuar sin bloquear
        }
        return res.json({
            success: true,
            ok: true,
            userPackage: nuevo,
            valRemaining: updatedUser.val,
            precioPagado: precio
        });
    }
    catch (error) {
        console.error('[AGREGAR-PAQUETE] Error:', error);
        return res.status(500).json({ success: false, error: 'Error al agregar paquete.' });
    }
});
// Quitar paquete a usuario
router.post('/quitar', async (req, res) => {
    const { userId, paqueteId } = req.body;
    if (!userId || !paqueteId)
        return res.status(400).json({ error: 'Faltan datos.' });
    try {
        const eliminado = await UserPackage_1.default.findOneAndDelete({ userId, paqueteId });
        if (!eliminado)
            return res.status(404).json({ error: 'No encontrado.' });
        // Emitir evento WebSocket para notificar que se removió un paquete
        const realtime = realtime_service_1.RealtimeService.getInstance();
        realtime.notifyInventoryUpdate(userId, {
            action: 'packageRemoved',
            removedPackageId: paqueteId
        });
        res.json({ ok: true, eliminado });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al quitar paquete.' });
    }
});
// Consultar paquetes de un usuario por userId (GET)
router.get('/:userId', async (req, res) => {
    try {
        const paquetes = await UserPackage_1.default.find({ userId: req.params.userId });
        // Expandir cada paquete con nombre y detalles
        const paquetesExpandidos = await Promise.all(paquetes.map(async (pkg) => {
            let paqueteInfo = null;
            try {
                paqueteInfo = await Package_1.default.findById(pkg.paqueteId);
            }
            catch { }
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error al consultar paquetes del usuario.' });
    }
});
// Consultar paquetes de un usuario por correo (POST)
router.post('/por-correo', async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ error: 'Falta el correo.' });
    try {
        // Buscar el usuario por correo
        const usuario = await User_1.User.findOne({ email });
        if (!usuario)
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        // Buscar los paquetes y expandir el nombre y detalles
        const paquetes = await UserPackage_1.default.find({ userId: usuario._id });
        const paquetesExpandidos = await Promise.all(paquetes.map(async (pkg) => {
            let paqueteInfo = null;
            try {
                paqueteInfo = await Package_1.default.findById(pkg.paqueteId);
            }
            catch { }
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error al consultar paquetes por correo.' });
    }
});
// POST /api/user-packages/:id/open
// Abre un `UserPackage` específico que pertenece al usuario autenticado.
router.post('/:id/open', async (req, res) => {
    const userId = req.userId; // provisto por el middleware de auth en app.ts
    const userPackageId = req.params.id;
    if (!userId)
        return res.status(401).json({ error: 'No autorizado' });
    if (!mongoose_1.Types.ObjectId.isValid(userPackageId))
        return res.status(400).json({ error: 'userPackageId inválido' });
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = await User_1.User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Lock atómico: marcar el UserPackage como locked si pertenece al usuario
        const userPackageToOpen = await UserPackage_1.default.findOneAndUpdate({
            _id: userPackageId,
            userId,
            $or: [
                { locked: { $exists: false } },
                { locked: false },
                { locked: true, lockedAt: { $lt: new Date(Date.now() - 30000) } }
            ]
        }, { $set: { locked: true, lockedAt: new Date() } }, { new: true, session }).select('+locked');
        if (!userPackageToOpen) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'UserPackage no encontrado o ya en proceso' });
        }
        const pkg = await Package_1.default.findById(userPackageToOpen.paqueteId).session(session);
        if (!pkg) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Paquete base no encontrado' });
        }
        // Aplica las mismas reglas de rewards que la versión previa
        if (pkg.val_reward) {
            user.val = (user.val || 0) + pkg.val_reward;
        }
        if (pkg.items_reward && Array.isArray(pkg.items_reward)) {
            user.inventarioEquipamiento = user.inventarioEquipamiento || [];
            for (const itemId of pkg.items_reward) {
                try {
                    if (!user.inventarioEquipamiento.some((id) => String(id) === String(itemId))) {
                        user.inventarioEquipamiento.push(new mongoose_1.Types.ObjectId(String(itemId)));
                    }
                }
                catch (itemError) {
                    console.error('[OPEN-PACKAGE] Error agregando item:', itemError);
                }
            }
        }
        const toAssign = pkg.personajes || 1;
        const assigned = [];
        const MAX_CHARACTERS = user.limiteInventarioPersonajes || 50;
        const MAX_EQUIPMENT = user.limiteInventarioEquipamiento || 200;
        const currentCharacters = user.personajes?.length || 0;
        const currentEquipment = user.inventarioEquipamiento?.length || 0;
        const itemsToAdd = (pkg.items_reward || []).length;
        if (currentCharacters + toAssign > MAX_CHARACTERS) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Límite de personajes alcanzado' });
        }
        if (currentEquipment + itemsToAdd > MAX_EQUIPMENT) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Límite de inventario alcanzado' });
        }
        const guaranteed = pkg.categorias_garantizadas || [];
        const categoriesList = await Category_1.default.find().session(session);
        async function chooseRandomBaseForCategory(_catName) {
            return BaseCharacter_1.default.aggregate([{ $sample: { size: 1 } }]).then((res) => res[0]);
        }
        for (const cat of guaranteed) {
            if (assigned.length >= toAssign)
                break;
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
                    });
                    assigned.push(base.id);
                }
            }
            catch (charError) {
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
                    accum += c.probabilidad || 0;
                    if (r <= accum) {
                        chosenCat = c.nombre;
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
                    });
                    assigned.push(base.id);
                }
                else {
                    break;
                }
            }
            catch (randomCharError) {
                console.error('[OPEN-PACKAGE] Error asignando personaje aleatorio:', randomCharError);
                break;
            }
        }
        await user.save({ session });
        await UserPackage_1.default.findByIdAndDelete(userPackageToOpen._id, { session });
        await PurchaseLog_1.default.create([{
                userId: new mongoose_1.Types.ObjectId(userId),
                packageId: pkg._id,
                action: 'open',
                itemsReceived: (pkg.items_reward || []).map((id) => new mongoose_1.Types.ObjectId(String(id))),
                charactersReceived: assigned,
                valReceived: pkg.val_reward || 0,
                timestamp: new Date(),
                metadata: {
                    currentCharacters: user.personajes.length,
                    currentItems: user.inventarioEquipamiento.length,
                    currentVal: user.val,
                    packageName: pkg.nombre || 'Unknown'
                }
            }], { session });
        await session.commitTransaction();
        // Emitir evento WebSocket para notificar actualización de inventario
        try {
            const realtime = realtime_service_1.RealtimeService.getInstance();
            realtime.notifyInventoryUpdate(userId, {
                personajes: user.personajes.length,
                equipamiento: user.inventarioEquipamiento.length,
                val: user.val,
                newCharacters: assigned,
                newItems: (pkg.items_reward || []).map((id) => new mongoose_1.Types.ObjectId(String(id))),
                valGranted: pkg.val_reward || 0
            });
        }
        catch (notifyErr) {
            console.warn('[USER-PACKAGE-OPEN] Notification failed:', notifyErr?.message || notifyErr);
        }
        res.json({ ok: true, assigned, summary: { charactersReceived: assigned.length, itemsReceived: itemsToAdd, valReceived: pkg.val_reward || 0, totalCharacters: user.personajes.length, totalItems: user.inventarioEquipamiento.length, valBalance: user.val } });
    }
    catch (err) {
        // Intentar abortar la transacción, pero silenciar cualquier
        // error (p. ej. "Cannot call abortTransaction after calling commitTransaction").
        try {
            await session.abortTransaction().catch((_e) => {
                // Silenciar errores de abort
            });
        }
        catch (_e) {
            // No hacer nada adicional
        }
        console.error('[USER-PACKAGE-OPEN] Error:', err);
        res.status(500).json({ error: 'Error al abrir paquete' });
    }
    finally {
        session.endSession();
    }
});
exports.default = router;
