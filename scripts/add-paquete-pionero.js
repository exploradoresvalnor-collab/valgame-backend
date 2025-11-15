require('dotenv').config();
const mongoose = require('mongoose');

async function updateTipoEnPaquetes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('packages');
    const paquetesSinTipo = await collection.find({ tipo: { $exists: false } }).toArray();
    if (paquetesSinTipo.length > 0) {
      console.log(`🔄 Actualizando ${paquetesSinTipo.length} paquetes para agregar campo 'tipo'...`);
      const result = await collection.updateMany(
        { tipo: { $exists: false } },
        { $set: { tipo: 'evento' } }
      );
      console.log(`✅ Paquetes actualizados: ${result.modifiedCount}`);
    } else {
      console.log('✅ Todos los paquetes ya tienen el campo tipo.');
    }
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error actualizando paquetes:', error);
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  updateTipoEnPaquetes();
}
