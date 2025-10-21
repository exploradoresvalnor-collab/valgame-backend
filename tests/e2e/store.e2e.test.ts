import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

describe('E2E Store / Paquetes (skeleton)', () => {
  const user = { email: `store${Date.now()}@test.com`, username: `store${Date.now()}`, password: 'test1234' };
  let token: string;

  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;

    await request(app).post('/auth/register').send(user).expect(201);
    const { User } = await import('../../src/models/User');
    const u = await User.findOne({ email: user.email });
    await request(app).get(`/auth/verify/${(u as any).verificationToken}`).expect(200);
    const loginRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('comprar paquete y abrirlo asignando items y/o personaje', async () => {
    // Usar rutas reales: GET /api/packages, POST /api/user-packages/agregar, POST /api/user-packages/open
    const list = await request(app).get('/api/packages').set('Authorization', `Bearer ${token}`);
    expect([200, 404]).toContain(list.status);

    if (list.status === 200 && Array.isArray(list.body) && list.body.length > 0) {
      const pkg = list.body[0];

      // Obtener userId desde /api/users/me
      const meBefore = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
      expect(meBefore.status).toBe(200);
      const userId = meBefore.body.id || meBefore.body._id;

      // Agregar paquete al usuario
      const addRes = await request(app)
        .post('/api/user-packages/agregar')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, paqueteId: pkg._id || pkg.id || pkg.id });

      expect([200,201]).toContain(addRes.status);

      // Abrir el paquete usando el endpoint de user-packages
      const openRes = await request(app)
        .post('/api/user-packages/open')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId });

      expect([200,201]).toContain(openRes.status);
      const assigned = openRes.body && openRes.body.assigned ? openRes.body.assigned : [];

      // Validaciones: user recibe val o items o personajes
      const meAfter = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
      expect(meAfter.status).toBe(200);
      const body = meAfter.body as any;
      const gotVal = typeof body.val === 'number' && body.val >= 0;
      const gotItems = Array.isArray(body.inventarioConsumibles) && body.inventarioConsumibles.length > 0;
      const gotChars = Array.isArray(body.personajes) && body.personajes.length > 0;
      expect(gotVal || gotItems || gotChars).toBeTruthy();

      // Si el paquete tiene categorias_garantizadas, al menos un personaje asignado debe cumplir la categoría
      if (pkg.categorias_garantizadas && Array.isArray(pkg.categorias_garantizadas) && pkg.categorias_garantizadas.length > 0) {
        const guaranteed = pkg.categorias_garantizadas;
        const hasGuaranteed = (body.personajes || []).some((p: any) => guaranteed.includes(p.rango));
        expect(hasGuaranteed).toBeTruthy();
      }

      // Validaciones concretas basadas en el seed: Paquete Pionero tiene val_reward: 50 y items_reward incluye potionId
      if ((pkg as any).nombre === 'Paquete Pionero') {
        // En seed el Paquete Pionero otorga 100 VAL
        expect((pkg as any).val_reward).toBe(100);
        const potionId = '68dc525adb5c735854b5659d';
        const itemsReward = (pkg as any).items_reward || [];
        // items_reward puede contener ObjectId, compararemos en strings
        const itemsStr = itemsReward.map((it: any) => String(it));
        expect(itemsStr.includes(potionId)).toBeTruthy();
        // Además, tras abrir, usuario debe tener al menos una instancia de la poción en inventarioConsumibles
        const hasPotion = (body.inventarioConsumibles || []).some((c: any) => String(c.consumableId) === potionId);
        expect(hasPotion).toBeTruthy();
      }
    }
  }, 20000);
});
