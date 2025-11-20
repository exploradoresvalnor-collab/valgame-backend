import mongoose from 'mongoose';
import LevelRequirement from '../src/models/LevelRequirement';

async function analyzeExpRequirements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/valgame');

    console.log('📊 ANÁLISIS DE EXPERIENCIA POR NIVEL');
    console.log('═══════════════════════════════════════');

    // Obtener algunos niveles clave
    const levels = await LevelRequirement.find({
      nivel: { $in: [1, 2, 5, 10, 20, 21, 30, 40, 41, 50, 60, 61, 80, 81, 100] }
    }).sort({ nivel: 1 });

    console.log('\n📈 EXPERIENCIA ACUMULADA PARA LLEGAR A NIVEL:');
    levels.forEach(level => {
      console.log(`Nivel ${level.nivel}: ${level.experiencia_acumulada.toLocaleString()} EXP total`);
    });

    console.log('\n⚡ EXPERIENCIA PARA SUBIR AL SIGUIENTE NIVEL:');
    for (let i = 0; i < levels.length - 1; i++) {
      const current = levels[i];
      const next = levels[i + 1];
      const expNeeded = next.experiencia_acumulada - current.experiencia_acumulada;
      console.log(`Nivel ${current.nivel} → ${next.nivel}: ${expNeeded.toLocaleString()} EXP`);
    }

    console.log('\n🎯 EJEMPLOS PRÁCTICOS:');

    // Calcular EXP para llegar a ciertos niveles desde cero
    const level1 = levels.find(l => l.nivel === 1);
    const level10 = levels.find(l => l.nivel === 10);
    const level20 = levels.find(l => l.nivel === 20);
    const level40 = levels.find(l => l.nivel === 40);
    const level60 = levels.find(l => l.nivel === 60);
    const level100 = levels.find(l => l.nivel === 100);

    if (level1 && level10) {
      console.log(`De nivel 1 a 10: ${(level10.experiencia_acumulada - level1.experiencia_acumulada).toLocaleString()} EXP`);
    }
    if (level1 && level20) {
      console.log(`De nivel 1 a 20: ${(level20.experiencia_acumulada - level1.experiencia_acumulada).toLocaleString()} EXP`);
    }
    if (level1 && level40) {
      console.log(`De nivel 1 a 40: ${(level40.experiencia_acumulada - level1.experiencia_acumulada).toLocaleString()} EXP`);
    }
    if (level1 && level60) {
      console.log(`De nivel 1 a 60: ${(level60.experiencia_acumulada - level1.experiencia_acumulada).toLocaleString()} EXP`);
    }
    if (level1 && level100) {
      console.log(`De nivel 1 a 100: ${(level100.experiencia_acumulada - level1.experiencia_acumulada).toLocaleString()} EXP`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeExpRequirements();