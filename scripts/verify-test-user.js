// Script para verificar usuario de prueba
require('dotenv').config();
const mongoose = require('mongoose');

async function verifyUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/valgame');
    console.log('✅ Conectado a MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const result = await User.updateOne(
      { email: 'testcookie@test.com' },
      { $set: { isVerified: true } }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Usuario testcookie@test.com verificado correctamente');
    } else {
      console.log('❌ Usuario no encontrado');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUser();
