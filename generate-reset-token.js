const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

async function generateResetToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Generar token como lo hace el backend
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // Actualizar usuario
    const result = await db.collection('users').updateOne(
      { email: 'proyectoagesh@gmail.com' },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordTokenExpires: expiresAt
        }
      }
    );

    if (result.modifiedCount === 0) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    console.log('\n✅ TOKEN DE RESET GENERADO:\n');
    console.log('Email:', 'proyectoagesh@gmail.com');
    console.log('Token:', resetToken);
    console.log('Expira en:', expiresAt);
    console.log('\n🔗 URL del formulario:');
    console.log(`http://localhost:8080/auth/reset-form/${resetToken}`);
    console.log('\n⏰ El token expira en 1 hora\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

generateResetToken();
