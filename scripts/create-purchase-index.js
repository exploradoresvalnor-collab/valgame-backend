/* Script simple para crear índices en Production/DB antes de recibir tráfico.
   Ejecutar con: node scripts/create-purchase-index.js --uri <MONGO_URI>
*/

const mongoose = require('mongoose');
const Purchase = require('../dist/models/Purchase').Purchase;

async function run() {
  const uri = process.argv[2] || process.env.MONGO_URI;
  if (!uri) {
    console.error('USAGE: node scripts/create-purchase-index.js <MONGO_URI>');
    process.exit(1);
  }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected');
  try {
    await Purchase.collection.createIndex({ externalPaymentId: 1 }, { unique: true, sparse: true });
    console.log('Index externalPaymentId created');
  } catch (err) {
    console.error('Error creating index', err);
  }
  await mongoose.disconnect();
}
run();
