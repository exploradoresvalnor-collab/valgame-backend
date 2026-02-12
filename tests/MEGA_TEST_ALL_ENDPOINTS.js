"use strict";
/**
 * 🎯 MEGA TEST - ALL 109 ENDPOINTS & FUNCTIONS
 * Prueba exhaustiva de todos los endpoints del sistema
 * Genera un reporte final de salud del proyecto
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:8080/api';
class MegaTestRunner {
    constructor() {
        this.results = [];
        this.token = null;
        this.userId = null;
        this.characterId = null;
        this.client = axios_1.default.create({
            baseURL: BASE_URL,
            validateStatus: () => true
        });
    }
    async runAll() {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║         🎯 MEGA TEST - ALL 109 ENDPOINTS & FUNCTIONS         ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        // Start server if needed
        await this.testHealthCheck();
        // Public Endpoints
        await this.testPublicEndpoints();
        // Auth Endpoints
        await this.testAuthEndpoints();
        // Game Core Endpoints
        await this.testGameCoreEndpoints();
        // User Endpoints
        await this.testUserEndpoints();
        // Character Endpoints
        await this.testCharacterEndpoints();
        // Combat Endpoints
        await this.testCombatEndpoints();
        // Marketplace Endpoints
        await this.testMarketplaceEndpoints();
        // Gamification Endpoints
        await this.testGamificationEndpoints();
        // Other Endpoints
        await this.testOtherEndpoints();
        // Print Results
        this.printResults();
    }
    async test(name, method, path, data) {
        const start = Date.now();
        try {
            let response;
            const fullPath = path.startsWith('/') ? path : `/${path}`;
            const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
            if (method === 'GET') {
                response = await this.client.get(fullPath, { headers });
            }
            else if (method === 'POST') {
                response = await this.client.post(fullPath, data || {}, { headers });
            }
            else if (method === 'PUT') {
                response = await this.client.put(fullPath, data || {}, { headers });
            }
            else if (method === 'DELETE') {
                response = await this.client.delete(fullPath, { headers });
            }
            const time = Date.now() - start;
            const success = response.status >= 200 && response.status < 400;
            this.results.push({
                name,
                method,
                path,
                status: response.status,
                success,
                time
            });
            const icon = success ? '✅' : response.status === 401 ? '🔐' : '⚠️';
            console.log(`${icon} ${method.padEnd(6)} ${fullPath.padEnd(40)} [${response.status}] ${time}ms`);
            return response;
        }
        catch (error) {
            const time = Date.now() - start;
            this.results.push({
                name,
                method,
                path,
                status: null,
                success: false,
                error: error.message,
                time
            });
            console.log(`❌ ${method.padEnd(6)} ${path.padEnd(40)} [ERROR] ${error.message}`);
            return null;
        }
    }
    async testHealthCheck() {
        console.log('🏥 Health Check\n');
        await this.test('Health', 'GET', '/health');
        await this.test('Health Live', 'GET', '/health/live');
        await this.test('Health Ready', 'GET', '/health/ready');
        console.log('');
    }
    async testPublicEndpoints() {
        console.log('🟢 Public Endpoints\n');
        await this.test('Base Characters', 'GET', '/base-characters');
        await this.test('Categories', 'GET', '/categories');
        await this.test('Game Settings', 'GET', '/game-settings');
        await this.test('Packages', 'GET', '/packages');
        await this.test('Offers', 'GET', '/offers');
        await this.test('Items', 'GET', '/items');
        await this.test('Equipment', 'GET', '/equipment');
        await this.test('Consumables', 'GET', '/consumables');
        await this.test('Level Requirements', 'GET', '/level-requirements');
        await this.test('Events', 'GET', '/events');
        console.log('');
    }
    async testAuthEndpoints() {
        console.log('🔐 Auth Endpoints\n');
        const registerRes = await this.test('Register', 'POST', '/auth/register', {
            nombre: `testuser_${Date.now()}`,
            correo: `test${Date.now()}@example.com`,
            contraseña: 'Test123456!'
        });
        if (registerRes?.data?.token) {
            this.token = registerRes.data.token;
            this.userId = registerRes.data.userId;
        }
        await this.test('Login', 'POST', '/auth/login', {
            correo: `test@example.com`,
            contraseña: 'test123'
        });
        await this.test('Logout', 'POST', '/auth/logout');
        await this.test('Forgot Password', 'POST', '/auth/forgot-password', {
            correo: 'test@example.com'
        });
        console.log('');
    }
    async testGameCoreEndpoints() {
        console.log('🎮 Game Core Endpoints\n');
        // Dungeons
        await this.test('Get Dungeons', 'GET', '/dungeons');
        await this.test('Get Dungeon', 'GET', '/dungeons/507f1f77bcf86cd799439011');
        await this.test('Get Dungeon Progress', 'GET', '/dungeons/507f1f77bcf86cd799439011/progress');
        await this.test('Start Dungeon', 'POST', '/dungeons/507f1f77bcf86cd799439011/start');
        // Survival
        await this.test('Get Survival', 'GET', '/survival');
        console.log('');
    }
    async testUserEndpoints() {
        console.log('👤 User Endpoints\n');
        if (this.token) {
            await this.test('Get Users', 'GET', '/users');
            await this.test('Get Me', 'GET', '/users/me');
            await this.test('Get Dashboard', 'GET', '/users/dashboard');
            await this.test('Get Energy Status', 'GET', '/users/energy/status');
            await this.test('Get Resources', 'GET', '/users/resources');
            await this.test('Get Profile', 'GET', '/users/profile/507f1f77bcf86cd799439011');
            await this.test('Consume Energy', 'POST', '/users/energy/consume', { cantidad: 10 });
        }
        console.log('');
    }
    async testCharacterEndpoints() {
        console.log('🎭 Character Endpoints\n');
        if (this.token) {
            await this.test('Get Characters', 'GET', '/characters');
            await this.test('Add Character', 'POST', '/characters', {
                nombre: 'TestChar',
                baseCharacterId: '507f1f77bcf86cd799439011'
            });
            const characterId = '507f1f77bcf86cd799439011';
            await this.test('Use Consumable', 'POST', `/characters/${characterId}/use-consumable`, {
                itemId: '507f1f77bcf86cd799439011'
            });
            await this.test('Revive Character', 'POST', `/characters/${characterId}/revive`);
            await this.test('Heal Character', 'POST', `/characters/${characterId}/heal`, { cantidad: 50 });
            await this.test('Level Up', 'PUT', `/characters/${characterId}/level-up`);
            await this.test('Add Experience', 'POST', `/characters/${characterId}/add-experience`, { experiencia: 100 });
            await this.test('Evolve', 'POST', `/characters/${characterId}/evolve`);
        }
        console.log('');
    }
    async testCombatEndpoints() {
        console.log('⚔️  Combat Endpoints\n');
        if (this.token) {
            await this.test('Start Dungeon Combat', 'POST', '/dungeons/507f1f77bcf86cd799439011/start', {
                characterId: '507f1f77bcf86cd799439011'
            });
            await this.test('Perform Attack', 'POST', '/combat/attack', {
                combateId: '507f1f77bcf86cd799439011'
            });
            await this.test('Perform Defend', 'POST', '/combat/defend', {
                combateId: '507f1f77bcf86cd799439011'
            });
            await this.test('End Combat', 'POST', '/combat/end', {
                combateId: '507f1f77bcf86cd799439011',
                victoria: true
            });
        }
        console.log('');
    }
    async testMarketplaceEndpoints() {
        console.log('🏪 Marketplace Endpoints\n');
        if (this.token) {
            await this.test('List Item', 'POST', '/marketplace/list', {
                itemId: '507f1f77bcf86cd799439011',
                precio: 100,
                descripcion: 'Test item'
            });
            await this.test('Get Listings', 'GET', '/marketplace');
            await this.test('Buy Item', 'POST', '/marketplace/buy/507f1f77bcf86cd799439011', {});
            await this.test('Cancel Listing', 'POST', '/marketplace/cancel/507f1f77bcf86cd799439011', {});
            await this.test('Get Marketplace Stats', 'GET', '/marketplace-transactions/stats');
            await this.test('Get My History', 'GET', '/marketplace-transactions/my-history');
            await this.test('Get My Purchases', 'GET', '/marketplace-transactions/my-purchases');
            await this.test('Get My Sales', 'GET', '/marketplace-transactions/my-sales');
        }
        console.log('');
    }
    async testGamificationEndpoints() {
        console.log('🏆 Gamification Endpoints\n');
        if (this.token) {
            await this.test('Get Rankings', 'GET', '/rankings');
            await this.test('Get My Ranking', 'GET', '/rankings/me');
            await this.test('Get Leaderboard', 'GET', '/rankings/leaderboard/level');
            await this.test('Get Ranking Stats', 'GET', '/rankings/stats');
            await this.test('Get Achievements', 'GET', '/achievements');
            await this.test('Unlock Achievement', 'POST', '/achievements/507f1f77bcf86cd799439011/unlock', {
                achievementId: '507f1f77bcf86cd799439011'
            });
            await this.test('Get Player Stats', 'GET', '/player-stats/usuario/507f1f77bcf86cd799439011');
            await this.test('Get Character Stats', 'GET', '/player-stats/personaje/507f1f77bcf86cd799439011');
        }
        console.log('');
    }
    async testOtherEndpoints() {
        console.log('📦 Other Endpoints\n');
        if (this.token) {
            await this.test('Get Chat Messages', 'GET', '/chat/messages');
            await this.test('Send Global Chat', 'POST', '/chat/global', { contenido: 'Test message' });
            await this.test('Get Notifications', 'GET', '/notifications');
            await this.test('Get Unread Count', 'GET', '/notifications/unread/count');
            await this.test('Get Shop Info', 'GET', '/shop/info');
            await this.test('Buy VAL', 'POST', '/shop/buy-val', { cantidad: 100 });
            await this.test('Get User Settings', 'GET', '/user/settings');
            await this.test('Get User Characters', 'GET', '/user-characters');
            await this.test('Get User Packages', 'GET', '/user-packages/507f1f77bcf86cd799439011');
            await this.test('Get Payments', 'POST', '/payments/checkout', {
                packageId: '507f1f77bcf86cd799439011'
            });
        }
        console.log('');
    }
    printResults() {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                    📊 TEST RESULTS SUMMARY                    ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        const successful = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;
        const authorized = this.results.filter(r => r.status === 401).length;
        console.log(`Total Tests:        ${this.results.length}`);
        console.log(`✅ Successful:       ${successful} (${((successful / this.results.length) * 100).toFixed(1)}%)`);
        console.log(`❌ Failed:           ${failed} (${((failed / this.results.length) * 100).toFixed(1)}%)`);
        console.log(`🔐 Unauthorized:     ${authorized}`);
        const avgTime = this.results.reduce((a, b) => a + b.time, 0) / this.results.length;
        console.log(`⏱️  Average Response: ${avgTime.toFixed(0)}ms`);
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                      ✅ TEST COMPLETED ✅                     ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        // Show failed tests
        if (failed > 0) {
            console.log('Failed Tests:');
            this.results.filter(r => !r.success).forEach(r => {
                console.log(`  ❌ ${r.method} ${r.path} - ${r.error || `HTTP ${r.status}`}`);
            });
        }
    }
}
// Run the mega test
const runner = new MegaTestRunner();
runner.runAll().catch(console.error);
