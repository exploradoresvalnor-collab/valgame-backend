"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// --- CONFIGURACIÓN DEL TRANSPORTER (CORREGIDA) ---
// Ahora usa las variables genéricas de SMTP de tu archivo .env
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST, // El host de tu dominio (ej. smtp.tudominio.com)
    port: Number(process.env.SMTP_PORT || 465), // El puerto seguro (465 es el estándar)
    secure: true, // Requerido para el puerto 465
    auth: {
        user: process.env.EMAIL_USER, // Tu correo completo (ej. noreply@tudominio.com)
        pass: process.env.EMAIL_PASS, // La contraseña de esa cuenta de correo
    },
});
// --- PLANTILLA HTML (Se mantiene igual, ya está bien diseñada) ---
const getHtmlTemplate = (verificationLink) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background-color: #2a2a3e; color: #ffffff; padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 40px; color: #333333; line-height: 1.6; }
    .content p { margin: 0 0 20px; }
    .button { display: inline-block; padding: 15px 25px; font-size: 16px; color: #ffffff; background-color: #5a42e4; border-radius: 5px; text-decoration: none; font-weight: bold; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Valgame</h1>
    </div>
    <div class="content">
      <h2>¡Bienvenido, Aventurero!</h2>
      <p>Solo falta un paso para comenzar tu viaje. Por favor, haz clic en el botón de abajo para verificar tu cuenta.</p>
      <p style="text-align: center;">
        <a href="${verificationLink}" class="button">Verificar Mi Cuenta</a>
      </p>
      <p>Si no te registraste en Valgame, puedes ignorar este correo. Este enlace es válido por 1 hora.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Valgame. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;
// --- FUNCIÓN DE ENVÍO (Se mantiene igual, ya es correcta) ---
const sendVerificationEmail = async (email, token) => {
    // En producción, deberías construir este enlace con la URL de tu backend real.
    const verificationLink = `http://localhost:${process.env.PORT || 8080}/auth/verify/${token}`;
    await transporter.sendMail({
        from: `"Valgame" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verifica tu cuenta de Valgame',
        html: getHtmlTemplate(verificationLink),
    });
    console.log(`Correo de verificación enviado a: ${email}`);
};
exports.sendVerificationEmail = sendVerificationEmail;
