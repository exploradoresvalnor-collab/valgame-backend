import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function readAllItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('\n✅ Conectado a MongoDB: Valnor\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📦 LEYENDO TODO DE LA COLECCIÓN: items');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Obtener TODOS los documentos de la colección 'items' sin filtros
    const itemsCollection = mongoose.connection.collection('items');
    const allItems = await itemsCollection.find({}).toArray();

    console.log(`Total de documentos en 'items': ${allItems.length}\n`);

    if (allItems.length === 0) {
      console.log('⚠️ La colección está vacía\n');
      await mongoose.disconnect();
      return;
    }

    // Mostrar cada item con TODOS sus campos
    allItems.forEach((item: any, index) => {
      console.log(`\n${'═'.repeat(70)}`);
      console.log(`ITEM #${index + 1}`);
      console.log('═'.repeat(70));
      console.log(`ID: ${item._id}`);
      console.log(`\n📋 TODOS LOS CAMPOS DEL DOCUMENTO:\n`);
      
      // Mostrar todos los campos del documento
      Object.entries(item).forEach(([key, value]) => {
        if (key === '_id') return; // Ya lo mostramos arriba
        
        // Formatear el valor según su tipo
        let formattedValue;
        if (value === null || value === undefined) {
          formattedValue = 'null/undefined';
        } else if (typeof value === 'object') {
          if (Array.isArray(value)) {
            if (value.length === 0) {
              formattedValue = '[] (array vacío)';
            } else {
              formattedValue = JSON.stringify(value, null, 2);
            }
          } else if (value instanceof Date) {
            formattedValue = value.toISOString();
          } else {
            formattedValue = JSON.stringify(value, null, 2);
          }
        } else if (typeof value === 'string') {
          formattedValue = `"${value}"`;
        } else {
          formattedValue = String(value);
        }
        
        console.log(`   ${key}: ${formattedValue}`);
      });
    });

    console.log(`\n${'═'.repeat(70)}`);
    console.log('📊 RESUMEN DE CAMPOS ENCONTRADOS');
    console.log('═'.repeat(70));

    // Analizar qué campos tienen los items
    const allKeys = new Set<string>();
    const fieldCount: { [key: string]: number } = {};

    allItems.forEach((item: any) => {
      Object.keys(item).forEach(key => {
        allKeys.add(key);
        fieldCount[key] = (fieldCount[key] || 0) + 1;
      });
    });

    console.log(`\nCampos encontrados (${allKeys.size} únicos):\n`);
    
    // Ordenar por frecuencia
    const sortedFields = Object.entries(fieldCount)
      .sort((a, b) => b[1] - a[1]);

    sortedFields.forEach(([field, count]) => {
      const percentage = ((count / allItems.length) * 100).toFixed(0);
      console.log(`   ${field.padEnd(30)} → ${count}/${allItems.length} items (${percentage}%)`);
    });

    // Identificar tipoItem
    console.log(`\n${'═'.repeat(70)}`);
    console.log('🏷️ CLASIFICACIÓN POR tipoItem');
    console.log('═'.repeat(70));

    const byTipoItem = allItems.reduce((acc: any, item: any) => {
      const tipo = item.tipoItem || 'SIN_TIPO';
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push(item.nombre || 'Sin nombre');
      return acc;
    }, {});

    Object.entries(byTipoItem).forEach(([tipo, nombres]: [string, any]) => {
      console.log(`\n${tipo}:`);
      nombres.forEach((nombre: string, idx: number) => {
        console.log(`   ${idx + 1}. ${nombre}`);
      });
    });

    console.log('\n' + '═'.repeat(70));
    console.log('✅ LECTURA COMPLETA FINALIZADA');
    console.log('═'.repeat(70) + '\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

readAllItems();
