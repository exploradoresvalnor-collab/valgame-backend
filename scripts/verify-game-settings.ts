/**
 * 🔍 VERIFICACIÓN: Comprobar GameSettings
 * 
 * Este script verifica que todos los campos críticos de GameSettings
 * existan y tengan valores válidos.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GameSettings from '../src/models/GameSetting';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/valgame';

async function verifyGameSettings() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const gameSettings = await GameSettings.findOne();

    if (!gameSettings) {
      console.log('❌ No se encontró GameSettings\n');
      process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔍 VERIFICACIÓN DE GAME SETTINGS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const settings = gameSettings.toObject();
    
    // Verificar campos críticos
    const checks = [
      {
        name: 'costo_evo_por_val',
        value: settings.costo_evo_por_val,
        expected: 100,
        description: '100 VAL = 1 EVO'
      },
      {
        name: 'costo_evo_etapa_2',
        value: settings.costo_evo_etapa_2,
        expected: 'object',
        description: 'Costos de evolución Común → Raro'
      },
      {
        name: 'costo_evo_etapa_3',
        value: settings.costo_evo_etapa_3,
        expected: 'object',
        description: 'Costos de evolución Raro → Épico'
      },
      {
        name: 'costo_ticket_en_val',
        value: settings.costo_ticket_en_val,
        expected: 50,
        description: 'Costo de 1 boleto en VAL'
      }
    ];

    let allValid = true;

    for (const check of checks) {
      const exists = check.value !== undefined && check.value !== null;
      
      // Manejar Maps de Mongoose
      let isEmpty = false;
      let displayValue = check.value;
      
      if (check.value instanceof Map) {
        isEmpty = check.value.size === 0;
        displayValue = Object.fromEntries(check.value);
      } else if (typeof check.value === 'object') {
        isEmpty = Object.keys(check.value).length === 0;
      }
      
      if (!exists || isEmpty) {
        console.log(`❌ ${check.name}: FALTA o VACÍO`);
        allValid = false;
      } else {
        console.log(`✅ ${check.name}: ${JSON.stringify(displayValue)}`);
        console.log(`   → ${check.description}\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════════');
    
    if (allValid) {
      console.log('✅ TODAS LAS VERIFICACIONES PASARON');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      console.log('📋 DOCUMENTO COMPLETO DE GAME SETTINGS:');
      console.log('─────────────────────────────────────────────────────────');
      console.log(JSON.stringify(settings, null, 2));
      console.log('─────────────────────────────────────────────────────────\n');
    } else {
      console.log('❌ ALGUNAS VERIFICACIONES FALLARON');
      console.log('═══════════════════════════════════════════════════════════\n');
    }

    await mongoose.disconnect();
    process.exit(allValid ? 0 : 1);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyGameSettings();
