const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

function switchToDevelopment() {
  console.log('🔄 Cambiando a MODO DESARROLLO (sin base de datos)...');

  let envContent = fs.readFileSync(envPath, 'utf8');

  // Cambiar NODE_ENV si existe, o agregarlo
  if (envContent.includes('NODE_ENV=')) {
    envContent = envContent.replace(/NODE_ENV=.*/, 'NODE_ENV=development');
  } else {
    envContent += '\nNODE_ENV=development\n';
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Modo desarrollo activado');
  console.log('📝 El sistema funcionará sin base de datos');
}

function switchToProduction() {
  console.log('🔄 Cambiando a MODO PRODUCCIÓN (con base de datos)...');

  let envContent = fs.readFileSync(envPath, 'utf8');

  // Cambiar NODE_ENV si existe, o agregarlo
  if (envContent.includes('NODE_ENV=')) {
    envContent = envContent.replace(/NODE_ENV=.*/, 'NODE_ENV=production');
  } else {
    envContent += '\nNODE_ENV=production\n';
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Modo producción activado');
  console.log('📝 El sistema requerirá conexión a MongoDB');
}

function showCurrentMode() {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const nodeEnvMatch = envContent.match(/NODE_ENV=(.*)/);

  if (nodeEnvMatch) {
    const mode = nodeEnvMatch[1].trim();
    console.log(`📊 Modo actual: ${mode.toUpperCase()}`);
  } else {
    console.log('📊 Modo actual: DESARROLLO (por defecto)');
  }
}

// Procesar argumentos de línea de comandos
const command = process.argv[2];

switch (command) {
  case 'dev':
  case 'development':
    switchToDevelopment();
    break;
  case 'prod':
  case 'production':
    switchToProduction();
    break;
  case 'status':
  case 'current':
    showCurrentMode();
    break;
  default:
    console.log('📖 Uso: node switch-mode.js [dev|prod|status]');
    console.log('');
    console.log('📋 Comandos:');
    console.log('  dev      - Cambiar a modo desarrollo (sin BD)');
    console.log('  prod     - Cambiar a modo producción (con BD)');
    console.log('  status   - Ver modo actual');
    console.log('');
    showCurrentMode();
}