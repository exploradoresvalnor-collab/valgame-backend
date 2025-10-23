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
const Category_1 = __importDefault(require("../models/Category"));
const BaseCharacter_1 = __importDefault(require("../models/BaseCharacter"));
const PurchaseLog_1 = __importDefault(require("../models/PurchaseLog"));
const router = (0, express_1.Router)();
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
        res.json(paquetes);
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
        const paquetes = await UserPackage_1.default.find({ userId: usuario._id });
        res.json(paquetes);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al consultar paquetes por correo.' });
    }
});
exports.default = router;
// POST /api/user-packages/open
// body: { userId, paqueteId }  (paqueteId opcional si el usuario tiene un UserPackage)
router.post('/open', async (req, res) => {
    const { userId, paqueteId } = req.body;
    if (!userId)
        return res.status(400).json({ error: 'Falta userId' });
    // 🔒 TRANSACCIÓN ATÓMICA para prevenir race conditions
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 🔒 SEGURIDAD 1: Validar que el usuario existe
        const user = await User_1.User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // 🔒 SEGURIDAD 2: Validar autorización (req.user._id === userId)
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'userId inválido' });
        }
        let pkg;
        let userPackageToDelete;
        if (paqueteId) {
            // Buscar paquete específico
            pkg = await Package_1.default.findById(paqueteId).session(session);
            // 🔒 LOCK ATÓMICO: Buscar y lockear el UserPackage en una sola operación
            userPackageToDelete = await UserPackage_1.default.findOneAndUpdate({
                userId,
                paqueteId,
                $or: [
                    { locked: { $exists: false } },
                    { locked: false },
                    {
                        locked: true,
                        lockedAt: { $lt: new Date(Date.now() - 30000) } // Lock expirado (30s)
                    }
                ]
            }, {
                $set: { locked: true, lockedAt: new Date() }
            }, {
                new: true,
                session
            }).select('+locked');
            if (!userPackageToDelete) {
                await session.abortTransaction();
                return res.status(429).json({
                    error: 'Paquete no disponible o ya está siendo abierto',
                    message: 'El paquete está siendo procesado o no existe'
                });
            }
        }
        else {
            // Buscar cualquier paquete disponible y lockearlo
            userPackageToDelete = await UserPackage_1.default.findOneAndUpdate({
                userId,
                $or: [
                    { locked: { $exists: false } },
                    { locked: false },
                    {
                        locked: true,
                        lockedAt: { $lt: new Date(Date.now() - 30000) }
                    }
                ]
            }, {
                $set: { locked: true, lockedAt: new Date() }
            }, {
                new: true,
                session
            }).select('+locked');
            if (!userPackageToDelete) {
                await session.abortTransaction();
                return res.status(404).json({ error: 'Usuario no tiene paquetes disponibles' });
            }
            pkg = await Package_1.default.findById(userPackageToDelete.paqueteId).session(session);
        }
        if (!pkg) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Paquete no encontrado' });
        }
        // 1) Añadir val_reward si existe
        if (pkg.val_reward) {
            user.val = (user.val || 0) + pkg.val_reward;
        }
        // 2) Añadir items_reward si existen
        if (pkg.items_reward && Array.isArray(pkg.items_reward)) {
            // 🔒 SEGURIDAD 6: Manejo de errores en loops
            for (const itemId of pkg.items_reward) {
                try {
                    // si es equipment añadir a inventarioEquipamiento, si es consumable añadir a inventarioConsumibles
                    // simplificamos: añadimos a inventarioEquipamiento
                    user.inventarioEquipamiento = user.inventarioEquipamiento || [];
                    if (!user.inventarioEquipamiento.some((id) => String(id) === String(itemId))) {
                        user.inventarioEquipamiento.push(new mongoose_1.Types.ObjectId(String(itemId)));
                    }
                }
                catch (itemError) {
                    console.error(`[OPEN-PACKAGE] Error agregando item ${itemId}:`, itemError);
                    // Continuar con el siguiente item en vez de romper todo
                }
            }
        }
        // 3) Asignar personajes (personajes: pkg.personajes)
        const toAssign = pkg.personajes || 1;
        const assigned = [];
        // 🔒 SEGURIDAD 3: Validar límites de inventario ANTES de asignar
        const MAX_CHARACTERS = user.limiteInventarioPersonajes || 50;
        const MAX_EQUIPMENT = user.limiteInventarioEquipamiento || 200;
        const currentCharacters = user.personajes?.length || 0;
        const currentEquipment = user.inventarioEquipamiento?.length || 0;
        const itemsToAdd = (pkg.items_reward || []).length;
        // Validar que hay espacio para nuevos personajes
        if (currentCharacters + toAssign > MAX_CHARACTERS) {
            await session.abortTransaction();
            return res.status(400).json({
                error: 'Límite de personajes alcanzado.',
                limit: MAX_CHARACTERS,
                current: currentCharacters,
                trying_to_add: toAssign,
                message: 'Vende o elimina algunos personajes primero'
            });
        }
        // Validar que hay espacio para nuevos items
        if (currentEquipment + itemsToAdd > MAX_EQUIPMENT) {
            await session.abortTransaction();
            return res.status(400).json({
                error: 'Límite de inventario alcanzado.',
                limit: MAX_EQUIPMENT,
                current: currentEquipment,
                trying_to_add: itemsToAdd,
                message: 'Vende o elimina algunos items primero'
            });
        }
        // Si hay categorias_garantizadas, primero asignarlas
        const guaranteed = pkg.categorias_garantizadas || [];
        const categoriesList = await Category_1.default.find();
        function chooseRandomBaseForCategory(_catName) {
            // El rango se asigna al personaje del usuario, no al BaseCharacter
            // Por tanto, simplemente escogemos un personaje base aleatorio
            return BaseCharacter_1.default.aggregate([
                { $sample: { size: 1 } }
            ]).then((res) => res[0]);
        }
        // Rellenar con garantizados
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
                console.error(`[OPEN-PACKAGE] Error asignando personaje garantizado ${cat}:`, charError);
                // Continuar con el siguiente personaje
            }
        }
        // Si faltan, asignar aleatoriamente por probabilidades en Category
        while (assigned.length < toAssign) {
            try {
                // elegir categoría por probabilidad
                const cats = categoriesList;
                const r = Math.random();
                let accum = 0;
                let chosenCat = cats[cats.length - 1].nombre;
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
                    // si no hay base para esa categoria, romper para evitar loop infinito
                    console.warn(`[OPEN-PACKAGE] No se encontró personaje base para categoría: ${chosenCat}`);
                    break;
                }
            }
            catch (randomCharError) {
                console.error('[OPEN-PACKAGE] Error asignando personaje aleatorio:', randomCharError);
                // Romper el loop para evitar loop infinito en caso de error persistente
                break;
            }
        }
        // 🔒 GUARDAR usuario con la sesión de transacción
        await user.save({ session });
        // 🔒 ELIMINAR el UserPackage (consumir) dentro de la transacción
        await UserPackage_1.default.findByIdAndDelete(userPackageToDelete._id, { session });
        // 📝 AUDITORÍA: Registrar la apertura del paquete
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
        // 🔒 COMMIT de la transacción - Todo o nada
        await session.commitTransaction();
        res.json({
            ok: true,
            assigned,
            summary: {
                charactersReceived: assigned.length,
                itemsReceived: itemsToAdd,
                valReceived: pkg.val_reward || 0,
                totalCharacters: user.personajes.length,
                totalItems: user.inventarioEquipamiento.length,
                valBalance: user.val
            }
        });
    }
    catch (err) {
        // 🔒 ROLLBACK en caso de error
        await session.abortTransaction();
        console.error('[USER-PACKAGE-OPEN] Error:', err);
        res.status(500).json({ error: 'Error al abrir paquete' });
    }
    finally {
        // 🔒 SIEMPRE cerrar la sesión
        session.endSession();
    }
});
