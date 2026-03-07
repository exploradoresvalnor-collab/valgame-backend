const mongoose = require('mongoose');
const path = require('path');

// Configuración para MongoDB local
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/valgame';

async function setupLocalMongoDB() {
  console.log('🔧 Configurando MongoDB Local para Valgame...\n');

  try {
    console.log('📡 Intentando conectar a MongoDB local...');
    await mongoose.connect(LOCAL_MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB local\n');

    // Crear usuario de prueba
    const userData = {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: '$2a$10$hashedpassword', // password: 'password123'
      isVerified: true,
      tutorialCompleted: true,
      personajes: [
        {
          _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          personajeId: 'char001',
          nombre: 'Héroe de Prueba',
          rango: 'D',
          nivel: 5,
          etapa: 1,
          experiencia: 100,
          stats: { salud: 100, ataque: 20, defensa: 15 },
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
          stats: { salud: 150, ataque: 30, defensa: 25 },
          saludActual: 150
        }
      ],
      valBalance: 1000,
      inventarioEquipamiento: [],
      inventarioConsumibles: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insertar usuario
    const usersCol = mongoose.connection.collection('users');
    await usersCol.updateOne(
      { email: 'test@example.com' },
      { $set: userData },
      { upsert: true }
    );

    console.log('✅ Usuario de prueba creado');

    // Crear game settings básicos
    const gameSettings = {
      nivel_evolucion_etapa_2: 40,
      nivel_evolucion_etapa_3: 100,
      puntos_ranking_por_victoria: 10,
      costo_ticket_en_val: 50,
      nivel_maximo_personaje: 100,
      MAX_PERSONAJES_POR_EQUIPO: 9,
      EXP_GLOBAL_MULTIPLIER: 1,
      costo_revivir_personaje: 50,
      PERMADEATH_TIMER_HOURS: 24
    };

    const gameSettingsCol = mongoose.connection.collection('game_settings');
    await gameSettingsCol.updateOne({}, { $set: gameSettings }, { upsert: true });

    console.log('✅ Configuración del juego creada');

    await mongoose.disconnect();

    console.log('\n🎉 ¡MongoDB configurado exitosamente!');
    console.log('\n📋 Para usar con tu aplicación:');
    console.log('1. Cambia en .env: MONGODB_URI=mongodb://localhost:27017/valgame');
    console.log('2. Reinicia el servidor: npm run dev');
    console.log('3. El sistema funcionará con base de datos real');

  } catch (error) {
    console.error('❌ Error configurando MongoDB:', error.message);
    console.log('\n🔍 Soluciones:');
    console.log('1. Asegúrate de que MongoDB esté instalado y ejecutándose');
    console.log('2. Verifica que el puerto 27017 esté disponible');
    console.log('3. O usa el modo desarrollo (sin cambios en .env)');
  }
}

setupLocalMongoDB();