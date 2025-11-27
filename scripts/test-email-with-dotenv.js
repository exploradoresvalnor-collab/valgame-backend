#!/usr/bin/env node

/**
 * Script para probar el envío de emails de verificación y recuperación
 * Uso: npm run test:email
 */

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

const { sendVerificationEmail, sendPasswordResetEmail } = require('../dist/config/mailer');

async function testEmails() {
  console.log('🧪 Probando envío de emails...\n');
  console.log('Variables de entorno cargadas:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***CONFIGURADO***' : 'NO CONFIGURADO');
  console.log('');

  try {
    // Generar un token de prueba
    const testToken = 'test-token-' + Date.now();
    const testEmail = process.env.SMTP_USER;

    if (!testEmail) {
      console.error('❌ ERROR: SMTP_USER no configurado');
      process.exit(1);
    }

    console.log('📧 Enviando email de verificación de prueba...');
    await sendVerificationEmail(testEmail, testToken);
    console.log('✅ Email de verificación enviado correctamente\n');

    console.log('🔐 Enviando email de recuperación de contraseña de prueba...');
    const resetURL = `http://localhost:4200/reset-password/${testToken}`;
    await sendPasswordResetEmail(testEmail, resetURL);
    console.log('✅ Email de recuperación enviado correctamente\n');

    console.log('🎉 ¡Todos los emails se enviaron exitosamente!');
    console.log('📬 Revisa tu bandeja de entrada y carpeta de spam');

  } catch (error) {
    console.error('❌ ERROR al enviar emails:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    console.error('1. Verifica que SMTP_USER y SMTP_PASS estén configurados correctamente');
    console.error('2. Asegúrate de usar una "App Password" de Google');
    console.error('3. Verifica que la cuenta de Gmail tenga activada la autenticación de 2 factores');
    process.exit(1);
  }
}

testEmails();