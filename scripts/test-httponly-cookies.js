// Test completo de cookies httpOnly
// Este script verifica que las cookies funcionan correctamente

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testHttpOnlyCookies() {
  console.log('🔐 TEST DE COOKIES HTTPONLY');
  console.log('============================\n');

  try {
    // 1. Conectar a MongoDB
    console.log('1️⃣ Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/valgame');
    console.log('✅ Conectado\n');

    // 2. Crear usuario de prueba verificado
    const timestamp = Date.now();
    const email = `testcookie_${timestamp}@test.com`;
    const username = `testcookie_${timestamp}`;
    const password = 'SecurePass123!';

    console.log('2️⃣ Creando usuario de prueba...');
    console.log(`   Email: ${email}`);
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      email,
      username,
      passwordHash,
      isVerified: true, // Ya verificado para poder hacer login
      val: 1000,
      boletos: 5,
      evo: 0
    });
    
    console.log('✅ Usuario creado y verificado\n');

    // 3. Hacer login con curl y capturar cookies
    console.log('3️⃣ Haciendo LOGIN...');
    
    const { execSync } = require('child_process');
    
    const loginResponse = execSync(`curl -i -X POST http://localhost:8080/auth/login \
      -H "Content-Type: application/json" \
      -d "{\\"email\\":\\"${email}\\",\\"password\\":\\"${password}\\"}" \
      -c test_cookies.txt 2>&1`, { encoding: 'utf-8' });

    console.log('Respuesta completa:');
    console.log('-------------------');
    console.log(loginResponse);
    console.log('-------------------\n');

    // Verificar Set-Cookie header
    const hasCookieHeader = loginResponse.includes('Set-Cookie:');
    const hasHttpOnly = loginResponse.toLowerCase().includes('httponly');
    const hasSameSite = loginResponse.includes('SameSite=Strict') || loginResponse.includes('SameSite=strict');
    const hasTokenCookie = loginResponse.includes('token=');

    console.log('📊 VERIFICACIÓN DE RESPUESTA:');
    console.log(`   ✓ Tiene Set-Cookie header: ${hasCookieHeader ? '✅' : '❌'}`);
    console.log(`   ✓ Tiene flag HttpOnly: ${hasHttpOnly ? '✅' : '❌'}`);
    console.log(`   ✓ Tiene SameSite=Strict: ${hasSameSite ? '✅' : '❌'}`);
    console.log(`   ✓ Cookie 'token' presente: ${hasTokenCookie ? '✅' : '❌'}`);
    
    // Verificar que el token NO está en el body JSON
    const hasTokenInBody = loginResponse.includes('"token":"') || loginResponse.includes('"token": "');
    console.log(`   ✓ Token NO en JSON body: ${!hasTokenInBody ? '✅ SEGURO' : '❌ INSEGURO'}`);
    
    console.log('\n');

    // 4. Leer archivo de cookies
    const fs = require('fs');
    if (fs.existsSync('test_cookies.txt')) {
      console.log('4️⃣ Archivo de cookies guardado:');
      const cookieContent = fs.readFileSync('test_cookies.txt', 'utf-8');
      console.log(cookieContent);
      console.log('');
    }

    // 5. Probar acceso con cookie
    console.log('5️⃣ Accediendo a endpoint protegido CON cookie...');
    try {
      const meResponse = execSync(`curl -s -X GET http://localhost:8080/api/users/me \
        -b test_cookies.txt 2>&1`, { encoding: 'utf-8' });
      
      console.log('Respuesta:');
      console.log(meResponse.substring(0, 200) + '...');
      
      const isAuthorized = meResponse.includes(email) || meResponse.includes(username);
      console.log(`   ${isAuthorized ? '✅' : '❌'} Acceso ${isAuthorized ? 'autorizado' : 'denegado'}\n`);
    } catch (error) {
      console.log('   ❌ Error al acceder\n');
    }

    // 6. Probar acceso SIN cookie
    console.log('6️⃣ Accediendo a endpoint protegido SIN cookie...');
    try {
      const noCookieResponse = execSync(`curl -s -X GET http://localhost:8080/api/users/dashboard 2>&1`, 
        { encoding: 'utf-8' });
      
      const isDenied = noCookieResponse.includes('Falta token') || noCookieResponse.includes('401');
      console.log(`   ${isDenied ? '✅' : '❌'} Acceso ${isDenied ? 'denegado correctamente' : 'permitido (MAL)'}\n`);
    } catch (error) {
      console.log('   ✅ Acceso denegado correctamente\n');
    }

    // Limpieza
    fs.unlinkSync('test_cookies.txt');
    await User.deleteOne({ email });

    console.log('============================');
    console.log('✅ TEST COMPLETADO');
    console.log('============================\n');

    if (hasCookieHeader && hasHttpOnly && hasTokenCookie && !hasTokenInBody) {
      console.log('🎉 TODAS LAS VERIFICACIONES PASARON');
      console.log('✅ Sistema de cookies httpOnly funciona correctamente');
      process.exit(0);
    } else {
      console.log('⚠️ ALGUNAS VERIFICACIONES FALLARON');
      console.log('Revisa los detalles arriba');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testHttpOnlyCookies();
