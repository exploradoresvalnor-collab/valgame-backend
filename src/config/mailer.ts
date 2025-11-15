import nodemailer from 'nodemailer';

// --- FUNCIÓN ASÍNCRONA PARA CREAR EL TRANSPORTER ---
// Configura el servicio SMTP (Gmail en este caso)
const createTransporter = async () => {
  // Verificar que existan las credenciales SMTP
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('[MAILER] ERROR: Variables SMTP no configuradas. Verifica SMTP_HOST, SMTP_USER y SMTP_PASS en .env');
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: false, // false para port 587 (STARTTLS), true para port 465 (SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  console.log(`[MAILER] Usando SMTP: ${process.env.SMTP_HOST}:${port} (${process.env.SMTP_USER})`);
  return transporter;
};

// --- PLANTILLA HTML (Mejorada para evitar SPAM) ---
const getHtmlTemplate = (verificationLink: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
    .content { padding: 40px; color: #333333; line-height: 1.6; }
    .button { display: inline-block; padding: 16px 32px; font-size: 16px; color: #ffffff; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; text-decoration: none; font-weight: bold; }
    .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #e0e0e0; }
    .info-box { background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 VALGAME</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Tu aventura comienza aquí</p>
    </div>
    <div class="content">
      <h2 style="color: #667eea;">¡Bienvenido, Aventurero!</h2>
      <p>Gracias por registrarte en <strong>Valgame</strong>. Solo falta un paso para comenzar tu épica aventura.</p>
      
      <div class="info-box">
        <strong>🎁 Al verificar tu cuenta recibirás:</strong><br>
        • Paquete del Pionero<br>
        • Personaje inicial exclusivo<br>
        • Recursos de inicio<br>
        • Acceso completo al juego
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" class="button" style="color: #ffffff;">✨ Verificar Mi Cuenta</a>
      </p>
      
      <p style="font-size: 14px; color: #666;">O copia y pega este enlace en tu navegador:</p>
      <p style="font-size: 12px; background-color: #f9f9f9; padding: 10px; border-radius: 4px; word-break: break-all;">
        ${verificationLink}
      </p>
      
      <p style="font-size: 13px; color: #888; margin-top: 30px;">
        ⏰ <strong>Importante:</strong> Este enlace es válido por 1 hora.<br>
        🛡️ Si no te registraste en Valgame, ignora este correo.
      </p>
    </div>
    <div class="footer">
      <p>© 2025 Valgame. Todos los derechos reservados.</p>
      <p style="margin-top: 10px;">
        <a href="#" style="color: #667eea; text-decoration: none;">Soporte</a> | 
        <a href="#" style="color: #667eea; text-decoration: none;">Política de Privacidad</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// --- PLANTILLA HTML PARA RECUPERACIÓN DE CONTRASEÑA ---
const getPasswordResetTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background-color: #e44242; color: #ffffff; padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 40px; color: #333333; line-height: 1.6; }
    .button { display: inline-block; padding: 15px 25px; font-size: 16px; color: #ffffff; background-color: #e44242; border-radius: 5px; text-decoration: none; font-weight: bold; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888888; }
    .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Recuperación de Contraseña</h1></div>
    <div class="content">
      <h2>¿Olvidaste tu contraseña?</h2>
      <p>No te preocupes, todos lo olvidamos de vez en cuando. Haz clic en el botón de abajo para crear una nueva contraseña.</p>
      <p style="text-align: center;"><a href="${resetLink}" class="button">Cambiar Mi Contraseña</a></p>
      <div class="warning">
        <strong>⚠️ Seguridad:</strong> Este enlace es válido por 1 hora. Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.
      </div>
    </div>
    <div class="footer"><p>&copy; 2025 Valgame. Todos los derechos reservados.</p></div>
  </div>
</body>
</html>
`;

// --- FUNCIÓN DE ENVÍO (MODIFICADA) ---
export const sendVerificationEmail = async (email: string, token: string) => {
  console.log('[MAILER] 🚀 Iniciando envío de correo de verificación...');
  console.log(`[MAILER] 📧 Destinatario: ${email}`);
  console.log(`[MAILER] 🔑 Token: ${token.substring(0, 10)}...`);
  
  try {
    const transporter = await createTransporter();
    const verificationLink = `http://localhost:${process.env.PORT || 8080}/auth/verify/${token}`;
    console.log(`[MAILER] 🔗 Link generado: ${verificationLink}`);

    const info = await transporter.sendMail({
      from: `"Valgame" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verifica tu cuenta de Valgame',
      html: getHtmlTemplate(verificationLink),
    });

    console.log(`[MAILER] ✅ Correo de verificación enviado exitosamente a: ${email}`);
    console.log(`[MAILER] 📨 Message ID: ${info.messageId}`);
    console.log(`[MAILER] 📋 Response: ${info.response}`);
  } catch (error: any) {
    console.error('[MAILER] ❌ ERROR al enviar correo de verificación:');
    console.error('[MAILER] Error completo:', error);
    console.error('[MAILER] Stack:', error.stack);
    throw error; // Re-lanzar el error para que lo maneje el controlador
  }
};

// --- NUEVA FUNCIÓN: ENVÍO DE EMAIL DE RECUPERACIÓN DE CONTRASEÑA ---
export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
  console.log('[MAILER] 🚀 Iniciando envío de correo de recuperación de contraseña...');
  console.log(`[MAILER] 📧 Destinatario: ${email}`);
  
  try {
    const transporter = await createTransporter();
    console.log(`[MAILER] 🔗 Link de recuperación: ${resetURL}`);

    const info = await transporter.sendMail({
      from: `"Valgame" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Recuperación de contraseña - Valgame',
      html: getPasswordResetTemplate(resetURL),
    });

    console.log(`[MAILER] ✅ Correo de recuperación enviado exitosamente a: ${email}`);
    console.log(`[MAILER] 📨 Message ID: ${info.messageId}`);
    console.log(`[MAILER] 📋 Response: ${info.response}`);
  } catch (error: any) {
    console.error('[MAILER] ❌ ERROR al enviar correo de recuperación:');
    console.error('[MAILER] Error completo:', error);
    console.error('[MAILER] Stack:', error.stack);
    throw error;
  }
};