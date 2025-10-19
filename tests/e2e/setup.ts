import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function setupTestDB() {
    process.env.NODE_ENV = 'test';
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    return mongod;
}

export async function seedTestData() {
    const { Item } = await import('../../src/models/Item');
    const { Consumable } = await import('../../src/models/Consumable');
    const BaseCharacter = (await import('../../src/models/BaseCharacter')).default;
    const Package = (await import('../../src/models/Package')).default;
    const GameSetting = (await import('../../src/models/GameSetting')).default;
    const LevelRequirement = (await import('../../src/models/LevelRequirement')).default;

    // Crear poción inicial usando el discriminador Consumable
    await Consumable.create({
        _id: new ObjectId('68dc525adb5c735854b5659d'),
        nombre: 'Poción de Vida',
        descripcion: 'Restaura HP',
        tipoItem: 'Consumable', // Campo del discriminador
        rango: 'D',
        tipo: 'pocion',
        usos_maximos: 1,
        duracion_efecto_minutos: 0,
        efectos: {
            mejora_atk: 0,
            mejora_defensa: 0,
            mejora_vida: 50,
            mejora_xp_porcentaje: 0
        },
        costo_val: 10,
        fuentes_obtencion: ['tienda', 'mazmorra']
    });

    // Crear personaje base
    await BaseCharacter.create({
        id: 'base_d_001',
        nombre: 'Aventurero Novato',
        descripcion: 'Un aventurero principiante',
        descripcion_rango: 'D',
        stats: {
            atk: 10,
            defensa: 10,
            vida: 100
        },
        progreso: 0,
        etapa: 1,
        nivel: 1,
        multiplicador_base: 1.0,
        imagen: 'aventurero_novato.png'
    });

    // Crear paquete pionero
    await Package.create({
        nombre: 'Paquete Pionero',
        precio_usdt: 0,
        personajes: 1,
        categorias_garantizadas: ['D'],
        distribucion_aleatoria: 'D:100',
        val_reward: 100,
        items_reward: [new ObjectId('68dc525adb5c735854b5659d')]
    });

    // Crear requisitos de nivel para testing (niveles 2-10)
    let expAcumulada = 0;
    for (let nivel = 2; nivel <= 10; nivel++) {
        const expRequerida = nivel * 100; // 200, 300, 400, etc.
        expAcumulada += expRequerida;
        await LevelRequirement.create({
            nivel: nivel,
            experiencia_requerida: expRequerida,
            experiencia_acumulada: expAcumulada
        });
    }

    // Crear configuración del juego con TODOS los campos requeridos
    await GameSetting.create({
        // Campos que faltaban (requeridos)
        nivel_evolucion_etapa_2: 40,
        nivel_evolucion_etapa_3: 100,
        puntos_ranking_por_victoria: 10,
        costo_ticket_en_val: 50,
        
        // Campos que ya estaban
        nivel_maximo_personaje: 100,
        costo_revivir_personaje: 50,
        MAX_PERSONAJES_POR_EQUIPO: 3,
        EXP_GLOBAL_MULTIPLIER: 1,
        PERMADEATH_TIMER_HOURS: 24,
        
        // Configuración de stats por nivel
        aumento_stats_por_nivel: {
            D: { atk: 2, defensa: 2, vida: 10 },
            C: { atk: 3, defensa: 3, vida: 15 },
            B: { atk: 4, defensa: 4, vida: 20 },
            A: { atk: 5, defensa: 5, vida: 25 },
            S: { atk: 6, defensa: 6, vida: 30 }
        }
    });
}

export async function cleanupTestDB(mongod: MongoMemoryServer) {
    await mongoose.disconnect();
    await mongod.stop();
}