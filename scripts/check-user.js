const mongoose = require('mongoose');

async function checkUserCharacters() {
  try {
    await mongoose.connect('mongodb://localhost:27017/valnor');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId('6987f78fd2dfcf3a2917b799') },
      { projection: { personajes: 1 } }
    );

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User personajes array length:', user.personajes.length);
    console.log('First personaje:');
    console.log(JSON.stringify(user.personajes[0], null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserCharacters();