/**
 * 🔍 Verificación rápida de tipos de items
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function quickCheck() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Conectado\n');

    const db = mongoose.connection.db;
    if (!db) throw new Error('DB no conectada');
    
    // Contar por tipoItem usando agregación
    const result = await db.collection('items').aggregate([
      {
        $group: {
          _id: '$tipoItem',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    console.log('📊 TIPOS DE ITEMS EN LA BD:\n');
    
    let total = 0;
    result.forEach((item: any) => {
      const tipo = item._id || 'SIN_TIPO';
      console.log(`   ${tipo}: ${item.count}`);
      total += item.count;
    });
    
    console.log(`\n   TOTAL: ${total} documentos\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Equipment y Consumable son CORRECTOS');
    console.log('❌ Cualquier otro tipo debería eliminarse\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

quickCheck();
