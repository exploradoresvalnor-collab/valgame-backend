import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User } from '../../src/models/User';
import Listing from '../../src/models/Listing';
import * as marketplaceService from '../../src/services/marketplace.service';

describe('Unit marketplace.service transactional behavior', () => {
  let replSet: any;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { name: 'rs0', count: 1 } });
    const uri = replSet.getUri();
    await mongoose.connect(uri, { dbName: 'test' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (replSet && typeof replSet.stop === 'function') await replSet.stop();
  });

  it('should rollback transaction if buyer.save fails', async () => {
    // Preparar seller con un consumible
    const seller = await User.create({
      email: 'seller@example.test',
      username: 'seller',
      passwordHash: 'x',
      val: 0,
      inventarioConsumibles: [{ consumableId: new mongoose.Types.ObjectId(), usos_restantes: 1 }]
    } as any);

    // Crear listing manualmente simulando listItem
    const itemId = seller.inventarioConsumibles[0].consumableId.toString();
  const listing = await Listing.create({ itemId, type: 'consumible', sellerId: seller._id, precio: 10, precioOriginal: 10, impuesto: 0, estado: 'activo', fechaExpiracion: new Date(Date.now()+1000000) } as any);

    // Crear buyer con fondos insuficientes a propósito y luego parchear para tener fondos pero forzar fallo en save
    const buyer = await User.create({ email: 'buyer@example.test', username: 'buyer', passwordHash: 'x', val: 100 } as any);

    // En lugar de mockear findById (que rompe la cadena .session), espiamos User.prototype.save
    // y simulamos fallo solo cuando se llama sobre la instancia del buyer.
    const UserModel = (await import('../../src/models/User')).User as any;
    const originalProtoSave = UserModel.prototype.save;
    const saveSpy = jest.spyOn(UserModel.prototype, 'save').mockImplementation(function(this: any, options?: any) {
      if (String(this._id) === String(buyer._id)) {
        throw new Error('Simulated save failure');
      }
      // Llamar al save original para otros casos (vendedor)
      return originalProtoSave.apply(this, arguments as any);
    });

    // Ejecutar buyItem pero esperamos que lance debido al fallo en buyer.save
    let threw = false;
    try {
      // listing._id puede ser unknown según la inferencia de tipos; castear a ObjectId para TS
      await marketplaceService.buyItem(buyer as any, (listing._id as mongoose.Types.ObjectId).toString());
    } catch (err) {
      threw = true;
    }

    expect(threw).toBe(true);

    // Refrescar seller desde DB y comprobar que el item sigue estando en su inventario (rollback)
    const freshSeller = await User.findById(seller._id);
    const stillHas = freshSeller!.inventarioConsumibles.some((c: any) => String(c.consumableId) === String(itemId));
    expect(stillHas).toBe(true);

  // Restaurar mocks
  saveSpy.mockRestore();
  }, 30000);
});
