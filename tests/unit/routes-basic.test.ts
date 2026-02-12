/**
 * Test básico para verificar que las rutas faltantes están montadas correctamente
 */
import request from 'supertest';
import app from '../src/app';
import { authToken, testUserId } from './setup/test-setup';

describe('Rutas Adicionales - Verificación Básica', () => {
  it('Debe acceder a /api/categories (GET)', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).not.toBe(404); // No debe ser 404 (ruta no encontrada)
  });

  it('Debe acceder a /api/notifications (GET)', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).not.toBe(404);
  });

  it('Debe acceder a /api/level-requirements (GET)', async () => {
    const res = await request(app)
      .get('/api/level-requirements')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).not.toBe(404);
  });

  it('Debe acceder a /api/events (GET)', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).not.toBe(404);
  });

  it('Debe acceder a /api/player-stats (GET)', async () => {
    const res = await request(app)
      .get('/api/player-stats')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).not.toBe(404);
  });

  it('Debe acceder a /api/rankings (GET)', async () => {
    const res = await request(app)
      .get('/api/rankings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).not.toBe(404);
  });
});