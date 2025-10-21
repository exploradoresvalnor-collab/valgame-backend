import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

describe('E2E Marketplace full flow', () => {
  const seller = { email: `sell${Date.now()}@test.com`, username: `sell${Date.now()}`, password: 'test1234' };
  const buyer = { email: `buy${Date.now()}@test.com`, username: `buy${Date.now()}`, password: 'test1234' };
  let sellerToken: string;
  let buyerToken: string;
  let itemId: string;
  let listingId: string;
  const price = 10;

  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;

    // Registrar y verificar seller
    await request(app).post('/auth/register').send(seller).expect(201);
    const { User } = await import('../../src/models/User');
    const sellerDoc = await User.findOne({ email: seller.email });
    await request(app).get(`/auth/verify/${(sellerDoc as any).verificationToken}`).expect(200);
  const sellerLoginRes = await request(app).post('/auth/login').send({ email: seller.email, password: seller.password });
  expect(sellerLoginRes.status).toBe(200);
  sellerToken = sellerLoginRes.body.token;
  expect(sellerToken).toBeDefined();

    // Registrar y verificar buyer
    await request(app).post('/auth/register').send(buyer).expect(201);
    const buyerDoc = await User.findOne({ email: buyer.email });
    await request(app).get(`/auth/verify/${(buyerDoc as any).verificationToken}`).expect(200);
  const buyerLoginRes = await request(app).post('/auth/login').send({ email: buyer.email, password: buyer.password });
  expect(buyerLoginRes.status).toBe(200);
  buyerToken = buyerLoginRes.body.token;
  expect(buyerToken).toBeDefined();

    // Obtener item del seller (paquete pionero asignado)
    const me = await request(app).get('/api/users/me').set('Authorization', `Bearer ${sellerToken}`);
    itemId = me.body.inventarioConsumibles[0].consumableId;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('publicar listing y verificar desaparición del item del vendedor', async () => {
    const res = await request(app)
      .post('/api/marketplace/listings')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ itemId, precio: price });

    expect(res.status).toBe(201);
    listingId = res.body.listing.id;

    // verificar vendedor ya no tiene el item
    const { User } = await import('../../src/models/User');
    const sellerPost = await User.findOne({ email: seller.email });
    expect(sellerPost!.inventarioConsumibles.some((c: any) => c.consumableId.toString() === itemId)).toBe(false);
  });

  it('buscar y comprar listing por buyer', async () => {
    const search = await request(app)
      .get('/api/marketplace/listings')
      .set('Authorization', `Bearer ${buyerToken}`)
      .query({ type: 'consumible' });

    expect(search.status).toBe(200);
    expect(search.body.listings.length).toBeGreaterThan(0);

    // Comprobar que el listing aparezca en los resultados de búsqueda
    const found = (search.body.listings || []).some((l: any) => {
      return l._id === listingId || l.id === listingId || l.itemId === itemId;
    });
    expect(found).toBe(true);

    // Comprobar saldos antes de la compra (ambos usuarios recibieron 50 VAL en el paquete pionero)
    const UserModel = (await import('../../src/models/User')).User;
    const buyerBefore = await UserModel.findOne({ email: buyer.email });
    const sellerBefore = await UserModel.findOne({ email: seller.email });
    expect(buyerBefore).toBeDefined();
    expect(sellerBefore).toBeDefined();
    expect(typeof buyerBefore!.val).toBe('number');
    expect(typeof sellerBefore!.val).toBe('number');

    const impuesto = Math.floor(price * 0.05);

    const buyRes = await request(app)
      .post(`/api/marketplace/listings/${listingId}/buy`)
      .set('Authorization', `Bearer ${buyerToken}`);

    // buyer receives, seller gets val (handled transactionally)
    expect(buyRes.status).toBe(200);

    const buyerPost = await UserModel.findOne({ email: buyer.email });
    const sellerPost = await UserModel.findOne({ email: seller.email });

    // buyer has item
    expect(buyerPost!.inventarioConsumibles.some((c: any) => c.consumableId.toString() === itemId)).toBe(true);
    // seller does not have item
    expect(sellerPost!.inventarioConsumibles.some((c: any) => c.consumableId.toString() === itemId)).toBe(false);

    // Verificar cambios en saldos: buyer -= precio, seller += (precio - impuesto)
    expect(buyerPost!.val).toBe(buyerBefore!.val - price);
    expect(sellerPost!.val).toBe(sellerBefore!.val + (price - impuesto));
  }, 30000);
});
