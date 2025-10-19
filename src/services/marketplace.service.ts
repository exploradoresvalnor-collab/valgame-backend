import mongoose, { Types } from 'mongoose';
import Listing from '../models/Listing';
import { User, IUser } from '../models/User';
import BaseCharacter from '../models/BaseCharacter';
import { NotFoundError, ValidationError, InsufficientFundsError, NotAuthorizedError } from '../utils/errors';
import { RealtimeService } from './realtime.service';
const IMPUESTO_VENTA = 0.05; // 5% de impuesto por venta
const DURACION_LISTING = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
const COSTO_DESTACAR = 100; // VAL para destacar un listing

export const listItem = async (
  seller: IUser,
  itemId: string,
  precio: number,
  destacar: boolean = false,
  metadata: Record<string, any> = {}
) => {
  const session = await mongoose.startSession();
  let createdListing: any;
  try {
    await session.withTransaction(async () => {
      // Asegurar que el documento seller use la sesión
      seller.$session(session);

      // Verificar que el usuario tenga el item según su tipo
      let type: 'personaje' | 'equipamiento' | 'consumible' | 'especial' = 'equipamiento';
      let item: any;
      let characterDetails: any;

      // Determinar el tipo de item y verificar propiedad
      if (seller.personajes?.some(p => p.personajeId === itemId)) {
        type = 'personaje';
        const foundItem = seller.personajes.find(p => p.personajeId === itemId);
        if (!foundItem) throw new NotFoundError('Personaje no encontrado');
        item = foundItem;
        if (item.personajeId === seller.personajeActivoId) {
          throw new ValidationError('No puedes vender tu personaje activo');
        }

        // Obtener detalles del personaje base (para nombre/imagen si se requieren en metadata)
        characterDetails = await BaseCharacter.findOne({ id: item.personajeId }).session(session);
        if (!characterDetails) {
          throw new NotFoundError('Detalles del personaje no encontrados');
        }

        // Agregar metadata específica del personaje
        metadata = {
          ...metadata,
          nivel: item.nivel ?? 1,
          etapa: item.etapa ?? 1,
          rango: item.rango, // usar el rango del personaje del usuario, no la descripcion del base
          stats: item.stats ?? characterDetails.stats,
          progreso: item.progreso ?? 0,
          nombre: characterDetails.nombre,
          imagen: characterDetails.imagen,
          // Campos adicionales para poder restaurar en cancelListing si es necesario
          saludActual: item.saludActual,
          saludMaxima: item.saludMaxima,
          estado: item.estado,
          fechaHerido: item.fechaHerido,
          equipamiento: Array.isArray(item.equipamiento) ? [...item.equipamiento] : [],
          activeBuffs: Array.isArray(item.activeBuffs) ? [...item.activeBuffs] : []
        };
      } else if (seller.inventarioEquipamiento?.some(id => id.toString() === itemId)) {
        type = 'equipamiento';
      } else if (seller.inventarioConsumibles?.some(c => c.consumableId.toString() === itemId)) {
        type = 'consumible';
        item = seller.inventarioConsumibles.find(c => c.consumableId.toString() === itemId);
        // Guardar usos restantes en metadata para poder reconstruir/cancelar correctamente
        metadata = {
          ...metadata,
          usos: item?.usos_restantes ?? 1
        };
      } else {
        throw new NotFoundError('Item no encontrado en tu inventario');
      }

      // Calcular impuesto
      const impuesto = Math.floor(precio * IMPUESTO_VENTA);

      // Si quiere destacar el listing, verificar que tenga suficiente VAL y descontar dentro de la transacción
      if (destacar) {
        if (seller.val < COSTO_DESTACAR) {
          throw new InsufficientFundsError('No tienes suficiente VAL para destacar el item');
        }
        seller.val -= COSTO_DESTACAR;
        await seller.save({ session });
      }

      // Crear el listing
      const listing = new Listing({
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
          const sub = seller.personajes.find(p => p.personajeId === itemId) as any;
          if (sub && typeof (sub as any).deleteOne === 'function') {
            await (sub as any).deleteOne();
          } else {
            // fallback por si deleteOne no está disponible
            // @ts-ignore for typed arrays replacement
            seller.personajes = seller.personajes.filter(p => p.personajeId !== itemId) as any;
          }
          break;
        }
        case 'equipamiento': {
          seller.inventarioEquipamiento = seller.inventarioEquipamiento.filter(id => id.toString() !== itemId);
          break;
        }
        case 'consumible': {
          const sub = seller.inventarioConsumibles.find(c => c.consumableId.toString() === itemId) as any;
          if (sub && typeof (sub as any).deleteOne === 'function') {
            await (sub as any).deleteOne();
          } else {
            seller.inventarioConsumibles = seller.inventarioConsumibles.filter(c => c.consumableId.toString() !== itemId) as any;
          }
          break;
        }
      }

      await seller.save({ session });

      createdListing = listing.toObject();
    });

    // Notificar en tiempo real sobre el nuevo listado después del commit
    if (createdListing) {
      RealtimeService.getInstance().notifyMarketplaceUpdate('new', createdListing);
    }

    return createdListing;
  } catch (error) {
    console.error('Error al listar item:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const cancelListing = async (seller: IUser, listingId: string) => {
  const session = await mongoose.startSession();
  let result: any;
  try {
    await session.withTransaction(async () => {
      seller.$session(session);

      const listing = await Listing.findById(listingId).session(session);
      if (!listing) throw new NotFoundError('Listing no encontrado');
      if (listing.estado !== 'activo') {
        throw new ValidationError('Este listing ya no está activo');
      }
      if (listing.sellerId.toString() !== (seller._id as Types.ObjectId).toString()) {
        throw new NotAuthorizedError('No puedes cancelar un listing que no es tuyo');
      }

      // Devolver el item al inventario del usuario según su tipo
      switch (listing.type) {
        case 'personaje': {
          // Reconstruir un IPersonaje válido desde metadata
          const md = listing.metadata as any;
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
          // Validar limite de inventario de equipamiento
          if (seller.inventarioEquipamiento.length >= seller.limiteInventarioEquipamiento) {
            throw new ValidationError('No hay espacio en el inventario de equipamiento para devolver el item.');
          }
          seller.inventarioEquipamiento.push(new Types.ObjectId(listing.itemId));
          break;
        }
        case 'consumible': {
          // Validar limite de inventario de consumibles
          if (seller.inventarioConsumibles.length >= seller.limiteInventarioConsumibles) {
            throw new ValidationError('No hay espacio en el inventario de consumibles para devolver el item.');
          }
          seller.inventarioConsumibles.push({
            consumableId: new Types.ObjectId(listing.itemId),
            usos_restantes: (listing.metadata as any)?.usos ?? 1
          } as any);
          break;
        }
      }

      // Si el listing estaba destacado, devolver parte del costo (prorrateado)
      if (listing.destacado) {
        const tiempoRestante = listing.fechaExpiracion.getTime() - Date.now();
        const proporcionRestante = Math.max(0, Math.min(1, tiempoRestante / DURACION_LISTING));
        const devolucion = Math.floor(COSTO_DESTACAR * proporcionRestante);
        seller.val += devolucion;
      }

      // Actualizar el listing y guardar cambios
      listing.estado = 'cancelado';

      await Promise.all([
        seller.save({ session }),
        listing.save({ session })
      ]);

      result = { success: true, message: 'Listado cancelado exitosamente' };
    });

    // Notificar en tiempo real sobre la cancelación después del commit
    if (result?.success) {
      const listing = await Listing.findById(listingId);
      if (listing) {
        RealtimeService.getInstance().notifyMarketplaceUpdate('cancelled', listing);
      }
    }

    return result;
  } catch (error) {
    console.error('Error al cancelar listing:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const buyItem = async (buyer: IUser, listingId: string) => {
  const session = await mongoose.startSession();
  try {
    let listing = await session.withTransaction(async () => {
      // Intentar reservar la venta de forma atómica (evita compras dobles)
      const now = new Date();
      const reserved = await Listing.findOneAndUpdate(
        { _id: listingId, estado: 'activo', fechaExpiracion: { $gt: now } },
        { $set: { estado: 'vendido', fechaVenta: now, buyerId: buyer._id } },
        { new: true, session }
      );

      if (!reserved) {
        throw new ValidationError('Este item ya no está disponible');
      }

      // Cargar seller y buyer frescos en la sesión
      const seller = await User.findById(reserved.sellerId).session(session);
      if (!seller) throw new NotFoundError('Vendedor no encontrado');

      const buyerDoc = await User.findById(buyer._id).session(session);
      if (!buyerDoc) throw new NotFoundError('Comprador no encontrado');

      // No permitir que el vendedor compre su propio item
      if ((seller._id as Types.ObjectId).toString() === (buyerDoc._id as Types.ObjectId).toString()) {
        throw new ValidationError('No puedes comprar tu propio item');
      }

      // Verificar fondos del comprador
      if (buyerDoc.val < reserved.precio) {
        throw new InsufficientFundsError('No tienes suficiente VAL para comprar este item');
      }

      // Validar capacidad de inventario según tipo
      switch (reserved.type) {
        case 'equipamiento': {
          if (buyerDoc.inventarioEquipamiento.length >= buyerDoc.limiteInventarioEquipamiento) {
            throw new ValidationError('Inventario de equipamiento lleno');
          }
          break;
        }
        case 'consumible': {
          if (buyerDoc.inventarioConsumibles.length >= buyerDoc.limiteInventarioConsumibles) {
            throw new ValidationError('Inventario de consumibles lleno');
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
          const md = (reserved.metadata as any) || {};
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
          } as any);
          break;
        }
        case 'equipamiento': {
          buyerDoc.inventarioEquipamiento.push(new Types.ObjectId(reserved.itemId));
          break;
        }
        case 'consumible': {
          buyerDoc.inventarioConsumibles.push({
            consumableId: new Types.ObjectId(reserved.itemId),
            usos_restantes: (reserved.metadata as any)?.usos ?? 1
          } as any);
          break;
        }
      }

      // Guardar todos los cambios
      await Promise.all([
        buyerDoc.save({ session }),
        seller.save({ session })
      ]);

      return reserved;
    });

    // Notificar en tiempo real sobre la venta y actualización de inventarios tras commit
    if (listing) {
      const realtimeService = RealtimeService.getInstance();
      realtimeService.notifyMarketplaceUpdate('sold', listing);
      const buyerId = (listing.buyerId as unknown as Types.ObjectId)?.toString() || '';
      const sellerId = (listing.sellerId as Types.ObjectId).toString();
      // Cargar usuarios para notificar inventario
      const [buyerFresh, sellerFresh] = await Promise.all([
        buyerId ? User.findById(buyerId) : null,
        User.findById(sellerId)
      ]);
      if (buyerFresh) realtimeService.notifyInventoryUpdate(buyerId, buyerFresh);
      if (sellerFresh) realtimeService.notifyInventoryUpdate(sellerId, sellerFresh);
    }

    return { success: true, transaction: listing };
  } catch (error) {
    console.error('Error al comprar item:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const getListings = async (filters: {
  type?: string,
  precioMin?: number,
  precioMax?: number,
  destacados?: boolean,
  rango?: string,
  nivelMin?: number,
  nivelMax?: number,
  limit?: number,
  offset?: number
}) => {
  try {
    const query: any = { estado: 'activo', fechaExpiracion: { $gt: new Date() } };

    if (filters.type) query.type = filters.type;
    if (filters.destacados) query.destacado = true;
    if (filters.rango) query['metadata.rango'] = filters.rango;
    if (filters.precioMin || filters.precioMax) {
      query.precio = {};
      if (filters.precioMin != null) query.precio.$gte = filters.precioMin;
      if (filters.precioMax != null) query.precio.$lte = filters.precioMax;
    }
    if (filters.nivelMin || filters.nivelMax) {
      query['metadata.nivel'] = {};
      if (filters.nivelMin != null) query['metadata.nivel'].$gte = filters.nivelMin;
      if (filters.nivelMax != null) query['metadata.nivel'].$lte = filters.nivelMax;
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .sort({ destacado: -1, fechaCreacion: -1 })
        .skip(offset)
        .limit(limit)
        .populate('sellerId', 'username'),
      Listing.countDocuments(query)
    ]);

    const response = {
      listings,
      total,
      hasMore: total > offset + limit
    };

    // No emitir broadcast global en GET para evitar ruido
    return response;
  } catch (error) {
    console.error('Error al obtener listings:', error);
    throw error;
  }
};
