require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/valgame').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  await User.updateOne({ email: 'finaltest@test.com' }, { $set: { isVerified: true } });
  console.log('✅ Usuario finaltest@test.com verificado');
  process.exit(0);
});
