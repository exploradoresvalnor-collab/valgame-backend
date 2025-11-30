const mongoose = require('mongoose');
require('dotenv').config();

async function manuallyDeliverPioneerPackage() {
  try {
    console.log('\n🎁 ENTREGANDO PAQUETE PIONERO MANUALMENTE...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Obtener el usuario
    const user = await db.collection('users').findOne({ 
      email: 'proyectoagesh@gmail.com' 
    });
    
    if (!user) {
      console.log('❌ Usuario NO encontrado');
      process.exit(1);
    }
    
    console.log('✅ Usuario encontrado:', user.username);
    
    // 1. Obtener un personaje base
    const baseChar = await db.collection('basecharacters').findOne({});
    if (!baseChar) {
      console.log('❌ No hay BaseCharacters en la BD');
      process.exit(1);
    }
    console.log('✅ Personaje base seleccionado:', baseChar.nombre);
    
    // 2. Crear el personaje
    const pioneerCharacter = {
      personajeId: baseChar._id,
      rango: 'D',
      nivel: 1,
      etapa: 1,
      progreso: 0,
      stats: baseChar.stats,
      saludActual: baseChar.stats.vida,
      saludMaxima: baseChar.stats.vida,
      estado: 'saludable',
      fechaHerido: null,
      equipamiento: [],
      activeBuffs: []
    };
    
    // 3. Obtener una pociónutton
    const potion = await db.collection('consumables').findOne({ 
      tipo: 'pocion' 
    });
    
    // 4. Obtener un arma
    const weapon = await db.collection('equipment').findOne({ 
      tipo: 'arma'
    });
    
    console.log('✅ Poción encontrada:', potion?.nombre);
    console.log('✅ Arma encontrada:', weapon?.nombre);
    
    // 5. Actualizar el usuario
    const updateData = {
      $set: {
        'val': 100,
        'evo': 2,
        'boletos': 10,
        'energia': 100,
        'energiaMaxima': 100,
        'receivedPioneerPackage': true
      },
      $push: {
        'personajes': pioneerCharacter,
      },
    };
    
    // Agregar pociones
    if (potion) {
      for (let i = 0; i < 3; i++) {
        updateData.$push.inventarioConsumibles = {
          consumableId: potion._id,
          usos_restantes: potion.usos_maximos || 1
        };
      }
    }
    
    // Agregar arma
    if (weapon) {
      updateData.$push.inventarioEquipamiento = weapon._id;
    }
    
    const result = await db.collection('users').updateOne(
      { email: 'proyectoagesh@gmail.com' },
      updateData
    );
    
    console.log('\n📦 RECOMPENSAS ENTREGADAS:\n');
    console.log('  ✅ 100 VAL');
    console.log('  ✅ 2 EVO');
    console.log('  ✅ 10 Boletos');
    console.log('  ✅ 100 Energía');
    console.log('  ✅ Personaje:', baseChar.nombre);
    console.log('  ✅ 3x Pociones');
    console.log('  ✅ 1x Arma:', weapon?.nombre || 'N/A');
    
    console.log('\n✅ PAQUETE PIONERO ENTREGADO EXITOSAMENTE\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

manuallyDeliverPioneerPackage();
