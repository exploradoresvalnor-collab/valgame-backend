import nodemailer from 'nodemailer';

async function testGmail() {
  console.log('🧪 Iniciando test de Gmail...');
  console.log('📧 Configuración:');
  console.log('  Host:', process.env.SMTP_HOST);
  console.log('  Port:', process.env.SMTP_PORT);
  console.log('  User:', process.env.SMTP_USER);
  console.log('  From:', process.env.SMTP_FROM);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('✅ Transporter creado');

    // Verificar conexión
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada');

    // Enviar email de prueba
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'proyectoagesh@gmail.com',
      subject: '🧪 Test de Gmail desde Valgame Backend',
      html: `
        <h1>✅ Gmail funciona correctamente</h1>
        <p>Este es un email de prueba enviado desde tu backend.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p>Si ves este email, significa que la configuración de Gmail está funcionando perfectamente.</p>
      `,
    });

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);
    
  } catch (error: any) {
    console.error('❌ Error al enviar email:');
    console.error('  Mensaje:', error.message);
    console.error('  Código:', error.code);
    console.error('  Stack:', error.stack);
  }
}

testGmail();
