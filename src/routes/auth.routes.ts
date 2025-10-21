import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Módulo nativo para generar tokens seguros
import { sendVerificationEmail } from '../config/mailer'; // Importamos nuestra nueva función
import BaseCharacter from '../models/BaseCharacter';
import { Consumable } from '../models/Consumable';
import { Types } from 'mongoose';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6)
});

// --- RUTA DE REGISTRO (MODIFICADA) ---
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = RegisterSchema.parse(req.body);

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

    // Enviamos el correo de verificación
    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json({ 
      message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.' 
    });

  } catch (e: any) {
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
            return res.status(400).send('<h1>Token de verificación inválido o expirado.</h1>');
        }

        // Verificamos al usuario y limpiamos los campos del token
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        // Entregar el Paquete del Pionero (idempotente)
        try {
          const { deliverPioneerPackage } = await import('../services/onboarding.service');
          const result = await deliverPioneerPackage(user as any);
          return res.json({ message: 'Cuenta verificada con éxito', package: result });
        } catch (err: any) {
          console.error('[VERIFY] Error al entregar paquete:', err);
          return res.status(500).json({ error: 'Cuenta verificada pero fallo al entregar paquete' });
        }

    } catch (error) {
        return res.status(500).send('<h1>Error interno del servidor.</h1>');
    }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// --- RUTA DE LOGIN (MODIFICADA) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    // AÑADIMOS LA COMPROBACIÓN
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Debes verificar tu cuenta antes de iniciar sesión.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return res.json({ token, user });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Bad Request' });
  }
});

export default router;