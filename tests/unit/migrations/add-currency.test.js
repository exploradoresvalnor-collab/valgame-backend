"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const Listing_1 = __importDefault(require("../../../src/models/Listing"));
const MarketplaceTransaction_1 = __importDefault(require("../../../src/models/MarketplaceTransaction"));
const migrate_add_currency_1 = require("../../..//scripts/migrate-add-currency");
jest.setTimeout(60000);
describe('migrate-add-currency', () => {
    let replSet;
    let uri;
    beforeAll(async () => {
        replSet = await mongodb_memory_server_1.MongoMemoryReplSet.create({ replSet: { count: 1 } });
        uri = replSet.getUri();
        await mongoose_1.default.connect(uri);
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await replSet.stop();
    });
    beforeEach(async () => {
        await Listing_1.default.deleteMany({});
        await MarketplaceTransaction_1.default.deleteMany({});
    });
    test('should add currency: VAL to documents without currency', async () => {
        // Insert sample docs WITHOUT currency using raw inserts (para evitar defaults del schema)
        await Listing_1.default.collection.insertMany([
            { itemId: 'it1', type: 'consumible', sellerId: new mongoose_1.default.Types.ObjectId(), precio: 10, precioOriginal: 10, impuesto: 0, estado: 'activo', fechaExpiracion: new Date(Date.now() + 1000000), destacado: false, metadata: {} },
            { itemId: 'it2', type: 'equipamiento', sellerId: new mongoose_1.default.Types.ObjectId(), precio: 20, precioOriginal: 20, impuesto: 0, estado: 'activo', fechaExpiracion: new Date(Date.now() + 1000000), destacado: false, metadata: {} }
        ]);
        await MarketplaceTransaction_1.default.collection.insertOne({ listingId: new mongoose_1.default.Types.ObjectId(), sellerId: new mongoose_1.default.Types.ObjectId(), itemId: 'it1', itemType: 'consumible', precioOriginal: 10, precioFinal: 10, impuesto: 0, action: 'listed', timestamp: new Date(), itemMetadata: {} });
        const stats = await (0, migrate_add_currency_1.runAddCurrency)({ mongoUri: uri, dryRun: false, batchSize: 100 });
        expect(stats.listingsUpdated).toBeGreaterThanOrEqual(2);
        expect(stats.txUpdated).toBeGreaterThanOrEqual(1);
        // El script se desconecta al final; reconectamos para verificar los documentos
        await mongoose_1.default.connect(uri);
        const listings = await Listing_1.default.find().lean();
        const txs = await MarketplaceTransaction_1.default.find().lean();
        listings.forEach(l => expect(l.currency).toBe('VAL'));
        txs.forEach(t => expect(t.currency).toBe('VAL'));
    });
});
