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
exports.deliverPioneerPackage = deliverPioneerPackage;
const BaseCharacter_1 = __importDefault(require("../models/BaseCharacter"));
const Consumable_1 = require("../models/Consumable");
async function deliverPioneerPackage(user) {
    // Si ya lo recibió, no hacemos nada (idempotencia)
    if (user.receivedPioneerPackage) {
        console.log('[ONBOARDING] ⚠️ Paquete del Pionero ya entregado anteriormente');
        return { delivered: false, reason: 'already_received' };
    }
    // Buscar cualquier BaseCharacter para el personaje inicial (usualmente el primero)
    const baseChar = await BaseCharacter_1.default.findOne().sort({ _id: 1 }).limit(1);
    if (!baseChar) {
        console.error('[ONBOARDING] ❌ No hay BaseCharacters en la base de datos. Ejecuta: node scripts/seed-base-characters.js --force');
        return { delivered: false, reason: 'base_character_missing' };
    }
    console.log(`[ONBOARDING] ✅ Personaje base seleccionado: ${baseChar.nombre}`);
    // Crear personaje para el usuario
    const pioneerCharacter = {
        personajeId: baseChar.id,
        rango: 'D',
        nivel: 1,
        etapa: 1,
        progreso: 0,
        stats: baseChar.stats,
        saludActual: baseChar.stats.vida,
        saludMaxima: baseChar.stats.vida,
        estado: 'saludable',
        fechaHerido: null,
        equipamiento: [],
        activeBuffs: []
    };
    user.personajes.push(pioneerCharacter);
    console.log(`[ONBOARDING] ✅ Personaje agregado: ${baseChar.nombre} (Rango D, Nivel 1)`);
    // === RECURSOS INICIALES ===
    // 1. VAL (moneda principal)
    const valInicial = 100;
    user.val = (user.val || 0) + valInicial;
    console.log(`[ONBOARDING] 💰 VAL otorgado: ${valInicial}`);
    // 2. Boletos (para abrir paquetes y conseguir personajes)
    const boletosIniciales = 10;
    user.boletos = (user.boletos || 0) + boletosIniciales;
    console.log(`[ONBOARDING] 🎫 Boletos otorgados: ${boletosIniciales}`);
    // 2.5. Energía (para actividades como mazmorras)
    const energiaInicial = 100;
    user.energia = energiaInicial;
    user.energiaMaxima = 100;
    console.log(`[ONBOARDING] ⚡ Energía inicial: ${energiaInicial}/${user.energiaMaxima}`);
    // 3. EVO (para evolucionar personajes)
    const evoInicial = 2;
    user.evo = (user.evo || 0) + evoInicial;
    console.log(`[ONBOARDING] ⚡ EVO otorgado: ${evoInicial}`);
    // 5. Pociones (buscar cualquier consumible tipo poción)
    try {
        const potion = await Consumable_1.Consumable.findOne({ tipo: 'pocion' }).sort({ _id: 1 }).limit(1);
        if (potion) {
            for (let i = 0; i < 3; i++) {
                user.inventarioConsumibles.push({
                    consumableId: potion._id,
                    usos_restantes: potion.usos_maximos || 1
                });
            }
            console.log(`[ONBOARDING] 🧪 Pociones otorgadas: 3x ${potion.nombre}`);
        }
        else {
            console.warn('[ONBOARDING] ⚠️ No hay pociones en la BD, omitiendo...');
        }
    }
    catch (err) {
        console.warn('[ONBOARDING] ⚠️ No fue posible asignar consumibles iniciales');
    }
    // 6. Equipamiento inicial (buscar el equipamiento más básico)
    try {
        const { Equipment } = await Promise.resolve().then(() => __importStar(require('../models/Equipment')));
        const basicWeapon = await Equipment.findOne({
            tipo: 'arma'
        }).sort({ 'stats.ataque': 1 }).limit(1); // El arma más débil
        if (basicWeapon) {
            user.inventarioEquipamiento = user.inventarioEquipamiento || [];
            user.inventarioEquipamiento.push(basicWeapon._id);
            console.log(`[ONBOARDING] ⚔️ Equipamiento otorgado: ${basicWeapon.nombre}`);
        }
        else {
            console.warn('[ONBOARDING] ⚠️ No hay equipamiento en la BD, omitiendo...');
        }
    }
    catch (err) {
        console.warn('[ONBOARDING] ⚠️ No fue posible asignar equipamiento inicial');
    }
    // Marcar como recibido y guardar
    user.receivedPioneerPackage = true;
    await user.save();
    console.log('[ONBOARDING] 🎉 Paquete del Pionero entregado exitosamente');
    return {
        delivered: true,
        rewards: {
            personaje: baseChar.nombre,
            val: valInicial,
            boletos: boletosIniciales,
            evo: evoInicial,
            pociones: 3,
            equipamiento: 1
        }
    };
}
exports.default = { deliverPioneerPackage };
