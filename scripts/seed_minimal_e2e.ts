import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valgame';

async function upsertCollection(collectionName: string, filter: any, doc: any) {
  const col = mongoose.connection.collection(collectionName);
  const res = await col.updateOne(filter, { $set: doc }, { upsert: true });
  console.log(`Upsert ${collectionName} - matched:${res.matchedCount} modified:${res.modifiedCount} upsertedId:${(res as any).upsertedId}`);
}

async function main() {
  console.log('Conectando a', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  // 1) Game settings
  const gameSettings = {
    nivel_evolucion_etapa_2: 40,
    nivel_evolucion_etapa_3: 100,
    puntos_ranking_por_victoria: 10,
    costo_ticket_en_val: 50,
    nivel_maximo_personaje: 100,
    MAX_PERSONAJES_POR_EQUIPO: 9,
    EXP_GLOBAL_MULTIPLIER: 1,
    costo_revivir_personaje: 50,
    PERMADEATH_TIMER_HOURS: 24,
    aumento_stats_por_nivel: {
      D: { atk: 2, vida: 10, defensa: 2 },
      C: { atk: 3, vida: 15, defensa: 3 },
      B: { atk: 4, vida: 20, defensa: 4 },
      A: { atk: 5, vida: 25, defensa: 5 },
      S: { atk: 6, vida: 30, defensa: 6 }
    }
  };

  await upsertCollection('game_settings', {}, gameSettings);

  // 2) Level requirements (insert minimal levels)
  const levelCol = mongoose.connection.collection('level_requirements');
  await levelCol.deleteMany({});
  await levelCol.insertMany([
    { nivel: 1, experiencia_requerida: 0, experiencia_acumulada: 0 },
    { nivel: 2, experiencia_requerida: 200, experiencia_acumulada: 200 },
    { nivel: 3, experiencia_requerida: 500, experiencia_acumulada: 700 }
  ]);
  console.log('Inserted level_requirements 1..3');

  // 3) Items (Equipment + Consumable)
  const itemsCol = mongoose.connection.collection('items');
  const espada = {
    nombre: 'Espada de Prueba',
    descripcion: 'Espada de ejemplo para tests',
    rango: 'C',
    tipoItem: 'Equipment',
    costo_val: 100
  };
  const pocion = {
    nombre: 'Poción Mayor',
    descripcion: 'Recupera vida y aplica buff temporal',
    rango: 'D',
    tipoItem: 'Consumable',
    detalle_uso: 'Recupera 50 vida, 1 uso',
    costo_val: 10
  };

  await itemsCol.updateOne({ nombre: espada.nombre }, { $set: espada }, { upsert: true });
  await itemsCol.updateOne({ nombre: pocion.nombre }, { $set: pocion }, { upsert: true });
  const espadaDoc = await itemsCol.findOne({ nombre: espada.nombre }) as any | null;
  const pocionDoc = await itemsCol.findOne({ nombre: pocion.nombre }) as any | null;
  if (!espadaDoc || !pocionDoc) {
    throw new Error('No se pudieron crear los items necesarios (Espada/Poción)');
  }
  console.log('Items ready:', espadaDoc._id.toString(), pocionDoc._id.toString());

  // 4) Dungeon
  const dungeonsCol = mongoose.connection.collection('dungeons');
  const dungeonDoc = {
    nombre: 'Mazmorra de Prueba',
    descripcion: 'Mazmorra para pruebas E2E',
    stats: { vida: 500, ataque: 50, defensa: 20 },
    probabilidades: { fallo_ataque_jugador: 0.15, fallo_ataque_propio: 0.25 },
    recompensas: {
      expBase: 100,
      dropTable: [
        { itemId: espadaDoc._id, tipoItem: 'Equipment', probabilidad: 0.05 },
        { itemId: pocionDoc._id, tipoItem: 'Consumable', probabilidad: 0.3 }
      ]
    }
  };
  await dungeonsCol.updateOne({ nombre: dungeonDoc.nombre }, { $set: dungeonDoc }, { upsert: true });
  console.log('Dungeon upserted');

  // 5) Package (opcional)
  const packagesCol = mongoose.connection.collection('packages');
  const paquete = {
    nombre: 'Paquete Pionero',
    precio_usdt: 0,
    personajes: 1,
    categorias_garantizadas: ['D', 'C'],
    distribucion_aleatoria: 'uniform'
  };
  await packagesCol.updateOne({ nombre: paquete.nombre }, { $set: paquete }, { upsert: true });
  console.log('Package upserted');

  // 6) User de prueba
  const usersCol = mongoose.connection.collection('users');
  const userEmail = 'test+e2e@local';
  await usersCol.updateOne(
    { email: userEmail },
    {
      $set: {
        email: userEmail,
        username: 'test_e2e',
        passwordHash: 'hash-fake',
        isVerified: true,
        val: 100,
        boletos: 10,
        energia: 100,
        energiaMaxima: 100
      }
    },
    { upsert: true }
  );

  const userDoc = await usersCol.findOne({ email: userEmail });
  // Añadir personaje e inventario de forma idempotente
  await usersCol.updateOne(
    { email: userEmail },
    ({ $addToSet: { inventarioEquipamiento: espadaDoc._id } } as any)
  );
  await usersCol.updateOne(
    { email: userEmail },
    ({ $push: { personajes: {
      personajeId: 'test-char-1',
      rango: 'C',
      nivel: 1,
      etapa: 1,
      progreso: 0,
      experiencia: 0,
      stats: { atk: 10, vida: 100, defensa: 5 },
      saludActual: 100,
      saludMaxima: 100,
      estado: 'saludable',
      fechaHerido: null,
      equipamiento: [],
      activeBuffs: []
    } } } as any)
  );
  await usersCol.updateOne(
    { email: userEmail },
    ({ $push: { inventarioConsumibles: { consumableId: pocionDoc._id, usos_restantes: 1 } } } as any)
  );

  console.log('User seed completed');

  await mongoose.disconnect();
  console.log('Seed finished');
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
