require('dotenv').config();
const mongoose = require('mongoose');

const email = process.argv[2] || 'mchaustman@gmail.com';

async function quickVerify() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado');

    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      isVerified: Boolean,
      verificationToken: String,
      verificationTokenExpires: Date
    }));

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    console.log('Usuario encontrado:', user.email, 'Verificado:', user.isVerified);
    
    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
      console.log('✅ Usuario verificado');
    } else {
      console.log('ℹ️ Ya estaba verificado');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

quickVerify();
