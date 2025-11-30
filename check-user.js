const mongoose = require('mongoose');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const user = await db.collection('users').findOne({ 
      email: 'proyectoagesh@gmail.com' 
    });
    
    if (user) {
      console.log('\n✅ USUARIO ENCONTRADO:');
      console.log('ID:', user._id);
      console.log('Email:', user.email);
      console.log('Username:', user.username);
      console.log('isVerified:', user.isVerified);
      console.log('Creado:', user.createdAt);
    } else {
      console.log('\n❌ Usuario NO encontrado en MongoDB');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser();
