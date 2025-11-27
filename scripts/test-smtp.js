#!/usr/bin/env node

/**
 * Script simple para probar credenciales SMTP de Gmail
 */

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔧 Probando conexión SMTP con Gmail...\n');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('📡 Intentando conectar...');
    await transporter.verify();
    console.log('✅ ¡Conexión SMTP exitosa!');
    console.log('🎉 Las credenciales SMTP son correctas');

    // Cerrar conexión
    transporter.close();

  } catch (error) {
    console.error('❌ Error de conexión SMTP:');
    console.error('Mensaje:', error.message);
    console.error('\n🔧 Posibles causas:');
    console.error('1. App Password incorrecta');
    console.error('2. Autenticación de 2 factores no activada');
    console.error('3. Gmail bloqueando aplicaciones menos seguras');
    console.error('4. Cuenta suspendida temporalmente');

    console.error('\n📋 Verificación necesaria:');
    console.error('- Ve a: https://myaccount.google.com/apppasswords');
    console.error('- Genera una nueva App Password');
    console.error('- Asegúrate de que la autenticación de 2 factores esté activada');
  }
}

testSMTP();