require('dotenv').config();
const mongoose = require('mongoose');

async function analyzeCollections() {
  try {
    console.log('\n��� Conectando a MongoDB...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000
    });

    console.log('✅ Conectado\n');
    const db = mongoose.connection.db;

    // Analizar colecciones críticas
    console.log('═'.repeat(80));
    console.log('��� ANÁLISIS DETALLADO DE COLECCIONES CRÍTICAS');
    console.log('═'.repeat(80) + '\n');

    // USERS
    console.log('��� USERS (Usuarios registrados)');
    console.log('─'.repeat(80));
    const usersCount = await db.collection('users').countDocuments();
    console.log(`   Documentos: ${usersCount}`);
    if (usersCount > 0) {
      const user = await db.collection('users').findOne();
      console.log(`   Campos: ${Object.keys(user).join(', ')}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Personajes: ${user.personajes ? user.personajes.length : 0}`);
    } else {
      console.log('   ⚠️ NO HAY USUARIOS - Necesitas crear al menos uno');
    }
    console.log();

    // ITEMS
    console.log('⚔️ ITEMS (Equipamiento, consumibles)');
    console.log('─'.repeat(80));
    const itemsCount = await db.collection('items').countDocuments();
    console.log(`   Documentos: ${itemsCount}`);
    if (itemsCount > 0) {
      const items = await db.collection('items').find({}).limit(3).toArray();
      items.forEach((item, i) => {
        console.log(`   [${i+1}] ${item.nombre} - Tipo: ${item.tipoItem} - Rango: ${item.rango}`);
      });
    }
    console.log();

    // DUNGEONS
    console.log('��� DUNGEONS (Mazmorras)');
    console.log('─'.repeat(80));
    const dungeonsCount = await db.collection('dungeons').countDocuments();
    console.log(`   Documentos: ${dungeonsCount}`);
    if (dungeonsCount > 0) {
      const dungeons = await db.collection('dungeons').find({}).toArray();
      dungeons.forEach((d, i) => {
        console.log(`   [${i+1}] ${d.nombre} - Dificultad: ${d.dificultad} - Oleadas: ${d.oleadas?.length || 0}`);
      });
    }
    console.log();

    // GAME_SETTINGS
    console.log('⚙️ GAME_SETTINGS (Configuración del juego)');
    console.log('─'.repeat(80));
    const settingsCount = await db.collection('game_settings').countDocuments();
    console.log(`   Documentos: ${settingsCount}`);
    if (settingsCount > 0) {
      const settings = await db.collection('game_settings').findOne();
      console.log(`   Campos: ${Object.keys(settings).slice(0, 10).join(', ')}`);
    }
    console.log();

    // PACKAGES
    console.log('��� PACKAGES (Paquetes de compra)');
    console.log('─'.repeat(80));
    const packagesCount = await db.collection('packages').countDocuments();
    console.log(`   Documentos: ${packagesCount}`);
    if (packagesCount > 0) {
      const packages = await db.collection('packages').find({}).limit(3).toArray();
      packages.forEach((pkg, i) => {
        console.log(`   [${i+1}] ${pkg.nombre} - Precio: $${pkg.precioUSD} - VAL: ${pkg.val}`);
      });
    }
    console.log();

    // SURVIVAL_SESSIONS
    console.log('��� SURVIVAL_SESSIONS (Sesiones de supervivencia)');
    console.log('─'.repeat(80));
    const survivalCount = await db.collection('survival_sessions').countDocuments();
    console.log(`   Documentos: ${survivalCount}`);
    if (survivalCount > 0) {
      const sessions = await db.collection('survival_sessions').find({}).limit(2).toArray();
      sessions.forEach((s, i) => {
        console.log(`   [${i+1}] Usuario: ${s.userId} - Puntos: ${s.puntos} - Estado: ${s.estado}`);
      });
    } else {
      console.log('   ⚠️ SIN SESIONES - Se crea cuando el usuario inicia supervivencia');
    }
    console.log();

    // LISTINGS
    console.log('��� LISTINGS (Items en venta en marketplace)');
    console.log('─'.repeat(80));
    const listingsCount = await db.collection('listings').countDocuments();
    console.log(`   Documentos: ${listingsCount}`);
    if (listingsCount > 0) {
      const listings = await db.collection('listings').find({}).limit(3).toArray();
      listings.forEach((l, i) => {
        console.log(`   [${i+1}] Item: ${l.itemId} - Vendedor: ${l.sellerId} - Precio: ${l.precio} VAL`);
      });
    } else {
      console.log('   ⚠️ SIN LISTINGS - Se crea cuando el usuario vende un item');
    }
    console.log();

    // CATEGORÍAS
    console.log('��� CATEGORIES (Categorías de items)');
    console.log('─'.repeat(80));
    const categoriesCount = await db.collection('categories').countDocuments();
    console.log(`   Documentos: ${categoriesCount}`);
    if (categoriesCount > 0) {
      const categories = await db.collection('categories').find({}).toArray();
      console.log(`   Categorías: ${categories.map(c => c.nombre).join(', ')}`);
    }
    console.log();

    console.log('═'.repeat(80));
    console.log('��� RESUMEN');
    console.log('═'.repeat(80));
    console.log(`\n✅ Items: ${itemsCount} - ${itemsCount >= 20 ? 'OK' : '⚠️ Pocos'}`);
    console.log(`${usersCount > 0 ? '✅' : '❌'} Usuarios: ${usersCount} - ${usersCount === 0 ? 'NECESITA USUARIOS' : 'OK'}`);
    console.log(`✅ Dungeons: ${dungeonsCount} - ${dungeonsCount >= 3 ? 'OK' : '⚠️ Pocos'}`);
    console.log(`✅ Packages: ${packagesCount} - ${packagesCount >= 3 ? 'OK' : '⚠️ Pocos'}`);
    console.log(`✅ GameSettings: ${settingsCount} - ${settingsCount > 0 ? 'OK' : '⚠️ Falta'}`);

    console.log('\n' + '═'.repeat(80));
    if (usersCount === 0) {
      console.log('��� ACCIÓN REQUERIDA: No hay usuarios en la BD');
      console.log('   Necesitas crear un usuario. Opciones:');
      console.log('   1. Registrarse a través de la API');
      console.log('   2. Ejecutar script de seed con usuarios');
      console.log('   3. Crear usuario manualmente en MongoDB');
    } else {
      console.log('��� TODO OK - Base de datos lista para usar');
    }
    console.log('═'.repeat(80) + '\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

analyzeCollections();
