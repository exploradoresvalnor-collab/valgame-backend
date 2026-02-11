import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Listing from '../../../src/models/Listing';
import MarketplaceTransaction from '../../../src/models/MarketplaceTransaction';
import { runAddCurrency } from '../../..//scripts/migrate-add-currency';

jest.setTimeout(60_000);

describe('migrate-add-currency', () => {
  let replSet: any;
  let uri: string;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    uri = replSet.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await replSet.stop();
  });

  beforeEach(async () => {
    await Listing.deleteMany({});
    await MarketplaceTransaction.deleteMany({});
  });

  test('should add currency: VAL to documents without currency', async () => {
    // Insert sample docs WITHOUT currency using raw inserts (para evitar defaults del schema)
    await Listing.collection.insertMany([
      { itemId: 'it1', type: 'consumible', sellerId: new mongoose.Types.ObjectId(), precio: 10, precioOriginal: 10, impuesto: 0, estado: 'activo', fechaExpiracion: new Date(Date.now()+1000000), destacado: false, metadata: {} },
      { itemId: 'it2', type: 'equipamiento', sellerId: new mongoose.Types.ObjectId(), precio: 20, precioOriginal: 20, impuesto: 0, estado: 'activo', fechaExpiracion: new Date(Date.now()+1000000), destacado: false, metadata: {} }
    ]);

    await MarketplaceTransaction.collection.insertOne({ listingId: new mongoose.Types.ObjectId(), sellerId: new mongoose.Types.ObjectId(), itemId: 'it1', itemType: 'consumible', precioOriginal: 10, precioFinal: 10, impuesto: 0, action: 'listed', timestamp: new Date(), itemMetadata: {} } as any);

    const stats = await runAddCurrency({ mongoUri: uri, dryRun: false, batchSize: 100 });

    expect(stats.listingsUpdated).toBeGreaterThanOrEqual(2);
    expect(stats.txUpdated).toBeGreaterThanOrEqual(1);

    // El script se desconecta al final; reconectamos para verificar los documentos
    await mongoose.connect(uri);

    const listings = await Listing.find().lean();
    const txs = await MarketplaceTransaction.find().lean();

    listings.forEach(l => expect(l.currency).toBe('VAL'));
    txs.forEach(t => expect((t as any).currency).toBe('VAL'));
  });
});
