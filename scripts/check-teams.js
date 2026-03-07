const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

async function test() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/valnor';
    console.log('Using URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Ocultar credenciales

    await mongoose.connect(mongoUri);
    console.log('Connected successfully');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Collections:', collectionNames);

    if (collectionNames.includes('teams')) {
      console.log('✅ Teams collection exists');
      const count = await mongoose.connection.db.collection('teams').countDocuments();
      console.log('Documents in teams:', count);
    } else {
      console.log('❌ Teams collection does not exist');
    }

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('authentication failed')) {
      console.log('💡 Posible problema: Credenciales incorrectas en .env');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Posible problema: MongoDB no está corriendo o URI incorrecta');
    }
  }
}

test();