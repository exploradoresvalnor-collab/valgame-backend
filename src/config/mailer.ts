import nodemailer from 'nodemailer';

// --- FUNCI√ìN AS√çNCRONA PARA CREAR EL TRANSPORTER ---
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

// --- PLANTILLA HTML MEJORADA PARA VERIFICACI√ìN ---
const getHtmlTemplate = (verificationLink: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu cuenta - Valgame</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto;
      background-color: #ffffff; 
      border-radius: 12px;
      overflow: hidden; 
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: #ffffff; 
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: 'ÌæÆ';
      position: absolute;
      font-size: 120px;
      opacity: 0.1;
      top: -30px;
      right: -30px;
    }
    .header h1 { 
      margin: 0; 
      font-size: 36px; 
      font-weight: 700;
      letter-spacing: 1px;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
      font-weight: 300;
    }
    .content { 
      padding: 50px 40px; 
      color: #333333; 
      line-height: 1.8;
    }
    .content h2 {
      color: #667eea;
      font-size: 24px;
      margin-bottom: 15px;
    }
    .welcome-text {
      font-size: 15px;
      color: #555;
      margin-bottom: 30px;
    }
    .rewards-box { 
      background: linear-gradient(135deg, #f0f4ff 0%, #f5f8ff 100%);
      border-left: 5px solid #667eea;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .rewards-box h3 {
      color: #667eea;
      margin-bottom: 12px;
      font-size: 16px;
    }
    .rewards-box ul {
      list-style: none;
      padding: 0;
    }
    .rewards-box li {
      padding: 8px 0;
      color: #666;
      font-size: 14px;
      display: flex;
      align-items: center;
    }
    .rewards-box li::before {
      content: '‚úì';
      color: #667eea;
      font-weight: bold;
      margin-right: 10px;
    }
    .cta-section {
      text-align: center;
      margin: 40px 0;
    }
    .button { 
      display: inline-block; 
      padding: 16px 40px; 
      font-size: 16px; 
      color: #ffffff;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px; 
      text-decoration: none; 
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
    .link-section {
      margin-top: 30px;
      padding-top: 25px;
      border-top: 1px solid #eee;
    }
    .link-text {
      font-size: 13px;
      color: #888;
      margin-bottom: 10px;
    }
    .link-box {
      background-color: #f9f9f9;
      padding: 12px;
      border-radius: 6px;
      word-break: break-all;
      font-size: 12px;
      color: #667eea;
      font-family: 'Courier New', monospace;
      border: 1px dashed #ddd;
    }
    .important {
      background-color: #fffbf0;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-top: 25px;
      border-radius: 6px;
      font-size: 13px;
      color: #666;
    }
    .important strong {
      color: #e67e22;
    }
    .footer { 
      background-color: #f9f9f9; 
      padding: 30px 40px;
      text-align: center; 
      font-size: 12px; 
      color: #888;
      border-top: 1px solid #eee;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
      margin: 0 10px;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ÔøΩÔøΩ VALGAME</h1>
      <p>¬°Tu aventura √©pica te espera!</p>
    </div>

    <div class="content">
      <h2>¬°Bienvenido, Aventurero! Ìºü</h2>
      <p class="welcome-text">
        Nos alegra mucho que te unas a la comunidad de <strong>Valgame</strong>. 
        Solo necesitas verificar tu correo para activar tu cuenta y comenzar tu √©pica aventura.
      </p>

      <div class="rewards-box">
        <h3>ÌæÅ Recompensas al Verificar:</h3>
        <ul>
          <li>Paquete del Pionero exclusivo</li>
          <li>Personaje inicial legendario</li>
          <li>Recursos de inicio generosos</li>
          <li>Acceso completo a todos los modos de juego</li>
        </ul>
      </div>

      <div class="cta-section">
        <a href="${verificationLink}" class="button">‚ú® Verificar Mi Cuenta Ahora</a>
      </div>

      <div class="link-section">
        <p class="link-text">O copia y pega este enlace en tu navegador:</p>
        <div class="link-box">${verificationLink}</div>
      </div>

      <div class="important">
        <strong>‚è∞ Importante:</strong> Este enlace es v√°lido por <strong>1 hora</strong>. 
        Activa tu cuenta pronto para recibir todas tus recompensas. 
        Si no te registraste en Valgame, por favor ignora este correo.
      </div>
    </div>

    <div class="footer">
      <p><strong>¬© 2025 Valgame - Tu Mundo de Aventuras</strong></p>
      <p>
        <a href="#">Centro de Ayuda</a> | 
        <a href="#">Pol√≠tica de Privacidad</a> | 
        <a href="#">T√©rminos de Servicio</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px;">
        Si tienes preguntas, contacta con nuestro equipo de soporte
      </p>
    </div>
  </div>
</body>
</html>
`;

// --- PLANTILLA HTML PARA RECUPERACI√ìN DE CONTRASE√ëA ---
const getPasswordResetTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recupera tu contrase√±a - Valgame</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto;
      background-color: #ffffff; 
      border-radius: 12px;
      overflow: hidden; 
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }
    .header { 
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); 
      color: #ffffff; 
      padding: 50px 40px;
      text-align: center;
    }
    .header h1 { 
      margin: 0; 
      font-size: 32px; 
      font-weight: 700;
    }
    .content { 
      padding: 50px 40px; 
      color: #333333; 
      line-height: 1.8;
    }
    .content h2 {
      color: #e74c3c;
      font-size: 22px;
      margin-bottom: 15px;
    }
    .cta-section {
      text-align: center;
      margin: 30px 0;
    }
    .button { 
      display: inline-block; 
      padding: 14px 35px; 
      font-size: 16px; 
      color: #ffffff;
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      border-radius: 8px; 
      text-decoration: none; 
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
      font-size: 13px;
      color: #666;
    }
    .warning strong {
      color: #ff9800;
    }
    .footer { 
      background-color: #f9f9f9; 
      padding: 30px 40px;
      text-align: center; 
      font-size: 12px; 
      color: #888;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ì¥ê Recuperar Contrase√±a</h1>
    </div>

    <div class="content">
      <h2>¬øOlvidaste tu contrase√±a?</h2>
      <p>No te preocupes, es muy f√°cil resetearla. Haz clic en el bot√≥n de abajo para crear una nueva contrase√±a segura.</p>

      <div class="cta-section">
        <a href="${resetLink}" class="button">Ì¥Ñ Cambiar Mi Contrase√±a</a>
      </div>

      <p style="font-size: 13px; color: #888; margin: 20px 0;">O copia este enlace:</p>
      <div style="background-color: #f9f9f9; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 11px; color: #667eea; font-family: 'Courier New', monospace; border: 1px dashed #ddd;">
        ${resetLink}
      </div>

      <div class="warning">
        <strong>‚ö†Ô∏è Seguridad:</strong> Este enlace es v√°lido por <strong>1 hora</strong>. 
        Si no solicitaste este cambio, por favor ignora este correo y tu contrase√±a permanecer√° sin cambios.
      </div>
    </div>

    <div class="footer">
      <p><strong>¬© 2025 Valgame - Tu Mundo de Aventuras</strong></p>
      <p>Si no solicitaste este cambio, <a href="#">reporta aqu√≠</a></p>
    </div>
  </div>
</body>
</html>
`;

// --- FUNCI√ìN DE ENV√çO (VERIFICACI√ìN) ---
export const sendVerificationEmail = async (email: string, token: string) => {
  console.log('[MAILER] Ì∫Ä Iniciando env√≠o de correo de verificaci√≥n...');
  console.log(`[MAILER] Ì≥ß Destinatario: ${email}`);
  console.log(`[MAILER] Ì¥ë Token: ${token.substring(0, 10)}...`);

  try {
    const transporter = await createTransporter();
    const verificationLink = `http://localhost:${process.env.PORT || 8080}/auth/verify/${token}`;
    console.log(`[MAILER] Ì¥ó Link generado: ${verificationLink}`);

    const info = await transporter.sendMail({
      from: `"ÌæÆ Valgame" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: '‚ú® Verifica tu cuenta de Valgame - ¬°Tu aventura te espera!',
      html: getHtmlTemplate(verificationLink),
    });

    console.log(`[MAILER] ‚úÖ Correo de verificaci√≥n enviado exitosamente a: ${email}`);
    console.log(`[MAILER] Ì≥® Message ID: ${info.messageId}`);
    console.log(`[MAILER] Ì≥ã Response: ${info.response}`);
  } catch (error: any) {
    console.error('[MAILER] ‚ùå ERROR al enviar correo de verificaci√≥n:');
    console.error('[MAILER] Error completo:', error);
    console.error('[MAILER] Stack:', error.stack);
    throw error;
  }
};

// --- FUNCI√ìN DE ENV√çO (RECUPERACI√ìN DE CONTRASE√ëA) ---
export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
  console.log('[MAILER] Ì∫Ä Iniciando env√≠o de correo de recuperaci√≥n de contrase√±a...');
  console.log(`[MAILER] Ì≥ß Destinatario: ${email}`);

  try {
    const transporter = await createTransporter();
    console.log(`[MAILER] Ì¥ó Link de recuperaci√≥n: ${resetURL}`);

    const info = await transporter.sendMail({
      from: `"ÌæÆ Valgame" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Ì¥ê Recupera tu contrase√±a de Valgame',
      html: getPasswordResetTemplate(resetURL),
    });

    console.log(`[MAILER] ‚úÖ Correo de recuperaci√≥n enviado exitosamente a: ${email}`);
    console.log(`[MAILER] Ì≥® Message ID: ${info.messageId}`);
    console.log(`[MAILER] Ì≥ã Response: ${info.response}`);
  } catch (error: any) {
    console.error('[MAILER] ‚ùå ERROR al enviar correo de recuperaci√≥n:');
    console.error('[MAILER] Error completo:', error);
    console.error('[MAILER] Stack:', error.stack);
    throw error;
  }
};
