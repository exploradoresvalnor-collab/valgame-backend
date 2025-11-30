const mongoose = require('mongoose');
require('dotenv').config();

async function checkUserStatus() {
  try {
    console.log('\n🔍 VERIFICANDO ESTADO DEL USUARIO...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const user = await db.collection('users').findOne({ 
      email: 'proyectoagesh@gmail.com' 
    });
    
    if (!user) {
      console.log('❌ Usuario NO encontrado en la base de datos');
      process.exit(1);
    }
    
    console.log('✅ USUARIO ENCONTRADO:\n');
    console.log('  Email:', user.email);
    console.log('  Username:', user.username);
    console.log('  Verificado:', user.isVerified ? '✅ SÍ' : '❌ NO');
    console.log('  Creado:', user.createdAt);
    
    console.log('\n📦 PAQUETES ASIGNADOS:\n');
    if (user.userPackages && user.userPackages.length > 0) {
      console.log('  Total paquetes:', user.userPackages.length);
      
      for (let i = 0; i < user.userPackages.length; i++) {
        const pkg = user.userPackages[i];
        
        // Buscar nombre del paquete
        const packageInfo = await db.collection('packages').findOne({ 
          _id: mongoose.Types.ObjectId(pkg.packageId) 
        });
        
        console.log(`\n  ${i + 1}. ${packageInfo?.name || 'Paquete desconocido'}`);
        console.log(`     ID: ${pkg.packageId}`);
        console.log(`     Recibido: ${pkg.receivedAt || 'N/A'}`);
      }
    } else {
      console.log('  ❌ SIN PAQUETES ASIGNADOS');
    }
    
    console.log('\n💰 RECURSOS:\n');
    console.log('  VAL Balance:', user.valBalance || 0);
    console.log('  EVO Balance:', user.evoBalance || 0);
    
    console.log('\n📊 INVENTARIO:\n');
    console.log('  Equipamiento:', user.equipamiento?.length || 0, 'items');
    console.log('  Consumibles:', user.inventarioConsumibles?.length || 0, 'items');
    console.log('  Personajes:', user.personajes?.length || 0);
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserStatus();
