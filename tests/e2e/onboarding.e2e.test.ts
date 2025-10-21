import request from 'supertest';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

const testEmail = `e2e_onb_${Date.now()}@example.com`;
const testUser = { email: testEmail, username: `e2e_onb_${Date.now()}`, password: 'password123' };

describe('Onboarding E2E', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  it('register -> verify should deliver pioneer package', async () => {
    // register
    const reg = await request(app).post('/auth/register').send(testUser).expect(201);
    expect(reg.body.message).toMatch(/Registro exitoso/);

    // get the user to read the token
    const { User } = await import('../../src/models/User');
    const user = await User.findOne({ email: testEmail });
    expect(user).toBeTruthy();
    const token = (user as any).verificationToken;
    expect(token).toBeTruthy();

    // verify
    const verifyRes = await request(app).get(`/auth/verify/${token}`).expect(200);
    expect(verifyRes.body.message).toMatch(/Cuenta verificada/);
    expect(verifyRes.body.package).toBeTruthy();

    // reload user and assert package delivered
    const userAfter = await User.findOne({ email: testEmail });
    expect((userAfter as any).receivedPioneerPackage).toBe(true);
    expect((userAfter as any).personajes.length).toBeGreaterThan(0);
    expect((userAfter as any).val).toBeGreaterThanOrEqual(50); // Actualizado: ahora entrega 50 VAL
  }, 30000);

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });
});
