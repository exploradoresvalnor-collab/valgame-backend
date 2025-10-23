/**
 * Script para agregar precio_val a todos los paquetes
 */

import mongoose from 'mongoose';
import PackageModel from '../src/models/Package';
import dotenv from 'dotenv';

dotenv.config();

async function addPrecioVal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Conectado a MongoDB\n');

    const packages = await PackageModel.find();
    console.log(`📦 Actualizando ${packages.length} paquetes...\n`);

    for (const pkg of packages) {
      // Si no tiene precio_val, usar precio_usdt * 500 (1 USDT = 500 VAL aproximadamente)
      if (!pkg.precio_val) {
        const precioVal = pkg.precio_usdt * 500;
        await PackageModel.updateOne(
          { _id: pkg._id },
          { $set: { precio_val: precioVal } }
        );
        console.log(`✅ ${pkg.nombre}: ${pkg.precio_usdt} USDT → ${precioVal} VAL`);
      } else {
        console.log(`⏭️  ${pkg.nombre}: Ya tiene precio_val = ${pkg.precio_val} VAL`);
      }
    }

    console.log('\n🎉 Todos los paquetes actualizados\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addPrecioVal();
