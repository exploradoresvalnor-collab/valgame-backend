// tests/websocket/get-jwt-e2e.js
// Script para crear, verificar y loguear un usuario de prueba y obtener el JWT

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:8080';
const testEmail = `e2e_test_${Date.now()}@example.com`;
const testUser = { email: testEmail, username: `e2e_${Date.now()}`, password: 'password123' };

async function registerUser() {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  const data = await res.json();
  console.log('Registro:', data);
}

async function verifyUser() {
  // Forzar verificación manualmente (requiere acceso directo a la base de datos)
  const mongoose = await import('mongoose');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Valnor');
  const { User } = await import('../../src/models/User');
  const user = await User.findOne({ email: testUser.email });
  if (user) {
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    console.log('Usuario verificado manualmente');
  }
  await mongoose.disconnect();
}

async function loginUser() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  });
  const data = await res.json();
  if (data.token) {
    console.log('✅ JWT obtenido:', data.token);
    return data.token;
  } else {
    console.error('❌ No se obtuvo JWT:', data);
    return null;
  }
}

async function main() {
  await registerUser();
  await verifyUser();
  await loginUser();
}

main();
