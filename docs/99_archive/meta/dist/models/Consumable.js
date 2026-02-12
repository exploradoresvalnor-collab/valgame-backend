"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consumable = void 0;
const mongoose_1 = require("mongoose");
const Item_1 = require("./Item"); // Importamos el modelo y la interfaz base
// Schema solo con los campos específicos del consumible
const ConsumableSchema = new mongoose_1.Schema({
    tipo: {
        type: String,
        enum: ['pocion', 'alimento', 'pergamino', 'fruto_mitico'],
        required: true
    },
    usos_maximos: { type: Number, default: 1 }, // Campo para los usos del consumible
    duracion_efecto_minutos: { type: Number },
    efectos: {
        mejora_atk: { type: Number, default: 0 },
        mejora_defensa: { type: Number, default: 0 },
        mejora_vida: { type: Number, default: 0 },
        mejora_xp_porcentaje: { type: Number, default: 0 }
    }
});
// Creamos el modelo 'Consumable' como un discriminador del modelo 'Item'
// El primer argumento 'Consumable' será el valor del campo 'tipoItem'
exports.Consumable = Item_1.Item.discriminator('Consumable', ConsumableSchema);
