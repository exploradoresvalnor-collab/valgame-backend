require('dotenv').config();
const mongoose = require('mongoose');

async function deleteUser() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    console.log('🗑️  Eliminando usuario proyectoagesh@gmail.com...');
    const result = await mongoose.connection.db.collection('users').deleteOne({ 
      email: 'proyectoagesh@gmail.com' 
    });

    if (result.deletedCount > 0) {
      console.log('✅ Usuario eliminado exitosamente');
    } else {
      console.log('⚠️ Usuario no encontrado (puede que ya esté eliminado)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

deleteUser();
