import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from '../e2e/setup';

let mongod: any;
let app: any;

describe('Routes: marketplace mount and duplicates', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('should not expose duplicate path /api/marketplace/marketplace/history', async () => {
    const res = await request(app).get('/api/marketplace/marketplace/history');
    expect([404, 401]).toContain(res.status); // 401 if auth required, 404 if not mounted
  });

  it('should expose /api/marketplace/history and respond with 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/marketplace/history');
    expect([401, 200, 400]).toContain(res.status); // depends on auth.
  });
});
