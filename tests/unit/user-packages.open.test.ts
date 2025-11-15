import request from 'supertest';
import app from '../../src/app';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { MongoMemoryReplSet } = require('mongodb-memory-server');

import { User } from '../../src/models/User';
import PackageModel from '../../src/models/Package';
import UserPackage from '../../src/models/UserPackage';
import Category from '../../src/models/Category';
import BaseCharacter from '../../src/models/BaseCharacter';
import PurchaseLog from '../../src/models/PurchaseLog';

describe('POST /api/user-packages/:id/open', () => {
  let mongoServer: any;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    // Crear un replSet en memoria para permitir transacciones en los tests
    mongoServer = await MongoMemoryReplSet.create({ replSet: { name: 'rs0', count: 1 } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true } as any);
  }, 20000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer && typeof mongoServer.stop === 'function') {
      await mongoServer.stop();
    }
  });

  afterEach(async () => {
    await User.deleteMany({}).exec();
    await PackageModel.deleteMany({}).exec();
    await UserPackage.deleteMany({}).exec();
    await Category.deleteMany({}).exec();
    await BaseCharacter.deleteMany({}).exec();
    await PurchaseLog.deleteMany({}).exec();
  });

  it('opens a user package and grants rewards', async () => {
    // Crear category y baseCharacter para la asignación de personajes
    const cat = await Category.create({ nombre: 'D', probabilidad: 1, descripcion: 'Categoria D', multiplicador_minado: 1 });
    const base = await BaseCharacter.create({
      id: 'base_1',
      nombre: 'Base1',
      imagen: '/images/base1.png',
      descripcion_rango: 'Personaje comun',
      multiplicador_base: 1,
      nivel: 1,
      etapa: 1,
      val_por_nivel_por_etapa: [0],
      stats: { atk: 5, vida: 100, defensa: 2 },
      progreso: 0,
      evoluciones: []
    } as any);

    // Crear paquete con rewards (campos requeridos según el schema)
    const pkg = await PackageModel.create({
      nombre: 'Paquete Test',
      tipo: 'starter',
      precio_usdt: 0,
      precio_val: 0,
      personajes: 1,
      categorias_garantizadas: ['D'],
      distribucion_aleatoria: 'uniform',
      val_reward: 5,
      items_reward: []
    } as any);

    // Crear usuario
    const password = 'Password1!';
    const passwordHash = await bcrypt.hash(password, 8);
    const user = await User.create({ email: 'a@b.com', username: 'tester', passwordHash, isVerified: true } as any);

    // Crear UserPackage
    const up = await UserPackage.create({ userId: (user._id as any).toString(), paqueteId: (pkg._id as any).toString() } as any);

    // Login para obtener token (en test app devuelve token en body)
    const loginRes = await request(app).post('/auth/login').send({ email: 'a@b.com', password });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    // Llamar al endpoint de abrir paquete
    const res = await request(app)
      .post(`/api/user-packages/${(up._id as any).toString()}/open`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.ok).toBeTruthy();
    expect(Array.isArray(res.body.assigned)).toBeTruthy();

    // Verificar que el UserPackage fue eliminado
    const still = await UserPackage.findById((up._id as any)).exec();
    expect(still).toBeNull();

    // Verificar que PurchaseLog tiene la acción 'open'
    const log = await PurchaseLog.findOne({ action: 'open', userId: (user._id as any) }).exec();
    expect(log).toBeDefined();
  }, 20000);
});
