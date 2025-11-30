const mongoose = require('mongoose');
require('dotenv').config();

async function debugPioneerDelivery() {
  try {
    console.log('\n🔍 DEBUGGEANDO ENTREGA DE PAQUETE PIONERO\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // 1. Verificar que BaseCharacters existen
    const baseChars = await db.collection('basecharacters').find({}).toArray();
    console.log('✅ BaseCharacters encontrados:', baseChars.length);
    if (baseChars.length > 0) {
      console.log('   Primero:', baseChars[0].nombre);
    }
    
    // 2. Verificar consumibles
    const consumables = await db.collection('consumables').find({}).toArray();
    console.log('✅ Consumables encontrados:', consumables.length);
    
    // 3. Verificar equipamiento
    const equipment = await db.collection('equipment').find({}).toArray();
    console.log('✅ Equipment encontrado:', equipment.length);
    
    // 4. Ver el usuario actual y qué tiene
    const user = await db.collection('users').findOne({ 
      email: 'proyectoagesh@gmail.com' 
    });
    
    console.log('\n👤 ESTADO ACTUAL DEL USUARIO:\n');
    console.log('  Email:', user.email);
    console.log('  Verificado:', user.isVerified);
    console.log('  receivedPioneerPackage:', user.receivedPioneerPackage);
    console.log('  VAL:', user.val || 0);
    console.log('  EVO:', user.evo || 0);
    console.log('  Boletos:', user.boletos || 0);
    console.log('  Energía:', user.energia || 0);
    console.log('  Personajes:', user.personajes?.length || 0);
    console.log('  Equipamiento:', user.inventarioEquipamiento?.length || 0);
    console.log('  Consumibles:', user.inventarioConsumibles?.length || 0);
    
    console.log('\n✅ DEBUG COMPLETADO\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugPioneerDelivery();
