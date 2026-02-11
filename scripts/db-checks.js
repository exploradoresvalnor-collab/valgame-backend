/* Read-only DB checks script
 * Usage: node scripts/db-checks.js
 * It connects to MONGODB_URI and prints GameSetting, samples of Listing and MarketplaceTransaction.
 */

(async () => {
  try {
    // Connect using mongoose directly to avoid requiring TypeScript source files
    const mongoose = require('mongoose');
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set in environment');
    await mongoose.connect(uri);

    // Require compiled models from dist (JS)
    const GameSetting = require('../dist/models/GameSetting').default;
    const Listing = require('../dist/models/Listing').default;
    const MarketplaceTransaction = require('../dist/models/MarketplaceTransaction').default;

    console.log('\n=== GameSetting ===');
    const gs = await GameSetting.findOne().lean();
    if (!gs) {
      console.log('No GameSetting document found');
    } else {
      console.log('GameSetting id:', gs._id?.toString());
      console.log('costo_ticket_en_val:', gs.costo_ticket_en_val);
      console.log('tasa_cambio_usdt (if present):', gs.tasa_cambio_usdt);
    }

    console.log('\n=== Listings sample & stats ===');
    const totalListings = await Listing.countDocuments();
    const listingsWithCurrency = await Listing.countDocuments({ currency: { $exists: true } });
    console.log('total listings:', totalListings);
    console.log('listings with currency field:', listingsWithCurrency);
    const sampleListings = await Listing.find().limit(5).lean();
    console.log('sample listings (first 5):');
    sampleListings.forEach(l => console.log(JSON.stringify(l, null, 2)));

    console.log('\n=== MarketplaceTransaction sample & stats ===');
    const totalTx = await MarketplaceTransaction.countDocuments();
    const txWithCurrency = await MarketplaceTransaction.countDocuments({ currency: { $exists: true } });
    console.log('total transactions:', totalTx);
    console.log('transactions with currency field:', txWithCurrency);
    const sampleTx = await MarketplaceTransaction.find().sort({ timestamp: -1 }).limit(5).lean();
    console.log('sample transactions (last 5):');
    sampleTx.forEach(t => console.log(JSON.stringify(t, null, 2)));

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Error running DB checks:', err);
    try { const { disconnectDB } = require('../src/config/db'); await disconnectDB(); } catch(e){}
    process.exit(1);
  }
})();
