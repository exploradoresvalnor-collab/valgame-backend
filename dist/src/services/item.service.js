"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Item_1 = require("../models/Item");
const GameSetting_1 = __importDefault(require("../models/GameSetting"));
const errors_1 = require("../utils/errors");
const PurchaseTransaction_1 = __importDefault(require("../models/PurchaseTransaction"));
class ItemService {
    static async buyItem(user, itemId, cantidad = 1, currency = 'val') {
        const session = await mongoose_1.default.startSession();
        try {
            let result = null;
            await session.withTransaction(async () => {
                user.$session(session);
                // Validaciones básicas
                if (cantidad <= 0)
                    throw new errors_1.ValidationError('Cantidad inválida');
                const item = await Item_1.Item.findById(itemId).session(session);
                if (!item)
                    throw new errors_1.NotFoundError('Item no encontrado');
                const costoVal = item.costo_val;
                if (typeof costoVal !== 'number' || isNaN(costoVal) || costoVal < 0) {
                    throw new errors_1.ValidationError('Este item no está disponible para compra');
                }
                const gameSettings = await GameSetting_1.default.findOne().session(session);
                const costoTicketEnVal = gameSettings?.costo_ticket_en_val || 100;
                const totalCostoVal = Math.floor(costoVal * cantidad);
                if (currency === 'val') {
                    if (user.val < totalCostoVal)
                        throw new errors_1.InsufficientFundsError('No tienes suficiente VAL');
                    user.val -= totalCostoVal;
                }
                else {
                    // Convertir a boletos
                    const requiredBoletos = Math.ceil(totalCostoVal / costoTicketEnVal);
                    if (user.boletos < requiredBoletos)
                        throw new errors_1.InsufficientFundsError('No tienes suficientes boletos');
                    user.boletos -= requiredBoletos;
                }
                // Agregar item(s) al inventario según tipo
                const tipoItem = item.tipoItem;
                if (tipoItem === 'Consumable') {
                    if ((user.inventarioConsumibles.length + cantidad) > user.limiteInventarioConsumibles) {
                        throw new errors_1.ValidationError('No hay espacio en inventario de consumibles');
                    }
                    const usos = item.usos_maximos || 1;
                    for (let i = 0; i < cantidad; i++) {
                        user.inventarioConsumibles.push({ consumableId: item._id, usos_restantes: usos });
                    }
                }
                else {
                    // Asumir equipamiento u otro tipo que ocupa inventarioEquipamiento
                    if ((user.inventarioEquipamiento.length + cantidad) > user.limiteInventarioEquipamiento) {
                        throw new errors_1.ValidationError('No hay espacio en inventario de equipamiento');
                    }
                    for (let i = 0; i < cantidad; i++) {
                        user.inventarioEquipamiento.push(item._id);
                    }
                }
                await user.save({ session });
                // Registrar auditoría de compra dentro de la misma transacción
                await PurchaseTransaction_1.default.create([{
                        userId: user._id,
                        itemId: item._id,
                        cantidad,
                        currency,
                        totalCostoVal,
                        metadata: {
                            itemNombre: item.nombre,
                            rango: item.rango || null
                        },
                        timestamp: new Date()
                    }], { session });
                result = {
                    itemId: item._id,
                    nombre: item.nombre,
                    cantidad,
                    currency,
                    totalCostoVal
                };
            });
            return result;
        }
        catch (err) {
            throw err;
        }
        finally {
            session.endSession();
        }
    }
}
exports.ItemService = ItemService;
