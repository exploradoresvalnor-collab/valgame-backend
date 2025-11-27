const mongoose = require('mongoose');

// Conectar a MongoDB
async function verifyUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://exploradoresvalnor:E1UCa5f9rdwDcw5y@valnor.kspbuki.mongodb.net/Valnor?retryWrites=true&w=majority');
    
    // Buscar y verificar usuario
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      isVerified: Boolean,
      username: String
    }));
    
    const user = await User.findOne({ email: 'testuser123@example.com' });
    if (user) {
      user.isVerified = true;
      await user.save();
      console.log('✅ Usuario verificado:', user.username);
      console.log('Email:', user.email);
      console.log('Verificado:', user.isVerified);
    } else {
      console.log('❌ Usuario no encontrado');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyUser();
