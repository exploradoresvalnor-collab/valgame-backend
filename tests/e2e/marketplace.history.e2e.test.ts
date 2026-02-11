import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';

// Aumentar timeout para tareas de setup que usan MongoMemoryReplSet
jest.setTimeout(120000);
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

describe('E2E Marketplace History and flows', () => {
  beforeAll(async () => {
    console.log('[TEST] beforeAll start');
    mongod = await setupTestDB();
    console.log('[TEST] setupTestDB done');
    await seedTestData();
    console.log('[TEST] seedTestData done');
    try {
      app = (await import('../../src/app')).default;
      console.log('[TEST] app imported');
    } catch (err) {
      console.error('[TEST] failed to import app:', err);
      throw err;
    }
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('should list, buy and return history paginated for seller and buyer', async () => {
    // Register seller and buyer
    const seller = { email: `seller${Date.now()}@test.com`, username: `seller${Date.now()}`, password: 'Test1234!A' };
    const buyer = { email: `buyer${Date.now()}@test.com`, username: `buyer${Date.now()}`, password: 'Test1234!B' };

    await request(app).post('/auth/register').send(seller).expect(201);
    await request(app).post('/auth/register').send(buyer).expect(201);

    // Verify both accounts via verification endpoint
    const { User } = await import('../../src/models/User');
    const s = await User.findOne({ email: seller.email });
    const b = await User.findOne({ email: buyer.email });
    await request(app).get(`/auth/verify/${(s as any).verificationToken}`).expect(200);
    await request(app).get(`/auth/verify/${(b as any).verificationToken}`).expect(200);

    // Login to get tokens
    const loginS = await request(app).post('/auth/login').send({ email: seller.email, password: seller.password });
    const sellerToken = loginS.body.token;
    const loginB = await request(app).post('/auth/login').send({ email: buyer.email, password: buyer.password });
    const buyerToken = loginB.body.token;

    // Add an item to seller's inventory directly
    const { Item } = await import('../../src/models/Item');
    const item = await Item.findOne({});
    expect(item).toBeDefined();
    // TS guard
    const itemId = (item as any)._id;
    await User.findByIdAndUpdate((s as any)._id, { $push: { inventarioEquipamiento: itemId }, $set: { val: 10000 } });
    await User.findByIdAndUpdate((b as any)._id, { $set: { val: 10000 } });

    // Seller creates listing
    const listRes = await request(app)
      .post('/api/marketplace/listings')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ itemId: itemId.toString(), precio: 500 });

    if (listRes.status !== 201) {
      console.error('[TEST] listing creation failed, status:', listRes.status, 'body:', listRes.body);
    }

    expect(listRes.status).toBe(201);
    expect(listRes.body.exito).toBeTruthy();
    const listingId = listRes.body.listing.id;

    // Buyer buys the listing
    const buyRes = await request(app)
      .post(`/api/marketplace/listings/${listingId}/buy`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send()
      .expect(200);

    expect(buyRes.body.exito).toBeTruthy();

    // Seller history
    const sellerHistory = await request(app)
      .get('/api/marketplace/history?page=0&limit=20')
      .set('Authorization', `Bearer ${sellerToken}`)
      .expect(200);

    expect(sellerHistory.body.success).toBe(true);
    expect(Array.isArray(sellerHistory.body.data)).toBeTruthy();
    expect(sellerHistory.body.pagination).toBeDefined();
    expect(sellerHistory.body.pagination.total).toBeGreaterThanOrEqual(1);

    // Buyer history
    const buyerHistory = await request(app)
      .get('/api/marketplace/history?page=0&limit=20')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(buyerHistory.body.success).toBe(true);
    expect(Array.isArray(buyerHistory.body.data)).toBeTruthy();
    expect(buyerHistory.body.pagination).toBeDefined();
    expect(buyerHistory.body.pagination.total).toBeGreaterThanOrEqual(1);
  }, 20000);
});
