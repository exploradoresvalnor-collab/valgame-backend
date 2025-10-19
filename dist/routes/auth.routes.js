"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto")); // Módulo nativo para generar tokens seguros
const mailer_1 = require("../config/mailer"); // Importamos nuestra nueva función
const router = (0, express_1.Router)();
const RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(6)
});
// --- RUTA DE REGISTRO (MODIFICADA) ---
router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = RegisterSchema.parse(req.body);
        const exists = await User_1.User.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            // Si el usuario existe pero no está verificado, podríamos reenviar el correo
            if (!exists.isVerified) {
                // Aquí podrías añadir lógica para reenviar el correo si lo deseas
            }
            return res.status(409).json({ error: 'Email o username ya existe' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Creamos una instancia del usuario para añadirle los tokens
        const user = new User_1.User({ email, username, passwordHash });
        // Nota: la entrega del Paquete del Pionero se realizará al verificar el correo
        // Generamos el token de verificación
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hora de validez
        await user.save(); // Guardamos el usuario con el token
        // Enviamos el correo de verificación
        await (0, mailer_1.sendVerificationEmail)(user.email, verificationToken);
        return res.status(201).json({
            message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.'
        });
    }
    catch (e) {
        return res.status(400).json({ error: e?.message || 'Bad Request' });
    }
});
// --- NUEVA RUTA DE VERIFICACIÓN ---
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User_1.User.findOne({
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
            const { deliverPioneerPackage } = await Promise.resolve().then(() => __importStar(require('../services/onboarding.service')));
            const result = await deliverPioneerPackage(user);
            return res.json({ message: 'Cuenta verificada con éxito', package: result });
        }
        catch (err) {
            console.error('[VERIFY] Error al entregar paquete:', err);
            return res.status(500).json({ error: 'Cuenta verificada pero fallo al entregar paquete' });
        }
    }
    catch (error) {
        return res.status(500).send('<h1>Error interno del servidor.</h1>');
    }
});
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
// --- RUTA DE LOGIN (MODIFICADA) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = LoginSchema.parse(req.body);
        const user = await User_1.User.findOne({ email });
        if (!user)
            return res.status(401).json({ error: 'Credenciales inválidas' });
        // AÑADIMOS LA COMPROBACIÓN
        if (!user.isVerified) {
            return res.status(403).json({ error: 'Debes verificar tu cuenta antes de iniciar sesión.' });
        }
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(401).json({ error: 'Credenciales inválidas' });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        return res.json({ token, user });
    }
    catch (e) {
        return res.status(400).json({ error: e?.message || 'Bad Request' });
    }
});
exports.default = router;
