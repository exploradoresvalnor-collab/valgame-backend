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
exports.startMarketplaceExpirationCron = exports.expireDueListings = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const mongoose_1 = __importStar(require("mongoose"));
const Listing_1 = __importDefault(require("../models/Listing"));
const User_1 = require("../models/User");
const realtime_service_1 = require("./realtime.service");
// Expira listings cuya fechaExpiracion ya pasó:
// - Marca el listing como 'expirado'
// - Devuelve el ítem al vendedor
// - No hay reembolso del costo de destacado
const expireDueListings = async () => {
    const now = new Date();
    const dueListings = await Listing_1.default.find({ estado: 'activo', fechaExpiracion: { $lte: now } }).limit(100);
    if (!dueListings.length)
        return;
    for (const listing of dueListings) {
        const session = await mongoose_1.default.startSession();
        try {
            await session.withTransaction(async () => {
                const seller = await User_1.User.findById(listing.sellerId).session(session);
                if (!seller) {
                    // Si el vendedor no existe, solo marcar como expirado
                    listing.estado = 'expirado';
                    await listing.save({ session });
                    return;
                }
                // Devolver el item al inventario del usuario según su tipo
                switch (listing.type) {
                    case 'personaje': {
                        const md = listing.metadata || {};
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
                        seller.inventarioEquipamiento.push(new mongoose_1.Types.ObjectId(listing.itemId));
                        break;
                    }
                    case 'consumible': {
                        seller.inventarioConsumibles.push({
                            consumableId: new mongoose_1.Types.ObjectId(listing.itemId),
                            usos_restantes: listing.metadata?.usos ?? 1
                        });
                        break;
                    }
                }
                listing.estado = 'expirado';
                await Promise.all([
                    seller.save({ session }),
                    listing.save({ session })
                ]);
            });
        }
        catch (err) {
            console.error('[CRON-Marketplace] Error al expirar listing', listing._id?.toString(), err);
        }
        finally {
            session.endSession();
        }
    }
    try {
        // Tras procesar, se puede emitir un refresh global para que los clientes vuelvan a consultar
        const realtime = realtime_service_1.RealtimeService.getInstance();
        realtime.notifyMarketplaceUpdate('refresh', { listings: [], total: 0, hasMore: false });
    }
    catch { }
};
exports.expireDueListings = expireDueListings;
const startMarketplaceExpirationCron = () => {
    // Ejecuta cada 5 minutos
    node_cron_1.default.schedule('*/5 * * * *', exports.expireDueListings, { timezone: 'Etc/UTC' });
    console.log('[CRON-Marketplace] Tarea de expiración de listings programada cada 5 minutos.');
};
exports.startMarketplaceExpirationCron = startMarketplaceExpirationCron;
