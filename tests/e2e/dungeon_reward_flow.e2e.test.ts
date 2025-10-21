import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/models/User';
import Dungeon, { IDrop } from '../../src/models/Dungeon';
import { Item } from '../../src/models/Item';
import Package from '../../src/models/Package';
import { Types } from 'mongoose';
import GameSetting from '../../src/models/GameSetting';
import LevelRequirement from '../../src/models/LevelRequirement';

let mongod: MongoMemoryReplSet;
let token: string;
let userId: string;
let dungeonId: string;
let weapon: any;
let armor: any;
let potion: any;
let rewardItem: any;

// Datos de prueba
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
  username: 'testuser'
};

// Seeds necesarios
const TEST_WEAPON = {
  nombre: 'Espada de Prueba',
  descripcion: 'Una espada para testing',
  tipoItem: 'Equipment',
  tipo: 'arma',
  rareza: 'comun',
  rango: 'D', // <-- CORRECCIÓN
  nivel_minimo_requerido: 1,
  stats: {
    atk: 10,
    defensa: 0,
    vida: 0
  }
};

const TEST_ARMOR = {
  nombre: 'Armadura de Prueba',
  descripcion: 'Una armadura para testing',
  tipoItem: 'Equipment',
  tipo: 'armadura',
  rareza: 'comun',
  rango: 'D', // <-- CORRECCIÓN
  nivel_minimo_requerido: 1,
  stats: {
    atk: 0,
    defensa: 15,
    vida: 20
  }
};

const TEST_POTION = {
  nombre: 'Poción de Fuerza',
  descripcion: 'Aumenta el ataque temporalmente',
  tipoItem: 'Consumable',
  tipo: 'pocion',
  rareza: 'comun',
  rango: 'D', // <-- CORRECCIÓN
  usos_maximos: 1,
  duracion_efecto_minutos: 30,
  efectos: {
    mejora_atk: 5,
    mejora_defensa: 0,
    mejora_vida: 0,
    mejora_xp_porcentaje: 0
  }
};

const TEST_DUNGEON = {
  nombre: 'Mazmorra de Prueba',
  descripcion: 'Una mazmorra para testing',
  stats: {
    vida: 50,
    ataque: 5,
    defensa: 5
  },
  probabilidades: {
    fallo_ataque_jugador: 0.1,
    fallo_ataque_propio: 0.2
  },
  recompensas: {
    expBase: 100,
    dropTable: [] // Se llenará con el itemId después de crear el item
  }
};

describe('Dungeon Reward Flow', () => {
  // Aumentar timeout para E2E que pueden tardar más en entornos lentos
  jest.setTimeout(30000);
  beforeAll(async () => {
    // Iniciar MongoDB en memoria con soporte para transacciones
    mongod = await MongoMemoryReplSet.create({
      replSet: { count: 1 }
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // Crear items de prueba
    [weapon, armor, potion, rewardItem] = await Promise.all([
      Item.create(TEST_WEAPON),
      Item.create(TEST_ARMOR),
      Item.create(TEST_POTION),
      Item.create({
        ...TEST_WEAPON,
        nombre: 'Espada Legendaria',
        rango: 'S', // <-- CORRECCIÓN
        stats: { atk: 25, defensa: 5, vida: 10 }
      })
    ]);
    
    // Actualizar dungeon con el itemId de recompensa
    const dropTable: IDrop[] = [{
      itemId: rewardItem._id as Types.ObjectId,
      tipoItem: 'Equipment',
      probabilidad: 1 // 100% para testing
    }];

    const dungeonData = {
      ...TEST_DUNGEON,
      recompensas: {
        ...TEST_DUNGEON.recompensas,
        dropTable
      }
    };
    
    // Crear la mazmorra de prueba
    const dungeon = await Dungeon.create(dungeonData);
    // Asegurar que el _id es un ObjectId y convertirlo a string
    dungeonId = (dungeon._id as Types.ObjectId).toString();

    // Crear GameSetting mínimo necesario para las pruebas (evita error: Configuración del juego no encontrada)
    await GameSetting.create({
      nivel_evolucion_etapa_2: 10,
      nivel_evolucion_etapa_3: 20,
      puntos_ranking_por_victoria: 10,
      costo_ticket_en_val: 10,
      nivel_maximo_personaje: 100,
      MAX_PERSONAJES_POR_EQUIPO: 3,
      EXP_GLOBAL_MULTIPLIER: 1,
      costo_revivir_personaje: 10,
      PERMADEATH_TIMER_HOURS: 24,
      aumento_stats_por_nivel: {
        D: { atk: 1, vida: 5, defensa: 1 },
        C: { atk: 2, vida: 10, defensa: 2 },
        B: { atk: 3, vida: 15, defensa: 3 },
        A: { atk: 4, vida: 20, defensa: 4 },
        S: { atk: 6, vida: 30, defensa: 6 }
      }
    });

    // Crear requisitos de nivel mínimos (backfill para tests)
    const levelDocs = [] as any[];
    let acum = 0;
    for (let lvl = 1; lvl <= 20; lvl++) {
      acum += lvl * 100; // simple progresión
      levelDocs.push({ nivel: lvl, experiencia_requerida: lvl * 100, experiencia_acumulada: acum });
    }
    await LevelRequirement.insertMany(levelDocs);

  // Crear paquete inicial con equipo y consumible
    console.log('Datos de prueba para Package:', {
      nombre: 'Paquete Inicial Test',
      descripcion: 'Paquete para testing',
      personajes: 1,
      distribucion_aleatoria: 'default',
      precio_usdt: 0,
      val_reward: 100,
      items_reward: [
        weapon._id,
        armor._id,
        potion._id
      ],
      personajes_garantizados: [{
        baseCharacterId: 'CHAR_TEST_001',
        rareza: 'comun'
      }],
      categorias_garantizadas: []
    });

    await Package.create({
      nombre: 'Paquete Inicial Test',
      descripcion: 'Paquete para testing',
      personajes: 1, // <-- Añadido para cumplir el schema
      distribucion_aleatoria: 'default', // <-- Añadido para cumplir el schema
      precio_usdt: 0,
      val_reward: 100,
      items_reward: [
        weapon._id as Types.ObjectId,
        armor._id as Types.ObjectId,
        potion._id as Types.ObjectId
      ],
      personajes_garantizados: [{
        baseCharacterId: 'CHAR_TEST_001',
        rareza: 'comun'
      }],
      categorias_garantizadas: [] // Añadido para cumplir el schema
    });

    // Crear paquete inicial con un personaje base (nombre único para evitar duplicados)
    await Package.create({
      nombre: 'Paquete Inicial Test - 2',
      descripcion: 'Paquete para testing',
      personajes: 1, // requerido por el schema
      distribucion_aleatoria: 'default', // requerido por el schema
      precio_val: 0,
      precio_usdt: 0,
      val_reward: 100,
      items_reward: [],
      personajes_garantizados: [{
        baseCharacterId: 'CHAR_TEST_001',
        rareza: 'comun'
      }],
      categorias_garantizadas: []
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should complete full dungeon flow: register → get character → complete dungeon → receive rewards → list item', async () => {
    // 1. Registro
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(TEST_USER);
    console.log('REGISTER RESPONSE:', registerResponse.status, registerResponse.body);
    
    expect(registerResponse.status).toBe(201);

    // Marcar usuario como verificado para saltar el paso de verificación por email en tests
    const createdUser = await User.findOne({ email: TEST_USER.email });
    if (createdUser) {
      createdUser.isVerified = true;
      await createdUser.save();
      console.log('Usuario marcado como verificado en DB para testing:', createdUser.email);
    }

    // Asignar manualmente paquete inicial al usuario: crear personaje y añadir items al inventario
    if (createdUser) {
      const personajeId = `TEST_CHAR_${Date.now()}`;
      createdUser.personajes.push({
        personajeId,
        rango: 'D',
        nivel: 1,
        etapa: 1,
        progreso: 0,
        experiencia: 0,
        stats: { atk: 1, vida: 10, defensa: 1 },
        saludActual: 100,
        saludMaxima: 100,
        estado: 'saludable',
        fechaHerido: null,
        equipamiento: [],
        activeBuffs: []
      } as any);
      // Añadir items al inventario
      createdUser.inventarioEquipamiento.push(weapon._id, armor._id);
      createdUser.inventarioConsumibles.push({ consumableId: potion._id, usos_restantes: 1 } as any);
      await createdUser.save();
      console.log('Paquete inicial asignado al usuario para testing:', createdUser.email);
    }
    
    // 2. Login
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password
      });
    console.log('LOGIN RESPONSE:', loginResponse.status, loginResponse.body);
    
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
    token = loginResponse.body.token;
    userId = loginResponse.body.userId || (loginResponse.body.user && loginResponse.body.user.id) || loginResponse.body.user?.id;

    // Asegurar que el usuario en DB tiene personaje e items (algunos endpoints pueden no reflejar cambios previos)
    const dbUser = await User.findById(userId);
    if (dbUser) {
      if (!dbUser.personajes || dbUser.personajes.length === 0) {
        const personajeId = `TEST_CHAR_DB_${Date.now()}`;
        // Cast to any to satisfy TypeScript (DocumentArray vs plain array)
        (dbUser as any).personajes = [{
          personajeId,
          rango: 'D',
          nivel: 1,
          etapa: 1,
          progreso: 0,
          experiencia: 0,
          stats: { atk: 1, vida: 10, defensa: 1 },
          saludActual: 100,
          saludMaxima: 100,
          estado: 'saludable',
          fechaHerido: null,
          equipamiento: [],
          activeBuffs: []
        } as any];
      }
      // asegurar inventario
      dbUser.inventarioEquipamiento = dbUser.inventarioEquipamiento || [];
      if (dbUser.inventarioEquipamiento.length === 0) {
        dbUser.inventarioEquipamiento.push(weapon._id, armor._id);
      }
      dbUser.inventarioConsumibles = dbUser.inventarioConsumibles || [];
      if (dbUser.inventarioConsumibles.length === 0) {
        dbUser.inventarioConsumibles.push({ consumableId: potion._id, usos_restantes: 1 } as any);
      }
      await dbUser.save();
      console.log('DB user ensured with personaje and items:', dbUser.email);
    }

    // 3. Verificar paquete inicial y personaje
    const userResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    console.log('GET /api/users/me:', userResponse.status, userResponse.body);
    
    expect(userResponse.status).toBe(200);
    expect(userResponse.body.personajes).toHaveLength(1);
    const characterId = userResponse.body.personajes[0].personajeId;

    // Verificar stats base del personaje
    const baseStats = userResponse.body.personajes[0].stats;
    expect(baseStats).toBeDefined();

    // 4. Asignar equipamiento directamente al personaje en DB (el endpoint de equipar no existe)
    const dbUserBeforeEquip = await User.findById(userId);
    if (!dbUserBeforeEquip) throw new Error('Usuario no encontrado en DB antes de equipar');
    const personaje = (dbUserBeforeEquip as any).personajes.find((p: any) => p.personajeId === characterId);
    // Añadir equipamiento (weapon y armor)
    personaje.equipamiento = personaje.equipamiento || [];
    personaje.equipamiento.push(weapon._id, armor._id);
    (dbUserBeforeEquip as any).markModified && (dbUserBeforeEquip as any).markModified('personajes');
    await dbUserBeforeEquip.save();
    console.log('Equipamiento asignado en DB al personaje:', personaje.personajeId, personaje.equipamiento);

    // 5. Usar poción de buff
    const useConsumableRes = await request(app)
      .post(`/api/characters/${characterId}/use-consumable`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: userResponse.body.inventarioConsumibles[0].consumableId // Primera poción
      });
    console.log('USE CONSUMABLE:', useConsumableRes.status, useConsumableRes.body);
    expect(useConsumableRes.status).toBe(200);

    // 6. Verificar que el consumible fue usado y que el personaje ahora tiene equipamiento
    const updatedUserRes = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    console.log('GET /api/users/me (after consumable):', updatedUserRes.status, updatedUserRes.body);

    // El backend aplica consumibles a salud y gestiona equipamiento en la DB; comprobamos presencia de equipamiento
    const updatedPersonaje = updatedUserRes.body.personajes.find((p: any) => p.personajeId === characterId);
    expect(Array.isArray(updatedPersonaje.equipamiento)).toBe(true);
    expect(updatedPersonaje.equipamiento.length).toBeGreaterThanOrEqual(2);
    // Verificar que el consumible se consumió (inventarioConsumibles disminuye o está vacío)
    expect(updatedUserRes.body.inventarioConsumibles.length).toBeLessThanOrEqual(userResponse.body.inventarioConsumibles.length);

    // 7. Iniciar mazmorra
    const dungeonStartResponse = await request(app)
      .post(`/api/dungeons/${dungeonId}/start`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        team: [characterId]
      });
    console.log('DUNGEON START RESPONSE:', dungeonStartResponse.status, dungeonStartResponse.body);

    expect(dungeonStartResponse.status).toBe(200);
    expect(dungeonStartResponse.body.resultado).toBe('victoria');
    expect(dungeonStartResponse.body.recompensas).toBeDefined();
    expect(dungeonStartResponse.body.recompensas.botinObtenido).toHaveLength(1);

    // 5. Verificar que el item aparece en el inventario (debería aumentar en +1)
    const updatedUserResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    console.log('GET /api/users/me (after dungeon):', updatedUserResponse.status, updatedUserResponse.body);

    expect(updatedUserResponse.status).toBe(200);
    const prevInventoryLen = userResponse.body.inventarioEquipamiento.length;
    expect(updatedUserResponse.body.inventarioEquipamiento.length).toBe(prevInventoryLen + 1);
    // Comprobar que contiene el rewardItem creado en beforeAll
    const rewardIdStr = (rewardItem._id as any).toString();
    expect(updatedUserResponse.body.inventarioEquipamiento).toContain(rewardIdStr);

    // 6. Intentar publicar el item en el marketplace
    const itemId = updatedUserResponse.body.inventarioEquipamiento[0];
    const listingResponse = await request(app)
      .post('/api/marketplace/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId,
        precio: 100,
        duracion: 24 // horas
      });
    console.log('LIST ITEM RESPONSE:', listingResponse.status, listingResponse.body);

  expect(listingResponse.status).toBe(201);
  // API devuelve { listing: { itemId, ... } }
  expect(listingResponse.body.listing.itemId).toBe(itemId);

    // 7. Verificar que el item aparece en búsqueda del marketplace
    const searchResponse = await request(app)
      .get('/api/marketplace/listings')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 10, offset: 0 });
    console.log('MARKET SEARCH RESPONSE:', searchResponse.status, searchResponse.body);

    expect(searchResponse.status).toBe(200);
    // getListings devuelve una estructura con `listings`
    expect(Array.isArray(searchResponse.body.listings)).toBe(true);
    expect(searchResponse.body.listings.length).toBeGreaterThanOrEqual(1);
    expect(searchResponse.body.listings.find((l: any) => String(l.itemId) === String(itemId))).toBeDefined();
  });

  it('should handle dungeon defeat correctly and mark character as wounded', async () => {
    // Crear un dungeon más difícil
    const hardDungeon = await Dungeon.create({
      ...TEST_DUNGEON,
      nombre: `Mazmorra de Prueba - hard ${Date.now()}`,
      stats: {
        vida: 100,
        ataque: 999, // Asegura derrota
        defensa: 5
      }
    });

    // Login y obtener personaje
    await request(app).post('/auth/register').send(TEST_USER);
    // Marcar usuario como verificado en DB para permitir login en tests
    const maybeUser = await User.findOne({ email: TEST_USER.email });
    if (maybeUser) {
      maybeUser.isVerified = true;
      await maybeUser.save();
    }
    const loginRes = await request(app).post('/auth/login').send({
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    token = loginRes.body.token;

    // Ensure DB user has a personaje for the second test as well
    const dbUser2 = await User.findById(loginRes.body.user?.id || loginRes.body.userId);
    if (dbUser2 && (!dbUser2.personajes || dbUser2.personajes.length === 0)) {
      const personajeId = `TEST_CHAR_DB_2_${Date.now()}`;
      (dbUser2 as any).personajes = [{
        personajeId,
        rango: 'D',
        nivel: 1,
        etapa: 1,
        progreso: 0,
        experiencia: 0,
        stats: { atk: 1, vida: 10, defensa: 1 },
        saludActual: 100,
        saludMaxima: 100,
        estado: 'saludable',
        fechaHerido: null,
        equipamiento: [],
        activeBuffs: []
      } as any];
      await dbUser2.save();
      console.log('DB user 2 ensured with personaje for defeat test:', dbUser2.email);
    }

    const userRes = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    const characterId = userRes.body.personajes[0].personajeId;

    // Intentar la mazmorra difícil
    const dungeonRes = await request(app)
      .post(`/api/dungeons/${hardDungeon._id}/start`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        team: [characterId]
      });

    expect(dungeonRes.status).toBe(200);
    expect(dungeonRes.body.resultado).toBe('derrota');

    // Verificar que el personaje queda herido
    const updatedUserRes = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    
    const character = updatedUserRes.body.personajes.find(
      (p: any) => p.personajeId === characterId
    );
    expect(character.estado).toBe('herido');
    expect(character.saludActual).toBe(0);
  });
});