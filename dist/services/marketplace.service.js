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
exports.getUserListings = exports.getListings = exports.buyItem = exports.cancelListing = exports.listItem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Listing_1 = __importDefault(require("../models/Listing"));
const User_1 = require("../models/User");
const BaseCharacter_1 = __importDefault(require("../models/BaseCharacter"));
const Item_1 = require("../models/Item"); // Importar modelo Item para consultar detalles
const MarketplaceTransaction_1 = __importDefault(require("../models/MarketplaceTransaction")); // Importar modelo de transacciones
const errors_1 = require("../utils/errors");
const realtime_service_1 = require("./realtime.service");
const marketplace_validations_1 = require("../validations/marketplace.validations");
// Configuración de precios del marketplace
const IMPUESTO_VENTA = 0.05; // 5% de impuesto por venta
const DURACION_LISTING = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
const COSTO_DESTACAR = 100; // VAL para destacar un listing
const MAX_PRECIO_MARKETPLACE = 1000000; // Precio máximo permitido (1 millón VAL)
// Precios mínimos por categoría
const PRECIOS_MINIMOS = {
    personaje: 100, // Personajes valen más
    equipamiento: 10, // Equipamiento estándar
    consumible: 5, // Consumibles más baratos
    especial: 50 // Items especiales
};
const listItem = async (seller, itemId, precio, destacar = false) => {
    const session = await mongoose_1.default.startSession();
    let createdListing;
    try {
        await session.withTransaction(async () => {
            // Asegurar que el documento seller use la sesión
            seller.$session(session);
            // Verificar que el usuario tenga el item según su tipo
            let type = 'equipamiento';
            let item;
            let characterDetails;
            let metadata = {};
            // Determinar el tipo de item y verificar propiedad
            if (seller.personajes?.some(p => p.personajeId === itemId)) {
                type = 'personaje';
                const foundItem = seller.personajes.find(p => p.personajeId === itemId);
                if (!foundItem)
                    throw new errors_1.NotFoundError('Personaje no encontrado');
                item = foundItem;
                if (item.personajeId === seller.personajeActivoId) {
                    throw new errors_1.ValidationError('No puedes vender tu personaje activo');
                }
                // Obtener detalles del personaje base (para nombre/imagen si se requieren en metadata)
                characterDetails = await BaseCharacter_1.default.findOne({ id: item.personajeId }).session(session);
                if (!characterDetails) {
                    throw new errors_1.NotFoundError('Detalles del personaje no encontrados');
                }
                // ✅ SEGURIDAD: Metadata con stats REALES del personaje del usuario
                // Los stats del usuario pueden haber sido mejorados, pero validamos que existan
                metadata = {
                    nombre: characterDetails.nombre,
                    imagen: characterDetails.imagen,
                    // Stats actuales del personaje del usuario (pueden ser mejorados legítimamente)
                    nivel: item.nivel ?? 1,
                    etapa: item.etapa ?? 1,
                    rango: item.rango,
                    stats: item.stats ?? characterDetails.stats, // Stats del usuario o base
                    progreso: item.progreso ?? 0,
                    // Campos adicionales para poder restaurar en cancelListing si es necesario
                    saludActual: item.saludActual,
                    saludMaxima: item.saludMaxima,
                    estado: item.estado,
                    fechaHerido: item.fechaHerido,
                    equipamiento: Array.isArray(item.equipamiento) ? [...item.equipamiento] : [],
                    activeBuffs: Array.isArray(item.activeBuffs) ? [...item.activeBuffs] : []
                };
            }
            else if (seller.inventarioEquipamiento?.some(id => id.toString() === itemId)) {
                type = 'equipamiento';
                // Consultar detalles del item para obtener nombre, imagen y stats REALES
                const itemDetails = await Item_1.Item.findById(itemId).session(session);
                if (!itemDetails) {
                    throw new errors_1.NotFoundError('Detalles del item de equipamiento no encontrados');
                }
                // ✅ SEGURIDAD: Forzar metadata con datos REALES del item (no del cliente)
                // Ignorar cualquier metadata enviada por el usuario para prevenir fraude
                const itemObj = itemDetails.toObject ? itemDetails.toObject() : itemDetails;
                metadata = {
                    nombre: itemDetails.nombre,
                    imagen: itemDetails.imagen,
                    descripcion: itemDetails.descripcion,
                    rango: itemDetails.rango,
                    // Solo incluir campos adicionales si existen
                    ...(itemObj.stats && { stats: itemObj.stats }),
                    ...(itemObj.durabilidad && { durabilidad: itemObj.durabilidad })
                };
            }
            else if (seller.inventarioConsumibles?.some(c => c.consumableId.toString() === itemId)) {
                type = 'consumible';
                item = seller.inventarioConsumibles.find(c => c.consumableId.toString() === itemId);
                // Consultar detalles REALES del consumible
                const consumibleDetails = await Item_1.Item.findById(itemId).session(session);
                if (!consumibleDetails) {
                    throw new errors_1.NotFoundError('Detalles del consumible no encontrados');
                }
                // ✅ SEGURIDAD: Forzar metadata con datos REALES (no del cliente)
                metadata = {
                    nombre: consumibleDetails.nombre,
                    imagen: consumibleDetails.imagen,
                    descripcion: consumibleDetails.descripcion,
                    rango: consumibleDetails.rango,
                    usos: item?.usos_restantes ?? 1 // Solo usos viene del inventario
                };
            }
            else {
                throw new errors_1.NotFoundError('Item no encontrado en tu inventario');
            }
            // Validar precio máximo global
            if (precio > MAX_PRECIO_MARKETPLACE) {
                throw new errors_1.ValidationError(`El precio máximo permitido es ${MAX_PRECIO_MARKETPLACE.toLocaleString()} VAL`);
            }
            // ✅ SEGURIDAD: Validar precio mínimo por categoría con función validadora
            const precioValidation = (0, marketplace_validations_1.validatePrecioByType)(type, precio);
            if (!precioValidation.valid) {
                throw new errors_1.ValidationError(precioValidation.error);
            }
            // ✅ SEGURIDAD: Sanitizar metadata (eliminar campos peligrosos)
            metadata = (0, marketplace_validations_1.sanitizeMetadata)(metadata);
            // Calcular impuesto
            const impuesto = Math.floor(precio * IMPUESTO_VENTA);
            // Si quiere destacar el listing, verificar que tenga suficiente VAL y descontar dentro de la transacción
            if (destacar) {
                if (seller.val < COSTO_DESTACAR) {
                    throw new errors_1.InsufficientFundsError('No tienes suficiente VAL para destacar el item');
                }
                seller.val -= COSTO_DESTACAR;
                await seller.save({ session });
            }
            // Crear el listing
            const listing = new Listing_1.default({
                itemId,
                type,
                sellerId: seller._id,
                precio,
                precioOriginal: precio,
                impuesto,
                fechaExpiracion: new Date(Date.now() + DURACION_LISTING),
                destacado: destacar,
                metadata
            });
            await listing.save({ session });
            // Remover el item del inventario del usuario según su tipo
            switch (type) {
                case 'personaje': {
                    const sub = seller.personajes.find(p => p.personajeId === itemId);
                    if (sub && typeof sub.deleteOne === 'function') {
                        await sub.deleteOne();
                    }
                    else {
                        // fallback por si deleteOne no está disponible
                        // @ts-ignore for typed arrays replacement
                        seller.personajes = seller.personajes.filter(p => p.personajeId !== itemId);
                    }
                    break;
                }
                case 'equipamiento': {
                    seller.inventarioEquipamiento = seller.inventarioEquipamiento.filter(id => id.toString() !== itemId);
                    break;
                }
                case 'consumible': {
                    // Eliminar consumible de forma determinista: filtrar por consumableId
                    // y marcar el campo como modificado para asegurar persistencia dentro de la sesión.
                    try {
                        seller.inventarioConsumibles = seller.inventarioConsumibles.filter((c) => {
                            try {
                                return String(c.consumableId) !== String(itemId);
                            }
                            catch (e) {
                                return true;
                            }
                        });
                        // Marcar el campo para que mongoose detecte el cambio en arrays de subdocumentos
                        if (typeof seller.markModified === 'function') {
                            seller.markModified('inventarioConsumibles');
                        }
                        // debug removed
                    }
                    catch (err) {
                        // En caso de error, dejar el fallback que filtra por consumableId
                        seller.inventarioConsumibles = seller.inventarioConsumibles.filter((c) => String(c.consumableId) !== String(itemId));
                        if (typeof seller.markModified === 'function') {
                            seller.markModified('inventarioConsumibles');
                        }
                    }
                    break;
                }
            }
            await seller.save({ session });
            // ✅ AUDITORÍA: Registrar transacción de listing
            await MarketplaceTransaction_1.default.create([{
                    listingId: listing._id,
                    sellerId: seller._id,
                    itemId,
                    itemType: type,
                    precioOriginal: precio,
                    precioFinal: precio,
                    impuesto,
                    action: 'listed',
                    timestamp: new Date(),
                    itemMetadata: {
                        nombre: metadata.nombre,
                        imagen: metadata.imagen,
                        descripcion: metadata.descripcion,
                        rango: metadata.rango,
                        nivel: metadata.nivel,
                        stats: metadata.stats
                    },
                    balanceSnapshot: {
                        sellerBalanceBefore: seller.val + (destacar ? COSTO_DESTACAR : 0),
                        sellerBalanceAfter: seller.val
                    },
                    metadata: {
                        destacado: destacar,
                        fechaExpiracion: listing.fechaExpiracion
                    }
                }], { session });
            createdListing = listing.toObject();
        });
        // Notificar en tiempo real sobre el nuevo listado después del commit
        if (createdListing) {
            try {
                const realtime = realtime_service_1.RealtimeService.getInstance();
                if (realtime && typeof realtime.notifyMarketplaceUpdate === 'function') {
                    realtime.notifyMarketplaceUpdate('new', createdListing);
                }
            }
            catch (err) {
                // En entorno de tests el RealtimeService puede no estar inicializado; loguear y continuar
                console.warn('RealtimeService no disponible, skip notify (listItem)', err?.message || err);
            }
        }
        return createdListing;
    }
    catch (error) {
        console.error('Error al listar item:', error);
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.listItem = listItem;
const cancelListing = async (seller, listingId) => {
    const session = await mongoose_1.default.startSession();
    let result;
    try {
        await session.withTransaction(async () => {
            seller.$session(session);
            const listing = await Listing_1.default.findById(listingId).session(session);
            if (!listing)
                throw new errors_1.NotFoundError('Listing no encontrado');
            if (listing.estado !== 'activo') {
                throw new errors_1.ValidationError('Este listing ya no está activo');
            }
            if (listing.sellerId.toString() !== seller._id.toString()) {
                throw new errors_1.NotAuthorizedError('No puedes cancelar un listing que no es tuyo');
            }
            // Devolver el item al inventario del usuario según su tipo
            switch (listing.type) {
                case 'personaje': {
                    // Reconstruir un IPersonaje válido desde metadata
                    const md = listing.metadata;
                    seller.personajes.push({
                        personajeId: listing.itemId,
                        rango: md.rango,
                        nivel: md.nivel ?? 1,
                        etapa: md.etapa ?? 1,
                        progreso: md.progreso ?? 0,
                        stats: md.stats ?? { atk: 0, vida: 0, defensa: 0 },
                        saludActual: md.saludActual ?? md.stats?.vida ?? 100,
                        saludMaxima: md.saludMaxima ?? md.stats?.vida ?? 100,
                        estado: md.estado ?? 'saludable',
                        fechaHerido: md.fechaHerido ?? null,
                        equipamiento: Array.isArray(md.equipamiento) ? md.equipamiento : [],
                        activeBuffs: Array.isArray(md.activeBuffs) ? md.activeBuffs : []
                    });
                    break;
                }
                case 'equipamiento': {
                    // Validar limite de inventario de equipamiento
                    if (seller.inventarioEquipamiento.length >= seller.limiteInventarioEquipamiento) {
                        throw new errors_1.ValidationError('No hay espacio en el inventario de equipamiento para devolver el item.');
                    }
                    seller.inventarioEquipamiento.push(new mongoose_1.Types.ObjectId(listing.itemId));
                    break;
                }
                case 'consumible': {
                    // Validar limite de inventario de consumibles
                    if (seller.inventarioConsumibles.length >= seller.limiteInventarioConsumibles) {
                        throw new errors_1.ValidationError('No hay espacio en el inventario de consumibles para devolver el item.');
                    }
                    seller.inventarioConsumibles.push({
                        consumableId: new mongoose_1.Types.ObjectId(listing.itemId),
                        usos_restantes: listing.metadata?.usos ?? 1
                    });
                    break;
                }
            }
            // Actualizar el listing y guardar cambios
            listing.estado = 'cancelado';
            const sellerBalanceBefore = seller.val;
            const devolucionDestacado = listing.destacado
                ? Math.floor(COSTO_DESTACAR * Math.max(0, Math.min(1, (listing.fechaExpiracion.getTime() - Date.now()) / DURACION_LISTING)))
                : 0;
            if (devolucionDestacado > 0) {
                seller.val += devolucionDestacado;
            }
            await Promise.all([
                seller.save({ session }),
                listing.save({ session })
            ]);
            // ✅ AUDITORÍA: Registrar transacción de cancelación
            const listingDuration = Date.now() - listing.fechaCreacion.getTime();
            await MarketplaceTransaction_1.default.create([{
                    listingId: listing._id,
                    sellerId: seller._id,
                    itemId: listing.itemId,
                    itemType: listing.type,
                    precioOriginal: listing.precioOriginal,
                    precioFinal: listing.precio,
                    impuesto: listing.impuesto,
                    action: 'cancelled',
                    timestamp: new Date(),
                    itemMetadata: {
                        nombre: listing.metadata?.nombre,
                        imagen: listing.metadata?.imagen,
                        descripcion: listing.metadata?.descripcion,
                        rango: listing.metadata?.rango,
                        nivel: listing.metadata?.nivel,
                        stats: listing.metadata?.stats
                    },
                    balanceSnapshot: {
                        sellerBalanceBefore,
                        sellerBalanceAfter: seller.val
                    },
                    listingDuration,
                    metadata: {
                        destacado: listing.destacado,
                        fechaExpiracion: listing.fechaExpiracion
                    }
                }], { session });
            result = { success: true, message: 'Listado cancelado exitosamente' };
        });
        // Notificar en tiempo real sobre la cancelación después del commit
        if (result?.success) {
            const listing = await Listing_1.default.findById(listingId);
            if (listing) {
                try {
                    const realtime = realtime_service_1.RealtimeService.getInstance();
                    if (realtime && typeof realtime.notifyMarketplaceUpdate === 'function') {
                        realtime.notifyMarketplaceUpdate('cancelled', listing);
                    }
                }
                catch (err) {
                    console.warn('RealtimeService no disponible, skip notify (cancelListing)', err?.message || err);
                }
            }
        }
        return result;
    }
    catch (error) {
        console.error('Error al cancelar listing:', error);
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.cancelListing = cancelListing;
const buyItem = async (buyer, listingId) => {
    const session = await mongoose_1.default.startSession();
    try {
        let listing = await session.withTransaction(async () => {
            // Intentar reservar la venta de forma atómica (evita compras dobles)
            const now = new Date();
            const reserved = await Listing_1.default.findOneAndUpdate({ _id: listingId, estado: 'activo', fechaExpiracion: { $gt: now } }, { $set: { estado: 'vendido', fechaVenta: now, buyerId: buyer._id } }, { new: true, session });
            if (!reserved) {
                throw new errors_1.ValidationError('Este item ya no está disponible');
            }
            // Cargar seller y buyer frescos en la sesión
            const seller = await User_1.User.findById(reserved.sellerId).session(session);
            if (!seller)
                throw new errors_1.NotFoundError('Vendedor no encontrado');
            const buyerDoc = await User_1.User.findById(buyer._id).session(session);
            if (!buyerDoc)
                throw new errors_1.NotFoundError('Comprador no encontrado');
            // No permitir que el vendedor compre su propio item
            if (seller._id.toString() === buyerDoc._id.toString()) {
                throw new errors_1.ValidationError('No puedes comprar tu propio item');
            }
            // Verificar fondos del comprador
            if (buyerDoc.val < reserved.precio) {
                throw new errors_1.InsufficientFundsError('No tienes suficiente VAL para comprar este item');
            }
            // Validar capacidad de inventario según tipo
            switch (reserved.type) {
                case 'equipamiento': {
                    if (buyerDoc.inventarioEquipamiento.length >= buyerDoc.limiteInventarioEquipamiento) {
                        throw new errors_1.ValidationError('Inventario de equipamiento lleno');
                    }
                    break;
                }
                case 'consumible': {
                    if (buyerDoc.inventarioConsumibles.length >= buyerDoc.limiteInventarioConsumibles) {
                        throw new errors_1.ValidationError('Inventario de consumibles lleno');
                    }
                    break;
                }
            }
            // Realizar la transacción de VAL
            buyerDoc.val -= reserved.precio;
            seller.val += (reserved.precio - reserved.impuesto);
            // Transferir el item según su tipo
            switch (reserved.type) {
                case 'personaje': {
                    const md = reserved.metadata || {};
                    buyerDoc.personajes.push({
                        personajeId: reserved.itemId,
                        nivel: md.nivel ?? 1,
                        etapa: md.etapa ?? 1,
                        stats: md.stats ?? { atk: 0, defensa: 0, vida: 100 },
                        progreso: md.progreso ?? 0,
                        activeBuffs: [], // Reiniciar buffs al transferir
                        equipamiento: [], // Reiniciar equipamiento al transferir
                        saludActual: md.stats?.vida ?? 100,
                        saludMaxima: md.stats?.vida ?? 100,
                        estado: 'saludable',
                        fechaHerido: null,
                        rango: md.rango
                    });
                    break;
                }
                case 'equipamiento': {
                    buyerDoc.inventarioEquipamiento.push(new mongoose_1.Types.ObjectId(reserved.itemId));
                    break;
                }
                case 'consumible': {
                    buyerDoc.inventarioConsumibles.push({
                        consumableId: new mongoose_1.Types.ObjectId(reserved.itemId),
                        usos_restantes: reserved.metadata?.usos ?? 1
                    });
                    break;
                }
            }
            // Guardar balances antes de las transacciones para snapshot
            const buyerBalanceBefore = buyerDoc.val + reserved.precio;
            const sellerBalanceBefore = seller.val - (reserved.precio - reserved.impuesto);
            // Guardar todos los cambios
            await Promise.all([
                buyerDoc.save({ session }),
                seller.save({ session })
            ]);
            // ✅ AUDITORÍA: Registrar transacción de venta
            const listingDuration = Date.now() - reserved.fechaCreacion.getTime();
            await MarketplaceTransaction_1.default.create([{
                    listingId: reserved._id,
                    sellerId: reserved.sellerId,
                    buyerId: buyerDoc._id,
                    itemId: reserved.itemId,
                    itemType: reserved.type,
                    precioOriginal: reserved.precioOriginal,
                    precioFinal: reserved.precio,
                    impuesto: reserved.impuesto,
                    action: 'sold',
                    timestamp: new Date(),
                    itemMetadata: {
                        nombre: reserved.metadata?.nombre,
                        imagen: reserved.metadata?.imagen,
                        descripcion: reserved.metadata?.descripcion,
                        rango: reserved.metadata?.rango,
                        nivel: reserved.metadata?.nivel,
                        stats: reserved.metadata?.stats
                    },
                    balanceSnapshot: {
                        sellerBalanceBefore,
                        sellerBalanceAfter: seller.val,
                        buyerBalanceBefore,
                        buyerBalanceAfter: buyerDoc.val
                    },
                    listingDuration,
                    metadata: {
                        destacado: reserved.destacado,
                        fechaExpiracion: reserved.fechaExpiracion
                    }
                }], { session });
            return reserved;
        });
        // Notificar en tiempo real sobre la venta y actualización de inventarios tras commit
        if (listing) {
            try {
                const realtimeService = realtime_service_1.RealtimeService.getInstance();
                if (realtimeService && typeof realtimeService.notifyMarketplaceUpdate === 'function') {
                    realtimeService.notifyMarketplaceUpdate('sold', listing);
                }
                const buyerId = listing.buyerId?.toString() || '';
                const sellerId = listing.sellerId.toString();
                // Cargar usuarios para notificar inventario
                const [buyerFresh, sellerFresh] = await Promise.all([
                    buyerId ? User_1.User.findById(buyerId) : null,
                    User_1.User.findById(sellerId)
                ]);
                if (buyerFresh && typeof realtimeService?.notifyInventoryUpdate === 'function')
                    realtimeService.notifyInventoryUpdate(buyerId, buyerFresh);
                if (sellerFresh && typeof realtimeService?.notifyInventoryUpdate === 'function')
                    realtimeService.notifyInventoryUpdate(sellerId, sellerFresh);
            }
            catch (err) {
                console.warn('RealtimeService no disponible, skip notify (buyItem)', err?.message || err);
            }
        }
        return { success: true, transaction: listing };
    }
    catch (error) {
        console.error('Error al comprar item:', error);
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.buyItem = buyItem;
const getListings = async (filters) => {
    try {
        // ✅ Query base: solo listings activos y no expirados
        const query = {
            estado: 'activo',
            fechaExpiracion: { $gt: new Date() }
        };
        // 🔍 NUEVO: Búsqueda por texto (nombre del item)
        if (filters.search) {
            query['metadata.nombre'] = {
                $regex: filters.search,
                $options: 'i' // Case insensitive
            };
        }
        // ✅ Filtro por tipo con validación
        if (filters.type) {
            const tiposValidos = ['personaje', 'equipamiento', 'consumible', 'especial'];
            if (!tiposValidos.includes(filters.type)) {
                throw new errors_1.ValidationError('Tipo de item no válido');
            }
            query.type = filters.type;
        }
        // ✅ Filtro por destacados
        if (filters.destacados) {
            query.destacado = true;
        }
        // ✅ Filtro por rango con validación
        if (filters.rango) {
            const rangosValidos = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
            if (!rangosValidos.includes(filters.rango)) {
                throw new errors_1.ValidationError('Rango no válido');
            }
            query['metadata.rango'] = filters.rango;
        }
        // 🎮 NUEVO: Filtro por etapa
        if (filters.etapa) {
            if (filters.etapa < 1 || filters.etapa > 3) {
                throw new errors_1.ValidationError('La etapa debe ser 1, 2 o 3');
            }
            query['metadata.etapa'] = filters.etapa;
        }
        // ✅ Filtro por precio con validación
        if (filters.precioMin || filters.precioMax) {
            query.precio = {};
            if (filters.precioMin != null) {
                if (filters.precioMin < 0) {
                    throw new errors_1.ValidationError('El precio mínimo no puede ser negativo');
                }
                query.precio.$gte = filters.precioMin;
            }
            if (filters.precioMax != null) {
                if (filters.precioMax < 0) {
                    throw new errors_1.ValidationError('El precio máximo no puede ser negativo');
                }
                if (filters.precioMin && filters.precioMax < filters.precioMin) {
                    throw new errors_1.ValidationError('El precio máximo debe ser mayor al precio mínimo');
                }
                query.precio.$lte = filters.precioMax;
            }
        }
        // ✅ Filtro por nivel con validación
        if (filters.nivelMin || filters.nivelMax) {
            query['metadata.nivel'] = {};
            if (filters.nivelMin != null) {
                if (filters.nivelMin < 1 || filters.nivelMin > 100) {
                    throw new errors_1.ValidationError('El nivel mínimo debe estar entre 1 y 100');
                }
                query['metadata.nivel'].$gte = filters.nivelMin;
            }
            if (filters.nivelMax != null) {
                if (filters.nivelMax < 1 || filters.nivelMax > 100) {
                    throw new errors_1.ValidationError('El nivel máximo debe estar entre 1 y 100');
                }
                if (filters.nivelMin && filters.nivelMax < filters.nivelMin) {
                    throw new errors_1.ValidationError('El nivel máximo debe ser mayor al nivel mínimo');
                }
                query['metadata.nivel'].$lte = filters.nivelMax;
            }
        }
        // ⚔️ NUEVO: Filtro por ATK
        if (filters.atkMin || filters.atkMax) {
            query['metadata.stats.atk'] = {};
            if (filters.atkMin != null) {
                if (filters.atkMin < 0) {
                    throw new errors_1.ValidationError('El ATK mínimo no puede ser negativo');
                }
                query['metadata.stats.atk'].$gte = filters.atkMin;
            }
            if (filters.atkMax != null) {
                if (filters.atkMax < 0) {
                    throw new errors_1.ValidationError('El ATK máximo no puede ser negativo');
                }
                if (filters.atkMin && filters.atkMax < filters.atkMin) {
                    throw new errors_1.ValidationError('El ATK máximo debe ser mayor al ATK mínimo');
                }
                query['metadata.stats.atk'].$lte = filters.atkMax;
            }
        }
        // 🛡️ NUEVO: Filtro por Vida
        if (filters.vidaMin || filters.vidaMax) {
            query['metadata.stats.vida'] = {};
            if (filters.vidaMin != null) {
                if (filters.vidaMin < 0) {
                    throw new errors_1.ValidationError('La Vida mínima no puede ser negativa');
                }
                query['metadata.stats.vida'].$gte = filters.vidaMin;
            }
            if (filters.vidaMax != null) {
                if (filters.vidaMax < 0) {
                    throw new errors_1.ValidationError('La Vida máxima no puede ser negativa');
                }
                if (filters.vidaMin && filters.vidaMax < filters.vidaMin) {
                    throw new errors_1.ValidationError('La Vida máxima debe ser mayor a la Vida mínima');
                }
                query['metadata.stats.vida'].$lte = filters.vidaMax;
            }
        }
        // 🛡️ NUEVO: Filtro por Defensa
        if (filters.defensaMin || filters.defensaMax) {
            query['metadata.stats.defensa'] = {};
            if (filters.defensaMin != null) {
                if (filters.defensaMin < 0) {
                    throw new errors_1.ValidationError('La Defensa mínima no puede ser negativa');
                }
                query['metadata.stats.defensa'].$gte = filters.defensaMin;
            }
            if (filters.defensaMax != null) {
                if (filters.defensaMax < 0) {
                    throw new errors_1.ValidationError('La Defensa máxima no puede ser negativa');
                }
                if (filters.defensaMin && filters.defensaMax < filters.defensaMin) {
                    throw new errors_1.ValidationError('La Defensa máxima debe ser mayor a la Defensa mínima');
                }
                query['metadata.stats.defensa'].$lte = filters.defensaMax;
            }
        }
        // ✅ Paginación con límites seguros
        const limit = Math.min(filters.limit || 20, 100); // Máximo 100 items por página
        const offset = Math.max(filters.offset || 0, 0);
        // ✅ Ordenamiento seguro (mejorado con nuevos campos)
        const sortField = filters.sortBy || 'fechaCreacion';
        const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
        const sort = { destacado: -1 }; // Siempre destacados primero
        if (sortField === 'precio') {
            sort.precio = sortOrder;
        }
        else if (sortField === 'fechaCreacion') {
            sort.fechaCreacion = sortOrder;
        }
        else if (sortField === 'nivel') {
            sort['metadata.nivel'] = sortOrder;
        }
        else if (sortField === 'atk') {
            sort['metadata.stats.atk'] = sortOrder;
        }
        const [listings, total] = await Promise.all([
            Listing_1.default.find(query)
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .populate('sellerId', 'username'), // ✅ Siempre mostrar nombre del vendedor
            Listing_1.default.countDocuments(query)
        ]);
        const response = {
            listings,
            total,
            hasMore: total > offset + limit,
            // Metadata de paginación
            pagination: {
                limit,
                offset,
                total,
                page: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit)
            }
        };
        // No emitir broadcast global en GET para evitar ruido
        return response;
    }
    catch (error) {
        console.error('Error al obtener listings:', error);
        throw error;
    }
};
exports.getListings = getListings;
// ✅ NUEVA: Obtener listings del usuario actual
const getUserListings = async (userId, filters = {}) => {
    try {
        // Query para obtener listings del usuario (incluyendo expirados y cancelados para historial)
        const query = { sellerId: userId };
        // Paginación
        const limit = Math.min(filters.limit || 20, 100);
        const offset = Math.max(filters.offset || 0, 0);
        const [listings, total] = await Promise.all([
            Listing_1.default.find(query)
                .sort({ fechaCreacion: -1 }) // Más recientes primero
                .skip(offset)
                .limit(limit)
                .populate('sellerId', 'username'),
            Listing_1.default.countDocuments(query)
        ]);
        return {
            listings,
            total,
            hasMore: total > offset + limit,
            pagination: {
                limit,
                offset,
                total,
                page: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    catch (error) {
        console.error('Error al obtener listings del usuario:', error);
        throw error;
    }
};
exports.getUserListings = getUserListings;
