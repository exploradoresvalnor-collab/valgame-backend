import mongoose from 'mongoose';
import LevelRequirement from '../src/models/LevelRequirement';
import Dungeon from '../src/models/Dungeon';

async function analyzeProgression() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/valgame');

    console.log('🎮 ANÁLISIS COMPLETO DE PROGRESIÓN - VALGAME');
    console.log('═══════════════════════════════════════════════════════════════');

    // 1. ANÁLISIS DE EXPERIENCIA POR NIVEL
    console.log('\n📊 1. SISTEMA DE EXPERIENCIA');
    console.log('─────────────────────────────');

    const levels = await LevelRequirement.find({
      nivel: { $in: [1, 2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100] }
    }).sort({ nivel: 1 });

    console.log('EXPERIENCIA ACUMULADA PARA LLEGAR A NIVEL:');
    levels.forEach(level => {
      console.log(`  Nivel ${level.nivel.toString().padStart(3)}: ${level.experiencia_acumulada.toLocaleString().padStart(8)} EXP total`);
    });

    console.log('\nEXPERIENCIA PARA SUBIR AL SIGUIENTE NIVEL:');
    for (let i = 0; i < levels.length - 1; i++) {
      const current = levels[i];
      const next = levels[i + 1];
      const expNeeded = next.experiencia_acumulada - current.experiencia_acumulada;
      console.log(`  Nivel ${current.nivel.toString().padStart(2)}→${next.nivel.toString().padStart(2)}: ${expNeeded.toLocaleString().padStart(6)} EXP`);
    }

    console.log('\n💡 EXPERIENCIA TOTAL PARA LLEGAR A NIVELES CLAVE:');
    const level1 = levels.find(l => l.nivel === 1);
    const level20 = levels.find(l => l.nivel === 20);
    const level40 = levels.find(l => l.nivel === 40);
    const level60 = levels.find(l => l.nivel === 60);
    const level100 = levels.find(l => l.nivel === 100);

    if (level1 && level20) {
      console.log(`  Nivel 1 → 20: ${(level20.experiencia_acumulada - level1.experiencia_acumulada).toLocaleString()} EXP`);
    }
    if (level1 && level40) {
      console.log(`  Nivel 1 → 40: ${(level40.experiencia_acumulada - level1.experiencia_acumulada).toLocaleString()} EXP`);
    }
    if (level1 && level60) {
      console.log(`  Nivel 1 → 60: ${(level60.experiencia_acumulada - level1.experiencia_acumulada).toLocaleString()} EXP`);
    }
    if (level1 && level100) {
      console.log(`  Nivel 1 → 100: ${(level100.experiencia_acumulada - level1.experiencia_acumulada).toLocaleString()} EXP`);
    }

    // 2. ANÁLISIS DE MAZMORRAS
    console.log('\n\n🏰 2. SISTEMA DE MAZMORRAS');
    console.log('─────────────────────────────');

    const dungeons = await Dungeon.find({}).sort({ nivel_requerido_minimo: 1 });

    console.log('MAZMORRAS Y SUS ESTADÍSTICAS BASE:');
    dungeons.forEach((dungeon, index) => {
      console.log(`\n${index + 1}. ${dungeon.nombre}`);
      console.log(`   📖 ${dungeon.descripcion}`);
      console.log(`   🎯 Nivel mínimo: ${dungeon.nivel_requerido_minimo}`);
      console.log(`   💪 Stats base: ${dungeon.stats.vida} HP | ${dungeon.stats.ataque} ATK | ${dungeon.stats.defensa} DEF`);
      console.log(`   ⭐ Recompensas base: ${dungeon.recompensas.expBase} EXP | ${dungeon.recompensas.valBase} VAL`);
      console.log(`   📈 Escalado: +${(dungeon.nivel_sistema?.multiplicador_stats_por_nivel || 0) * 100}% stats/nivel`);
      console.log(`   💰 Escalado VAL: +${(dungeon.nivel_sistema?.multiplicador_val_por_nivel || 0) * 100}% VAL/nivel`);
      console.log(`   ⚡ Escalado EXP: +${(dungeon.nivel_sistema?.multiplicador_xp_por_nivel || 0) * 100}% EXP/nivel`);
    });

    // 3. CÁLCULO DE SESIONES NECESARIAS
    console.log('\n\n🎯 3. CÁLCULO DE SESIONES NECESARIAS');
    console.log('─────────────────────────────────────');

    // Tomar la mazmorra más fácil como referencia
    const easiestDungeon = dungeons[0];
    if (easiestDungeon) {
      console.log(`\n📊 Usando ${easiestDungeon.nombre} como referencia:`);
      console.log(`   EXP base por victoria: ${easiestDungeon.recompensas.expBase}`);
      console.log(`   Escalado EXP: +${(easiestDungeon.nivel_sistema?.multiplicador_xp_por_nivel || 0) * 100}% por nivel`);

      console.log('\nSESIONES NECESARIAS PARA SUBIR NIVELES (aproximado):');

      const calculateSessionsForLevel = (targetLevel: number) => {
        const targetLevelData = levels.find(l => l.nivel === targetLevel);
        if (!targetLevelData) return null;

        const expNeeded = targetLevelData.experiencia_acumulada;
        const baseExp = easiestDungeon.recompensas.expBase;

        // Estimación simple (sin considerar escalado por nivel de mazmorra)
        const sessionsNeeded = Math.ceil(expNeeded / baseExp);
        return sessionsNeeded;
      };

      [10, 20, 30, 40, 50, 60].forEach(level => {
        const sessions = calculateSessionsForLevel(level);
        if (sessions) {
          console.log(`  Nivel ${level.toString().padStart(2)}: ~${sessions.toLocaleString()} sesiones (${Math.ceil(sessions/5)} días con 5 boletos/día)`);
        }
      });
    }

    // 4. ANÁLISIS DE ESCALADO DE MAZMORRAS
    console.log('\n\n⚔️ 4. ESCALADO DE DIFICULTAD');
    console.log('─────────────────────────────');

    console.log('CÓMO ESCALAN LAS MAZMORRAS CON EL NIVEL DEL JUGADOR:');
    console.log('\nEjemplo con Mazmorra Nivel 1 (Cueva Goblins):');
    console.log('Base: 150 HP, 15 ATK, 10 DEF, 50 EXP, 10 VAL');

    for (let playerLevel = 1; playerLevel <= 10; playerLevel++) {
      const multiplier = 1 + (0.15 * (playerLevel - 1)); // 15% por nivel
      const scaledHP = Math.floor(150 * multiplier);
      const scaledATK = Math.floor(15 * multiplier);
      const scaledDEF = Math.floor(10 * multiplier);
      const scaledEXP = Math.floor(50 * (1 + 0.10 * (playerLevel - 1))); // 10% EXP por nivel
      const scaledVAL = Math.floor(10 * (1 + 0.10 * (playerLevel - 1))); // 10% VAL por nivel

      console.log(`  Jugador nivel ${playerLevel}: ${scaledHP} HP, ${scaledATK} ATK, ${scaledDEF} DEF, ${scaledEXP} EXP, ${scaledVAL} VAL`);
    }

    // 5. CONCLUSIONES
    console.log('\n\n🎮 5. CONCLUSIONES DEL ANÁLISIS');
    console.log('───────────────────────────────');

    console.log('✅ ASPECTOS POSITIVOS:');
    console.log('  • Progresión exponencial bien balanceada');
    console.log('  • Mazmorras escalan apropiadamente con el nivel');
    console.log('  • Sistema de boletos previene farming infinito');
    console.log('  • Recompensas crecen con la dificultad');

    console.log('\n⚠️ ÁREAS DE MEJORA:');
    console.log('  • Posible aumento de boletos diarios (5→10)');
    console.log('  • Revisar costo de curación (2 VAL/10 HP)');
    console.log('  • Considerar sistema de energía adicional');
    console.log('  • Asegurar consistencia en drops de EVO');

    console.log('\n📈 PROGRESIÓN RECOMENDADA:');
    console.log('  • Principiante: Mazmorra 1 (niveles 1-15)');
    console.log('  • Intermedio: Mazmorra 2-3 (niveles 15-40)');
    console.log('  • Avanzado: Mazmorra 4-5 (niveles 40-100)');
    console.log('  • Endgame: Mazmorras nivel 10+ (desafío infinito)');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeProgression();