import cron from 'node-cron';
import mongoose, { Types } from 'mongoose';
import Listing from '../models/Listing';
import { User } from '../models/User';
import { RealtimeService } from './realtime.service';

// Expira listings cuya fechaExpiracion ya pasó:
// - Marca el listing como 'expirado'
// - Devuelve el ítem al vendedor
// - No hay reembolso del costo de destacado
export const expireDueListings = async () => {
  const now = new Date();
  const dueListings = await Listing.find({ estado: 'activo', fechaExpiracion: { $lte: now } }).limit(100);
  if (!dueListings.length) return;

  for (const listing of dueListings) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const seller = await User.findById(listing.sellerId).session(session);
        if (!seller) {
          // Si el vendedor no existe, solo marcar como expirado
          listing.estado = 'expirado';
          await listing.save({ session });
          return;
        }

        // Devolver el item al inventario del usuario según su tipo
        switch (listing.type) {
          case 'personaje': {
            const md = (listing.metadata as any) || {};
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
            } as any);
            break;
          }
          case 'equipamiento': {
            seller.inventarioEquipamiento.push(new Types.ObjectId(listing.itemId));
            break;
          }
          case 'consumible': {
            seller.inventarioConsumibles.push({
              consumableId: new Types.ObjectId(listing.itemId),
              usos_restantes: (listing.metadata as any)?.usos ?? 1
            } as any);
            break;
          }
        }

        listing.estado = 'expirado';
        await Promise.all([
          seller.save({ session }),
          listing.save({ session })
        ]);
      });
    } catch (err) {
      console.error('[CRON-Marketplace] Error al expirar listing', listing._id?.toString(), err);
    } finally {
      session.endSession();
    }
  }

  try {
    // Tras procesar, se puede emitir un refresh global para que los clientes vuelvan a consultar
    const realtime = RealtimeService.getInstance();
    realtime.notifyMarketplaceUpdate('refresh', { listings: [], total: 0, hasMore: false });
  } catch {}
};

export const startMarketplaceExpirationCron = () => {
  // Ejecuta cada 5 minutos
  cron.schedule('*/5 * * * *', expireDueListings, { timezone: 'Etc/UTC' });
  console.log('[CRON-Marketplace] Tarea de expiración de listings programada cada 5 minutos.');
};
