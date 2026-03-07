const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valgame';

async function seedTestData() {
  console.log('Conectando a', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  // Crear usuario de prueba con personajes
  const userData = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'test@example.com',
    username: 'testuser',
    password: '$2a$10$hashedpassword', // password: 'password123'
    personajes: [
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        personajeId: 'char001',
        nombre: 'Héroe de Prueba',
        rango: 'D',
        nivel: 5,
        etapa: 1,
        experiencia: 100,
        stats: {
          salud: 100,
          ataque: 20,
          defensa: 15
        },
        saludActual: 100
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
        personajeId: 'char002',
        nombre: 'Guerrero Élite',
        rango: 'C',
        nivel: 10,
        etapa: 1,
        experiencia: 500,
        stats: {
          salud: 150,
          ataque: 30,
          defensa: 25
        },
        saludActual: 150
      }
    ],
    valBalance: 1000,
    inventarioEquipamiento: [],
    inventarioConsumibles: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insertar o actualizar usuario
  const usersCol = mongoose.connection.collection('users');
  await usersCol.updateOne(
    { email: 'test@example.com' },
    { $set: userData },
    { upsert: true }
  );

  console.log('Usuario de prueba creado/actualizado');

  // Crear token JWT simulado (en un caso real vendría del login)
  console.log('Usuario de prueba listo. Para probar:');
  console.log('- Email: test@example.com');
  console.log('- Personajes disponibles: 2');
  console.log('- IDs de personajes:', [
    '507f1f77bcf86cd799439012',
    '507f1f77bcf86cd799439013'
  ]);

  await mongoose.disconnect();
  console.log('Desconectado de MongoDB');
}

seedTestData().catch(console.error);