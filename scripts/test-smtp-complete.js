#!/usr/bin/env node
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n' + '‚ïê'.repeat(90));
console.log('Ì∑™ DIAGN√ìSTICO COMPLETO DE SMTP - VALGAME');
console.log('‚ïê'.repeat(90) + '\n');

// 1. Verificar variables
console.log('Ì≥ã PASO 1: Verificar variables de entorno\n');
const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
let allPresent = true;

required.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`   ‚ùå ${key}: NO CONFIGURADO`);
    allPresent = false;
  } else {
    const display = key.includes('PASS') ? '***' + value.slice(-4) : value;
    console.log(`   ‚úÖ ${key}: ${display}`);
  }
});

if (!allPresent) {
  console.error('\n‚ùå ERROR: Faltan variables de entorno cr√≠ticas\n');
  process.exit(1);
}

console.log('\n' + '‚îÄ'.repeat(90));
console.log('Ì¥ó PASO 2: Intentar conectar a SMTP\n');

async function runTest() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: true,
      debug: true,
    });

    console.log('   Ì≥ç Transporter creado');
    console.log('   ÔøΩÔøΩ Verificando conexi√≥n al servidor...\n');

    const verified = await transporter.verify();

    if (!verified) {
      console.error('   ‚ùå Verificaci√≥n fall√≥');
      process.exit(1);
    }

    console.log('   ‚úÖ Conexi√≥n verificada exitosamente\n');

    console.log('‚îÄ'.repeat(90));
    console.log('Ì≥ß PASO 3: Enviar email de prueba\n');

    const testEmail = process.env.SMTP_USER;
    console.log(`   Ì≥Æ Enviando a: ${testEmail}`);
    console.log(`   Ì±§ Desde: ${process.env.SMTP_FROM}\n`);

    const info = await transporter.sendMail({
      from: `"Valgame Test" <${process.env.SMTP_FROM}>`,
      to: testEmail,
      subject: 'Ì∑™ Test SMTP - Valgame',
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial; background: #f0f0f0; margin: 0; padding: 20px; }
              .card { background: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #667eea; }
              .success { color: #27ae60; font-weight: bold; }
              .details { background: #f9f9f9; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>‚úÖ SMTP Funcionando</h1>
              <p>Si recibes este correo, la configuraci√≥n SMTP es correcta.</p>
              <div class="details">
                <p><strong>Hora del test:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p><strong>Servidor SMTP:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>
                <p class="success">Status: Configuraci√≥n lista para producci√≥n</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('   ‚úÖ Email enviado exitosamente!\n');
    console.log(`   Ì≥® Message ID: ${info.messageId}`);
    console.log(`   Ì≥¨ Response: ${info.response}\n`);

    console.log('‚ïê'.repeat(90));
    console.log('Ìø¢ RESULTADO: SMTP FUNCIONA CORRECTAMENTE');
    console.log('‚ïê'.repeat(90));
    console.log('\n‚úÖ El sistema est√° listo para:');
    console.log('   1. Enviar correos de verificaci√≥n');
    console.log('   2. Enviar correos de recuperaci√≥n de contrase√±a');
    console.log('   3. Enviar notificaciones\n');

    process.exit(0);

  } catch (error) {
    console.error('\n‚ùå ERROR DURANTE EL TEST:\n');
    console.error(`   C√≥digo: ${error.code}`);
    console.error(`   Mensaje: ${error.message}`);
    if (error.command) console.error(`   Command: ${error.command}`);
    if (error.response) console.error(`   Response: ${error.response}`);

    console.log('\n' + '‚ïê'.repeat(90));
    console.log('Ì¥ç DIAGN√ìSTICO DE ERRORES');
    console.log('‚ïê'.repeat(90) + '\n');

    if (error.code === 'EAUTH') {
      console.log('‚ùå ERROR DE AUTENTICACI√ìN (EAUTH)');
      console.log('\n‚úÖ Soluciones:');
      console.log('   1. Verifica que el email es correcto:');
      console.log(`      ${process.env.SMTP_USER}`);
      console.log('   2. Verifica que usas una APP PASSWORD, NO la contrase√±a normal');
      console.log('   3. Si 2FA est√° habilitado en Google, requiere App Password');
      console.log('   4. Crea una nueva App Password en: https://myaccount.google.com/apppasswords');
      console.log('   5. Copia exactamente el c√≥digo (16 caracteres sin espacios)\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('‚ùå CONEXI√ìN RECHAZADA');
      console.log('\n‚úÖ Soluciones:');
      console.log(`   1. Verifica el servidor: ${process.env.SMTP_HOST}`);
      console.log(`   2. Verifica el puerto: ${process.env.SMTP_PORT}`);
      console.log('   3. Verifica tu conexi√≥n a internet');
      console.log('   4. Si usas VPN, desact√≠vala\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('‚ùå TIMEOUT - El servidor tard√≥ demasiado');
      console.log('\n‚úÖ Soluciones:');
      console.log('   1. Comprueba tu conexi√≥n a internet');
      console.log('   2. Intenta de nuevo en unos segundos');
      console.log('   3. Si persiste, contacta al soporte\n');
    } else {
      console.log(`‚ùå ERROR DESCONOCIDO: ${error.code}`);
      console.log('\nStack completo:');
      console.log(error.stack + '\n');
    }

    process.exit(1);
  }
}

runTest();
