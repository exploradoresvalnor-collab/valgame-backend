require('dotenv').config();
const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN AUXILIAR: Obtener IDs de items por nombre
// ═══════════════════════════════════════════════════════════════
async function getItemIdByName(collection, nombre) {
  const item = await collection.findOne({ nombre });
  return item ? item._id : null;
}

// ═══════════════════════════════════════════════════════════════
// CREAR MAZMORRAS CON DROP TABLES
// ═══════════════════════════════════════════════════════════════
async function createDungeons() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const itemsCollection = db.collection('items');
    const dungeonsCollection = db.collection('dungeons');

    console.log('📦 Obteniendo IDs de items para drop tables...\n');

    // Obtener IDs de items para drops
    const itemIds = {
      // Equipamiento común
      dagaOxidada: await getItemIdByName(itemsCollection, "Daga Oxidada"),
      armaduraCuero: await getItemIdByName(itemsCollection, "Armadura de Cuero"),
      escudoMadera: await getItemIdByName(itemsCollection, "Escudo de Madera"),
      
      // Equipamiento intermedio
      espadaAcero: await getItemIdByName(itemsCollection, "Espada de Acero"),
      cotaMallas: await getItemIdByName(itemsCollection, "Cota de Mallas"),
      espadaFlamigera: await getItemIdByName(itemsCollection, "Espada Flamígera"),
      armaduraPlacas: await getItemIdByName(itemsCollection, "Armadura de Placas Reforzadas"),
      anilloFuerza: await getItemIdByName(itemsCollection, "Anillo de Fuerza"),
      
      // Equipamiento épico
      katanaDragon: await getItemIdByName(itemsCollection, "Katana del Dragón"),
      armaduraGuardian: await getItemIdByName(itemsCollection, "Armadura del Guardián"),
      
      // Equipamiento legendario
      guadanaCaos: await getItemIdByName(itemsCollection, "Guadaña del Caos"),
      escudoTitan: await getItemIdByName(itemsCollection, "Escudo del Titán"),
      anilloFenix: await getItemIdByName(itemsCollection, "Anillo del Fénix"),
      
      // Consumibles
      pocionVidaMenor: await getItemIdByName(itemsCollection, "Poción de Vida Menor"),
      pocionVida: await getItemIdByName(itemsCollection, "Poción de Vida"),
      pocionVidaMayor: await getItemIdByName(itemsCollection, "Poción de Vida Mayor"),
      elixirResurreccion: await getItemIdByName(itemsCollection, "Elixir de Resurrección"),
      panCampo: await getItemIdByName(itemsCollection, "Pan de Campo"),
      carneAsada: await getItemIdByName(itemsCollection, "Carne Asada"),
      festinGuerrero: await getItemIdByName(itemsCollection, "Festín del Guerrero"),
      pergaminoSabiduria: await getItemIdByName(itemsCollection, "Pergamino de Sabiduría"),
      pergaminoMaestria: await getItemIdByName(itemsCollection, "Pergamino de Maestría"),
      tomoAncestral: await getItemIdByName(itemsCollection, "Tomo Ancestral"),
      frutoPoder: await getItemIdByName(itemsCollection, "Fruto del Poder"),
      frutoVitalidad: await getItemIdByName(itemsCollection, "Fruto de la Vitalidad"),
      frutoDivino: await getItemIdByName(itemsCollection, "Fruto Divino")
    };

    // ═══════════════════════════════════════════════════════════════
    // MAZMORRAS (5 niveles de dificultad)
    // ═══════════════════════════════════════════════════════════════
    
    const mazmorras = [
      // NIVEL 1: Principiante (Nivel recomendado: 1-15)
      {
        nombre: "Cueva de los Goblins",
        descripcion: "Una cueva oscura infestada de goblins débiles. Ideal para novatos.",
        nivel_requerido_minimo: 1,
        stats: {
          vida: 150,
          ataque: 15,
          defensa: 10
        },
        probabilidades: {
          fallo_ataque_jugador: 0.10, // 10% de fallar
          fallo_ataque_propio: 0.30   // 30% de fallar
        },
        recompensas: {
          expBase: 50,
          valBase: 10, // Bajo para mantener economía escasa
          dropTable: [
            { itemId: itemIds.pocionVidaMenor, tipoItem: "Consumable", probabilidad: 0.50 }, // 50%
            { itemId: itemIds.panCampo, tipoItem: "Consumable", probabilidad: 0.40 },        // 40%
            { itemId: itemIds.dagaOxidada, tipoItem: "Equipment", probabilidad: 0.15 },      // 15%
            { itemId: itemIds.armaduraCuero, tipoItem: "Equipment", probabilidad: 0.15 },    // 15%
            { itemId: itemIds.escudoMadera, tipoItem: "Equipment", probabilidad: 0.10 }      // 10%
          ]
        },
        nivel_sistema: {
          multiplicador_stats_por_nivel: 0.15,
          multiplicador_val_por_nivel: 0.10,
          multiplicador_xp_por_nivel: 0.10,
          multiplicador_drop_por_nivel: 0.05,
          nivel_maximo_recomendado: 50
        },
        nivel_minimo_para_exclusivos: 20
      },

      // NIVEL 2: Intermedio (Nivel recomendado: 15-30)
      {
        nombre: "Bosque Maldito",
        descripcion: "Un bosque encantado con criaturas corruptas y espíritus vengativos.",
        nivel_requerido_minimo: 10,
        stats: {
          vida: 400,
          ataque: 30,
          defensa: 25
        },
        probabilidades: {
          fallo_ataque_jugador: 0.15,
          fallo_ataque_propio: 0.25
        },
        recompensas: {
          expBase: 150,
          valBase: 25,
          dropTable: [
            { itemId: itemIds.pocionVida, tipoItem: "Consumable", probabilidad: 0.60 },
            { itemId: itemIds.carneAsada, tipoItem: "Consumable", probabilidad: 0.35 },
            { itemId: itemIds.pergaminoSabiduria, tipoItem: "Consumable", probabilidad: 0.20 },
            { itemId: itemIds.espadaAcero, tipoItem: "Equipment", probabilidad: 0.25 },
            { itemId: itemIds.cotaMallas, tipoItem: "Equipment", probabilidad: 0.25 },
            { itemId: itemIds.espadaFlamigera, tipoItem: "Equipment", probabilidad: 0.08 }
          ]
        },
        nivel_sistema: {
          multiplicador_stats_por_nivel: 0.15,
          multiplicador_val_por_nivel: 0.10,
          multiplicador_xp_por_nivel: 0.10,
          multiplicador_drop_por_nivel: 0.05,
          nivel_maximo_recomendado: 50
        },
        nivel_minimo_para_exclusivos: 20
      },

      // NIVEL 3: Avanzado (Nivel recomendado: 30-50)
      {
        nombre: "Fortaleza del Caballero Negro",
        descripcion: "Una fortaleza abandonada protegida por el espíritu de un caballero caído.",
        nivel_requerido_minimo: 20,
        stats: {
          vida: 800,
          ataque: 50,
          defensa: 45
        },
        probabilidades: {
          fallo_ataque_jugador: 0.20,
          fallo_ataque_propio: 0.20
        },
        recompensas: {
          expBase: 350,
          valBase: 50,
          dropTable: [
            { itemId: itemIds.pocionVidaMayor, tipoItem: "Consumable", probabilidad: 0.50 },
            { itemId: itemIds.festinGuerrero, tipoItem: "Consumable", probabilidad: 0.30 },
            { itemId: itemIds.pergaminoMaestria, tipoItem: "Consumable", probabilidad: 0.15 },
            { itemId: itemIds.armaduraPlacas, tipoItem: "Equipment", probabilidad: 0.30 },
            { itemId: itemIds.anilloFuerza, tipoItem: "Equipment", probabilidad: 0.20 },
            { itemId: itemIds.katanaDragon, tipoItem: "Equipment", probabilidad: 0.05 }
          ]
        },
        nivel_sistema: {
          multiplicador_stats_por_nivel: 0.15,
          multiplicador_val_por_nivel: 0.10,
          multiplicador_xp_por_nivel: 0.10,
          multiplicador_drop_por_nivel: 0.05,
          nivel_maximo_recomendado: 50
        },
        nivel_minimo_para_exclusivos: 20
      },

      // NIVEL 4: Épico (Nivel recomendado: 50-70)
      {
        nombre: "Templo del Dragón Ancestral",
        descripcion: "Un templo sagrado custodiado por un dragón milenario. Solo los valientes entran.",
        nivel_requerido_minimo: 30,
        stats: {
          vida: 1500,
          ataque: 80,
          defensa: 70
        },
        probabilidades: {
          fallo_ataque_jugador: 0.25,
          fallo_ataque_propio: 0.15
        },
        recompensas: {
          expBase: 750,
          valBase: 100,
          dropTable: [
            { itemId: itemIds.elixirResurreccion, tipoItem: "Consumable", probabilidad: 0.40 },
            { itemId: itemIds.tomoAncestral, tipoItem: "Consumable", probabilidad: 0.25 },
            { itemId: itemIds.katanaDragon, tipoItem: "Equipment", probabilidad: 0.35 },
            { itemId: itemIds.armaduraGuardian, tipoItem: "Equipment", probabilidad: 0.30 },
            { itemId: itemIds.guadanaCaos, tipoItem: "Equipment", probabilidad: 0.10 },
            { itemId: itemIds.frutoPoder, tipoItem: "Consumable", probabilidad: 0.08 },
            { itemId: itemIds.frutoVitalidad, tipoItem: "Consumable", probabilidad: 0.08 }
          ]
        },
        nivel_sistema: {
          multiplicador_stats_por_nivel: 0.15,
          multiplicador_val_por_nivel: 0.10,
          multiplicador_xp_por_nivel: 0.10,
          multiplicador_drop_por_nivel: 0.05,
          nivel_maximo_recomendado: 50
        },
        nivel_minimo_para_exclusivos: 20
      },

      // NIVEL 5: Legendario (Nivel recomendado: 70-100)
      {
        nombre: "Abismo del Caos Eterno",
        descripcion: "El punto más oscuro del universo. Aquí residen las entidades más poderosas. Solo leyendas sobreviven.",
        nivel_requerido_minimo: 50,
        stats: {
          vida: 3000,
          ataque: 120,
          defensa: 100
        },
        probabilidades: {
          fallo_ataque_jugador: 0.30,
          fallo_ataque_propio: 0.10
        },
        recompensas: {
          expBase: 2000,
          valBase: 250,
          dropTable: [
            { itemId: itemIds.elixirResurreccion, tipoItem: "Consumable", probabilidad: 0.60 },
            { itemId: itemIds.tomoAncestral, tipoItem: "Consumable", probabilidad: 0.40 },
            { itemId: itemIds.guadanaCaos, tipoItem: "Equipment", probabilidad: 0.40 },
            { itemId: itemIds.escudoTitan, tipoItem: "Equipment", probabilidad: 0.35 },
            { itemId: itemIds.anilloFenix, tipoItem: "Equipment", probabilidad: 0.20 },
            { itemId: itemIds.frutoPoder, tipoItem: "Consumable", probabilidad: 0.25 },
            { itemId: itemIds.frutoVitalidad, tipoItem: "Consumable", probabilidad: 0.25 },
            { itemId: itemIds.frutoDivino, tipoItem: "Consumable", probabilidad: 0.03 }
          ]
        },
        nivel_sistema: {
          multiplicador_stats_por_nivel: 0.15,
          multiplicador_val_por_nivel: 0.10,
          multiplicador_xp_por_nivel: 0.10,
          multiplicador_drop_por_nivel: 0.05,
          nivel_maximo_recomendado: 50
        },
        nivel_minimo_para_exclusivos: 20
      }
    ];

    // Verificar si ya existen mazmorras
    const existingCount = await dungeonsCollection.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} mazmorras en la base de datos\n`);
      const existing = await dungeonsCollection.find({}).toArray();
      console.log('🏰 Mazmorras existentes:');
      existing.forEach((d, i) => {
        console.log(`  ${i+1}. ${d.nombre} - ${d.stats.vida} HP`);
      });
      console.log('\n¿Quieres reemplazarlas? Ejecuta:');
      console.log('  node scripts/seed-dungeons.js --force\n');
      await mongoose.disconnect();
      return;
    }

    // Insertar mazmorras
    console.log('🏰 Insertando mazmorras...\n');
    const result = await dungeonsCollection.insertMany(mazmorras);
    
    console.log(`✅ Insertadas ${result.insertedCount} mazmorras exitosamente\n`);
    
    // Mostrar resumen
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🏰 MAZMORRAS CREADAS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    mazmorras.forEach((maz, index) => {
      console.log(`${index + 1}. ${maz.nombre}`);
      console.log(`   📖 ${maz.descripcion}`);
      console.log(`   � Nivel mínimo requerido: ${maz.nivel_requerido_minimo}`);
      console.log(`   �💪 Stats: ${maz.stats.vida} HP | ATK ${maz.stats.ataque} | DEF ${maz.stats.defensa}`);
      console.log(`   🎯 Fallo jugador: ${(maz.probabilidades.fallo_ataque_jugador * 100).toFixed(0)}% | Fallo enemigo: ${(maz.probabilidades.fallo_ataque_propio * 100).toFixed(0)}%`);
      console.log(`   ⭐ Recompensas base: ${maz.recompensas.expBase} XP | ${maz.recompensas.valBase} VAL`);
      console.log(`   📈 Sistema de niveles: +${(maz.nivel_sistema.multiplicador_stats_por_nivel * 100).toFixed(0)}% stats/nivel | +${(maz.nivel_sistema.multiplicador_val_por_nivel * 100).toFixed(0)}% VAL/nivel`);
      console.log(`   🎁 Drops posibles: ${maz.recompensas.dropTable.length} items`);
      console.log(`   🏆 Exclusivos desbloqueados en nivel ${maz.nivel_minimo_para_exclusivos}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 PROGRESIÓN DE DIFICULTAD');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Nivel 1: Cueva Goblins (150 HP, 50 XP, 10 VAL) - Items comunes');
    console.log('Nivel 2: Bosque Maldito (400 HP, 150 XP, 25 VAL) - Items poco comunes');
    console.log('Nivel 3: Fortaleza Caballero (800 HP, 350 XP, 50 VAL) - Items raros');
    console.log('Nivel 4: Templo Dragón (1500 HP, 750 XP, 100 VAL) - Items épicos + frutos');
    console.log('Nivel 5: Abismo Caos (3000 HP, 2000 XP, 250 VAL) - Items legendarios + fruto divino\n');
    console.log('💡 Sistema de progresión infinita:');
    console.log('   - Cada victoria sube el nivel de esa mazmorra para ti');
    console.log('   - Las stats escalan +15% por nivel');
    console.log('   - Las recompensas de VAL/XP escalan +10% por nivel');
    console.log('   - Los drops escalan +5% por nivel (máximo 2x)');
    console.log('   - Items exclusivos se desbloquean en nivel 20+\n');

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

async function forceReplaceDungeons() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const itemsCollection = db.collection('items');
    const dungeonsCollection = db.collection('dungeons');

    // Borrar mazmorras existentes
    const deleteResult = await dungeonsCollection.deleteMany({});
    console.log(`🗑️  Borradas ${deleteResult.deletedCount} mazmorras antiguas\n`);

    // Llamar a la función principal de creación
    await mongoose.disconnect();
    await createDungeons();

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

// Main
const args = process.argv.slice(2);
if (args.includes('--force')) {
  forceReplaceDungeons();
} else {
  createDungeons();
}
