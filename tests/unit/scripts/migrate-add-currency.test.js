"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tests/unit/scripts/migrate-add-currency.test.ts
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const migrate_add_currency_1 = require("../../../scripts/migrate-add-currency");
const Listing_1 = __importDefault(require("../../../src/models/Listing"));
const MarketplaceTransaction_1 = __importDefault(require("../../../src/models/MarketplaceTransaction"));
// Aumentar timeout para descargar binarios de mongo si es necesario
jest.setTimeout(60000);
describe('Migration Script: Add Currency', () => {
    let mongoServer;
    beforeAll(async () => {
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    });
    afterAll(async () => {
        if (mongoose_1.default.connection.readyState !== 0) {
            await mongoose_1.default.disconnect();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    });
    beforeEach(async () => {
        // Asegurarnos de estar desconectados antes de cada test para que el script pueda conectar
        if (mongoose_1.default.connection.readyState !== 0) {
            await mongoose_1.default.disconnect();
        }
    });
    it('should update listings and transactions correctly', async () => {
        const uri = mongoServer.getUri();
        // 1. Conectar manualmente para preparar datos "antiguos" (sin campo currency)
        await mongoose_1.default.connect(uri);
        // Insertar datos crudos bypassendo esquemas para simular datos legacy
        const oldListingId = new mongoose_1.default.Types.ObjectId();
        const oldTxId = new mongoose_1.default.Types.ObjectId();
        await mongoose_1.default.connection.db?.collection('listings').insertOne({
            _id: oldListingId,
            itemId: 'item-123',
            type: 'equipamiento',
            sellerId: new mongoose_1.default.Types.ObjectId(),
            precio: 100,
            precioOriginal: 100,
            impuesto: 5,
            estado: 'activo',
            fechaExpiracion: new Date(),
            fechaCreacion: new Date(),
            // currency: FALTA INTENCIONALMENTE
        });
        await mongoose_1.default.connection.db?.collection('marketplacetransactions').insertOne({
            _id: oldTxId,
            listingId: oldListingId,
            sellerId: new mongoose_1.default.Types.ObjectId(),
            itemId: 'item-123',
            itemType: 'equipamiento',
            precioOriginal: 100,
            precioFinal: 100,
            impuesto: 5,
            action: 'listed',
            timestamp: new Date(),
            // currency: FALTA INTENCIONALMENTE
        });
        await mongoose_1.default.disconnect();
        // 2. Ejecutar la migración
        const stats = await (0, migrate_add_currency_1.runAddCurrency)({
            mongoUri: uri,
            dryRun: false,
            batchSize: 10
        });
        // 3. Verificaciones
        expect(stats.listingsUpdated).toBe(1);
        expect(stats.txUpdated).toBe(1);
        // Reconectar para verificar datos
        await mongoose_1.default.connect(uri);
        const updatedListing = await Listing_1.default.findById(oldListingId).lean();
        const updatedTx = await MarketplaceTransaction_1.default.findById(oldTxId).lean();
        expect(updatedListing?.currency).toBe('VAL');
        expect(updatedTx?.currency).toBe('VAL');
    });
    it('should respect dryRun mode (no changes)', async () => {
        const uri = mongoServer.getUri();
        await mongoose_1.default.connect(uri);
        // Limpiar colecciones
        await Listing_1.default.deleteMany({});
        await MarketplaceTransaction_1.default.deleteMany({});
        // Datos legacy
        const oldListingId = new mongoose_1.default.Types.ObjectId();
        await mongoose_1.default.connection.db?.collection('listings').insertOne({
            _id: oldListingId,
            itemId: 'dry-item',
            type: 'equipamiento',
            sellerId: new mongoose_1.default.Types.ObjectId(),
            precio: 50,
            precioOriginal: 50,
            impuesto: 2,
            estado: 'activo',
            fechaExpiracion: new Date(),
            fechaCreacion: new Date(),
        });
        await mongoose_1.default.disconnect();
        // Ejecutar con dryRun = true
        const stats = await (0, migrate_add_currency_1.runAddCurrency)({
            mongoUri: uri,
            dryRun: true
        });
        // Debería detectar pero no actualizar (el script devuelve stats de lo que *habría* hecho o lo que encontró)
        // Revisando el script: stats.listingsUpdated se incrementa en el bucle real. 
        // En dryRun el bucle break, así que listingsUpdated será 0, pero listingsChecked > 0?
        // El script dice: "if (dryRun) break;" inmediatamente después de encontrar. 
        // Así que listingsUpdated debería ser 0.
        expect(stats.listingsChecked).toBeGreaterThan(0);
        expect(stats.listingsUpdated).toBe(0);
        // Verificar persistencia
        await mongoose_1.default.connect(uri);
        // Usar collection directo para ver campo raw
        const doc = await mongoose_1.default.connection.db?.collection('listings').findOne({ _id: oldListingId });
        expect(doc).toBeDefined();
        expect(doc?.currency).toBeUndefined(); // NO debe haber cambiado
    });
});
