"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config"); // Carga las variables de entorno del .env
const db_1 = require("../config/db");
const Item_1 = require("../models/Item");
const Equipment_1 = require("../models/Equipment");
const Consumable_1 = require("../models/Consumable");
// --- DATOS ANTIGUOS --- 
const oldEquipmentData = [
    {
        "_id": new mongoose_1.default.Types.ObjectId("68dc50e9db5c735854b56591"),
        "nombre": "Espada Corta Oxidada",
        "tipo": "arma",
        "rango": "D",
        "nivel_minimo_requerido": 1,
        "habilidades": [],
        "stats": {
            "mejora_atk": { "min": 1, "max": 10 },
            "mejora_vida": { "min": 5, "max": 10 },
            "mejora_defensa": { "min": 1, "max": 10 }
        }
    },
    {
        "_id": new mongoose_1.default.Types.ObjectId("68dc510bdb5c735854b56593"),
        "nombre": "Coraza de Cuero Rígido",
        "tipo": "armadura",
        "rango": "C",
        "nivel_minimo_requerido": 5,
        "habilidades": [],
        "stats": {
            "mejora_atk": { "min": 5, "max": 20 },
            "mejora_vida": { "min": 10, "max": 20 },
            "mejora_defensa": { "min": 5, "max": 20 }
        }
    },
    {
        "_id": new mongoose_1.default.Types.ObjectId("68dc515bdb5c735854b56595"),
        "nombre": "Hacha de Batalla Equilibrada",
        "tipo": "arma",
        "rango": "B",
        "nivel_minimo_requerido": 10,
        "habilidades": ["Golpe Ligero"],
        "stats": {
            "mejora_atk": { "min": 10, "max": 30 },
            "mejora_vida": { "min": 15, "max": 30 },
            "mejora_defensa": { "min": 10, "max": 30 }
        }
    },
    {
        "_id": new mongoose_1.default.Types.ObjectId("68dc51aedb5c735854b56597"),
        "nombre": "Anillo de Vitalidad",
        "tipo": "anillo",
        "rango": "A",
        "nivel_minimo_requerido": 15,
        "habilidades": ["Regeneración Menor"],
        "stats": {
            "mejora_atk": { "min": 15, "max": 40 },
            "mejora_vida": { "min": 20, "max": 40 },
            "mejora_defensa": { "min": 15, "max": 40 }
        }
    },
    {
        "_id": new mongoose_1.default.Types.ObjectId("68dc51d2db5c735854b56599"),
        "nombre": "Filo del Dragón",
        "tipo": "arma",
        "rango": "S",
        "nivel_minimo_requerido": 20,
        "habilidades": ["Aliento de Fuego", "Corte Profundo"],
        "stats": {
            "mejora_atk": { "min": 20, "max": 50 },
            "mejora_vida": { "min": 50, "max": 100 },
            "mejora_defensa": { "min": 20, "max": 50 }
        }
    }
];
const oldConsumablesData = [
    {
        "_id": new mongoose_1.default.Types.ObjectId("68dc525adb5c735854b5659d"),
        "nombre": "Poción de Salud Menor",
        "tipo": "pocion",
        "rango": "D",
        "duracion_efecto_minutos": 15,
        "efectos": {
            "mejora_atk": { "min": 1, "max": 10 },
            "mejora_vida": { "min": 5, "max": 10 },
            "mejora_defensa": { "min": 1, "max": 10 },
            "mejora_xp": 2
        }
    },
    {
        "_id": new mongoose_1.default.Types.ObjectId("68dc5277db5c735854b5659f"),
        "nombre": "Estofado Vigorizante",
        "tipo": "alimento",
        "rango": "C",
        "duracion_efecto_minutos": 30,
        "efectos": {
            "mejora_atk": { "min": 5, "max": 20 },
            "mejora_vida": { "min": 10, "max": 20 },
            "mejora_defensa": { "min": 5, "max": 20 },
            "mejora_xp": 3
        }
    },
    {
        "_id": new mongoose_1.default.Types.ObjectId("68dc528bdb5c735854b565a1"),
        "nombre": "Pergamino de Barrera",
        "tipo": "pergamino",
        "rango": "B",
        "duracion_efecto_minutos": 60,
        "efectos": {
            "mejora_atk": { "min": 10, "max": 30 },
            "mejora_vida": { "min": 15, "max": 30 },
            "mejora_defensa": { "min": 10, "max": 30 },
            "mejora_xp": 5
        }
    }
];
// --- NUEVOS ITEMS LEGENDARIOS --- 
const newSuperConsumablesData = [
    {
        nombre: "Esencia de Dragón Ancestral",
        rango: 'SSS',
        descripcion: "El poder de un dragón concentrado. Otorga una fuerza y resistencia colosales.",
        tipo: 'pocion',
        duracion_efecto_minutos: 30,
        efectos: {
            mejora_atk: 150,
            mejora_defensa: 100
        }
    },
    {
        nombre: "Fruto Dorado de Yggdrasil",
        rango: 'SSS',
        descripcion: "Un fruto del árbol del mundo que acelera el aprendizaje a niveles divinos.",
        tipo: 'fruto_mitico',
        duracion_efecto_minutos: 120, // 2 horas
        efectos: {
            mejora_xp_porcentaje: 50
        }
    }
];
const runMigration = async () => {
    // Validar que la MONGODB_URI está presente
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error('Error: La variable de entorno MONGODB_URI no está definida. Asegúrate de que tu archivo .env está correcto.');
        process.exit(1);
    }
    try {
        await (0, db_1.connectDB)(MONGODB_URI);
        console.log('--- Limpiando la colección `items` existente... ---');
        await Item_1.Item.deleteMany({});
        console.log('Colección `items` limpiada.');
        // --- Migrar Equipamiento ---
        console.log('--- Migrando datos de equipamiento antiguos... ---');
        for (const old of oldEquipmentData) {
            const newEquip = {
                _id: old._id,
                tipoItem: 'Equipment',
                nombre: old.nombre,
                descripcion: `Equipamiento de rango ${old.rango}.`,
                rango: old.rango,
                tipo: old.tipo,
                nivel_minimo_requerido: old.nivel_minimo_requerido,
                habilidades: old.habilidades,
                stats: {
                    atk: Math.round((old.stats.mejora_atk.min + old.stats.mejora_atk.max) / 2),
                    defensa: Math.round((old.stats.mejora_defensa.min + old.stats.mejora_defensa.max) / 2),
                    vida: Math.round((old.stats.mejora_vida.min + old.stats.mejora_vida.max) / 2),
                }
            };
            await Equipment_1.Equipment.create(newEquip);
        }
        console.log(`${oldEquipmentData.length} equipos migrados correctamente.`);
        // --- Migrar Consumibles ---
        console.log('--- Migrando datos de consumibles antiguos... ---');
        for (const old of oldConsumablesData) {
            const newConsume = {
                _id: old._id,
                tipoItem: 'Consumable',
                nombre: old.nombre,
                descripcion: `Consumible de rango ${old.rango}.`,
                rango: old.rango,
                tipo: old.tipo,
                duracion_efecto_minutos: old.duracion_efecto_minutos,
                efectos: {
                    mejora_atk: Math.round((old.efectos.mejora_atk.min + old.efectos.mejora_atk.max) / 2),
                    mejora_defensa: Math.round((old.efectos.mejora_defensa.min + old.efectos.mejora_defensa.max) / 2),
                    mejora_vida: Math.round((old.efectos.mejora_vida.min + old.efectos.mejora_vida.max) / 2),
                    mejora_xp_porcentaje: old.efectos.mejora_xp || 0
                }
            };
            await Consumable_1.Consumable.create(newConsume);
        }
        console.log(`${oldConsumablesData.length} consumibles migrados correctamente.`);
        // --- Crear Nuevos Super Consumibles ---
        console.log('--- Creando nuevos consumibles legendarios... ---');
        for (const superItem of newSuperConsumablesData) {
            await Consumable_1.Consumable.create({ ...superItem, tipoItem: 'Consumable' });
        }
        console.log(`${newSuperConsumablesData.length} consumibles legendarios creados.`);
        console.log('\n¡Migración y seeding completados con éxito!');
    }
    catch (error) {
        console.error('Error durante la migración:', error);
    }
    finally {
        // Usar la desconexión estándar de mongoose
        await mongoose_1.default.disconnect();
        console.log('[DB] Desconectado de MongoDB');
    }
};
runMigration();
