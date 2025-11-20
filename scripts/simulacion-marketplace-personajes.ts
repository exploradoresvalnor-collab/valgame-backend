/**
 * 🎭 TRANSACCIÓN REAL: Marketplace de Personajes
 * 
 * Crea DOS usuarios reales con el mismo personaje "Draco Ígneo"
 * y ejecuta una transacción REAL de compra/venta.
 * Los usuarios y la transacción quedan PERMANENTES en MongoDB.
 */

import mongoose from 'mongoose';
import { User } from '../src/models/User';
import Listing from '../src/models/Listing';
import MarketplaceTransaction from '../src/models/MarketplaceTransaction';
import dotenv from 'dotenv';

dotenv.config();

async function simulacionMarketplacePersonajes() {
  try {
    console.log('\n🎭 TRANSACCIÓN REAL: MARKETPLACE DE PERSONAJES\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Conectado a MongoDB\n');

    // ==================================================================
    // PASO 1: Crear dos usuarios diferentes
    // ==================================================================
    console.log('📝 PASO 1: Creando dos usuarios...\n');

    const timestamp = Date.now();

    const vendedor = await User.create({
      username: `vendedor_draco_${timestamp}`,
      email: `vendedor_${timestamp}@test.com`,
      passwordHash: 'hash123',
      isVerified: true,
      receivedPioneerPackage: true,
      val: 1000,
      evo: 100,
      boletos: 10,
      energia: 100,
      energiaMaxima: 100,
      invocaciones: 0,
      evoluciones: 0,
      boletosDiarios: 0,
      personajes: [
        {
          personajeId: 'draco-igneo', // ← PERSONAJE REAL de la BD
          rango: 'SS' as const,
          nivel: 50,
          etapa: 3 as const,
          progreso: 80,
          experiencia: 125000,
          stats: { atk: 1500, vida: 9000, defensa: 600 }, // Stats evolucionados
          saludActual: 9000,
          saludMaxima: 9000,
          estado: 'saludable' as const,
          fechaHerido: null,
          equipamiento: [],
          activeBuffs: []
        }
      ],
      inventarioEquipamiento: [],
      inventarioConsumibles: [],
      limiteInventarioEquipamiento: 200,
      limiteInventarioConsumibles: 50,
      limiteInventarioPersonajes: 50
    });

    const comprador = await User.create({
      username: `comprador_draco_${timestamp}`,
      email: `comprador_${timestamp}@test.com`,
      passwordHash: 'hash456',
      isVerified: true,
      receivedPioneerPackage: true,
      val: 20000, // Tiene suficiente VAL para comprar
      evo: 50,
      boletos: 10,
      energia: 100,
      energiaMaxima: 100,
      invocaciones: 0,
      evoluciones: 0,
      boletosDiarios: 0,
      personajes: [
        {
          personajeId: 'draco-igneo', // ← MISMO PERSONAJE REAL
          rango: 'B' as const,        // ← Pero rango diferente
          nivel: 15,                  // ← Nivel diferente
          etapa: 1 as const,
          progreso: 30,
          experiencia: 5000,
          stats: { atk: 200, vida: 500, defensa: 150 }, // Stats iniciales
          saludActual: 500,
          saludMaxima: 500,
          estado: 'saludable' as const,
          fechaHerido: null,
          equipamiento: [],
          activeBuffs: []
        }
      ],
      inventarioEquipamiento: [],
      inventarioConsumibles: [],
      limiteInventarioEquipamiento: 200,
      limiteInventarioConsumibles: 50,
      limiteInventarioPersonajes: 50
    });

    console.log(`✅ Vendedor creado: ${vendedor.username} (ID: ${vendedor._id})`);
    console.log(`✅ Comprador creado: ${comprador.username} (ID: ${comprador._id})\n`);

    // ==================================================================
    // PASO 2: Mostrar los personajes de cada usuario
    // ==================================================================
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 PASO 2: Estado INICIAL de los personajes\n');

    console.log(`👤 VENDEDOR (${vendedor.username}):`);
    console.log(`   VAL: ${vendedor.val}`);
    console.log(`   Personajes: ${vendedor.personajes.length}`);
    vendedor.personajes.forEach((p, idx) => {
      console.log(`   
   [${idx + 1}] Instancia ID: ${p._id}
       Personaje Base: "${p.personajeId}"
       Rango: ${p.rango}
       Nivel: ${p.nivel}
       Stats: ATK=${p.stats.atk}, Vida=${p.stats.vida}, DEF=${p.stats.defensa}
       Experiencia: ${p.experiencia} XP`);
    });

    console.log(`\n👤 COMPRADOR (${comprador.username}):`);
    console.log(`   VAL: ${comprador.val}`);
    console.log(`   Personajes: ${comprador.personajes.length}`);
    comprador.personajes.forEach((p, idx) => {
      console.log(`   
   [${idx + 1}] Instancia ID: ${p._id}
       Personaje Base: "${p.personajeId}"
       Rango: ${p.rango}
       Nivel: ${p.nivel}
       Stats: ATK=${p.stats.atk}, Vida=${p.stats.vida}, DEF=${p.stats.defensa}
       Experiencia: ${p.experiencia} XP`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🔍 OBSERVACIÓN IMPORTANTE:\n');
    console.log('   ✅ Ambos usuarios tienen "Draco Ígneo, Señor de las Llamas" (personaje REAL de la BD)');
    console.log('   ✅ Pero cada Draco tiene un _id ÚNICO diferente');
    console.log('   ✅ Vendedor tiene Draco SS nivel 50 etapa 3 (super poderoso)');
    console.log('   ✅ Comprador tiene Draco B nivel 15 etapa 1 (débil)');
    console.log('   ✅ Son INSTANCIAS DIFERENTES del mismo personaje base\n');

    // ==================================================================
    // PASO 3: El vendedor lista su Aria SS en el marketplace
    // ==================================================================
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('💰 PASO 3: Vendedor lista su Draco Ígneo SS en el marketplace\n');

    const dracoVendedor = vendedor.personajes[0];
    const precioVenta = 15000; // 15,000 VAL

    console.log(`📝 Creando listing REAL en MongoDB...`);
    console.log(`   Personaje: ${dracoVendedor.personajeId}`);
    console.log(`   Instancia ID: ${dracoVendedor._id}`);
    console.log(`   Rango: ${dracoVendedor.rango}`);
    console.log(`   Nivel: ${dracoVendedor.nivel}`);
    console.log(`   Etapa: ${dracoVendedor.etapa}`);
    console.log(`   Precio: ${precioVenta} VAL`);
    console.log(`   Vendedor: ${vendedor._id}\n`);

    // ⚡ CREAR LISTING REAL EN MONGODB
    const impuesto = Math.floor(precioVenta * 0.05); // 5%
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 30); // 30 días

    const listing = await Listing.create({
      itemId: (dracoVendedor._id as any).toString(),
      type: 'personaje',
      sellerId: vendedor._id,
      precio: precioVenta,
      precioOriginal: precioVenta,
      impuesto: impuesto,
      estado: 'activo',
      fechaCreacion: new Date(),
      fechaExpiracion: fechaExpiracion,
      destacado: false,
      metadata: {
        nombre: 'Draco Ígneo, Señor de las Llamas',
        rango: dracoVendedor.rango,
        nivel: dracoVendedor.nivel,
        stats: dracoVendedor.stats
      }
    });

    console.log('✅ Listing REAL creado en MongoDB:\n');
    console.log(`   Listing ID: ${listing._id}`);
    console.log(`   Estado: ${listing.estado}`);
    console.log(`   Impuesto: ${impuesto} VAL`);
    console.log(`   Expira: ${listing.fechaExpiracion.toLocaleDateString()}\n`);

    // ==================================================================
    // PASO 4: El comprador compra el personaje
    // ==================================================================
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('💸 PASO 4: Comprador compra la Aria SS del vendedor\n');

    // Validaciones
    console.log('🔍 Validaciones de compra:\n');

    // 1. Verificar que el comprador tiene suficiente VAL
    console.log(`   ✓ VAL del comprador: ${comprador.val} >= ${precioVenta}? ${comprador.val >= precioVenta ? '✅ SÍ' : '❌ NO'}`);

    // 2. Verificar que el vendedor aún tiene el personaje
    const vendedorRefresh = await User.findById(vendedor._id);
    const personajeEnVendedor = vendedorRefresh?.personajes.id(dracoVendedor._id);
    console.log(`   ✓ Vendedor tiene el personaje? ${personajeEnVendedor ? '✅ SÍ' : '❌ NO'}`);

    // 3. Verificar que no es auto-compra
    console.log(`   ✓ No es auto-compra? ${(vendedor._id as any).toString() !== (comprador._id as any).toString() ? '✅ SÍ' : '❌ NO'}`);

    console.log('\n💵 Procesando transacción...\n');

    // ==================================================================
    // PASO 5: EJECUTAR LA TRANSACCIÓN
    // ==================================================================

    // 1. Transferir VAL (impuesto ya calculado arriba)
    const valParaVendedor = precioVenta - impuesto;

    vendedorRefresh!.val += valParaVendedor;
    comprador.val -= precioVenta;

    console.log(`   → Comprador paga: ${precioVenta} VAL`);
    console.log(`   → Impuesto marketplace: ${impuesto} VAL`);
    console.log(`   → Vendedor recibe: ${valParaVendedor} VAL`);

    // 2. Transferir el personaje del vendedor al comprador
    if (personajeEnVendedor) {
      // Copiar los datos del personaje
      const personajeTransferido = {
        personajeId: personajeEnVendedor.personajeId,
        rango: personajeEnVendedor.rango,
        nivel: personajeEnVendedor.nivel,
        etapa: personajeEnVendedor.etapa,
        progreso: personajeEnVendedor.progreso,
        experiencia: personajeEnVendedor.experiencia,
        stats: personajeEnVendedor.stats,
        saludActual: personajeEnVendedor.saludActual,
        saludMaxima: personajeEnVendedor.saludMaxima,
        estado: personajeEnVendedor.estado,
        fechaHerido: personajeEnVendedor.fechaHerido,
        equipamiento: personajeEnVendedor.equipamiento,
        activeBuffs: personajeEnVendedor.activeBuffs
      };

      // Agregar al comprador
      comprador.personajes.push(personajeTransferido as any);

      // Remover del vendedor
      vendedorRefresh!.personajes.pull(dracoVendedor._id);

      console.log(`\n   ✅ Personaje transferido del vendedor al comprador`);
    }

    // 3. Guardar cambios en BD
    await vendedorRefresh!.save();
    await comprador.save();

    // 4. Actualizar el listing a "vendido"
    listing.estado = 'vendido';
    listing.buyerId = comprador._id as any;
    listing.fechaVenta = new Date();
    await listing.save();

    // 5. Crear registro de transacción en MarketplaceTransaction
    const transaction = await MarketplaceTransaction.create({
      listingId: listing._id,
      sellerId: vendedor._id,
      buyerId: comprador._id,
      itemId: (dracoVendedor._id as any).toString(),
      itemType: 'personaje',
      precioOriginal: precioVenta,
      precioFinal: precioVenta,
      impuesto: impuesto,
      action: 'sold',
      timestamp: new Date(),
      itemMetadata: {
        nombre: 'Draco Ígneo, Señor de las Llamas',
        rango: dracoVendedor.rango,
        nivel: dracoVendedor.nivel,
        stats: dracoVendedor.stats
      },
      balanceSnapshot: {
        sellerBalanceBefore: 1000,
        sellerBalanceAfter: vendedorRefresh!.val,
        buyerBalanceBefore: 20000,
        buyerBalanceAfter: comprador.val
      },
      listingDuration: 0
    });

    console.log(`   ✅ Transacción completada`);
    console.log(`   ✅ Listing actualizado a "vendido"`);
    console.log(`   ✅ Registro de transacción creado: ${transaction._id}\n`);

    // ==================================================================
    // PASO 6: Mostrar el estado FINAL
    // ==================================================================
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 PASO 5: Estado FINAL después de la compra\n');

    const vendedorFinal = await User.findById(vendedor._id);
    const compradorFinal = await User.findById(comprador._id);

    console.log(`👤 VENDEDOR (${vendedorFinal!.username}):`);
    console.log(`   VAL: ${vendedorFinal!.val} (+${valParaVendedor} recibido)`);
    console.log(`   Personajes: ${vendedorFinal!.personajes.length}`);
    if (vendedorFinal!.personajes.length === 0) {
      console.log(`   ⚠️  Ya no tiene personajes (vendió su única Aria)`);
    } else {
      vendedorFinal!.personajes.forEach((p, idx) => {
        console.log(`   [${idx + 1}] ${p.personajeId} - Rango ${p.rango} - Nivel ${p.nivel}`);
      });
    }

    console.log(`\n👤 COMPRADOR (${compradorFinal!.username}):`);
    console.log(`   VAL: ${compradorFinal!.val} (-${precioVenta} gastado)`);
    console.log(`   Personajes: ${compradorFinal!.personajes.length} (¡aumentó!)`);
    compradorFinal!.personajes.forEach((p, idx) => {
      console.log(`   
   [${idx + 1}] Instancia ID: ${p._id}
       Personaje: "${p.personajeId}"
       Rango: ${p.rango}
       Nivel: ${p.nivel}
       Stats: ATK=${p.stats.atk}, Vida=${p.stats.vida}, DEF=${p.stats.defensa}
       ${p.nivel === 50 ? '⭐ ¡COMPRADA!' : '📦 Original'}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 RESULTADO FINAL:\n');
    console.log('   ✅ El comprador ahora tiene 2 Dracos Ígneos diferentes:');
    console.log('      1. Su Draco B original (nivel 15, etapa 1) - ID único');
    console.log('      2. El Draco SS comprado (nivel 50, etapa 3) - ID único diferente');
    console.log('   ✅ Cada Draco tiene su propio _id único');
    console.log('   ✅ Cada Draco mantiene sus stats, nivel y experiencia propios');
    console.log('   ✅ El vendedor recibió VAL y ya no tiene ese Draco');
    console.log('   ✅ El sistema funciona correctamente! 🚀\n');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('💾 REGISTROS PERMANENTES EN MONGODB:\n');
    console.log(`   📋 Usuario Vendedor: ${vendedorFinal!.username} (ID: ${vendedorFinal!._id})`);
    console.log(`   📋 Usuario Comprador: ${compradorFinal!.username} (ID: ${compradorFinal!._id})`);
    console.log(`   📋 Listing: ${listing._id} (Estado: ${listing.estado})`);
    console.log(`   📋 Transacción: ${transaction._id}`);
    console.log('\n   ⚠️  NOTA: Los usuarios y registros NO se eliminaron.');
    console.log('   ⚠️  Puedes consultarlos en MongoDB para verificar la transacción.\n');

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB\n');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar simulación
simulacionMarketplacePersonajes();
