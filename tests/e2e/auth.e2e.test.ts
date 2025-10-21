import request from 'supertest';
import { setupTestDB, seedTestData, cleanupTestDB } from './setup';

let mongod: any;
let app: any;

const testEmail = `e2e_test_${Date.now()}@example.com`;
const testUser = { email: testEmail, username: `e2e_${Date.now()}`, password: 'password123' };

describe('Auth E2E', () => {
  beforeAll(async () => {
    mongod = await setupTestDB();
    await seedTestData();
    app = (await import('../../src/app')).default;
  });

  it('should register, login and get health', async () => {
    const registerRes = await request(app).post('/auth/register').send(testUser).expect(201);
    expect(registerRes.body.message).toMatch(/Registro exitoso/);

    // Verificar el usuario manualmente para poder hacer login
    const { User } = await import('../../src/models/User');
    const user = await User.findOne({ email: testUser.email });
    if (user) {
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
    }

    const loginRes = await request(app).post('/auth/login').send({ email: testUser.email, password: testUser.password }).expect(200);
    expect(loginRes.body.token).toBeTruthy();

    const healthRes = await request(app).get('/health').expect(200);
    expect(healthRes.body.ok).toBe(true);
  }, 20000);

  afterAll(async () => {
    await cleanupTestDB(mongod);
  });
});
