"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(req, res, next) {
    const header = req.header('Authorization') || '';
    const token = header.replace(/^Bearer\s+/i, '').trim();
    if (!token)
        return res.status(401).json({ error: 'Falta token' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.id;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
