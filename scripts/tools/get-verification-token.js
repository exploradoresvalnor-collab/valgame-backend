const mongoose = require('mongoose');

// Conectar a MongoDB y obtener token de verificación
async function getVerificationToken() {
  try {
    await mongoose.connect('mongodb+srv://exploradoresvalnor:E1UCa5f9rdwDcw5y@valnor.kspbuki.mongodb.net/Valnor?retryWrites=true&w=majority&appName=Valnor');
    
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      verificationToken: String,
      verificationTokenExpires: Date,
      username: String
    }));
    
    const user = await User.findOne({ email: 'testuser123@example.com' });
    if (user) {
      console.log('Token de verificación:', user.verificationToken);
      console.log('Expira:', user.verificationTokenExpires);
    } else {
      console.log('Usuario no encontrado');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getVerificationToken();
