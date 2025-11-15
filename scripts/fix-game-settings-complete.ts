/**
 * 🔧 MIGRACIÓN COMPLETA: Arreglar GameSettings
 * 
 * Este script corrige TODOS los campos faltantes o vacíos en game_settings:
 * 1. costo_evo_por_val (nuevo campo para comprar EVO con VAL)
 * 2. costo_evo_etapa_2 (costos de evolución por rango - etapa 2)
 * 3. costo_evo_etapa_3 (costos de evolución por rango - etapa 3)
 * 
 * USO:
 * npx ts-node scripts/fix-game-settings-complete.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GameSettings from '../src/models/GameSetting';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/valgame';

async function fixGameSettings() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB:', MONGODB_URI);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔧 MIGRACIÓN COMPLETA: Arreglar GameSettings');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Buscar el documento de configuración
    let gameSettings = await GameSettings.findOne();

    if (!gameSettings) {
      console.log('❌ No se encontró documento de GameSettings.');
      console.log('   Por favor ejecuta el seed primero: npm run seed\n');
      process.exit(1);
    }

    console.log('✅ Documento de GameSettings encontrado.');
    console.log(`   ID: ${gameSettings._id}\n`);

    // Preparar actualizaciones
    const updates: any = {};
    let needsUpdate = false;

    // 1. Verificar costo_evo_por_val
    if ((gameSettings as any).costo_evo_por_val === undefined) {
      console.log('🔧 Añadiendo campo: costo_evo_por_val = 100');
      updates.costo_evo_por_val = 100;
      needsUpdate = true;
    } else {
      console.log(`✅ costo_evo_por_val ya existe: ${(gameSettings as any).costo_evo_por_val}`);
    }

    // 2. Verificar costo_evo_etapa_2
    const costoEtapa2 = (gameSettings as any).costo_evo_etapa_2;
    const etapa2Empty = !costoEtapa2 || (costoEtapa2 instanceof Map && costoEtapa2.size === 0) || (typeof costoEtapa2 === 'object' && Object.keys(costoEtapa2).length === 0);
    
    if (etapa2Empty) {
      console.log('🔧 Añadiendo campo: costo_evo_etapa_2');
      // Crear Map directamente
      const etapa2Map = new Map([
        ['D', 5],   // Común → Raro: 5 EVO
        ['C', 8],
        ['B', 10],
        ['A', 15],
        ['S', 20],
        ['SS', 30],
        ['SSS', 50]
      ]);
      updates['costo_evo_etapa_2.D'] = 5;
      updates['costo_evo_etapa_2.C'] = 8;
      updates['costo_evo_etapa_2.B'] = 10;
      updates['costo_evo_etapa_2.A'] = 15;
      updates['costo_evo_etapa_2.S'] = 20;
      updates['costo_evo_etapa_2.SS'] = 30;
      updates['costo_evo_etapa_2.SSS'] = 50;
      needsUpdate = true;
    } else {
      console.log(`✅ costo_evo_etapa_2 ya existe:`, costoEtapa2);
    }

    // 3. Verificar costo_evo_etapa_3
    const costoEtapa3 = (gameSettings as any).costo_evo_etapa_3;
    const etapa3Empty = !costoEtapa3 || (costoEtapa3 instanceof Map && costoEtapa3.size === 0) || (typeof costoEtapa3 === 'object' && Object.keys(costoEtapa3).length === 0);
    
    if (etapa3Empty) {
      console.log('🔧 Añadiendo campo: costo_evo_etapa_3');
      updates['costo_evo_etapa_3.D'] = 10;  // Raro → Épico: 10 EVO
      updates['costo_evo_etapa_3.C'] = 15;
      updates['costo_evo_etapa_3.B'] = 20;
      updates['costo_evo_etapa_3.A'] = 30;
      updates['costo_evo_etapa_3.S'] = 40;
      updates['costo_evo_etapa_3.SS'] = 60;
      updates['costo_evo_etapa_3.SSS'] = 100;
      needsUpdate = true;
    } else {
      console.log(`✅ costo_evo_etapa_3 ya existe:`, costoEtapa3);
    }

    // Aplicar actualizaciones si es necesario
    if (needsUpdate) {
      console.log('\n📝 Aplicando actualizaciones...\n');
      
      await GameSettings.updateOne(
        { _id: gameSettings._id },
        { $set: updates }
      );

      // Recargar el documento para verificar
      gameSettings = await GameSettings.findOne();

      console.log('✅ Actualizaciones aplicadas exitosamente.\n');
      console.log('📊 CONFIGURACIÓN ACTUALIZADA:');
      console.log('─────────────────────────────────────────────────────────');
      console.log(`   costo_evo_por_val: ${(gameSettings as any).costo_evo_por_val}`);
      console.log('   costo_evo_etapa_2:', (gameSettings as any).costo_evo_etapa_2);
      console.log('   costo_evo_etapa_3:', (gameSettings as any).costo_evo_etapa_3);
      console.log('─────────────────────────────────────────────────────────\n');

      console.log('💡 EXPLICACIÓN:');
      console.log('   • costo_evo_por_val = 100 → 100 VAL = 1 EVO');
      console.log('   • costo_evo_etapa_2 = Costo de evolucionar de Común a Raro');
      console.log('   • costo_evo_etapa_3 = Costo de evolucionar de Raro a Épico');
      console.log('\n   Ejemplo: Personaje Rango D');
      console.log('   - Evolucionar a etapa 2: 5 EVO');
      console.log('   - Evolucionar a etapa 3: 10 EVO');
      console.log('   - Total para llegar a épico: 15 EVO = 1500 VAL\n');

    } else {
      console.log('\n✅ No se requieren actualizaciones.');
      console.log('   Todos los campos ya existen con valores válidos.\n');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ MIGRACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixGameSettings();
