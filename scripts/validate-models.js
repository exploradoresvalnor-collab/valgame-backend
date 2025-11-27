/**
 * Script: Validar que los modelos est√°n acordes al proyecto
 * NO necesita conexi√≥n a MongoDB
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

function validateModels() {
  log('\nÌ¥ç VALIDACI√ìN DE MODELOS MONGOOSE', 'blue');
  log('‚ïê'.repeat(70), 'blue');
  
  const modelsDir = path.join(__dirname, '../src/models');
  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts'));
  
  log(`\nÌ≥ã Modelos encontrados: ${files.length}`, 'yellow');
  log('‚îÄ'.repeat(70), 'blue');
  
  const requiredModels = [
    'User.ts',
    'Equipment.ts',
    'Consumable.ts',
    'Item.ts',
    'SurvivalSession.ts',
    'SurvivalRun.ts',
    'GameSetting.ts',
    'Dungeon.ts'
  ];
  
  let validCount = 0;
  
  for (const model of requiredModels) {
    if (files.includes(model)) {
      log(`‚úÖ ${model}`, 'green');
      validCount++;
    } else {
      log(`‚ùå FALTA: ${model}`, 'red');
    }
  }
  
  log('\n' + '‚îÄ'.repeat(70), 'blue');
  
  // Validar User.ts
  log('\nÌ¥ç VALIDANDO ESTRUCTURA: User.ts', 'blue');
  log('‚îÄ'.repeat(70), 'blue');
  
  const userPath = path.join(modelsDir, 'User.ts');
  const userContent = fs.readFileSync(userPath, 'utf-8');
  
  const checks = [
    { field: 'email', regex: /email.*string/i },
    { field: 'personajes', regex: /personajes.*\[\]/i },
    { field: 'equipamiento', regex: /equipamiento.*ObjectId/i },
    { field: 'val', regex: /val.*number/i },
    { field: 'evo', regex: /evo.*number/i },
    { field: 'inventarioConsumibles', regex: /inventarioConsumibles/i },
  ];
  
  for (const check of checks) {
    if (check.regex.test(userContent)) {
      log(`  ‚úÖ Campo "${check.field}" encontrado`, 'green');
    } else {
      log(`  ‚ùå Campo "${check.field}" NO encontrado`, 'red');
    }
  }
  
  // Validar Equipment.ts
  log('\nÌ¥ç VALIDANDO ESTRUCTURA: Equipment.ts', 'blue');
  log('‚îÄ'.repeat(70), 'blue');
  
  const equipmentPath = path.join(modelsDir, 'Equipment.ts');
  const equipmentContent = fs.readFileSync(equipmentPath, 'utf-8');
  
  const equipChecks = [
    { field: 'nombre', regex: /nombre/i },
    { field: 'slot', regex: /slot.*head|body|hands|feet/i },
    { field: 'stats', regex: /stats/i },
    { field: 'tipoItem', regex: /tipoItem.*Equipment/i },
  ];
  
  for (const check of equipChecks) {
    if (check.regex.test(equipmentContent)) {
      log(`  ‚úÖ Campo "${check.field}" encontrado`, 'green');
    } else {
      log(`  ‚ùå Campo "${check.field}" NO encontrado`, 'red');
    }
  }
  
  // Validar SurvivalSession.ts
  log('\nÌ¥ç VALIDANDO ESTRUCTURA: SurvivalSession.ts', 'blue');
  log('‚îÄ'.repeat(70), 'blue');
  
  const survivalPath = path.join(modelsDir, 'SurvivalSession.ts');
  const survivalContent = fs.readFileSync(survivalPath, 'utf-8');
  
  const survivalChecks = [
    { field: 'userId', regex: /userId/i },
    { field: 'characterId', regex: /characterId/i },
    { field: 'oleadas', regex: /oleadas|waves/i },
    { field: 'puntos', regex: /puntos|points/i },
    { field: 'estado', regex: /estado|status/i },
  ];
  
  for (const check of survivalChecks) {
    if (check.regex.test(survivalContent)) {
      log(`  ‚úÖ Campo "${check.field}" encontrado`, 'green');
    } else {
      log(`  ‚ö†Ô∏è  Campo "${check.field}" - REVISAR`, 'yellow');
    }
  }
  
  // Contar l√≠neas de c√≥digo en modelos
  log('\nÌ≥ä ESTAD√çSTICAS DE MODELOS:', 'blue');
  log('‚îÄ'.repeat(70), 'blue');
  
  let totalLines = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(modelsDir, file), 'utf-8');
    const lines = content.split('\n').length;
    totalLines += lines;
  }
  
  log(`Total de archivos: ${files.length}`, 'yellow');
  log(`Total de l√≠neas de c√≥digo: ${totalLines.toLocaleString()}`, 'yellow');
  log(`Promedio por archivo: ${Math.round(totalLines / files.length)} l√≠neas`, 'yellow');
  
  log('\n' + '‚ïê'.repeat(70), 'blue');
  log('‚úÖ VALIDACI√ìN COMPLETADA', 'green');
  log('‚ïê'.repeat(70), 'blue');
}

validateModels();
