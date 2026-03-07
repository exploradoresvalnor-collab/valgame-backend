"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const User_1 = require("../../src/models/User");
const Listing_1 = __importDefault(require("../../src/models/Listing"));
const marketplaceService = __importStar(require("../../src/services/marketplace.service"));
describe('Unit marketplace.service transactional behavior', () => {
    let replSet;
    beforeAll(async () => {
        replSet = await mongodb_memory_server_1.MongoMemoryReplSet.create({ replSet: { name: 'rs0', count: 1 } });
        const uri = replSet.getUri();
        await mongoose_1.default.connect(uri, { dbName: 'test' });
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        if (replSet && typeof replSet.stop === 'function')
            await replSet.stop();
    });
    it('should rollback transaction if buyer.save fails', async () => {
        // Preparar seller con un consumible
        const seller = await User_1.User.create({
            email: 'seller@example.test',
            username: 'seller',
            passwordHash: 'x',
            val: 0,
            inventarioConsumibles: [{ consumableId: new mongoose_1.default.Types.ObjectId(), usos_restantes: 1 }]
        });
        // Crear listing manualmente simulando listItem
        const itemId = seller.inventarioConsumibles[0].consumableId.toString();
        const listing = await Listing_1.default.create({ itemId, type: 'consumible', sellerId: seller._id, precio: 10, precioOriginal: 10, impuesto: 0, estado: 'activo', fechaExpiracion: new Date(Date.now() + 1000000) });
        // Crear buyer con fondos insuficientes a propósito y luego parchear para tener fondos pero forzar fallo en save
        const buyer = await User_1.User.create({ email: 'buyer@example.test', username: 'buyer', passwordHash: 'x', val: 100 });
        // En lugar de mockear findById (que rompe la cadena .session), espiamos User.prototype.save
        // y simulamos fallo solo cuando se llama sobre la instancia del buyer.
        const UserModel = (await Promise.resolve().then(() => __importStar(require('../../src/models/User')))).User;
        const originalProtoSave = UserModel.prototype.save;
        const saveSpy = jest.spyOn(UserModel.prototype, 'save').mockImplementation(function (options) {
            if (String(this._id) === String(buyer._id)) {
                throw new Error('Simulated save failure');
            }
            // Llamar al save original para otros casos (vendedor)
            return originalProtoSave.apply(this, arguments);
        });
        // Ejecutar buyItem pero esperamos que lance debido al fallo en buyer.save
        let threw = false;
        try {
            // listing._id puede ser unknown según la inferencia de tipos; castear a ObjectId para TS
            await marketplaceService.buyItem(buyer, listing._id.toString());
        }
        catch (err) {
            threw = true;
        }
        expect(threw).toBe(true);
        // Refrescar seller desde DB y comprobar que el item sigue estando en su inventario (rollback)
        const freshSeller = await User_1.User.findById(seller._id);
        const stillHas = freshSeller.inventarioConsumibles.some((c) => String(c.consumableId) === String(itemId));
        expect(stillHas).toBe(true);
        // Restaurar mocks
        saveSpy.mockRestore();
    }, 30000);
});
