const request = require('supertest');
require('dotenv').config();

const BASE_URL = 'http://localhost:8080';

describe('🎮 FLUJO COMPLETO DEL JUEGO', () => {
  let token;
  let userId;
  let personajeId;
  let equipamientoId;
  let consumibleId;
  let dungeonId;

  // Datos del usuario de prueba
  const testUser = {
    email: 'proyectoagesh@gmail.com',
    password: '123456'
  };

  beforeAll(() => {
    console.log('\n🎯 Iniciando test del flujo completo del juego...\n');
  });

  // ===== PASO 1: LOGIN =====
  test('1️⃣ LOGIN - Debe iniciar sesión correctamente', async () => {
    console.log('\n--- PASO 1: LOGIN ---');
    
    const res = await request(BASE_URL)
      .post('/auth/login')
      .send(testUser)
      .expect(200);

    expect(res.body.message).toBe('Login exitoso');
    expect(res.body.user).toBeDefined();
    
    // Extraer token de la cookie
    const cookies = res.headers['set-cookie'];
    token = cookies[0].split(';')[0].split('=')[1];
    userId = res.body.user.id;

    console.log('✅ Login exitoso');
    console.log(`   Usuario: ${res.body.user.username}`);
    console.log(`   VAL: ${res.body.user.val}`);
    console.log(`   Boletos: ${res.body.user.boletos}`);
    console.log(`   EVO: ${res.body.user.evo}`);
    console.log(`   Personajes: ${res.body.user.personajes.length}`);
    console.log(`   Equipamiento: ${res.body.user.inventarioEquipamiento.length}`);
    console.log(`   Consumibles: ${res.body.user.inventarioConsumibles.length}`);

    // Guardar IDs para usar después
    personajeId = res.body.user.personajes[0].personajeId;
    equipamientoId = res.body.user.inventarioEquipamiento[0];
    consumibleId = res.body.user.inventarioConsumibles[0].consumableId;
  });

  // ===== PASO 2: VER INVENTARIO =====
  test('2️⃣ INVENTARIO - Debe mostrar el inventario completo', async () => {
    console.log('\n--- PASO 2: INVENTARIO ---');
    
    const res = await request(BASE_URL)
      .get('/api/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    console.log('✅ Inventario obtenido');
    console.log(`   Personaje: ${res.body.personajes[0].personajeId} (Nivel ${res.body.personajes[0].nivel})`);
    console.log(`   Salud: ${res.body.personajes[0].saludActual}/${res.body.personajes[0].saludMaxima}`);
    console.log(`   Stats: ATK=${res.body.personajes[0].stats.atk}, DEF=${res.body.personajes[0].stats.defensa}, VIDA=${res.body.personajes[0].stats.vida}`);
  });

  // ===== PASO 3: EQUIPAR ARMA =====
  test('3️⃣ EQUIPAR - Debe equipar la Daga Oxidada al personaje', async () => {
    console.log('\n--- PASO 3: EQUIPAR ARMA ---');
    
    const res = await request(BASE_URL)
      .post(`/api/characters/${personajeId}/equip`)
      .set('Cookie', `token=${token}`)
      .send({ itemId: equipamientoId })
      .expect(200);

    console.log('✅ Arma equipada exitosamente');
    console.log(`   ${res.body.message}`);
    if (res.body.newStats) {
      console.log(`   Nuevos stats: ATK=${res.body.newStats.atk}, DEF=${res.body.newStats.defensa}, VIDA=${res.body.newStats.vida}`);
    }
  });

  // ===== PASO 4: VER STATS MEJORADOS =====
  test('4️⃣ STATS - Debe mostrar stats mejorados con equipamiento', async () => {
    console.log('\n--- PASO 4: STATS CON EQUIPAMIENTO ---');
    
    const res = await request(BASE_URL)
      .get(`/api/characters/${personajeId}/stats`)
      .set('Cookie', `token=${token}`)
      .expect(200);

    console.log('✅ Stats calculados:');
    console.log(`   ATK: ${res.body.stats.atk} (Base: ${res.body.baseStats?.atk || 'N/A'})`);
    console.log(`   DEF: ${res.body.stats.defensa} (Base: ${res.body.baseStats?.defensa || 'N/A'})`);
    console.log(`   VIDA: ${res.body.stats.vida} (Base: ${res.body.baseStats?.vida || 'N/A'})`);
    
    if (res.body.equipmentBonus) {
      console.log(`   Bonus de equipamiento: +${res.body.equipmentBonus.atk || 0} ATK, +${res.body.equipmentBonus.defensa || 0} DEF`);
    }
  });

  // ===== PASO 5: SIMULAR DAÑO =====
  test('5️⃣ DAÑO - Debe recibir daño el personaje', async () => {
    console.log('\n--- PASO 5: SIMULAR DAÑO ---');
    
    const res = await request(BASE_URL)
      .post(`/api/characters/${personajeId}/damage`)
      .set('Cookie', `token=${token}`)
      .send({ damage: 10 })
      .expect(200);

    console.log('✅ Daño aplicado');
    console.log(`   ${res.body.message}`);
    console.log(`   Salud: ${res.body.saludActual}/${res.body.saludMaxima}`);
  });

  // ===== PASO 6: USAR POCIÓN (SE DEBE BORRAR) =====
  test('6️⃣ CONSUMIBLE - Debe usar poción y eliminarla del inventario', async () => {
    console.log('\n--- PASO 6: USAR POCIÓN ---');
    
    // Ver inventario antes
    const before = await request(BASE_URL)
      .get('/api/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    const consumiblesAntes = before.body.inventarioConsumibles.length;
    console.log(`   Pociones antes: ${consumiblesAntes}`);

    // Usar poción
    const res = await request(BASE_URL)
      .post(`/api/characters/${personajeId}/use-consumable`)
      .set('Cookie', `token=${token}`)
      .send({ itemId: consumibleId })
      .expect(200);

    console.log('✅ Poción usada');
    console.log(`   ${res.body.message}`);
    console.log(`   Salud después: ${res.body.saludActual}`);

    // Verificar inventario después
    const after = await request(BASE_URL)
      .get('/api/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    const consumiblesDespues = after.body.inventarioConsumibles.length;
    console.log(`   Pociones después: ${consumiblesDespues}`);
    
    expect(consumiblesDespues).toBe(consumiblesAntes - 1);
    console.log('   ✅ La poción se eliminó correctamente del inventario');
  });

  // ===== PASO 7: HACER MÁS DAÑO (HASTA HERIR) =====
  test('7️⃣ HERIR - Debe herir al personaje (salud = 0)', async () => {
    console.log('\n--- PASO 7: HERIR PERSONAJE ---');
    
    const res = await request(BASE_URL)
      .post(`/api/characters/${personajeId}/damage`)
      .set('Cookie', `token=${token}`)
      .send({ damage: 100 })
      .expect(200);

    console.log('✅ Personaje herido');
    console.log(`   Salud: ${res.body.saludActual}/${res.body.saludMaxima}`);
  });

  // ===== PASO 8: REVIVIR PAGANDO VAL =====
  test('8️⃣ REVIVIR - Debe revivir al personaje pagando VAL', async () => {
    console.log('\n--- PASO 8: REVIVIR PERSONAJE ---');
    
    // Ver VAL antes
    const before = await request(BASE_URL)
      .get('/api/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    const valAntes = before.body.val;
    console.log(`   VAL antes: ${valAntes}`);

    // Revivir
    const res = await request(BASE_URL)
      .post(`/api/characters/${personajeId}/revive`)
      .set('Cookie', `token=${token}`)
      .expect(200);

    console.log('✅ Personaje revivido');
    console.log(`   ${res.body.message}`);
    if (res.body.costePagado) {
      console.log(`   Coste pagado: ${res.body.costePagado} VAL`);
    }

    // Verificar VAL después
    const after = await request(BASE_URL)
      .get('/api/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    const valDespues = after.body.val;
    console.log(`   VAL después: ${valDespues}`);
    console.log(`   Estado: ${after.body.personajes[0].estado}`);
    
    expect(valDespues).toBeLessThan(valAntes);
    console.log('   ✅ VAL descontado correctamente');
  });

  // ===== PASO 9: DAÑAR Y CURAR PAGANDO VAL =====
  test('9️⃣ CURAR - Debe curar al personaje pagando VAL', async () => {
    console.log('\n--- PASO 9: CURAR PERSONAJE ---');
    
    // Hacer daño primero
    await request(BASE_URL)
      .post(`/api/characters/${personajeId}/damage`)
      .set('Cookie', `token=${token}`)
      .send({ damage: 15 })
      .expect(200);

    // Ver VAL antes
    const before = await request(BASE_URL)
      .get('/api/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    const valAntes = before.body.val;
    const saludAntes = before.body.personajes[0].saludActual;
    console.log(`   VAL antes: ${valAntes}`);
    console.log(`   Salud antes: ${saludAntes}/${before.body.personajes[0].saludMaxima}`);

    // Curar
    const res = await request(BASE_URL)
      .post(`/api/characters/${personajeId}/heal`)
      .set('Cookie', `token=${token}`)
      .expect(200);

    console.log('✅ Personaje curado');
    console.log(`   ${res.body.message}`);
    if (res.body.costePagado) {
      console.log(`   Coste pagado: ${res.body.costePagado} VAL`);
    }

    // Verificar después
    const after = await request(BASE_URL)
      .get('/api/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    const valDespues = after.body.val;
    const saludDespues = after.body.personajes[0].saludActual;
    console.log(`   VAL después: ${valDespues}`);
    console.log(`   Salud después: ${saludDespues}/${after.body.personajes[0].saludMaxima}`);
    
    expect(valDespues).toBeLessThan(valAntes);
    expect(saludDespues).toBeGreaterThan(saludAntes);
    console.log('   ✅ VAL descontado y salud restaurada');
  });

  // ===== PASO 10: LISTAR MAZMORRAS =====
  test('🔟 MAZMORRAS - Debe listar las mazmorras disponibles', async () => {
    console.log('\n--- PASO 10: LISTAR MAZMORRAS ---');
    
    const res = await request(BASE_URL)
      .get('/api/dungeons')
      .set('Cookie', `token=${token}`)
      .expect(200);

    console.log('✅ Mazmorras disponibles:');
    res.body.forEach((dungeon, i) => {
      console.log(`   ${i + 1}. ${dungeon.nombre} (${dungeon.dificultad})`);
      console.log(`      Recompensas: ${dungeon.recompensas?.val || 0} VAL`);
    });

    dungeonId = res.body[0]._id;
  });

  // ===== PASO 11: ENTRAR A MAZMORRA =====
  test('1️⃣1️⃣ COMBATE - Debe entrar a la mazmorra y combatir', async () => {
    console.log('\n--- PASO 11: ENTRAR A MAZMORRA ---');
    
    const res = await request(BASE_URL)
      .post(`/api/dungeons/${dungeonId}/start`)
      .set('Cookie', `token=${token}`)
      .send({ personajeId })
      .expect(200);

    console.log('✅ Mazmorra iniciada');
    console.log(`   ${res.body.message || 'Combate en progreso'}`);
    
    if (res.body.resultado) {
      console.log(`   Resultado: ${res.body.resultado}`);
    }
    
    if (res.body.recompensas) {
      console.log('   🎁 Recompensas obtenidas:');
      if (res.body.recompensas.val) console.log(`      💰 ${res.body.recompensas.val} VAL`);
      if (res.body.recompensas.evo) console.log(`      ⚡ ${res.body.recompensas.evo} EVO`);
      if (res.body.recompensas.items) console.log(`      📦 ${res.body.recompensas.items.length} items`);
    }
  });

  // ===== PASO 12: VERIFICAR RECOMPENSAS =====
  test('1️⃣2️⃣ RECOMPENSAS - Debe haber recibido recompensas', async () => {
    console.log('\n--- PASO 12: VERIFICAR RECOMPENSAS ---');
    
    const res = await request(BASE_URL)
      .get('/api/users/me')
      .set('Cookie', `token=${token}`)
      .expect(200);

    console.log('✅ Inventario final:');
    console.log(`   VAL: ${res.body.val}`);
    console.log(`   Boletos: ${res.body.boletos}`);
    console.log(`   EVO: ${res.body.evo}`);
    console.log(`   Personaje nivel: ${res.body.personajes[0].nivel}`);
    console.log(`   Personaje salud: ${res.body.personajes[0].saludActual}/${res.body.personajes[0].saludMaxima}`);
    console.log(`   Personaje estado: ${res.body.personajes[0].estado}`);
    console.log(`   Equipamiento: ${res.body.inventarioEquipamiento.length} items`);
    console.log(`   Consumibles: ${res.body.inventarioConsumibles.length} items`);
  });

  afterAll(() => {
    console.log('\n✅ Test del flujo completo finalizado\n');
  });
});
