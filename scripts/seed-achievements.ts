import 'dotenv/config';
import { connectDB } from './config/db';
import { Achievement } from './models/Achievement';

async function seedAchievements() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[SEED-ACHIEVEMENTS] Falta MONGODB_URI en el entorno.');
    process.exit(1);
  }

  await connectDB(uri);
  console.log('[SEED-ACHIEVEMENTS] Conectado a la BD. Creando logros...');

  try {
    const achievements = [
      {
        nombre: 'Primeros Pasos',
        descripcion: 'Completa tu primer combate',
        categoria: 'combate' as const,
        icono: 'sword',
        color: '#FFD700',
        requisitos: [{
          tipoRequisito: 'combates' as const,
          valor: 1,
          descripcion: 'Gana 1 combate'
        }],
        recompensas: [{
          tipo: 'xp' as const,
          valor: 100,
          descripcion: '+100 XP'
        }],
        dificultad: 'facil' as const,
        oculto: false,
        seccion: 'Primeros Pasos',
        activo: true
      },
      {
        nombre: 'Guerrero Novato',
        descripcion: 'Alcanza el nivel 5 con tu personaje',
        categoria: 'hito' as const,
        icono: 'shield',
        color: '#C0C0C0',
        requisitos: [{
          tipoRequisito: 'nivel' as const,
          valor: 5,
          descripcion: 'Alcanza nivel 5'
        }],
        recompensas: [{
          tipo: 'xp' as const,
          valor: 250,
          descripcion: '+250 XP'
        }],
        dificultad: 'facil' as const,
        oculto: false,
        seccion: 'Progreso',
        activo: true
      },
      {
        nombre: 'Comerciante',
        descripcion: 'Gasta 1000 monedas en la tienda',
        categoria: 'economia' as const,
        icono: 'coins',
        color: '#FFD700',
        requisitos: [{
          tipoRequisito: 'dinero' as const,
          valor: 1000,
          descripcion: 'Gasta 1000 monedas'
        }],
        recompensas: [{
          tipo: 'val' as const,
          valor: 50,
          descripcion: '+50 VAL'
        }],
        dificultad: 'normal' as const,
        oculto: false,
        seccion: 'Economía',
        activo: true
      },
      {
        nombre: 'Explorador',
        descripcion: 'Completa tu primera mazmorra',
        categoria: 'exploracion' as const,
        icono: 'map',
        color: '#8B4513',
        requisitos: [{
          tipoRequisito: 'custom' as const,
          valor: 1,
          descripcion: 'Completa 1 mazmorra'
        }],
        recompensas: [{
          tipo: 'xp' as const,
          valor: 300,
          descripcion: '+300 XP'
        }],
        dificultad: 'normal' as const,
        oculto: false,
        seccion: 'Exploración',
        activo: true
      },
      {
        nombre: 'Superviviente',
        descripcion: 'Sobrevive 10 oleadas en modo supervivencia',
        categoria: 'hito' as const,
        icono: 'skull',
        color: '#FF0000',
        requisitos: [{
          tipoRequisito: 'custom' as const,
          valor: 10,
          descripcion: 'Sobrevive 10 oleadas'
        }],
        recompensas: [{
          tipo: 'badge' as const,
          valor: 1,
          descripcion: 'Insignia de Superviviente'
        }],
        dificultad: 'dificil' as const,
        oculto: false,
        seccion: 'Supervivencia',
        activo: true
      }
    ];

    for (const achievementData of achievements) {
      const existing = await Achievement.findOne({ nombre: achievementData.nombre });
      if (!existing) {
        await Achievement.create(achievementData);
        console.log(`[SEED-ACHIEVEMENTS] Logro creado: ${achievementData.nombre}`);
      } else {
        console.log(`[SEED-ACHIEVEMENTS] Logro ya existe: ${achievementData.nombre}`);
      }
    }

    console.log('[SEED-ACHIEVEMENTS] Proceso completado.');
    process.exit(0);
  } catch (err) {
    console.error('[SEED-ACHIEVEMENTS] Error:', err);
    process.exit(1);
  }
}

seedAchievements();