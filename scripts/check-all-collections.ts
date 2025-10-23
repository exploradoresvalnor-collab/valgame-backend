import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function checkAllCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('\n✅ Conectado a MongoDB: Valnor\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 REVISIÓN COMPLETA DE TODAS LAS COLECCIONES');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Obtener la base de datos
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('No se pudo obtener la base de datos');
    }
    
    // Listar TODAS las colecciones
    const collections = await db.listCollections().toArray();
    
    console.log(`📚 Total de colecciones encontradas: ${collections.length}\n`);
    
    // Para cada colección, contar documentos
    const collectionStats: any[] = [];
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await db.collection(collectionName).countDocuments();
      
      collectionStats.push({
        name: collectionName,
        count: count,
        type: collection.type
      });
    }
    
    // Ordenar por nombre
    collectionStats.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('📊 ESTADO DE CADA COLECCIÓN:\n');
    console.log('─'.repeat(70));
    console.log('COLECCIÓN'.padEnd(35) + 'DOCUMENTOS'.padEnd(15) + 'ESTADO');
    console.log('─'.repeat(70));
    
    collectionStats.forEach(stat => {
      const status = stat.count === 0 ? '⚠️ VACÍA' : stat.count < 5 ? '⚠️ POCOS' : '✅ OK';
      console.log(
        stat.name.padEnd(35) + 
        stat.count.toString().padEnd(15) + 
        status
      );
    });
    
    console.log('─'.repeat(70));
    
    // Análisis detallado
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎯 ANÁLISIS DETALLADO');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Colecciones críticas para el gameplay
    const criticalCollections = [
      'packages',
      'base_characters',
      'categories',
      'items',
      'dungeons',
      'game_settings',
      'level_requirements'
    ];
    
    console.log('🔴 COLECCIONES CRÍTICAS PARA GAMEPLAY:\n');
    
    for (const criticalName of criticalCollections) {
      const stat = collectionStats.find(s => s.name === criticalName);
      
      if (!stat) {
        console.log(`   ❌ ${criticalName}: NO EXISTE`);
        continue;
      }
      
      const status = stat.count === 0 ? '❌ VACÍA' : 
                     stat.count < 5 ? '⚠️ POCOS DATOS' : 
                     '✅ OK';
      
      console.log(`   ${status} ${criticalName}: ${stat.count} documentos`);
      
      // Detalles específicos
      if (stat.count > 0) {
        const sample = await db.collection(criticalName).findOne();
        const fields = Object.keys(sample || {}).length;
        console.log(`      → ${fields} campos en los documentos`);
      }
    }
    
    // Colecciones vacías
    const emptyCollections = collectionStats.filter(s => s.count === 0);
    
    if (emptyCollections.length > 0) {
      console.log('\n⚠️ COLECCIONES VACÍAS:\n');
      emptyCollections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // Colecciones con pocos datos
    const fewDataCollections = collectionStats.filter(s => s.count > 0 && s.count < 5);
    
    if (fewDataCollections.length > 0) {
      console.log('\n⚠️ COLECCIONES CON POCOS DATOS (< 5):\n');
      fewDataCollections.forEach(col => {
        console.log(`   - ${col.name}: ${col.count} documentos`);
      });
    }
    
    // Resumen ejecutivo
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📋 RESUMEN EJECUTIVO');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const totalDocs = collectionStats.reduce((sum, s) => sum + s.count, 0);
    const collectionsWithData = collectionStats.filter(s => s.count > 0).length;
    
    console.log(`   Total colecciones: ${collections.length}`);
    console.log(`   Colecciones con datos: ${collectionsWithData}`);
    console.log(`   Colecciones vacías: ${emptyCollections.length}`);
    console.log(`   Total documentos: ${totalDocs}\n`);
    
    // Problemas detectados
    console.log('🚨 PROBLEMAS DETECTADOS:\n');
    
    const problems: string[] = [];
    
    // Verificar categories
    const categoriesCol = collectionStats.find(s => s.name === 'categories');
    if (!categoriesCol || categoriesCol.count === 0) {
      problems.push('❌ NO HAY CATEGORÍAS - Las probabilidades de drops no funcionarán');
    }
    
    // Verificar items
    const itemsCol = collectionStats.find(s => s.name === 'items');
    if (itemsCol && itemsCol.count < 10) {
      problems.push('⚠️ POCOS ITEMS - Deberías tener más equipamiento y consumibles');
    }
    
    // Verificar dungeons
    const dungeonsCol = collectionStats.find(s => s.name === 'dungeons');
    if (!dungeonsCol || dungeonsCol.count === 0) {
      problems.push('❌ NO HAY MAZMORRAS - El combate PvE no funcionará');
    }
    
    // Verificar base_characters
    const charsCol = collectionStats.find(s => s.name === 'base_characters');
    if (charsCol && charsCol.count < 7) {
      problems.push('⚠️ POCOS PERSONAJES BASE - Deberías tener al menos uno de cada rango');
    }
    
    if (problems.length === 0) {
      console.log('   ✅ No se detectaron problemas críticos\n');
    } else {
      problems.forEach(p => console.log(`   ${p}`));
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllCollections();
