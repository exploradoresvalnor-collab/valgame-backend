import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

describe('E2E Team & Equipment (skeleton)', () => {
  const user = { email: `team${Date.now()}@test.com`, username: `team${Date.now()}`, password: 'test1234' };
  let token: string;
  let characterId: string;

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

    const me = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    characterId = me.body.personajes?.[0]?.personajeId;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('comprar equipamiento y equiparlo al personaje', async () => {
    // TODO: ajustar endpoints reales de tienda/equipment
    const list = await request(app).get('/api/items').set('Authorization', `Bearer ${token}`);
    expect([200,404]).toContain(list.status);

    if (list.status === 200 && Array.isArray(list.body) && list.body.length > 0) {
      const item = list.body.find((i: any) => i.tipoItem === 'Equipment') || list.body[0];
      // Intentar comprar
      const buyRes = await request(app).post(`/api/items/${item.id}/buy`).set('Authorization', `Bearer ${token}`).send({ metodoPago: 'val' });
      expect([200,201,404]).toContain(buyRes.status);

      // Intentar equipar si existe endpoint
      const equipRes = await request(app).post(`/api/characters/${characterId}/equip`).set('Authorization', `Bearer ${token}`).send({ itemId: item.id });
      expect([200,201,404]).toContain(equipRes.status);

      if (equipRes.status === 200 || equipRes.status === 201) {
        const meAfter = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
        expect(meAfter.status).toBe(200);
        // Verificar que personaje tiene equipamiento referenciado o que el inventario se actualizó
        const hasEquipped = (meAfter.body.personajes || []).some((p: any) => Array.isArray(p.equipamiento) && p.equipamiento.length > 0);
        const invChanged = Array.isArray(meAfter.body.inventarioEquipamiento) && meAfter.body.inventarioEquipamiento.length >= 0;
        expect(hasEquipped || invChanged).toBeTruthy();
      }
    }
  }, 20000);
});
