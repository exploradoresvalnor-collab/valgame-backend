/**
 * 🔧 MIGRACIÓN: Añadir campo costo_evo_por_val a GameSettings
 * 
 * Este script añade el nuevo campo `costo_evo_por_val` a la colección game_settings
 * para permitir la compra de Cristales de Evolución (EVO) con VAL.
 * 
 * Valor por defecto: 100 (100 VAL = 1 EVO)
 * 
 * USO:
 * npx ts-node scripts/migrate-add-evo-cost.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GameSettings from '../src/models/GameSetting';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/valgame';

async function migrateAddEvoCost() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB:', MONGODB_URI);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔧 MIGRACIÓN: Añadir campo costo_evo_por_val');
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

    // Verificar si el campo ya existe
    if ((gameSettings as any).costo_evo_por_val !== undefined) {
      console.log('ℹ️  El campo costo_evo_por_val ya existe.');
      console.log(`   Valor actual: ${(gameSettings as any).costo_evo_por_val}`);
      console.log('\n   No se requiere migración.');
    } else {
      console.log('🔧 Añadiendo campo costo_evo_por_val...\n');
      
      // Usar updateOne para añadir el campo
      await GameSettings.updateOne(
        { _id: gameSettings._id },
        { $set: { costo_evo_por_val: 100 } }
      );

      // Recargar el documento para verificar
      gameSettings = await GameSettings.findOne();

      console.log('✅ Campo costo_evo_por_val añadido exitosamente.');
      console.log(`   Valor: ${(gameSettings as any).costo_evo_por_val}`);
      console.log('\n   📊 Tasa de cambio configurada:');
      console.log('   100 VAL = 1 EVO');
      console.log('   1 EVO = 0.01 VAL');
    }

    console.log('\n═══════════════════════════════════════════════════════════');
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

migrateAddEvoCost();
