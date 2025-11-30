require('dotenv').config();
const mongoose = require('mongoose');

async function analyzeCollections() {
  try {
    console.log('\nÌ¥ó Conectando a MongoDB...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('‚úÖ Conectado\n');
    const db = mongoose.connection.db;

    // Analizar colecciones cr√≠ticas
    console.log('‚ïê'.repeat(80));
    console.log('Ì≥ä AN√ÅLISIS DETALLADO DE COLECCIONES CR√çTICAS');
    console.log('‚ïê'.repeat(80) + '\n');

    // USERS
    console.log('Ì±§ USERS (Usuarios registrados)');
    console.log('‚îÄ'.repeat(80));
    const usersCount = await db.collection('users').countDocuments();
    console.log(`   Documentos: ${usersCount}`);
    if (usersCount > 0) {
      const user = await db.collection('users').findOne();
      console.log(`   Campos: ${Object.keys(user).join(', ')}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Personajes: ${user.personajes ? user.personajes.length : 0}`);
    } else {
      console.log('   ‚ö†Ô∏è NO HAY USUARIOS - Necesitas crear al menos uno');
    }
    console.log();

    // ITEMS
    console.log('‚öîÔ∏è ITEMS (Equipamiento, consumibles)');
    console.log('‚îÄ'.repeat(80));
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
    console.log('Ìø∞ DUNGEONS (Mazmorras)');
    console.log('‚îÄ'.repeat(80));
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
    console.log('‚öôÔ∏è GAME_SETTINGS (Configuraci√≥n del juego)');
    console.log('‚îÄ'.repeat(80));
    const settingsCount = await db.collection('game_settings').countDocuments();
    console.log(`   Documentos: ${settingsCount}`);
    if (settingsCount > 0) {
      const settings = await db.collection('game_settings').findOne();
      console.log(`   Campos: ${Object.keys(settings).slice(0, 10).join(', ')}`);
    }
    console.log();

    // PACKAGES
    console.log('Ì≥¶ PACKAGES (Paquetes de compra)');
    console.log('‚îÄ'.repeat(80));
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
    console.log('ÌæÆ SURVIVAL_SESSIONS (Sesiones de supervivencia)');
    console.log('‚îÄ'.repeat(80));
    const survivalCount = await db.collection('survival_sessions').countDocuments();
    console.log(`   Documentos: ${survivalCount}`);
    if (survivalCount > 0) {
      const sessions = await db.collection('survival_sessions').find({}).limit(2).toArray();
      sessions.forEach((s, i) => {
        console.log(`   [${i+1}] Usuario: ${s.userId} - Puntos: ${s.puntos} - Estado: ${s.estado}`);
      });
    } else {
      console.log('   ‚ö†Ô∏è SIN SESIONES - Se crea cuando el usuario inicia supervivencia');
    }
    console.log();

    // LISTINGS
    console.log('Ì≤∞ LISTINGS (Items en venta en marketplace)');
    console.log('‚îÄ'.repeat(80));
    const listingsCount = await db.collection('listings').countDocuments();
    console.log(`   Documentos: ${listingsCount}`);
    if (listingsCount > 0) {
      const listings = await db.collection('listings').find({}).limit(3).toArray();
      listings.forEach((l, i) => {
        console.log(`   [${i+1}] Item: ${l.itemId} - Vendedor: ${l.sellerId} - Precio: ${l.precio} VAL`);
      });
    } else {
      console.log('   ‚ö†Ô∏è SIN LISTINGS - Se crea cuando el usuario vende un item');
    }
    console.log();

    // CATEGOR√çAS
    console.log('Ì≥Ç CATEGORIES (Categor√≠as de items)');
    console.log('‚îÄ'.repeat(80));
    const categoriesCount = await db.collection('categories').countDocuments();
    console.log(`   Documentos: ${categoriesCount}`);
    if (categoriesCount > 0) {
      const categories = await db.collection('categories').find({}).toArray();
      console.log(`   Categor√≠as: ${categories.map(c => c.nombre).join(', ')}`);
    }
    console.log();

    console.log('‚ïê'.repeat(80));
    console.log('Ì≥ã RESUMEN');
    console.log('‚ïê'.repeat(80));
    console.log(`\n‚úÖ Items: ${itemsCount} - ${itemsCount >= 20 ? 'OK' : '‚ö†Ô∏è Pocos'}`);
    console.log(`${usersCount > 0 ? '‚úÖ' : '‚ùå'} Usuarios: ${usersCount} - ${usersCount === 0 ? 'NECESITA USUARIOS' : 'OK'}`);
    console.log(`‚úÖ Dungeons: ${dungeonsCount} - ${dungeonsCount >= 3 ? 'OK' : '‚ö†Ô∏è Pocos'}`);
    console.log(`‚úÖ Packages: ${packagesCount} - ${packagesCount >= 3 ? 'OK' : '‚ö†Ô∏è Pocos'}`);
    console.log(`‚úÖ GameSettings: ${settingsCount} - ${settingsCount > 0 ? 'OK' : '‚ö†Ô∏è Falta'}`);

    console.log('\n' + '‚ïê'.repeat(80));
    if (usersCount === 0) {
      console.log('Ì¥¥ ACCI√ìN REQUERIDA: No hay usuarios en la BD');
      console.log('   Necesitas crear un usuario. Opciones:');
      console.log('   1. Registrarse a trav√©s de la API');
      console.log('   2. Ejecutar script de seed con usuarios');
      console.log('   3. Crear usuario manualmente en MongoDB');
    } else {
      console.log('Ìø¢ TODO OK - Base de datos lista para usar');
    }
    console.log('‚ïê'.repeat(80) + '\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n‚ùå Error:', error.message);
    process.exit(1);
  }
}

analyzeCollections();
