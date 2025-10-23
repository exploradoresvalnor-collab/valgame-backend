require('dotenv').config();
const mongoose = require('mongoose');

// 8 personajes base con sus 2 evoluciones cada uno
// Los requisitos.val son estimados razonables (se pueden ajustar después)
const personajes = [
  {
    id: "vision-espectral",
    nombre: "Visión Espectral",
    imagen: "assets/vision-espectral.png",
    descripcion_rango: "El rango (D, C, B, A, S, SS, SSS) se asigna al abrir un paquete según 'categories.probabilidad' o 'packages.categorias_garantizadas', registrado en 'users.personajes.rango'.",
    multiplicador_base: 1.5,
    nivel: 1,
    etapa: 1,
    val_por_nivel_por_etapa: [15, 20, 25],
    stats: {
      atk: 10,
      vida: 20,
      defensa: 5
    },
    progreso: 0,
    ultimoMinado: null,
    evoluciones: [
      {
        nombre: "Visión Espectral Etapa 2",
        etapa: 2,
        requisitos: {
          val: 500, // Costo aproximado en VAL para evolución etapa 2
          evo: 1,
          nivel: 40
        },
        multiplicador_base: 2.0,
        val_por_nivel_por_etapa: [20, 20, 20],
        stats: {
          atk: 15,
          vida: 25,
          defensa: 7
        }
      },
      {
        nombre: "Visión Espectral Etapa 3",
        etapa: 3,
        requisitos: {
          val: 2000, // Costo aproximado en VAL para evolución etapa 3
          evo: 1,
          nivel: 100
        },
        multiplicador_base: 2.5,
        val_por_nivel_por_etapa: [25, 25, 25],
        stats: {
          atk: 20,
          vida: 30,
          defensa: 10
        }
      }
    ]
  },
  {
    id: "sir-nocturno",
    nombre: "Sir Nocturno, Guardián de Sombras",
    imagen: "assets/sir-nocturno.png",
    descripcion_rango: "El rango (D, C, B, A, S, SS, SSS) se asigna al abrir un paquete según 'categories.probabilidad' o 'packages.categorias_garantizadas', registrado en 'users.personajes.rango'.",
    multiplicador_base: 2.0,
    nivel: 1,
    etapa: 1,
    val_por_nivel_por_etapa: [20, 25, 30],
    stats: {
      atk: 12,
      vida: 22,
      defensa: 7
    },
    progreso: 0,
    ultimoMinado: null,
    evoluciones: [
      {
        nombre: "Sir Nocturno Etapa 2",
        etapa: 2,
        requisitos: {
          val: 600,
          evo: 1,
          nivel: 40
        },
        multiplicador_base: 2.5,
        val_por_nivel_por_etapa: [25, 25, 25],
        stats: {
          atk: 17,
          vida: 27,
          defensa: 9
        }
      },
      {
        nombre: "Sir Nocturno Etapa 3",
        etapa: 3,
        requisitos: {
          val: 2500,
          evo: 1,
          nivel: 100
        },
        multiplicador_base: 3.0,
        val_por_nivel_por_etapa: [30, 30, 30],
        stats: {
          atk: 22,
          vida: 32,
          defensa: 12
        }
      }
    ]
  },
  {
    id: "arcanis",
    nombre: "Arcanis el Místico",
    imagen: "assets/arcanis.png",
    descripcion_rango: "El rango (D, C, B, A, S, SS, SSS) se asigna al abrir un paquete según 'categories.probabilidad' o 'packages.categorias_garantizadas', registrado en 'users.personajes.rango'.",
    multiplicador_base: 2.0,
    nivel: 1,
    etapa: 1,
    val_por_nivel_por_etapa: [20, 25, 30],
    stats: {
      atk: 13,
      vida: 21,
      defensa: 6
    },
    progreso: 0,
    ultimoMinado: null,
    evoluciones: [
      {
        nombre: "Arcanis Etapa 2",
        etapa: 2,
        requisitos: {
          val: 600,
          evo: 1,
          nivel: 40
        },
        multiplicador_base: 2.5,
        val_por_nivel_por_etapa: [25, 25, 25],
        stats: {
          atk: 18,
          vida: 26,
          defensa: 8
        }
      },
      {
        nombre: "Arcanis Etapa 3",
        etapa: 3,
        requisitos: {
          val: 2500,
          evo: 1,
          nivel: 100
        },
        multiplicador_base: 3.0,
        val_por_nivel_por_etapa: [30, 30, 30],
        stats: {
          atk: 23,
          vida: 31,
          defensa: 11
        }
      }
    ]
  },
  {
    id: "draco-igneo",
    nombre: "Draco Ígneo, Señor de las Llamas",
    imagen: "assets/draco-igneo.png",
    descripcion_rango: "El rango (D, C, B, A, S, SS, SSS) se asigna al abrir un paquete según 'categories.probabilidad' o 'packages.categorias_garantizadas', registrado en 'users.personajes.rango'.",
    multiplicador_base: 2.5,
    nivel: 1,
    etapa: 1,
    val_por_nivel_por_etapa: [25, 30, 35],
    stats: {
      atk: 15,
      vida: 25,
      defensa: 8
    },
    progreso: 0,
    ultimoMinado: null,
    evoluciones: [
      {
        nombre: "Draco Ígneo Etapa 2",
        etapa: 2,
        requisitos: {
          val: 750,
          evo: 1,
          nivel: 40
        },
        multiplicador_base: 3.0,
        val_por_nivel_por_etapa: [30, 30, 30],
        stats: {
          atk: 20,
          vida: 30,
          defensa: 10
        }
      },
      {
        nombre: "Draco Ígneo Etapa 3",
        etapa: 3,
        requisitos: {
          val: 3000,
          evo: 1,
          nivel: 100
        },
        multiplicador_base: 3.5,
        val_por_nivel_por_etapa: [35, 35, 35],
        stats: {
          atk: 25,
          vida: 35,
          defensa: 13
        }
      }
    ]
  },
  {
    id: "tenebris",
    nombre: "Tenebris, la Bestia Umbría",
    imagen: "assets/tenebris.png",
    descripcion_rango: "El rango (D, C, B, A, S, SS, SSS) se asigna al abrir un paquete según 'categories.probabilidad' o 'packages.categorias_garantizadas', registrado en 'users.personajes.rango'.",
    multiplicador_base: 3.0,
    nivel: 1,
    etapa: 1,
    val_por_nivel_por_etapa: [30, 35, 40],
    stats: {
      atk: 18,
      vida: 28,
      defensa: 10
    },
    progreso: 0,
    ultimoMinado: null,
    evoluciones: [
      {
        nombre: "Tenebris Etapa 2",
        etapa: 2,
        requisitos: {
          val: 900,
          evo: 1,
          nivel: 40
        },
        multiplicador_base: 3.5,
        val_por_nivel_por_etapa: [35, 35, 35],
        stats: {
          atk: 23,
          vida: 33,
          defensa: 12
        }
      },
      {
        nombre: "Tenebris Etapa 3",
        etapa: 3,
        requisitos: {
          val: 3500,
          evo: 1,
          nivel: 100
        },
        multiplicador_base: 4.0,
        val_por_nivel_por_etapa: [40, 40, 40],
        stats: {
          atk: 28,
          vida: 38,
          defensa: 15
        }
      }
    ]
  },
  {
    id: "fenix-solar",
    nombre: "Fénix Solar",
    imagen: "assets/fenix-solar.png",
    descripcion_rango: "El rango (D, C, B, A, S, SS, SSS) se asigna al abrir un paquete según 'categories.probabilidad' o 'packages.categorias_garantizadas', registrado en 'users.personajes.rango'.",
    multiplicador_base: 3.5,
    nivel: 1,
    etapa: 1,
    val_por_nivel_por_etapa: [35, 40, 45],
    stats: {
      atk: 20,
      vida: 30,
      defensa: 12
    },
    progreso: 0,
    ultimoMinado: null,
    evoluciones: [
      {
        nombre: "Fénix Solar Etapa 2",
        etapa: 2,
        requisitos: {
          val: 1050,
          evo: 1,
          nivel: 40
        },
        multiplicador_base: 4.0,
        val_por_nivel_por_etapa: [40, 40, 40],
        stats: {
          atk: 25,
          vida: 35,
          defensa: 14
        }
      },
      {
        nombre: "Fénix Solar Etapa 3",
        etapa: 3,
        requisitos: {
          val: 4000,
          evo: 1,
          nivel: 100
        },
        multiplicador_base: 4.5,
        val_por_nivel_por_etapa: [45, 45, 45],
        stats: {
          atk: 30,
          vida: 40,
          defensa: 17
        }
      }
    ]
  },
  {
    id: "leviatan",
    nombre: "Leviatán",
    imagen: "assets/leviatan.png",
    descripcion_rango: "El rango (D, C, B, A, S, SS, SSS) se asigna al abrir un paquete según 'categories.probabilidad' o 'packages.categorias_garantizadas', registrado en 'users.personajes.rango'.",
    multiplicador_base: 4.0,
    nivel: 1,
    etapa: 1,
    val_por_nivel_por_etapa: [40, 45, 50],
    stats: {
      atk: 22,
      vida: 32,
      defensa: 14
    },
    progreso: 0,
    ultimoMinado: null,
    evoluciones: [
      {
        nombre: "Leviatán Etapa 2",
        etapa: 2,
        requisitos: {
          val: 1200,
          evo: 1,
          nivel: 40
        },
        multiplicador_base: 4.5,
        val_por_nivel_por_etapa: [45, 45, 45],
        stats: {
          atk: 27,
          vida: 37,
          defensa: 16
        }
      },
      {
        nombre: "Leviatán Etapa 3",
        etapa: 3,
        requisitos: {
          val: 4500,
          evo: 1,
          nivel: 100
        },
        multiplicador_base: 5.0,
        val_por_nivel_por_etapa: [50, 50, 50],
        stats: {
          atk: 32,
          vida: 42,
          defensa: 19
        }
      }
    ]
  },
  {
    id: "arbol-caos",
    nombre: "Árbol del Caos",
    imagen: "assets/arbol-caos.png",
    descripcion_rango: "El rango (D, C, B, A, S, SS, SSS) se asigna al abrir un paquete según 'categories.probabilidad' o 'packages.categorias_garantizadas', registrado en 'users.personajes.rango'.",
    multiplicador_base: 5.0,
    nivel: 1,
    etapa: 1,
    val_por_nivel_por_etapa: [50, 55, 60],
    stats: {
      atk: 25,
      vida: 35,
      defensa: 16
    },
    progreso: 0,
    ultimoMinado: null,
    evoluciones: [
      {
        nombre: "Árbol del Caos Etapa 2",
        etapa: 2,
        requisitos: {
          val: 1500,
          evo: 1,
          nivel: 40
        },
        multiplicador_base: 5.5,
        val_por_nivel_por_etapa: [55, 55, 55],
        stats: {
          atk: 30,
          vida: 40,
          defensa: 18
        }
      },
      {
        nombre: "Árbol del Caos Etapa 3",
        etapa: 3,
        requisitos: {
          val: 5000,
          evo: 1,
          nivel: 100
        },
        multiplicador_base: 6.0,
        val_por_nivel_por_etapa: [60, 60, 60],
        stats: {
          atk: 35,
          vida: 45,
          defensa: 21
        }
      }
    ]
  }
];

async function seedBaseCharacters() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('base_characters');

    // Verificar personajes existentes
    const existingCount = await collection.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} personajes en la base de datos`);
      const existing = await collection.find({}).toArray();
      console.log('\n🎭 Personajes existentes:');
      existing.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.nombre} (${p.id})`);
      });
      console.log('\n¿Quieres reemplazarlos? Ejecuta:');
      console.log('  node scripts/seed-base-characters.js --force\n');
      await mongoose.disconnect();
      return;
    }

    // Insertar personajes
    console.log('🎭 Insertando 8 personajes base...\n');
    const result = await collection.insertMany(personajes);
    
    console.log(`✅ Insertados ${result.insertedCount} personajes exitosamente\n`);
    
    // Mostrar resumen
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎭 PERSONAJES BASE CREADOS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    personajes.forEach((p, index) => {
      console.log(`${index + 1}. ${p.nombre}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Stats base: ATK ${p.stats.atk} | VIDA ${p.stats.vida} | DEF ${p.stats.defensa}`);
      console.log(`   Multiplicador: ${p.multiplicador_base}x`);
      console.log(`   Evoluciones: ${p.evoluciones.length}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Total personajes: ${personajes.length}`);
    console.log(`Total evoluciones: ${personajes.reduce((sum, p) => sum + p.evoluciones.length, 0)}`);
    console.log(`\nCada personaje tiene:`);
    console.log(`  • Etapa 1 (nivel 1)`);
    console.log(`  • Etapa 2 (desbloq. nivel 40, req. 1 EVO + VAL)`);
    console.log(`  • Etapa 3 (desbloq. nivel 100, req. 1 EVO + VAL)`);
    console.log('\n💡 El rango (D-SSS) se asigna al abrir paquetes\n');

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

async function forceReplaceCharacters() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('base_characters');

    // Borrar personajes existentes
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Borrados ${deleteResult.deletedCount} personajes antiguos\n`);

    // Insertar nuevos personajes
    console.log('🎭 Insertando 8 personajes nuevos...\n');
    const result = await collection.insertMany(personajes);
    
    console.log(`✅ Insertados ${result.insertedCount} personajes exitosamente\n`);

    personajes.forEach((p, i) => {
      console.log(`${i+1}. ${p.nombre} - ${p.evoluciones.length} evoluciones`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

// Main
const args = process.argv.slice(2);
if (args.includes('--force')) {
  forceReplaceCharacters();
} else {
  seedBaseCharacters();
}
