import 'dotenv/config';
import { connectDB } from './config/db';
import { Types } from 'mongoose';
import BaseCharacter from './models/BaseCharacter';
import { Consumable } from './models/Consumable';
import PackageModel from './models/Package';
import { Equipment } from './models/Equipment';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[SEED] Falta MONGODB_URI en el entorno.');
    process.exit(1);
  }

  await connectDB(uri);
  console.log('[SEED] Conectado a la BD. Iniciando seed...');

  try {
    // Consumible inicial (ID hardcodeado usado por el register)
    const potionId = new Types.ObjectId('68dc525adb5c735854b5659d');
    let potion = await Consumable.findById(potionId);
    if (!potion) {
      potion = await Consumable.create({
        _id: potionId,
        nombre: 'Poción de Vida',
        descripcion: 'Cura y otorga un pequeño buff temporal',
        rango: 'D',
        tipo: 'pocion',
        usos_maximos: 3,
        duracion_efecto_minutos: 30,
        efectos: {
          mejora_vida: 50,
          mejora_atk: 0,
          mejora_defensa: 0,
          mejora_xp_porcentaje: 0
        }
      } as any);
  console.log('[SEED] Consumible inicial creado:', String((potion as any)._id));
    } else {
  console.log('[SEED] Consumible inicial ya existe:', String((potion as any)._id));
    }

    // BaseCharacter rango D
    let baseD = await BaseCharacter.findOne({ descripcion_rango: 'D' });
    if (!baseD) {
      baseD = await BaseCharacter.create({
        id: 'base_d_001',
        nombre: 'Explorador Novato',
        imagen: 'default_base_d.png', // valor por defecto válido para evitar validación
        descripcion_rango: 'D',
        multiplicador_base: 1,
        nivel: 1,
        etapa: 1,
        val_por_nivel_por_etapa: [1],
        stats: { atk: 5, vida: 100, defensa: 2 },
        progreso: 0,
        ultimoMinado: null,
        evoluciones: []
      } as any);
  console.log('[SEED] BaseCharacter rango D creado:', baseD.id || String((baseD as any)._id));
    } else {
  console.log('[SEED] BaseCharacter rango D ya existe:', baseD.id || String((baseD as any)._id));
    }

    // Paquete básico (opcional) - crear si no existe
    const pkgName = 'Paquete Pionero';
    let pkg = await PackageModel.findOne({ nombre: pkgName });
    if (!pkg) {
      pkg = await PackageModel.create({
        nombre: pkgName,
        precio_usdt: 0,
        personajes: 1,
        categorias_garantizadas: ['D'],
        distribucion_aleatoria: 'simple',
        val_reward: 50,
        items_reward: [new Types.ObjectId('68dc50e9db5c735854b56591')]
      } as any);
  console.log('[SEED] Package creado:', String((pkg as any)._id));
    } else {
  console.log('[SEED] Package ya existe:', String((pkg as any)._id));
    }

    // Equipment (Espada Corta Oxidada) - crear si no existe (ID provisto por el usuario)
    try {
      const equipmentId = new Types.ObjectId('68dc50e9db5c735854b56591');
      let equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        equipment = await Equipment.create({
          _id: equipmentId,
          nombre: 'Espada Corta Oxidada',
          descripcion: 'Equipamiento de rango D.',
          rango: 'D',
          tipo: 'arma',
          nivel_minimo_requerido: 1,
          stats: { atk: 6, defensa: 6, vida: 8 },
          fuentes_obtencion: []
        } as any);
        console.log('[SEED] Equipment creado:', String((equipment as any)._id));
      } else {
        console.log('[SEED] Equipment ya existe:', String((equipment as any)._id));
      }
    } catch (err) {
      console.warn('[SEED] No fue posible crear/verificar el Equipment inicial:', err);
    }

    console.log('[SEED] Seed completado con éxito.');
    process.exit(0);
  } catch (err) {
    console.error('[SEED] Error durante el seed:', err);
    process.exit(1);
  }
}

seed();
