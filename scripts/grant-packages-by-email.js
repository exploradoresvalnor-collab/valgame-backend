require('dotenv').config();
const mongoose = require('mongoose');

async function grantPackagesByEmail(email, count = 4, packageName = 'Huevo Básico') {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI no está definido en el entorno (.env)');
    process.exit(1);
  }
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado');

    const db = mongoose.connection.db;
    const usersCol = db.collection('users');
    const packagesCol = db.collection('packages');
    const userPackagesCol = db.collection('user_packages');

    // 1) Buscar usuario por email
    const user = await usersCol.findOne({ email });
    if (!user) {
      console.error(`❌ Usuario no encontrado: ${email}`);
      process.exit(2);
    }

    // 2) Buscar paquete por nombre (o tomar el primero)
    let pkg = await packagesCol.findOne({ nombre: packageName });
    if (!pkg) {
      console.warn(`⚠️  Paquete "${packageName}" no encontrado. Buscando primero disponible...`);
      pkg = await packagesCol.findOne({});
      if (!pkg) {
        console.error('❌ No hay paquetes disponibles en la colección packages. Ejecuta scripts/seed-packages.js primero.');
        process.exit(3);
      }
    }

    // 3) Insertar N paquetes para el usuario
    const docs = Array.from({ length: Number(count) }).map(() => ({
      userId: String(user._id),
      paqueteId: String(pkg._id),
      fecha: new Date(),
      // snapshot opcional por si se borra el package luego
      packageSnapshot: {
        nombre: pkg.nombre,
        personajes: pkg.personajes || 1,
        categorias_garantizadas: pkg.categorias_garantizadas || [],
        val_reward: pkg.val_reward || 0,
        items_reward: pkg.items_reward || [],
      }
    }));

    const result = await userPackagesCol.insertMany(docs);

    console.log('🎁 Paquetes asignados correctamente');
    console.log('──────────────────────────────────────────────────────────');
    console.log(`👤 Usuario: ${user.email} (${user.username || 'sin username'})`);
    console.log(`📦 Paquete: ${pkg.nombre} (${pkg._id})`);
    console.log(`🔢 Cantidad: ${count}`);
    console.log(`🆔 IDs creados: ${Object.values(result.insertedIds).map(id => String(id)).join(', ')}`);

    // Mostrar total actual del usuario
    const totalUserPackages = await userPackagesCol.countDocuments({ userId: String(user._id) });
    console.log('──────────────────────────────────────────────────────────');
    console.log(`📊 Total de paquetes del usuario ahora: ${totalUserPackages}`);

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

// CLI
// node scripts/grant-packages-by-email.js --email user@example.com --count 4 --name "Huevo Básico"
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const email = args.email || args.e || null;
const count = Number(args.count || args.c || 4);
const name = args.name || args.n || 'Huevo Básico';

if (!email) {
  console.log('Uso: node scripts/grant-packages-by-email.js --email <correo> [--count 4] [--name "Huevo Básico"]');
  process.exit(0);
}

grantPackagesByEmail(email, count, name);
