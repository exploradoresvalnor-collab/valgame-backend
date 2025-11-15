import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { TokenBlacklist } from '../models/TokenBlacklist';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Módulo nativo para generar tokens seguros
import { sendVerificationEmail } from '../config/mailer'; // Importamos nuestra nueva función
import { getJWTSecret, getSecurityInfo } from '../config/security'; // Importar configuración segura
import BaseCharacter from '../models/BaseCharacter';
import { Consumable } from '../models/Consumable';
import { Types } from 'mongoose';
import { auth } from '../middlewares/auth';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6)
});

// --- RUTA DE REGISTRO (MODIFICADA) ---
router.post('/register', async (req, res) => {
  console.log('[REGISTER] 🎯 Endpoint /register llamado');
  try {
    const { email, username, password } = RegisterSchema.parse(req.body);
    console.log(`[REGISTER] 📝 Datos recibidos: ${email}, ${username}`);

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
        // Si el usuario existe pero no está verificado, podríamos reenviar el correo
        if (!exists.isVerified) {
            // Aquí podrías añadir lógica para reenviar el correo si lo deseas
        }
        return res.status(409).json({ error: 'Email o username ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Creamos una instancia del usuario para añadirle los tokens
    const user = new User({ email, username, passwordHash });

  // Nota: la entrega del Paquete del Pionero se realizará al verificar el correo

    // Generamos el token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hora de validez

    await user.save(); // Guardamos el usuario con el token
    console.log(`[REGISTER] ✅ Usuario creado: ${username} (${email})`);

    // Enviamos el correo de verificación
    console.log(`[REGISTER] 📧 Intentando enviar correo de verificación...`);
    try {
      await sendVerificationEmail(user.email, verificationToken);
      console.log(`[REGISTER] ✅ Correo enviado exitosamente`);
    } catch (emailError: any) {
      console.error(`[REGISTER] ❌ ERROR al enviar correo:`, emailError.message);
      // El usuario ya fue creado, pero informamos que hubo problema con el email
      return res.status(201).json({ 
        message: 'Registro exitoso pero hubo un problema al enviar el correo de verificación. Por favor, contacta al soporte.',
        warning: 'Email no enviado'
      });
    }

    return res.status(201).json({ 
      message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.' 
    });

  } catch (e: any) {
    console.error('[REGISTER] ❌ Error en registro:', e.message);
    return res.status(400).json({ error: e?.message || 'Bad Request' });
  }
});

// --- NUEVA RUTA DE VERIFICACIÓN ---
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }, // Token válido y no expirado
        });

        if (!user) {
            return res.status(400).send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token Inválido - Valgame</title>
  <style>
    body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 500px; text-align: center; }
    h1 { color: #e74c3c; font-size: 28px; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; }
    .icon { font-size: 64px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Token Inválido o Expirado</h1>
    <p>El enlace de verificación no es válido o ya ha expirado.</p>
    <p>Por favor, solicita un nuevo correo de verificación.</p>
  </div>
</body>
</html>
            `);
        }

        // Verificamos al usuario y limpiamos los campos del token
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        console.log(`[VERIFY] ✅ Usuario verificado: ${user.username} (${user.email})`);

        // Entregar el Paquete del Pionero (idempotente)
        let packageResult = null;
        try {
          console.log('[VERIFY] 🎁 Intentando entregar Paquete del Pionero...');
          const { deliverPioneerPackage } = await import('../services/onboarding.service');
          packageResult = await deliverPioneerPackage(user as any);
          console.log('[VERIFY] ✅ Paquete del Pionero entregado exitosamente');
        } catch (err: any) {
          console.error('[VERIFY] ❌ Error al entregar paquete:', err.message);
          // Continuar aunque falle el paquete
        }

        // Detectar si es petición API (JSON) o browser (HTML)
        const accept = req.headers.accept || '';
        const isAPI = accept.includes('application/json') || req.query.format === 'json' || process.env.NODE_ENV === 'test';

        if (isAPI) {
          // Respuesta JSON para APIs/tests
          return res.json({
            ok: true,
            message: 'Usuario verificado exitosamente',
            package: packageResult
          });
        } else {
          // Página HTML para browsers
          return res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Cuenta Verificada! - Valgame</title>
  <style>
    body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 500px; text-align: center; animation: slideIn 0.5s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    h1 { color: #27ae60; font-size: 32px; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; margin: 15px 0; }
    .icon { font-size: 80px; margin-bottom: 20px; animation: bounce 1s ease infinite; }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .rewards { background: #f0f4ff; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left; }
    .rewards h3 { color: #667eea; margin-top: 0; }
    .rewards ul { list-style: none; padding: 0; }
    .rewards li { padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
    .rewards li:last-child { border-bottom: none; }
    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; transition: transform 0.2s; }
    .btn:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎉</div>
    <h1>¡Cuenta Verificada con Éxito!</h1>
    <p>¡Bienvenido a <strong>Valgame</strong>, aventurero <strong>${user.username}</strong>!</p>
    
    ${packageResult ? `
    <div class="rewards">
      <h3>🎁 Recompensas Recibidas:</h3>
      <ul>
        <li>✅ Paquete del Pionero desbloqueado</li>
        <li>⚔️ Personaje inicial</li>
        <li>💰 Recursos de inicio</li>
        <li>🎮 Acceso completo al juego</li>
      </ul>
    </div>
    ` : `
    <div class="rewards">
      <h3>✅ Tu cuenta está verificada</h3>
      <p>Ya puedes iniciar sesión y comenzar tu aventura.</p>
    </div>
    `}
    
    <p style="margin-top: 30px;">Ya puedes cerrar esta ventana e iniciar sesión en el juego.</p>
    <a href="#" class="btn">🎮 Ir al Juego</a>
  </div>
</body>
</html>
          `);
        }

    } catch (error: any) {
        console.error('[VERIFY] ❌ Error en verificación:', error.message);
        return res.status(500).send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - Valgame</title>
  <style>
    body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 500px; text-align: center; }
    h1 { color: #e74c3c; font-size: 28px; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; }
    .icon { font-size: 64px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>Error del Servidor</h1>
    <p>Ocurrió un error al procesar tu verificación.</p>
    <p>Por favor, contacta al soporte técnico.</p>
  </div>
</body>
</html>
        `);
    }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// --- RUTA DE LOGIN (MODIFICADA CON httpOnly COOKIE) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    // AÑADIMOS LA COMPROBACIÓN (bypass en desarrollo si TEST_MODE está activo)
    const bypassVerification = process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'test';
    if (!user.isVerified && !bypassVerification) {
      return res.status(403).json({ error: 'Debes verificar tu cuenta antes de iniciar sesión.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user._id }, 
      getJWTSecret(), 
      { expiresIn: '7d' }
    );

    // 🔐 SEGURIDAD: Token en httpOnly cookie (NO accesible desde JavaScript)
    res.cookie('token', token, {
      httpOnly: true,           // Protege contra XSS
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict',       // Protege contra CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 días
    });

    // Preparar respuesta con todos los datos del usuario
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
      tutorialCompleted: user.tutorialCompleted,
      // ✅ RECURSOS del usuario
      val: user.val ?? 0,
      boletos: user.boletos ?? 0,
      evo: user.evo ?? 0,
      invocaciones: user.invocaciones ?? 0,
      evoluciones: user.evoluciones ?? 0,
      boletosDiarios: user.boletosDiarios ?? 0,
      // Arrays e inventario
      personajes: user.personajes || [],
      inventarioEquipamiento: user.inventarioEquipamiento || [],
      inventarioConsumibles: user.inventarioConsumibles || [],
      // Límites
      limiteInventarioEquipamiento: user.limiteInventarioEquipamiento,
      limiteInventarioConsumibles: user.limiteInventarioConsumibles,
      limiteInventarioPersonajes: user.limiteInventarioPersonajes,
      // Estado
      personajeActivoId: user.personajeActivoId,
      receivedPioneerPackage: user.receivedPioneerPackage
    };

    // En entorno de test, también devolvemos el token en el body para los tests
    if (process.env.NODE_ENV === 'test') {
      return res.json({
        message: 'Login exitoso',
        token,
        user: userData
      });
    }
    
    // En producción y desarrollo normal, devolver datos completos
    return res.json({ 
      message: 'Login exitoso',
      user: userData
    });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Bad Request' });
  }
});

// --- NUEVA RUTA DE LOGOUT (CON LIMPIEZA DE COOKIE) ---
router.post('/logout', auth, async (req, res) => {
  try {
    const header = req.header('Authorization') || '';
    let token = header.replace(/^Bearer\s+/i, '').trim();

    // Si no hay token en header, intentar obtenerlo de la cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(400).json({ error: 'No se proporcionó token' });
    }

    // Decodificar el token para obtener su fecha de expiración
    const decoded = jwt.verify(token, getJWTSecret()) as any;
    const expiresAt = new Date(decoded.exp * 1000); // Convertir timestamp a Date

    // Agregar el token a la blacklist
    await TokenBlacklist.create({
      token,
      expiresAt
    });

    // 🔐 SEGURIDAD: Limpiar cookie httpOnly
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error: any) {
    console.error('[LOGOUT] Error:', error);
    return res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

// --- NUEVA RUTA: REENVIAR EMAIL DE VERIFICACIÓN ---
const ResendVerificationSchema = z.object({
  email: z.string().email()
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = ResendVerificationSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no revelar si el usuario existe o no
      return res.json({ message: 'Si el correo existe y no está verificado, se enviará un nuevo email de verificación.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'La cuenta ya está verificada' });
    }

    // Verificar si ya existe un token válido para evitar spam
    if (user.verificationTokenExpires && user.verificationTokenExpires > new Date()) {
      const minutesLeft = Math.ceil((user.verificationTokenExpires.getTime() - Date.now()) / 60000);
      return res.status(429).json({ 
        error: `Ya existe un email de verificación válido. Espera ${minutesLeft} minutos antes de solicitar otro.` 
      });
    }

    // Generar nuevo token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    // Enviar email
    await sendVerificationEmail(user.email, verificationToken);

    return res.json({ message: 'Email de verificación enviado. Revisa tu bandeja de entrada.' });
  } catch (e: any) {
    console.error('[RESEND-VERIFICATION] Error:', e);
    return res.status(400).json({ error: e?.message || 'Error al reenviar verificación' });
  }
});

// --- NUEVA RUTA: SOLICITAR RECUPERACIÓN DE CONTRASEÑA ---
const ForgotPasswordSchema = z.object({
  email: z.string().email()
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no revelar si el usuario existe o no
      return res.json({ message: 'Si el correo existe, se enviará un email con instrucciones para recuperar tu contraseña.' });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    // Construir URL del frontend (ajusta según tu configuración)
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetURL = `${frontendURL}/reset-password/${resetToken}`;

    // Enviar email (necesitarás crear esta función en config/mailer.ts)
    const { sendPasswordResetEmail } = await import('../config/mailer');
    await sendPasswordResetEmail(user.email, resetURL);

    return res.json({ message: 'Si el correo existe, se enviará un email con instrucciones para recuperar tu contraseña.' });
  } catch (e: any) {
    console.error('[FORGOT-PASSWORD] Error:', e);
    return res.status(400).json({ error: e?.message || 'Error al procesar solicitud' });
  }
});

// --- NUEVA RUTA: RESETEAR CONTRASEÑA CON TOKEN ---
const ResetPasswordSchema = z.object({
  password: z.string().min(6)
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = ResetPasswordSchema.parse(req.body);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: new Date() } // Token válido y no expirado
    });

    if (!user) {
      return res.status(400).json({ error: 'Token de recuperación inválido o expirado' });
    }

    // Hash de la nueva contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;

    // Limpiar tokens de recuperación
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    return res.json({ message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
  } catch (e: any) {
    console.error('[RESET-PASSWORD] Error:', e);
    return res.status(400).json({ error: e?.message || 'Error al resetear contraseña' });
  }
});

export default router;