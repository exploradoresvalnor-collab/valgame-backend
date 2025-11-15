"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const TokenBlacklist_1 = require("../models/TokenBlacklist");
const security_1 = require("../config/security");
const verifyToken = async (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, (0, security_1.getJWTSecret)());
        return decoded;
    }
    catch (error) {
        throw new Error('Token inválido');
    }
};
exports.verifyToken = verifyToken;
async function auth(req, res, next) {
    const header = req.header('Authorization') || '';
    let token = header.replace(/^Bearer\s+/i, '').trim();
    // 🔐 SEGURIDAD: Intentar obtener token de httpOnly cookie si no está en header
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token)
        return res.status(401).json({ error: 'Falta token' });
    try {
        // Verificar si el token está en la blacklist
        const blacklisted = await TokenBlacklist_1.TokenBlacklist.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({ error: 'Token inválido o sesión cerrada' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, (0, security_1.getJWTSecret)());
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        // Compatibilidad: algunos controladores esperan `req.userId`, otros `req.user`
        req.user = user;
        req.userId = user._id.toString();
        next();
    }
    catch (error) {
        console.error('Error en el middleware de autenticación:', error);
        return res.status(401).json({ error: 'Token inválido' });
    }
}
