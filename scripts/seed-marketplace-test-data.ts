/**
 * 🌱 SEED: Datos de prueba para el Marketplace
 * 
 * Crea listings de prueba para poder testear los filtros
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from '../src/models/Listing';
import { User } from '../src/models/User';

dotenv.config();

async function seedMarketplaceTestData() {
  try {
    console.log('\n🌱 CREANDO DATOS DE PRUEBA PARA MARKETPLACE\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI no definida');

    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar un usuario para asignar como seller
    const seller = await User.findOne();
    if (!seller) {
      console.log('❌ No hay usuarios en la BD. Crea usuarios primero.');
      process.exit(1);
    }

    console.log(`📦 Creando listings para usuario: ${seller.username}\n`);

    // Eliminar listings existentes de prueba
    await Listing.deleteMany({ 'metadata.nombre': /TEST/ });

    const testListings = [
      // PERSONAJES con diferentes stats
      {
        itemId: 'test-personaje-1',
        type: 'personaje',
        sellerId: seller._id,
        precio: 5000,
        precioOriginal: 5000,
        impuesto: 250,
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        destacado: false,
        metadata: {
          nombre: 'TEST Draco Flamígero',
          imagen: 'https://example.com/draco.png',
          rango: 'SS',
          nivel: 45,
          etapa: 3,
          stats: {
            atk: 2500,
            vida: 3000,
            defensa: 1500
          }
        }
      },
      {
        itemId: 'test-personaje-2',
        type: 'personaje',
        sellerId: seller._id,
        precio: 3000,
        precioOriginal: 3000,
        impuesto: 150,
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        destacado: true,
        metadata: {
          nombre: 'TEST Arcanis Místico',
          imagen: 'https://example.com/arcanis.png',
          rango: 'S',
          nivel: 30,
          etapa: 2,
          stats: {
            atk: 1800,
            vida: 2200,
            defensa: 1200
          }
        }
      },
      {
        itemId: 'test-personaje-3',
        type: 'personaje',
        sellerId: seller._id,
        precio: 1500,
        precioOriginal: 1500,
        impuesto: 75,
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        destacado: false,
        metadata: {
          nombre: 'TEST Guerrero Novato',
          imagen: 'https://example.com/guerrero.png',
          rango: 'C',
          nivel: 10,
          etapa: 1,
          stats: {
            atk: 800,
            vida: 1500,
            defensa: 600
          }
        }
      },
      // EQUIPAMIENTO
      {
        itemId: 'test-equip-1',
        type: 'equipamiento',
        sellerId: seller._id,
        precio: 2000,
        precioOriginal: 2000,
        impuesto: 100,
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        destacado: false,
        metadata: {
          nombre: 'TEST Espada Legendaria',
          imagen: 'https://example.com/espada.png',
          descripcion: 'Una espada de gran poder',
          rango: 'A',
          stats: {
            atk: 500,
            vida: 100,
            defensa: 50
          }
        }
      },
      {
        itemId: 'test-equip-2',
        type: 'equipamiento',
        sellerId: seller._id,
        precio: 800,
        precioOriginal: 800,
        impuesto: 40,
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        destacado: false,
        metadata: {
          nombre: 'TEST Armadura Básica',
          imagen: 'https://example.com/armadura.png',
          descripcion: 'Armadura de defensa',
          rango: 'B',
          stats: {
            atk: 0,
            vida: 200,
            defensa: 300
          }
        }
      },
      // CONSUMIBLES
      {
        itemId: 'test-consumible-1',
        type: 'consumible',
        sellerId: seller._id,
        precio: 100,
        precioOriginal: 100,
        impuesto: 5,
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        destacado: false,
        metadata: {
          nombre: 'TEST Poción de Vida',
          imagen: 'https://example.com/pocion.png',
          descripcion: 'Restaura 500 HP',
          rango: 'C',
          usos: 3
        }
      }
    ];

    await Listing.insertMany(testListings);
    console.log(`✅ ${testListings.length} listings de prueba creados:\n`);
    
    testListings.forEach(listing => {
      console.log(`   - ${listing.metadata.nombre}`);
      console.log(`     Tipo: ${listing.type}, Precio: ${listing.precio} VAL`);
      if (listing.metadata.stats) {
        console.log(`     Stats: ATK ${listing.metadata.stats.atk}, Vida ${listing.metadata.stats.vida}, Def ${listing.metadata.stats.defensa}`);
      }
      if (listing.metadata.nivel) {
        console.log(`     Nivel: ${listing.metadata.nivel}, Etapa: ${listing.metadata.etapa}`);
      }
      console.log();
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎉 SEED COMPLETADO\n');

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedMarketplaceTestData();
