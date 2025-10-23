require('dotenv').config();
const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// EQUIPAMIENTO (Equipment) - Items permanentes que dan stats
// ═══════════════════════════════════════════════════════════════

const equipamiento = [
  // --- ARMAS ---
  {
    tipoItem: "Equipment",
    nombre: "Daga Oxidada",
    descripcion: "Una daga vieja pero aún funcional",
    rango: "D",
    tipo: "arma",
    nivel_minimo_requerido: 1,
    stats: { atk: 5, defensa: 0, vida: 0 },
    costo_val: 50,
    fuentes_obtencion: ["Paquete Pionero", "Drop común"]
  },
  {
    tipoItem: "Equipment",
    nombre: "Espada de Acero",
    descripcion: "Espada básica de acero forjado",
    rango: "C",
    tipo: "arma",
    nivel_minimo_requerido: 10,
    stats: { atk: 12, defensa: 0, vida: 0 },
    costo_val: 200,
    fuentes_obtencion: ["Tienda", "Drop poco común"]
  },
  {
    tipoItem: "Equipment",
    nombre: "Espada Flamígera",
    descripcion: "Espada envuelta en llamas eternas",
    rango: "B",
    tipo: "arma",
    nivel_minimo_requerido: 25,
    stats: { atk: 25, defensa: 0, vida: 5 },
    costo_val: 500,
    fuentes_obtencion: ["Mazmorra nivel 2", "Tienda premium"],
    habilidades: ["Ignición: +10% daño contra enemigos de hielo"]
  },
  {
    tipoItem: "Equipment",
    nombre: "Katana del Dragón",
    descripcion: "Forjada con escamas de dragón ancestral",
    rango: "A",
    tipo: "arma",
    nivel_minimo_requerido: 40,
    stats: { atk: 40, defensa: 5, vida: 10 },
    costo_val: 1500,
    fuentes_obtencion: ["Mazmorra nivel 4", "Drop épico"],
    habilidades: ["Furia del Dragón: +15% ATK durante 3 turnos"]
  },
  {
    tipoItem: "Equipment",
    nombre: "Guadaña del Caos",
    descripcion: "Arma legendaria que consume la vida enemiga",
    rango: "S",
    tipo: "arma",
    nivel_minimo_requerido: 60,
    stats: { atk: 60, defensa: 10, vida: 20 },
    costo_val: 5000,
    fuentes_obtencion: ["Boss final", "Paquete Reinos Eternos"],
    habilidades: ["Drenaje de Vida: Recupera 10% del daño como HP"]
  },

  // --- ARMADURAS ---
  {
    tipoItem: "Equipment",
    nombre: "Armadura de Cuero",
    descripcion: "Protección básica de cuero curtido",
    rango: "D",
    tipo: "armadura",
    nivel_minimo_requerido: 1,
    stats: { atk: 0, defensa: 8, vida: 15 },
    costo_val: 60,
    fuentes_obtencion: ["Paquete Pionero", "Tienda básica"]
  },
  {
    tipoItem: "Equipment",
    nombre: "Cota de Mallas",
    descripcion: "Armadura de anillos entrelazados",
    rango: "C",
    tipo: "armadura",
    nivel_minimo_requerido: 10,
    stats: { atk: 0, defensa: 15, vida: 30 },
    costo_val: 250,
    fuentes_obtencion: ["Tienda", "Drop poco común"]
  },
  {
    tipoItem: "Equipment",
    nombre: "Armadura de Placas Reforzadas",
    descripcion: "Armadura pesada con protección superior",
    rango: "B",
    tipo: "armadura",
    nivel_minimo_requerido: 25,
    stats: { atk: 0, defensa: 30, vida: 60 },
    costo_val: 600,
    fuentes_obtencion: ["Mazmorra nivel 2", "Crafteo avanzado"]
  },
  {
    tipoItem: "Equipment",
    nombre: "Armadura del Guardián",
    descripcion: "Armadura bendecida por espíritus protectores",
    rango: "A",
    tipo: "armadura",
    nivel_minimo_requerido: 40,
    stats: { atk: 5, defensa: 50, vida: 100 },
    costo_val: 2000,
    fuentes_obtencion: ["Mazmorra nivel 4", "Evento especial"],
    habilidades: ["Escudo Divino: Reduce 20% del daño recibido"]
  },

  // --- ESCUDOS ---
  {
    tipoItem: "Equipment",
    nombre: "Escudo de Madera",
    descripcion: "Escudo básico de madera reforzada",
    rango: "D",
    tipo: "escudo",
    nivel_minimo_requerido: 5,
    stats: { atk: 0, defensa: 10, vida: 10 },
    costo_val: 80,
    fuentes_obtencion: ["Tienda básica"]
  },
  {
    tipoItem: "Equipment",
    nombre: "Escudo del Titán",
    descripcion: "Escudo legendario que nunca se rompe",
    rango: "S",
    tipo: "escudo",
    nivel_minimo_requerido: 50,
    stats: { atk: 0, defensa: 80, vida: 150 },
    costo_val: 6000,
    fuentes_obtencion: ["Boss legendario", "Paquete Reinos Eternos"],
    habilidades: ["Bastión Inquebrantable: Inmunidad a críticos 1 vez por combate"]
  },

  // --- ANILLOS ---
  {
    tipoItem: "Equipment",
    nombre: "Anillo de Fuerza",
    descripcion: "Aumenta la fuerza física del portador",
    rango: "B",
    tipo: "anillo",
    nivel_minimo_requerido: 20,
    stats: { atk: 15, defensa: 0, vida: 0 },
    costo_val: 400,
    fuentes_obtencion: ["Tienda premium", "Drop raro"]
  },
  {
    tipoItem: "Equipment",
    nombre: "Anillo del Fénix",
    descripcion: "Resucita al portador una vez",
    rango: "SS",
    tipo: "anillo",
    nivel_minimo_requerido: 70,
    stats: { atk: 30, defensa: 30, vida: 100 },
    costo_val: 15000,
    fuentes_obtencion: ["Boss mítico", "Evento limitado"],
    habilidades: ["Renacimiento: Resucita con 50% HP (1 uso por día)"]
  }
];

// ═══════════════════════════════════════════════════════════════
// CONSUMIBLES (Consumable) - Items temporales con efectos
// ═══════════════════════════════════════════════════════════════

const consumibles = [
  // --- POCIONES (Efecto instantáneo - 1 uso) ---
  {
    tipoItem: "Consumable",
    nombre: "Poción de Vida Menor",
    descripcion: "Restaura 50 puntos de vida",
    rango: "D",
    tipo: "pocion",
    usos_maximos: 1,
    efectos: { mejora_vida: 50 },
    costo_val: 30,
    fuentes_obtencion: ["Tienda básica", "Drop común"],
    detalle_uso: "Uso instantáneo, restaura HP inmediatamente"
  },
  {
    tipoItem: "Consumable",
    nombre: "Poción de Vida",
    descripcion: "Restaura 150 puntos de vida",
    rango: "C",
    tipo: "pocion",
    usos_maximos: 1,
    efectos: { mejora_vida: 150 },
    costo_val: 100,
    fuentes_obtencion: ["Tienda", "Paquete Pionero"],
    detalle_uso: "Uso instantáneo, restaura HP inmediatamente"
  },
  {
    tipoItem: "Consumable",
    nombre: "Poción de Vida Mayor",
    descripcion: "Restaura 300 puntos de vida",
    rango: "B",
    tipo: "pocion",
    usos_maximos: 1,
    efectos: { mejora_vida: 300 },
    costo_val: 300,
    fuentes_obtencion: ["Tienda premium", "Mazmorra"],
    detalle_uso: "Uso instantáneo, restaura HP inmediatamente"
  },
  {
    tipoItem: "Consumable",
    nombre: "Elixir de Resurrección",
    descripcion: "Restaura completamente la vida",
    rango: "A",
    tipo: "pocion",
    usos_maximos: 1,
    efectos: { mejora_vida: 9999 },
    costo_val: 1000,
    fuentes_obtencion: ["Boss raro", "Evento especial"],
    detalle_uso: "Uso instantáneo, restaura 100% HP"
  },

  // --- ALIMENTOS (Efecto temporal - duración limitada) ---
  {
    tipoItem: "Consumable",
    nombre: "Pan de Campo",
    descripcion: "Aumenta temporalmente ATK +5",
    rango: "D",
    tipo: "alimento",
    usos_maximos: 1,
    duracion_efecto_minutos: 30,
    efectos: { mejora_atk: 5 },
    costo_val: 40,
    fuentes_obtencion: ["Tienda básica", "Crafteo"],
    detalle_uso: "Efecto temporal de 30 minutos"
  },
  {
    tipoItem: "Consumable",
    nombre: "Carne Asada",
    descripcion: "Aumenta ATK +15 y DEF +10 temporalmente",
    rango: "C",
    tipo: "alimento",
    usos_maximos: 1,
    duracion_efecto_minutos: 60,
    efectos: { mejora_atk: 15, mejora_defensa: 10 },
    costo_val: 150,
    fuentes_obtencion: ["Tienda", "Crafteo"],
    detalle_uso: "Efecto temporal de 60 minutos"
  },
  {
    tipoItem: "Consumable",
    nombre: "Festín del Guerrero",
    descripcion: "Aumenta todos los stats temporalmente",
    rango: "B",
    tipo: "alimento",
    usos_maximos: 1,
    duracion_efecto_minutos: 120,
    efectos: { mejora_atk: 30, mejora_defensa: 25, mejora_vida: 50 },
    costo_val: 500,
    fuentes_obtencion: ["Tienda premium", "Evento"],
    detalle_uso: "Efecto temporal de 2 horas"
  },

  // --- PERGAMINOS (Bonus de XP - múltiples usos) ---
  {
    tipoItem: "Consumable",
    nombre: "Pergamino de Sabiduría",
    descripcion: "Aumenta XP ganada en +10%",
    rango: "C",
    tipo: "pergamino",
    usos_maximos: 5,
    duracion_efecto_minutos: 60,
    efectos: { mejora_xp_porcentaje: 10 },
    costo_val: 200,
    fuentes_obtencion: ["Tienda", "Misión diaria"],
    detalle_uso: "5 usos, cada uno dura 60 minutos",
    limites: "No acumulable con otros pergaminos"
  },
  {
    tipoItem: "Consumable",
    nombre: "Pergamino de Maestría",
    descripcion: "Aumenta XP ganada en +25%",
    rango: "B",
    tipo: "pergamino",
    usos_maximos: 3,
    duracion_efecto_minutos: 120,
    efectos: { mejora_xp_porcentaje: 25 },
    costo_val: 600,
    fuentes_obtencion: ["Tienda premium", "Paquete Adventure"],
    detalle_uso: "3 usos, cada uno dura 2 horas",
    limites: "No acumulable con otros pergaminos"
  },
  {
    tipoItem: "Consumable",
    nombre: "Tomo Ancestral",
    descripcion: "Duplica la XP ganada (+100%)",
    rango: "A",
    tipo: "pergamino",
    usos_maximos: 1,
    duracion_efecto_minutos: 180,
    efectos: { mejora_xp_porcentaje: 100 },
    costo_val: 2000,
    fuentes_obtencion: ["Boss épico", "Paquete Héroes de Leyenda"],
    detalle_uso: "1 uso, dura 3 horas",
    limites: "No acumulable con otros pergaminos"
  },

  // --- FRUTOS MÍTICOS (Permanentes - mejoran personaje para siempre) ---
  {
    tipoItem: "Consumable",
    nombre: "Fruto del Poder",
    descripcion: "Aumenta permanentemente ATK +10",
    rango: "S",
    tipo: "fruto_mitico",
    usos_maximos: 1,
    efectos: { mejora_atk: 10 },
    costo_val: 5000,
    fuentes_obtencion: ["Boss legendario", "Paquete Reinos Eternos"],
    detalle_uso: "Mejora PERMANENTE, no expira",
    limites: "1 por personaje"
  },
  {
    tipoItem: "Consumable",
    nombre: "Fruto de la Vitalidad",
    descripcion: "Aumenta permanentemente VIDA +100",
    rango: "S",
    tipo: "fruto_mitico",
    usos_maximos: 1,
    efectos: { mejora_vida: 100 },
    costo_val: 5000,
    fuentes_obtencion: ["Boss legendario", "Evento mítico"],
    detalle_uso: "Mejora PERMANENTE, no expira",
    limites: "1 por personaje"
  },
  {
    tipoItem: "Consumable",
    nombre: "Fruto de la Fortaleza",
    descripcion: "Aumenta permanentemente DEF +15",
    rango: "S",
    tipo: "fruto_mitico",
    usos_maximos: 1,
    efectos: { mejora_defensa: 15 },
    costo_val: 5000,
    fuentes_obtencion: ["Boss legendario", "Paquete Reinos Eternos"],
    detalle_uso: "Mejora PERMANENTE, no expira",
    limites: "1 por personaje"
  },
  {
    tipoItem: "Consumable",
    nombre: "Fruto Divino",
    descripcion: "Aumenta TODOS los stats permanentemente",
    rango: "SSS",
    tipo: "fruto_mitico",
    usos_maximos: 1,
    efectos: { mejora_atk: 20, mejora_defensa: 20, mejora_vida: 150 },
    costo_val: 20000,
    fuentes_obtencion: ["Boss final definitivo", "Evento limitado anual"],
    detalle_uso: "Mejora PERMANENTE máxima, no expira",
    limites: "1 por personaje, extremadamente raro"
  }
];

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PARA SUBIR ITEMS
// ═══════════════════════════════════════════════════════════════

async function seedItems() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('items');

    const existingCount = await collection.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} items en la base de datos\n`);
      const existing = await collection.find({}).toArray();
      console.log('📦 Items existentes:');
      existing.forEach((item, i) => {
        console.log(`  ${i+1}. ${item.nombre} (${item.tipoItem}) - Rango ${item.rango}`);
      });
      console.log('\n¿Quieres reemplazarlos? Ejecuta:');
      console.log('  node scripts/seed-items.js --force\n');
      await mongoose.disconnect();
      return;
    }

    const todosLosItems = [...equipamiento, ...consumibles];
    
    console.log('📦 Insertando items...\n');
    const result = await collection.insertMany(todosLosItems);
    
    console.log(`✅ Insertados ${result.insertedCount} items exitosamente\n`);
    
    // Resumen por tipo
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE ITEMS CREADOS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`⚔️  EQUIPAMIENTO (${equipamiento.length} items):`);
    console.log(`   • Armas: 5`);
    console.log(`   • Armaduras: 4`);
    console.log(`   • Escudos: 2`);
    console.log(`   • Anillos: 2\n`);
    
    console.log(`🧪 CONSUMIBLES (${consumibles.length} items):`);
    console.log(`   • Pociones (1 uso): 4`);
    console.log(`   • Alimentos (temporal): 3`);
    console.log(`   • Pergaminos (XP boost): 3`);
    console.log(`   • Frutos Míticos (permanente): 4\n`);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 TOTAL: ${todosLosItems.length} items`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('💡 TIPOS DE EFECTOS:');
    console.log('   • Instantáneo: Pociones (1 uso)');
    console.log('   • Temporal: Alimentos, Pergaminos (duración limitada)');
    console.log('   • Permanente: Frutos Míticos (mejora definitiva)');
    console.log('   • Equipable: Armamento (stats mientras esté equipado)\n');

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

async function forceReplaceItems() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('items');

    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Borrados ${deleteResult.deletedCount} items antiguos\n`);

    const todosLosItems = [...equipamiento, ...consumibles];
    const result = await collection.insertMany(todosLosItems);
    
    console.log(`✅ Insertados ${result.insertedCount} items nuevos\n`);
    console.log(`   ⚔️  Equipamiento: ${equipamiento.length}`);
    console.log(`   🧪 Consumibles: ${consumibles.length}\n`);

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

// Main
const args = process.argv.slice(2);
if (args.includes('--force')) {
  forceReplaceItems();
} else {
  seedItems();
}
