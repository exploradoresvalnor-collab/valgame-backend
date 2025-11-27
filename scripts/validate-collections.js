/**
 * Script de Validaci√≥n: Verificar que todas las colecciones de MongoDB
 * est√°n acordes con el proyecto Valgame v2.1.0
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

async function validateCollections() {
  try {
    log('\nÌ¥ç INICIANDO VALIDACI√ìN DE COLECCIONES', 'blue');
    log('‚îÄ'.repeat(60), 'blue');
    
    // Conexi√≥n a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    log('‚úÖ Conectado a MongoDB', 'green');
    
    const db = mongoose.connection.db;
    
    // Obtener todas las colecciones
    const collections = await db.listCollections().toArray();
    log(`\nÌ≥ä Total de colecciones encontradas: ${collections.length}`, 'blue');
    
    // Colecciones esperadas seg√∫n Valgame v2.1.0
    const expectedCollections = [
      'users',
      'items',
      'consumables',
      'equipment',
      'dungeons',
      'listings',
      'marketplacetransactions',
      'survivalruns',
      'survivalsessions',
      'survivalscenariosv2s',
      'survivalleaderboards',
      'levelhhistories',
      'gamesettings',
      'packages',
      'userpackages',
      'purchases',
      'purchaselogs',
      'notifications',
      'chatmessages',
      'teams',
      'events',
      'rankings',
      'tokenblacklists'
    ];
    
    const collectionNames = collections.map(c => c.name.toLowerCase());
    
    log('\nÌ≥ã VERIFICACI√ìN DE COLECCIONES ESPERADAS:', 'blue');
    log('‚îÄ'.repeat(60), 'blue');
    
    let validCount = 0;
    let missingCount = 0;
    
    for (const expected of expectedCollections) {
      const exists = collectionNames.some(c => c.toLowerCase().includes(expected));
      if (exists) {
        log(`‚úÖ ${expected}`, 'green');
        validCount++;
      } else {
        log(`‚ùå FALTA: ${expected}`, 'red');
        missingCount++;
      }
    }
    
    log('\nÌ≥ä RESULTADO:', 'blue');
    log(`‚úÖ Colecciones v√°lidas: ${validCount}/${expectedCollections.length}`, 'green');
    if (missingCount > 0) {
      log(`‚ùå Colecciones faltantes: ${missingCount}`, 'red');
    }
    
    // Verificar estructura de User
    log('\nÌ¥ç VALIDANDO ESTRUCTURA DE USERS:', 'blue');
    log('‚îÄ'.repeat(60), 'blue');
    
    const userCount = await db.collection('users').countDocuments();
    log(`Documentos en 'users': ${userCount}`, 'yellow');
    
    if (userCount > 0) {
      const sampleUser = await db.collection('users').findOne();
      
      const requiredFields = [
        'email',
        'username',
        'personajes',
        'inventarioEquipamiento',
        'inventarioConsumibles',
        'val',
        'evo'
      ];
      
      log('\nCampos requeridos en User:', 'yellow');
      for (const field of requiredFields) {
        if (sampleUser[field] !== undefined) {
          log(`  ‚úÖ ${field}`, 'green');
        } else {
          log(`  ‚ùå FALTA: ${field}`, 'red');
        }
      }
      
      // Validar estructura de personaje
      if (sampleUser.personajes && sampleUser.personajes.length > 0) {
        const sampleChar = sampleUser.personajes[0];
        log('\nCampos en personaje:', 'yellow');
        
        const charFields = [
          'nombre',
          'nivel',
          'rango',
          'etapa',
          'stats',
          'equipamiento',
          'saludActual'
        ];
        
        for (const field of charFields) {
          if (sampleChar[field] !== undefined) {
            log(`  ‚úÖ ${field}`, 'green');
          } else {
            log(`  ‚ùå FALTA: ${field}`, 'red');
          }
        }
      }
    }
    
    // Verificar Items
    log('\nÌ¥ç VALIDANDO ESTRUCTURA DE ITEMS:', 'blue');
    log('‚îÄ'.repeat(60), 'blue');
    
    const itemCount = await db.collection('items').countDocuments();
    log(`Documentos en 'items': ${itemCount}`, 'yellow');
    
    if (itemCount > 0) {
      const sampleItem = await db.collection('items').findOne();
      const itemFields = ['nombre', 'descripcion', 'tipoItem', 'rango'];
      
      log('\nCampos en Item:', 'yellow');
      for (const field of itemFields) {
        if (sampleItem[field] !== undefined) {
          log(`  ‚úÖ ${field}`, 'green');
        } else {
          log(`  ‚ùå FALTA: ${field}`, 'red');
        }
      }
    }
    
    // Verificar Equipment
    log('\nÌ¥ç VALIDANDO ESTRUCTURA DE EQUIPMENT:', 'blue');
    log('‚îÄ'.repeat(60), 'blue');
    
    const equipmentCount = await db.collection('equipment').countDocuments();
    log(`Documentos en 'equipment': ${equipmentCount}`, 'yellow');
    
    if (equipmentCount > 0) {
      const sampleEquip = await db.collection('equipment').findOne();
      const equipFields = ['nombre', 'slot', 'stats', 'rareza'];
      
      log('\nCampos en Equipment:', 'yellow');
      for (const field of equipFields) {
        if (sampleEquip[field] !== undefined) {
          log(`  ‚úÖ ${field}`, 'green');
        } else {
          log(`  ‚ùå FALTA: ${field}`, 'red');
        }
      }
    }
    
    // Verificar Survival
    log('\nÌ¥ç VALIDANDO ESTRUCTURA DE SURVIVAL:', 'blue');
    log('‚îÄ'.repeat(60), 'blue');
    
    const survivalSessionCount = await db.collection('survivalsessions').countDocuments();
    log(`Documentos en 'survivalsessions': ${survivalSessionCount}`, 'yellow');
    
    if (survivalSessionCount > 0) {
      const sampleSurvival = await db.collection('survivalsessions').findOne();
      const survivalFields = ['userId', 'characterId', 'puntos', 'oleadas', 'estado'];
      
      log('\nCampos en SurvivalSession:', 'yellow');
      for (const field of survivalFields) {
        if (sampleSurvival[field] !== undefined) {
          log(`  ‚úÖ ${field}`, 'green');
        } else {
          log(`  ‚ùå FALTA: ${field}`, 'red');
        }
      }
    }
    
    log('\n' + '‚ïê'.repeat(60), 'blue');
    log('‚úÖ VALIDACI√ìN COMPLETADA', 'green');
    log('‚ïê'.repeat(60), 'blue');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    log(`\n‚ùå ERROR: ${error.message}`, 'red');
    process.exit(1);
  }
}

validateCollections();
