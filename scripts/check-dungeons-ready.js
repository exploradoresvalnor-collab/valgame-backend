require('dotenv').config();
const mongoose = require('mongoose');

async function checkCollections() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    
    // Verificar colecciones críticas
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔍 VERIFICACIÓN DE COLECCIONES PARA SISTEMA DE MAZMORRAS');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 1. Verificar dungeons
    const dungeons = await db.collection('dungeons').find({}).toArray();
    console.log(`1️⃣  DUNGEONS: ${dungeons.length} documentos`);
    if (dungeons.length > 0) {
      const primerMazmorra = dungeons[0];
      console.log(`   ✅ Nombre: ${primerMazmorra.nombre}`);
      console.log(`   ✅ nivel_requerido_minimo: ${primerMazmorra.nivel_requerido_minimo || 'NO EXISTE ❌'}`);
      console.log(`   ✅ recompensas.valBase: ${primerMazmorra.recompensas?.valBase || 'NO EXISTE ❌'}`);
      console.log(`   ✅ nivel_sistema: ${primerMazmorra.nivel_sistema ? 'SÍ ✅' : 'NO EXISTE ❌'}`);
      console.log(`   ✅ nivel_minimo_para_exclusivos: ${primerMazmorra.nivel_minimo_para_exclusivos || 'NO EXISTE ❌'}`);
      console.log(`   ✅ items_exclusivos: ${primerMazmorra.items_exclusivos ? 'SÍ ✅' : 'NO EXISTE ❌'}`);
    }
    console.log('');

    // 2. Verificar usuarios (sample)
    const usersSample = await db.collection('users').findOne({});
    console.log(`2️⃣  USERS: ${await db.collection('users').countDocuments()} documentos`);
    if (usersSample) {
      console.log(`   ✅ dungeon_progress: ${usersSample.dungeon_progress ? 'SÍ ✅' : 'NO (se crea al combatir) ⚠️'}`);
      console.log(`   ✅ dungeon_streak: ${usersSample.dungeon_streak !== undefined ? 'SÍ ✅' : 'NO (se crea al combatir) ⚠️'}`);
      console.log(`   ✅ dungeon_stats: ${usersSample.dungeon_stats ? 'SÍ ✅' : 'NO (se crea al combatir) ⚠️'}`);
    }
    console.log('');

    // 3. Verificar otras colecciones importantes
    const categories = await db.collection('categories').countDocuments();
    const packages = await db.collection('packages').countDocuments();
    const baseCharacters = await db.collection('base_characters').countDocuments();
    const items = await db.collection('items').countDocuments();
    const levelRequirements = await db.collection('level_requirements').countDocuments();

    console.log(`3️⃣  OTRAS COLECCIONES:`);
    console.log(`   📦 categories: ${categories}`);
    console.log(`   📦 packages: ${packages}`);
    console.log(`   📦 base_characters: ${baseCharacters}`);
    console.log(`   📦 items: ${items}`);
    console.log(`   📦 level_requirements: ${levelRequirements}`);
    console.log('');

    // 4. Verificar estructura completa de una mazmorra
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔬 ANÁLISIS DETALLADO DE UNA MAZMORRA');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    if (dungeons.length > 0) {
      const mazmorra = dungeons[0];
      console.log(`Mazmorra: ${mazmorra.nombre}\n`);
      console.log(JSON.stringify(mazmorra, null, 2));
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ RESUMEN');
    console.log('═══════════════════════════════════════════════════════════\n');

    const camposFaltantes = [];
    
    if (dungeons.length > 0) {
      const d = dungeons[0];
      if (!d.nivel_requerido_minimo) camposFaltantes.push('nivel_requerido_minimo');
      if (!d.recompensas?.valBase) camposFaltantes.push('recompensas.valBase');
      if (!d.nivel_sistema) camposFaltantes.push('nivel_sistema');
      if (!d.nivel_minimo_para_exclusivos) camposFaltantes.push('nivel_minimo_para_exclusivos');
    }

    if (camposFaltantes.length > 0) {
      console.log('❌ CAMPOS FALTANTES EN DUNGEONS:');
      camposFaltantes.forEach(campo => console.log(`   - ${campo}`));
      console.log('\n💡 SOLUCIÓN: Ejecuta el script de re-seed:');
      console.log('   node scripts/seed-dungeons.js --force\n');
    } else {
      console.log('✅ Todas las mazmorras tienen los campos necesarios!');
      console.log('✅ El sistema está listo para funcionar!\n');
    }

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

checkCollections();
