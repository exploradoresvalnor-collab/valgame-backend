"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const LevelRequirement_1 = __importDefault(require("../models/LevelRequirement"));
async function initializeLevelRequirements() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI no está definido en las variables de entorno');
        }
        await mongoose_1.default.connect(uri);
        console.log('Conectado a MongoDB');
        // Eliminar todos los documentos e índices
        const collection = mongoose_1.default.connection.collection('level_requirements');
        await collection.drop().catch(err => {
            if (err.codeName !== 'NamespaceNotFound') {
                throw err;
            }
        });
        // Crear un nuevo índice
        await collection.createIndex({ nivel: 1 }, { unique: true });
        console.log('Colección limpiada y índice recreado');
        // Crear requisitos para niveles 1-100
        const requirements = [];
        let expAcumulada = 0;
        for (let nivel = 1; nivel <= 100; nivel++) {
            let expBase;
            if (nivel <= 20)
                expBase = 100;
            else if (nivel <= 40)
                expBase = 200;
            else if (nivel <= 60)
                expBase = 400;
            else if (nivel <= 80)
                expBase = 800;
            else
                expBase = 1600;
            const expRequerida = expBase * nivel;
            expAcumulada += expRequerida;
            requirements.push({
                nivel,
                experiencia_requerida: expRequerida,
                experiencia_acumulada: expAcumulada
            });
        }
        // Insertar todos los documentos
        await collection.insertMany(requirements);
        console.log(`Se crearon ${requirements.length} requisitos de nivel`);
        // Mostrar algunos ejemplos
        console.log('\nEjemplos de requisitos de nivel:');
        const ejemplos = await LevelRequirement_1.default.find({
            nivel: { $in: [1, 10, 50, 100] }
        }).sort({ nivel: 1 }).lean();
        ejemplos.forEach(ejemplo => {
            console.log(`Nivel ${ejemplo.nivel}:`, ejemplo);
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Desconectado de MongoDB');
    }
}
initializeLevelRequirements();
