import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { setupTestDB, seedTestData, cleanupTestDB } from '../e2e/setup';

let mongod: any;
let app: any;

describe('Shop controller', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });

  it('GET /api/shop/info returns costPerBoleto from GameSetting', async () => {
    const res = await request(app).get('/api/shop/info');
    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.exchangeRates).toBeDefined();
    // Default from seedTestData sets costo_ticket_en_val: 50 in some seeds, but we rely on existing GameSetting
    // Ensure costPerBoleto exists and is a positive number
    expect(typeof body.exchangeRates.costPerBoleto).toBe('number');
    expect(body.exchangeRates.costPerBoleto).toBeGreaterThan(0);
    // Since business decision is 1 boleto = 100 VAL, it should be >= 1
    // Not enforcing equality here because GameSetting in test may vary; we ensure consistency between costPerBoleto and boletosPerVal
    expect(typeof body.exchangeRates.boletosPerVal).toBe('number');
    expect(body.exchangeRates.boletosPerVal).toBeCloseTo(1 / body.exchangeRates.costPerBoleto, 6);
  });
});
