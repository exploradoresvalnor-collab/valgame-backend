"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
// Forzar DNS de Google para resolver registros SRV de MongoDB Atlas
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
async function connectDB(uri = process.env.MONGODB_URI || '') {
    // Si ya estamos conectados o conectando, no hacer nada.
    if (mongoose_1.default.connection.readyState >= 1) {
        return;
    }
    if (!uri)
        throw new Error('Falta MONGODB_URI en el entorno');
    mongoose_1.default.set('strictQuery', true);
    await mongoose_1.default.connect(uri);
    console.log('[DB] Conectado a MongoDB');
}
async function disconnectDB() {
    // Si no estamos conectados, no hacer nada.
    if (mongoose_1.default.connection.readyState === 0) {
        return;
    }
    await mongoose_1.default.disconnect();
    console.log('[DB] Desconectado de MongoDB');
}
