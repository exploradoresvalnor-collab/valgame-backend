const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

const envPath = path.join(__dirname, '.env');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completado`);
    return output;
  } catch (error) {
    console.log(`❌ Error en ${description}: ${error.message}`);
    throw error;
  }
}

async function setupComplete() {
  console.log('🚀 CONFIGURACIÓN COMPLETA DE VALGAME CON MONGODB');
  console.log('================================================\n');

  try {
    // Paso 1: Verificar Node.js y npm
    console.log('📋 Paso 1: Verificando entorno...');
    runCommand('node --version', 'Verificar Node.js');
    runCommand('npm --version', 'Verificar npm');

    // Paso 2: Instalar dependencias
    runCommand('npm install', 'Instalar dependencias');

    // Paso 3: Verificar .env
    console.log('\n📋 Paso 2: Configurando entorno...');
    if (!fs.existsSync(envPath)) {
      if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', envPath);
        console.log('✅ Archivo .env creado desde .env.example');
      } else {
        console.log('⚠️  No se encontró .env.example, creando .env básico...');
        const basicEnv = `NODE_ENV=development\nPORT=8080\nJWT_SECRET=your-secret-key\n`;
        fs.writeFileSync(envPath, basicEnv);
        console.log('✅ Archivo .env básico creado');
      }
    } else {
      console.log('✅ Archivo .env ya existe');
    }

    // Paso 4: Verificar configuración
    runCommand('npm run check-env', 'Validar configuración');

    // Paso 5: Configurar modo desarrollo inicialmente
    runCommand('node switch-mode.js dev', 'Configurar modo desarrollo');

    // Paso 6: Intentar build (no crítico para desarrollo)
    console.log('\n📋 Paso 3: Verificando compilación TypeScript...');
    try {
      runCommand('npm run build', 'Verificar compilación TypeScript');
    } catch (error) {
      console.log('⚠️  Build tiene errores, pero el sistema puede funcionar en desarrollo');
      console.log('💡 Para desarrollo: npm run dev (usa ts-node-dev)');
    }

    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA!');
    console.log('===============================\n');

    console.log('✅ El sistema está listo para funcionar');
    console.log('✅ Modo actual: DESARROLLO (sin base de datos)');
    console.log('✅ Servidor listo para iniciar\n');

    console.log('🚀 Para iniciar el servidor:');
    console.log('   npm run dev\n');

    console.log('🗄️  Para usar con MongoDB real:');
    console.log('   node setup-mongodb-local.js');
    console.log('   npm run seed');
    console.log('   node switch-mode.js prod');
    console.log('   npm run dev\n');

    console.log('📋 Scripts disponibles:');
    console.log('   node switch-mode.js status  - Ver modo actual');
    console.log('   node check-mongodb.js       - Verificar MongoDB');
    console.log('   npm run test:master         - Ejecutar tests completos');

  } catch (error) {
    console.log('\n❌ ERROR EN LA CONFIGURACIÓN');
    console.log('============================\n');
    console.log(`Error: ${error.message}`);
    console.log('\n🔧 Soluciones posibles:');
    console.log('1. Asegúrate de tener Node.js y npm instalados');
    console.log('2. Verifica que no haya procesos usando el puerto 8080');
    console.log('3. Revisa los permisos de escritura en la carpeta');
    console.log('4. Para desarrollo básico, ejecuta: npm run dev');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupComplete();
}

module.exports = { setupComplete };