import mongoose from 'mongoose';
import { Item } from '../models/Item';
import { User, IUser } from '../models/User';
import GameSetting from '../models/GameSetting';
import { NotFoundError, ValidationError, InsufficientFundsError } from '../utils/errors';
import PurchaseTransaction from '../models/PurchaseTransaction';

export class ItemService {
  static async buyItem(user: IUser, itemId: string, cantidad: number = 1, currency: 'val' | 'boletos' = 'val') {
    const session = await mongoose.startSession();
    try {
      let result: any = null;
      await session.withTransaction(async () => {
        user.$session(session);

        // Validaciones básicas
        if (cantidad <= 0) throw new ValidationError('Cantidad inválida');

        const item = await Item.findById(itemId).session(session);
        if (!item) throw new NotFoundError('Item no encontrado');

        const costoVal = (item as any).costo_val;
        if (typeof costoVal !== 'number' || isNaN(costoVal) || costoVal < 0) {
          throw new ValidationError('Este item no está disponible para compra');
        }

        const gameSettings = await GameSetting.findOne().session(session);
        const costoTicketEnVal = gameSettings?.costo_ticket_en_val || 100;

        const totalCostoVal = Math.floor(costoVal * cantidad);

        if (currency === 'val') {
          if (user.val < totalCostoVal) throw new InsufficientFundsError('No tienes suficiente VAL');
          user.val -= totalCostoVal;
        } else {
          // Convertir a boletos
          const requiredBoletos = Math.ceil(totalCostoVal / costoTicketEnVal);
          if (user.boletos < requiredBoletos) throw new InsufficientFundsError('No tienes suficientes boletos');
          user.boletos -= requiredBoletos;
        }

        // Agregar item(s) al inventario según tipo
        const tipoItem = (item as any).tipoItem;

        if (tipoItem === 'Consumable') {
          if ((user.inventarioConsumibles.length + cantidad) > user.limiteInventarioConsumibles) {
            throw new ValidationError('No hay espacio en inventario de consumibles');
          }
          const usos = (item as any).usos_maximos || 1;
          for (let i = 0; i < cantidad; i++) {
            user.inventarioConsumibles.push({ consumableId: item._id, usos_restantes: usos } as any);
          }
        } else {
          // Asumir equipamiento u otro tipo que ocupa inventarioEquipamiento
          if ((user.inventarioEquipamiento.length + cantidad) > user.limiteInventarioEquipamiento) {
            throw new ValidationError('No hay espacio en inventario de equipamiento');
          }
          for (let i = 0; i < cantidad; i++) {
            user.inventarioEquipamiento.push((item._id as any));
          }
        }

        await user.save({ session });

        // Registrar auditoría de compra dentro de la misma transacción
        await PurchaseTransaction.create([{
          userId: user._id,
          itemId: item._id,
          cantidad,
          currency,
          totalCostoVal,
          metadata: {
            itemNombre: item.nombre,
            rango: (item as any).rango || null
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
    } catch (err) {
      throw err;
    } finally {
      session.endSession();
    }
  }
}
