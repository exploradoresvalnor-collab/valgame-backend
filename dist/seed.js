"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("./config/db");
const mongoose_1 = require("mongoose");
const BaseCharacter_1 = __importDefault(require("./models/BaseCharacter"));
const Consumable_1 = require("./models/Consumable");
const Package_1 = __importDefault(require("./models/Package"));
const Equipment_1 = require("./models/Equipment");
async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('[SEED] Falta MONGODB_URI en el entorno.');
        process.exit(1);
    }
    await (0, db_1.connectDB)(uri);
    console.log('[SEED] Conectado a la BD. Iniciando seed...');
    try {
        // Consumible inicial (ID hardcodeado usado por el register)
        const potionId = new mongoose_1.Types.ObjectId('68dc525adb5c735854b5659d');
        let potion = await Consumable_1.Consumable.findById(potionId);
        if (!potion) {
            potion = await Consumable_1.Consumable.create({
                _id: potionId,
                nombre: 'Poción de Vida',
                descripcion: 'Cura y otorga un pequeño buff temporal',
                rango: 'D',
                tipo: 'pocion',
                usos_maximos: 3,
                duracion_efecto_minutos: 30,
                efectos: {
                    mejora_vida: 50,
                    mejora_atk: 0,
                    mejora_defensa: 0,
                    mejora_xp_porcentaje: 0
                }
            });
            console.log('[SEED] Consumible inicial creado:', String(potion._id));
        }
        else {
            console.log('[SEED] Consumible inicial ya existe:', String(potion._id));
        }
        // BaseCharacter rango D
        let baseD = await BaseCharacter_1.default.findOne({ descripcion_rango: 'D' });
        if (!baseD) {
            baseD = await BaseCharacter_1.default.create({
                id: 'base_d_001',
                nombre: 'Explorador Novato',
                imagen: 'default_base_d.png', // valor por defecto válido para evitar validación
                descripcion_rango: 'D',
                multiplicador_base: 1,
                nivel: 1,
                etapa: 1,
                val_por_nivel_por_etapa: [1],
                stats: { atk: 5, vida: 100, defensa: 2 },
                progreso: 0,
                ultimoMinado: null,
                evoluciones: []
            });
            console.log('[SEED] BaseCharacter rango D creado:', baseD.id || String(baseD._id));
        }
        else {
            console.log('[SEED] BaseCharacter rango D ya existe:', baseD.id || String(baseD._id));
        }
        // Paquete básico (opcional) - crear si no existe
        const pkgName = 'Paquete Pionero';
        let pkg = await Package_1.default.findOne({ nombre: pkgName });
        if (!pkg) {
            pkg = await Package_1.default.create({
                nombre: pkgName,
                precio_usdt: 0,
                personajes: 1,
                categorias_garantizadas: ['D'],
                distribucion_aleatoria: 'simple',
                val_reward: 50,
                items_reward: [new mongoose_1.Types.ObjectId('68dc50e9db5c735854b56591')]
            });
            console.log('[SEED] Package creado:', String(pkg._id));
        }
        else {
            console.log('[SEED] Package ya existe:', String(pkg._id));
        }
        // Equipment (Espada Corta Oxidada) - crear si no existe (ID provisto por el usuario)
        try {
            const equipmentId = new mongoose_1.Types.ObjectId('68dc50e9db5c735854b56591');
            let equipment = await Equipment_1.Equipment.findById(equipmentId);
            if (!equipment) {
                equipment = await Equipment_1.Equipment.create({
                    _id: equipmentId,
                    nombre: 'Espada Corta Oxidada',
                    descripcion: 'Equipamiento de rango D.',
                    rango: 'D',
                    tipo: 'arma',
                    nivel_minimo_requerido: 1,
                    stats: { atk: 6, defensa: 6, vida: 8 },
                    fuentes_obtencion: []
                });
                console.log('[SEED] Equipment creado:', String(equipment._id));
            }
            else {
                console.log('[SEED] Equipment ya existe:', String(equipment._id));
            }
        }
        catch (err) {
            console.warn('[SEED] No fue posible crear/verificar el Equipment inicial:', err);
        }
        console.log('[SEED] Seed completado con éxito.');
        process.exit(0);
    }
    catch (err) {
        console.error('[SEED] Error durante el seed:', err);
        process.exit(1);
    }
}
seed();
