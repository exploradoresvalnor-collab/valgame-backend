import { User, IUser } from '../models/User';
import BaseCharacter from '../models/BaseCharacter';
import { Consumable } from '../models/Consumable';
import PackageModel from '../models/Package';
import { Types } from 'mongoose';

export async function deliverPioneerPackage(user: IUser) {
  // Si ya lo recibió, no hacemos nada (idempotencia)
  if ((user as any).receivedPioneerPackage) {
    console.log('[ONBOARDING] ⚠️ Paquete del Pionero ya entregado anteriormente');
    return { delivered: false, reason: 'already_received' };
  }

  // Buscar cualquier BaseCharacter para el personaje inicial (usualmente el primero)
  const baseChar = await BaseCharacter.findOne().sort({ _id: 1 }).limit(1);
  if (!baseChar) {
    console.error('[ONBOARDING] ❌ No hay BaseCharacters en la base de datos. Ejecuta: node scripts/seed-base-characters.js --force');
    return { delivered: false, reason: 'base_character_missing' };
  }
  
  console.log(`[ONBOARDING] ✅ Personaje base seleccionado: ${baseChar.nombre}`);

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
  console.log(`[ONBOARDING] ✅ Personaje agregado: ${baseChar.nombre} (Rango D, Nivel 1)`);

  // === RECURSOS INICIALES ===
  
  // 1. VAL (moneda principal)
  const valInicial = 100;
  user.val = (user.val || 0) + valInicial;
  console.log(`[ONBOARDING] 💰 VAL otorgado: ${valInicial}`);

  // 2. Boletos (para abrir paquetes y conseguir personajes)
  const boletosIniciales = 10;
  user.boletos = (user.boletos || 0) + boletosIniciales;
  console.log(`[ONBOARDING] 🎫 Boletos otorgados: ${boletosIniciales}`);

  // 2.5. Energía (para actividades como mazmorras)
  const energiaInicial = 100;
  user.energia = energiaInicial;
  user.energiaMaxima = 100;
  console.log(`[ONBOARDING] ⚡ Energía inicial: ${energiaInicial}/${user.energiaMaxima}`);

  // 3. EVO (para evolucionar personajes)
  const evoInicial = 2;
  user.evo = (user.evo || 0) + evoInicial;
  console.log(`[ONBOARDING] ⚡ EVO otorgado: ${evoInicial}`);

  // 5. Pociones (buscar cualquier consumible tipo poción)
  try {
    const potion = await Consumable.findOne({ tipo: 'pocion' }).sort({ _id: 1 }).limit(1);
    if (potion) {
      for (let i = 0; i < 3; i++) {
        (user as any).inventarioConsumibles.push({ 
          consumableId: potion._id, 
          usos_restantes: potion.usos_maximos || 1 
        });
      }
      console.log(`[ONBOARDING] 🧪 Pociones otorgadas: 3x ${potion.nombre}`);
    } else {
      console.warn('[ONBOARDING] ⚠️ No hay pociones en la BD, omitiendo...');
    }
  } catch (err) {
    console.warn('[ONBOARDING] ⚠️ No fue posible asignar consumibles iniciales');
  }

  // 6. Equipamiento inicial (buscar el equipamiento más básico)
  try {
    const { Equipment } = await import('../models/Equipment');
    const basicWeapon = await Equipment.findOne({ 
      tipo: 'arma' 
    }).sort({ 'stats.ataque': 1 }).limit(1); // El arma más débil
    
    if (basicWeapon) {
      (user as any).inventarioEquipamiento = user.inventarioEquipamiento || [];
      (user as any).inventarioEquipamiento.push(basicWeapon._id);
      console.log(`[ONBOARDING] ⚔️ Equipamiento otorgado: ${basicWeapon.nombre}`);
    } else {
      console.warn('[ONBOARDING] ⚠️ No hay equipamiento en la BD, omitiendo...');
    }
  } catch (err) {
    console.warn('[ONBOARDING] ⚠️ No fue posible asignar equipamiento inicial');
  }

  // Marcar como recibido y guardar
  (user as any).receivedPioneerPackage = true;
  await user.save();

  console.log('[ONBOARDING] 🎉 Paquete del Pionero entregado exitosamente');

  return { 
    delivered: true, 
    rewards: {
      personaje: baseChar.nombre,
      val: valInicial,
      boletos: boletosIniciales,
      evo: evoInicial,
      pociones: 3,
      equipamiento: 1
    }
  };
}

export default { deliverPioneerPackage };
