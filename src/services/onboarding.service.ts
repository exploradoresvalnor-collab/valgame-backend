import { User, IUser } from '../models/User';
import BaseCharacter from '../models/BaseCharacter';
import { Consumable } from '../models/Consumable';
import PackageModel from '../models/Package';
import { Types } from 'mongoose';

export async function deliverPioneerPackage(user: IUser) {
  // Si ya lo recibió, no hacemos nada (idempotencia)
  if ((user as any).receivedPioneerPackage) {
    return { delivered: false, reason: 'already_received' };
  }

  // Buscar BaseCharacter rango D
  const baseChar = await BaseCharacter.findOne({ descripcion_rango: 'D' });
  if (!baseChar) {
    // No crear en tiempo de ejecución para evitar duplicados; el seed debe garantizar esto.
    console.error('[ONBOARDING] BaseCharacter rango D no encontrado. Ejecuta el seed o agrega el personaje base manualmente.');
    return { delivered: false, reason: 'base_character_missing' };
  }

  // Crear personaje para el usuario
  const pioneerCharacter = {
    personajeId: baseChar.id,
    rango: 'D',
    nivel: 1,
    etapa: 1,
    progreso: 0,
    stats: baseChar.stats,
    saludActual: baseChar.stats.vida,
    saludMaxima: baseChar.stats.vida,
    estado: 'saludable',
    fechaHerido: null,
    equipamiento: [],
    activeBuffs: []
  } as any;

  user.personajes.push(pioneerCharacter as any);

  // Asignar VAL inicial (logica simple: 100)
  // El paquete del pionero ahora otorga 50 VAL según solicitud
  user.val = (user.val || 0) + 50;

  // Añadir consumibles (usando el seed ID si existe)
  try {
    const potionId = new Types.ObjectId('68dc525adb5c735854b5659d');
    const potion = await Consumable.findById(potionId);
    if (potion) {
      // Añadir 3 pociones al inventario de consumibles
      for (let i = 0; i < 3; i++) {
        (user as any).inventarioConsumibles.push({ consumableId: potionId, usos_restantes: potion.usos_maximos || 1 });
      }
    }
  } catch (err) {
    // No bloquear si falla
    console.warn('[ONBOARDING] No fue posible asignar consumibles iniciales:', err);
  }

  // Añadir el equipamiento inicial (Espada Corta Oxidada) si existe
  try {
    const swordId = new Types.ObjectId('68dc50e9db5c735854b56591');
    const sword = await (await import('../models/Equipment')).Equipment.findById(swordId);
    if (sword) {
      // Añadir al inventarioEquipamiento si aún no está
      if (!(user.inventarioEquipamiento || []).some((id: any) => String(id) === String(swordId))) {
        (user as any).inventarioEquipamiento = user.inventarioEquipamiento || [];
        (user as any).inventarioEquipamiento.push(swordId);
      }
    }
  } catch (err) {
    console.warn('[ONBOARDING] No fue posible asignar equipamiento inicial:', err);
  }

  // Marcar como recibido y guardar
  (user as any).receivedPioneerPackage = true;
  await user.save();

  return { delivered: true, characterId: pioneerCharacter.personajeId };
}

export default { deliverPioneerPackage };
