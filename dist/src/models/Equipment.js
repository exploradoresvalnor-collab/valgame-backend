"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equipment = void 0;
const mongoose_1 = require("mongoose");
const Item_1 = require("./Item"); // Importamos el modelo y la interfaz base
// Schema solo con los campos específicos del equipamiento
const EquipmentSchema = new mongoose_1.Schema({
    tipo: {
        type: String,
        enum: ['arma', 'armadura', 'escudo', 'anillo'],
        required: true
    },
    nivel_minimo_requerido: { type: Number, default: 1 },
    stats: {
        atk: { type: Number, default: 0 },
        defensa: { type: Number, default: 0 },
        vida: { type: Number, default: 0 }
    },
    habilidades: [{ type: String }]
});
// Creamos el modelo 'Equipment' como un discriminador del modelo 'Item'
// El primer argumento 'Equipment' será el valor del campo 'tipoItem'
exports.Equipment = Item_1.Item.discriminator('Equipment', EquipmentSchema);
