"use strict";
/**
 * MIGRACIÓN: Añadir campo `currency` a Listing y MarketplaceTransaction
 * Uso:
 *  npx ts-node -r dotenv/config scripts/migrate-add-currency.ts --dryRun --batchSize=500
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAddCurrency = runAddCurrency;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Listing_1 = __importDefault(require("../src/models/Listing"));
const MarketplaceTransaction_1 = __importDefault(require("../src/models/MarketplaceTransaction"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/valgame';
async function runAddCurrency(options = {}) {
    const uri = options.mongoUri || MONGODB_URI;
    const dryRun = !!options.dryRun;
    const batchSize = options.batchSize || 1000;
    await mongoose_1.default.connect(uri);
    console.log('✅ Conectado a MongoDB:', uri);
    const stats = {
        listingsChecked: 0,
        listingsUpdated: 0,
        txChecked: 0,
        txUpdated: 0
    };
    try {
        // LISTINGS
        while (true) {
            const docs = await Listing_1.default.find({ currency: { $exists: false } }).limit(batchSize).lean();
            if (!docs.length)
                break;
            stats.listingsChecked += docs.length;
            if (dryRun) {
                console.log(`[DRY RUN] Encontrados ${docs.length} listings sin currency`);
                break;
            }
            const ops = docs.map(d => ({ updateOne: { filter: { _id: d._id }, update: { $set: { currency: 'VAL' } } } }));
            const res = await Listing_1.default.bulkWrite(ops);
            stats.listingsUpdated += res.modifiedCount || docs.length;
            console.log(`✅ Actualizados ${res.modifiedCount || docs.length} listings`);
        }
        // MARKETPLACE TRANSACTIONS
        while (true) {
            const docs = await MarketplaceTransaction_1.default.find({ currency: { $exists: false } }).limit(batchSize).lean();
            if (!docs.length)
                break;
            stats.txChecked += docs.length;
            if (dryRun) {
                console.log(`[DRY RUN] Encontradas ${docs.length} marketplaceTransactions sin currency`);
                break;
            }
            const ops = docs.map(d => ({ updateOne: { filter: { _id: d._id }, update: { $set: { currency: 'VAL' } } } }));
            const res = await MarketplaceTransaction_1.default.bulkWrite(ops);
            stats.txUpdated += res.modifiedCount || docs.length;
            console.log(`✅ Actualizadas ${res.modifiedCount || docs.length} transactions`);
        }
        console.log('\nResumen: ', stats);
        await mongoose_1.default.disconnect();
        return stats;
    }
    catch (err) {
        console.error('❌ Error durante migración:', err);
        await mongoose_1.default.disconnect();
        throw err;
    }
}
// CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dryRun') || args.includes('--dry-run');
    const batchArg = args.find(a => a.startsWith('--batchSize='));
    const batchSize = batchArg ? parseInt(batchArg.split('=')[1], 10) : 1000;
    runAddCurrency({ dryRun, batchSize })
        .then(s => {
        console.log('✅ MIGRACIÓN COMPLETADA', s);
        process.exit(0);
    })
        .catch(e => {
        console.error('❌ MIGRACIÓN FALLIDA', e);
        process.exit(1);
    });
}
