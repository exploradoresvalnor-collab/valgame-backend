"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Test básico para verificar que las rutas faltantes están montadas correctamente
 */
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const test_setup_1 = require("./setup/test-setup");
describe('Rutas Adicionales - Verificación Básica', () => {
    it('Debe acceder a /api/categories (GET)', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/categories')
            .set('Authorization', `Bearer ${test_setup_1.authToken}`);
        expect(res.status).not.toBe(404); // No debe ser 404 (ruta no encontrada)
    });
    it('Debe acceder a /api/notifications (GET)', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${test_setup_1.authToken}`);
        expect(res.status).not.toBe(404);
    });
    it('Debe acceder a /api/level-requirements (GET)', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/level-requirements')
            .set('Authorization', `Bearer ${test_setup_1.authToken}`);
        expect(res.status).not.toBe(404);
    });
    it('Debe acceder a /api/events (GET)', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/events')
            .set('Authorization', `Bearer ${test_setup_1.authToken}`);
        expect(res.status).not.toBe(404);
    });
    it('Debe acceder a /api/player-stats (GET)', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/player-stats')
            .set('Authorization', `Bearer ${test_setup_1.authToken}`);
        expect(res.status).not.toBe(404);
    });
    it('Debe acceder a /api/rankings (GET)', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/rankings')
            .set('Authorization', `Bearer ${test_setup_1.authToken}`);
        expect(res.status).not.toBe(404);
    });
});
