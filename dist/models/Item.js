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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Opciones para el schema base, clave para los discriminadores
const baseOptions = {
    discriminatorKey: 'tipoItem', // Campo que define el tipo de item
    collection: 'items', // Todos los items vivirán en esta colección
    versionKey: false,
    timestamps: true
};
// --- SCHEMA BASE DEL ITEM ---
// Define la estructura común
const ItemSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true, index: true },
    descripcion: { type: String, required: true },
    imagen: { type: String }, // URL de la imagen (opcional para compatibilidad)
    rango: { type: String, enum: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], required: true },
    tasa_cambio_usdt: { type: Number },
    costo_val: { type: Number },
    fuentes_obtencion: [{ type: String }],
    detalle_uso: { type: String },
    limites: { type: String },
    requisito_evolucion: { type: String }
}, baseOptions);
// --- EXPORTACIÓN DEL MODELO BASE ---
// A partir de este modelo se crearán los demás tipos de items
exports.Item = mongoose_1.default.model('Item', ItemSchema);
