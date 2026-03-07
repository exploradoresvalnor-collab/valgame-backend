const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valgame';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function generateTestToken() {
  console.log('Conectando a', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  // Buscar usuario de prueba
  const usersCol = mongoose.connection.collection('users');
  const user = await usersCol.findOne({ email: 'test@example.com' });

  if (!user) {
    console.log('Usuario de prueba no encontrado. Ejecuta primero seed-test-user.js');
    await mongoose.disconnect();
    return;
  }

  // Generar token JWT
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  console.log('=== TOKEN JWT PARA PRUEBAS ===');
  console.log('Usuario ID:', user._id.toString());
  console.log('Email:', user.email);
  console.log('Token JWT:', token);
  console.log('');
  console.log('Para usar en el frontend:');
  console.log('localStorage.setItem("authToken", "' + token + '");');
  console.log('');
  console.log('Para probar con curl:');
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:8080/api/user-characters`);

  await mongoose.disconnect();
}

generateTestToken().catch(console.error);