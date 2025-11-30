"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// --- FUNCIÓN ASÍNCRONA PARA CREAR EL TRANSPORTER ---
// Configura el servicio SMTP (Gmail en este caso)
const createTransporter = async () => {
    // Verificar que existan las credenciales SMTP
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('[MAILER] ERROR: Variables SMTP no configuradas. Verifica SMTP_HOST, SMTP_USER y SMTP_PASS en .env');
    }
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer_1.default.createTransport({
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
// --- PLANTILLA HTML MEJORADA PARA VERIFICACIÓN ---
const getHtmlTemplate = (verificationLink) => `
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
      content: '���';
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
      content: '✓';
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
      <h1>�� VALGAME</h1>
      <p>¡Tu aventura épica te espera!</p>
    </div>

    <div class="content">
      <h2>¡Bienvenido, Aventurero! ���</h2>
      <p class="welcome-text">
        Nos alegra mucho que te unas a la comunidad de <strong>Valgame</strong>. 
        Solo necesitas verificar tu correo para activar tu cuenta y comenzar tu épica aventura.
      </p>

      <div class="rewards-box">
        <h3>��� Recompensas al Verificar:</h3>
        <ul>
          <li>Paquete del Pionero exclusivo</li>
          <li>Personaje inicial legendario</li>
          <li>Recursos de inicio generosos</li>
          <li>Acceso completo a todos los modos de juego</li>
        </ul>
      </div>

      <div class="cta-section">
        <a href="${verificationLink}" class="button">✨ Verificar Mi Cuenta Ahora</a>
      </div>

      <div class="link-section">
        <p class="link-text">O copia y pega este enlace en tu navegador:</p>
        <div class="link-box">${verificationLink}</div>
      </div>

      <div class="important">
        <strong>⏰ Importante:</strong> Este enlace es válido por <strong>1 hora</strong>. 
        Activa tu cuenta pronto para recibir todas tus recompensas. 
        Si no te registraste en Valgame, por favor ignora este correo.
      </div>
    </div>

    <div class="footer">
      <p><strong>© 2025 Valgame - Tu Mundo de Aventuras</strong></p>
      <p>
        <a href="#">Centro de Ayuda</a> | 
        <a href="#">Política de Privacidad</a> | 
        <a href="#">Términos de Servicio</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px;">
        Si tienes preguntas, contacta con nuestro equipo de soporte
      </p>
    </div>
  </div>
</body>
</html>
`;
// --- PLANTILLA HTML PARA RECUPERACIÓN DE CONTRASEÑA ---
const getPasswordResetTemplate = (resetLink) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recupera tu contraseña - Valgame</title>
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
      <h1>��� Recuperar Contraseña</h1>
    </div>

    <div class="content">
      <h2>¿Olvidaste tu contraseña?</h2>
      <p>No te preocupes, es muy fácil resetearla. Haz clic en el botón de abajo para crear una nueva contraseña segura.</p>

      <div class="cta-section">
        <a href="${resetLink}" class="button">��� Cambiar Mi Contraseña</a>
      </div>

      <p style="font-size: 13px; color: #888; margin: 20px 0;">O copia este enlace:</p>
      <div style="background-color: #f9f9f9; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 11px; color: #667eea; font-family: 'Courier New', monospace; border: 1px dashed #ddd;">
        ${resetLink}
      </div>

      <div class="warning">
        <strong>⚠️ Seguridad:</strong> Este enlace es válido por <strong>1 hora</strong>. 
        Si no solicitaste este cambio, por favor ignora este correo y tu contraseña permanecerá sin cambios.
      </div>
    </div>

    <div class="footer">
      <p><strong>© 2025 Valgame - Tu Mundo de Aventuras</strong></p>
      <p>Si no solicitaste este cambio, <a href="#">reporta aquí</a></p>
    </div>
  </div>
</body>
</html>
`;
// --- FUNCIÓN DE ENVÍO (VERIFICACIÓN) ---
const sendVerificationEmail = async (email, token) => {
    console.log('[MAILER] ��� Iniciando envío de correo de verificación...');
    console.log(`[MAILER] ��� Destinatario: ${email}`);
    console.log(`[MAILER] ��� Token: ${token.substring(0, 10)}...`);
    try {
        const transporter = await createTransporter();
        const verificationLink = `http://localhost:${process.env.PORT || 8080}/auth/verify/${token}`;
        console.log(`[MAILER] ��� Link generado: ${verificationLink}`);
        const info = await transporter.sendMail({
            from: `"��� Valgame" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: email,
            subject: '✨ Verifica tu cuenta de Valgame - ¡Tu aventura te espera!',
            html: getHtmlTemplate(verificationLink),
        });
        console.log(`[MAILER] ✅ Correo de verificación enviado exitosamente a: ${email}`);
        console.log(`[MAILER] ��� Message ID: ${info.messageId}`);
        console.log(`[MAILER] ��� Response: ${info.response}`);
    }
    catch (error) {
        console.error('[MAILER] ❌ ERROR al enviar correo de verificación:');
        console.error('[MAILER] Error completo:', error);
        console.error('[MAILER] Stack:', error.stack);
        throw error;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
// --- FUNCIÓN DE ENVÍO (RECUPERACIÓN DE CONTRASEÑA) ---
const sendPasswordResetEmail = async (email, resetURL) => {
    console.log('[MAILER] ��� Iniciando envío de correo de recuperación de contraseña...');
    console.log(`[MAILER] ��� Destinatario: ${email}`);
    try {
        const transporter = await createTransporter();
        console.log(`[MAILER] ��� Link de recuperación: ${resetURL}`);
        const info = await transporter.sendMail({
            from: `"��� Valgame" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: email,
            subject: '��� Recupera tu contraseña de Valgame',
            html: getPasswordResetTemplate(resetURL),
        });
        console.log(`[MAILER] ✅ Correo de recuperación enviado exitosamente a: ${email}`);
        console.log(`[MAILER] ��� Message ID: ${info.messageId}`);
        console.log(`[MAILER] ��� Response: ${info.response}`);
    }
    catch (error) {
        console.error('[MAILER] ❌ ERROR al enviar correo de recuperación:');
        console.error('[MAILER] Error completo:', error);
        console.error('[MAILER] Stack:', error.stack);
        throw error;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
