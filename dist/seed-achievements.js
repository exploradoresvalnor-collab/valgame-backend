"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("./config/db");
const Achievement_1 = require("./models/Achievement");
async function seedAchievements() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('[SEED-ACHIEVEMENTS] Falta MONGODB_URI en el entorno.');
        process.exit(1);
    }
    await (0, db_1.connectDB)(uri);
    console.log('[SEED-ACHIEVEMENTS] Conectado a la BD. Creando logros...');
    try {
        const achievements = [
            {
                nombre: 'Primeros Pasos',
                descripcion: 'Completa tu primer combate',
                categoria: 'combate',
                icono: 'sword',
                color: '#FFD700',
                requisitos: [{
                        tipoRequisito: 'combates',
                        valor: 1,
                        descripcion: 'Gana 1 combate'
                    }],
                recompensas: [{
                        tipo: 'xp',
                        valor: 100,
                        descripcion: '+100 XP'
                    }],
                dificultad: 'facil',
                oculto: false,
                seccion: 'Primeros Pasos',
                activo: true
            },
            {
                nombre: 'Guerrero Novato',
                descripcion: 'Alcanza el nivel 5 con tu personaje',
                categoria: 'hito',
                icono: 'shield',
                color: '#C0C0C0',
                requisitos: [{
                        tipoRequisito: 'nivel',
                        valor: 5,
                        descripcion: 'Alcanza nivel 5'
                    }],
                recompensas: [{
                        tipo: 'xp',
                        valor: 250,
                        descripcion: '+250 XP'
                    }],
                dificultad: 'facil',
                oculto: false,
                seccion: 'Progreso',
                activo: true
            },
            {
                nombre: 'Comerciante',
                descripcion: 'Gasta 1000 monedas en la tienda',
                categoria: 'economia',
                icono: 'coins',
                color: '#FFD700',
                requisitos: [{
                        tipoRequisito: 'dinero',
                        valor: 1000,
                        descripcion: 'Gasta 1000 monedas'
                    }],
                recompensas: [{
                        tipo: 'val',
                        valor: 50,
                        descripcion: '+50 VAL'
                    }],
                dificultad: 'normal',
                oculto: false,
                seccion: 'Economía',
                activo: true
            },
            {
                nombre: 'Explorador',
                descripcion: 'Completa tu primera mazmorra',
                categoria: 'exploracion',
                icono: 'map',
                color: '#8B4513',
                requisitos: [{
                        tipoRequisito: 'custom',
                        valor: 1,
                        descripcion: 'Completa 1 mazmorra'
                    }],
                recompensas: [{
                        tipo: 'xp',
                        valor: 300,
                        descripcion: '+300 XP'
                    }],
                dificultad: 'normal',
                oculto: false,
                seccion: 'Exploración',
                activo: true
            },
            {
                nombre: 'Superviviente',
                descripcion: 'Sobrevive 10 oleadas en modo supervivencia',
                categoria: 'hito',
                icono: 'skull',
                color: '#FF0000',
                requisitos: [{
                        tipoRequisito: 'custom',
                        valor: 10,
                        descripcion: 'Sobrevive 10 oleadas'
                    }],
                recompensas: [{
                        tipo: 'badge',
                        valor: 1,
                        descripcion: 'Insignia de Superviviente'
                    }],
                dificultad: 'dificil',
                oculto: false,
                seccion: 'Supervivencia',
                activo: true
            }
        ];
        for (const achievementData of achievements) {
            const existing = await Achievement_1.Achievement.findOne({ nombre: achievementData.nombre });
            if (!existing) {
                await Achievement_1.Achievement.create(achievementData);
                console.log(`[SEED-ACHIEVEMENTS] Logro creado: ${achievementData.nombre}`);
            }
            else {
                console.log(`[SEED-ACHIEVEMENTS] Logro ya existe: ${achievementData.nombre}`);
            }
        }
        console.log('[SEED-ACHIEVEMENTS] Proceso completado.');
        process.exit(0);
    }
    catch (err) {
        console.error('[SEED-ACHIEVEMENTS] Error:', err);
        process.exit(1);
    }
}
seedAchievements();
