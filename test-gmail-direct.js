const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmail() {
  console.log('=== TEST DE CONEXIÓN GMAIL ===\n');
  
  // Mostrar configuración (sin mostrar la contraseña completa)
  console.log('📋 Configuración:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NO CONFIGURADO'}`);
  console.log(`   SMTP_FROM: ${process.env.SMTP_FROM}\n`);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ ERROR: Variables SMTP no configuradas en .env');
    return;
  }

  console.log('🔧 Creando transporter...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // false para 587 con STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true, // Habilitar logs detallados
    logger: true  // Habilitar logger
  });

  console.log('✅ Transporter creado\n');

  console.log('🔍 Verificando conexión SMTP...');
  try {
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada exitosamente\n');
  } catch (error) {
    console.error('❌ ERROR al verificar conexión SMTP:');
    console.error(error);
    return;
  }

  console.log('📧 Enviando email de prueba...');
  try {
    const info = await transporter.sendMail({
      from: `"Valgame Test" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: 'proyectoagesh@gmail.com', // Email del último registro
      subject: 'Test de Conexión Gmail - Valgame',
      text: 'Si recibes este correo, la configuración de Gmail funciona correctamente.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2a2a3e;">✅ Test Exitoso</h2>
          <p>Si recibes este correo, significa que la configuración de Gmail está funcionando correctamente.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">Valgame Backend - ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('\n✅ EMAIL ENVIADO EXITOSAMENTE');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`   Accepted: ${info.accepted}`);
    console.log(`   Rejected: ${info.rejected}`);
    console.log('\n🎉 Revisa el correo proyectoagesh@gmail.com (incluyendo SPAM)');
    
  } catch (error) {
    console.error('\n❌ ERROR AL ENVIAR EMAIL:');
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.command) console.error('Command:', error.command);
    if (error.response) console.error('Response:', error.response);
    console.error('\nStack completo:', error.stack);
  }
}

testGmail().then(() => {
  console.log('\n=== FIN DEL TEST ===');
  process.exit(0);
}).catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
