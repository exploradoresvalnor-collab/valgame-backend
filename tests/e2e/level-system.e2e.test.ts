import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';
import { LevelHistory } from '../../src/models/LevelHistory';
import { User } from '../../src/models/User';
import jwt from 'jsonwebtoken';

let mongod: MongoMemoryServer;
let token: string;
let userId: string;
let characterId: string;

beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
});

afterAll(async () => {
    await cleanupTestDB(mongod);
});

describe('Sistema de Niveles', () => {
    beforeEach(async () => {
        // Limpiar TODAS las colecciones antes de cada test
        await User.deleteMany({});
        await LevelHistory.deleteMany({});
        
        // Limpiar también las colecciones que se crean en seedTestData
        const { Item } = await import('../../src/models/Item');
        const { Consumable } = await import('../../src/models/Consumable');
        const BaseCharacter = (await import('../../src/models/BaseCharacter')).default;
        const Package = (await import('../../src/models/Package')).default;
        const GameSetting = (await import('../../src/models/GameSetting')).default;
        const LevelRequirement = (await import('../../src/models/LevelRequirement')).default;
        
        await Item.deleteMany({});
        await Consumable.deleteMany({});
        await BaseCharacter.deleteMany({});
        await Package.deleteMany({});
        await GameSetting.deleteMany({});
        await LevelRequirement.deleteMany({});
        
        // Ahora sembrar los datos de prueba
        await seedTestData();

        // Crear un usuario de prueba y su personaje inicial
        const userResponse = await request(app)
            .post('/auth/register')
            .send({
                email: 'test@test.com',
                password: 'Test1234!',
                username: 'testUser'
            });

        // Verificar que el registro fue exitoso
        if (userResponse.status !== 201) {
            console.error('Error en registro:', userResponse.body);
            throw new Error(`Registro falló: ${JSON.stringify(userResponse.body)}`);
        }

        // Buscar el usuario recién creado y verificarlo manualmente (bypass para testing)
        let user = await User.findOne({ email: 'test@test.com' });
        if (!user) {
            throw new Error('Usuario no encontrado después del registro');
        }

        // Verificar el usuario y entregar el paquete del pionero manualmente
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        
        // Entregar el Paquete del Pionero manualmente para testing
        const { deliverPioneerPackage } = await import('../../src/services/onboarding.service');
        await deliverPioneerPackage(user as any);
        
        await user.save();
        userId = (user._id as mongoose.Types.ObjectId).toString();

        // Ahora hacer login para obtener el token
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@test.com',
                password: 'Test1234!'
            });

        if (loginResponse.status !== 200 || !loginResponse.body.token) {
            console.error('Error en login:', loginResponse.body);
            throw new Error(`Login falló: ${JSON.stringify(loginResponse.body)}`);
        }

        token = loginResponse.body.token;

        // Obtener y actualizar el usuario con todas las propiedades necesarias
        user = await User.findById(userId);
        if (user && user.personajes.length > 0) {
            const personaje = user.personajes[0];
            personaje.rango = 'D';
            personaje.nivel = 1;
            personaje.etapa = 1;
            personaje.progreso = 0;
            personaje.experiencia = 0;
            personaje.stats = {
                atk: 10,
                defensa: 10,
                vida: 100
            };
            personaje.saludActual = 100;
            personaje.saludMaxima = 100;
            await user.save();
            characterId = personaje.personajeId;
        } else {
            throw new Error('No se pudo crear el personaje inicial');
        }
    });

    it('debería registrar el historial cuando un personaje sube de nivel', async () => {
        // Simular una subida de nivel (200 EXP para nivel 2 según LevelRequirement)
        const response = await request(app)
            .post(`/api/characters/${characterId}/add-experience`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 200 }); // 200 EXP es suficiente para subir al nivel 2

        expect(response.status).toBe(200);

        // Verificar que se creó el registro en level_histories
        const historyEntries = await LevelHistory.find({ userId, personajeId: characterId });
        
        expect(historyEntries).toHaveLength(1);
        expect(historyEntries[0]).toMatchObject({
            userId: expect.any(mongoose.Types.ObjectId),
            personajeId: characterId,
            nivel: 2,
            experienciaTotal: expect.any(Number),
            experienciaAnterior: expect.any(Number),
            experienciaNueva: expect.any(Number),
            statsAnteriores: {
                atk: expect.any(Number),
                defensa: expect.any(Number),
                vida: expect.any(Number)
            },
            statsNuevos: {
                atk: expect.any(Number),
                defensa: expect.any(Number),
                vida: expect.any(Number)
            },
            fecha: expect.any(Date)
        });

        // Verificar que el personaje actualizó su nivel
        const updatedUser = await User.findById(userId);
        const character = updatedUser?.personajes.find(p => p.personajeId === characterId);
        expect(character?.nivel).toBe(2);
    });

    it('debería mantener un historial completo de subidas de nivel', async () => {
        // Simular múltiples subidas de nivel
        for (let i = 0; i < 3; i++) {
            const response = await request(app)
                .post(`/api/characters/${characterId}/add-experience`)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 150 }); // Asumiendo que cada 150 EXP sube un nivel

            expect(response.status).toBe(200);
        }

        // Verificar el historial completo
        const historyEntries = await LevelHistory.find({ 
            userId,
            personajeId: characterId 
        }).sort({ fecha: 1 });

        expect(historyEntries).toHaveLength(3);
        expect(historyEntries.map(entry => entry.nivel)).toEqual([2, 3, 4]);
    });
});