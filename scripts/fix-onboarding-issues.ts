/**
 * 🔧 SCRIPT DE REPARACIÓN: FLUJO DE ONBOARDING
 * 
 * Repara automáticamente problemas detectados en el flujo de onboarding:
 * 1. Usuarios verificados sin Paquete Pionero → Entregar paquete
 * 2. Usuarios con recursos NULL → Inicializar a 0
 * 3. Usuarios con flag pero sin personaje → Re-entregar personaje
 * 4. Usuarios con flag pero sin items → Re-entregar items
 * 
 * USO:
 * npx ts-node scripts/fix-onboarding-issues.ts
 * 
 * SEGURIDAD:
 * - Modo DRY RUN por defecto (no modifica DB)
 * - Usa --apply para aplicar cambios reales
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, IUser } from '../src/models/User';
import BaseCharacter from '../src/models/BaseCharacter';
import { Consumable } from '../src/models/Consumable';
import { Equipment } from '../src/models/Equipment';
import { Types } from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/valgame';
const DRY_RUN = !process.argv.includes('--apply');

// IDs conocidos (mismo que en onboarding.service.ts)
const POTION_ID = new Types.ObjectId('68dc525adb5c735854b5659d');
const SWORD_ID = new Types.ObjectId('68dc50e9db5c735854b56591');

interface RepairStats {
  usersAnalyzed: number;
  usersFixed: number;
  resourcesInitialized: number;
  packagesDelivered: number;
  charactersAdded: number;
  itemsAdded: number;
  errors: any[];
}

async function fixOnboardingIssues() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB:', MONGODB_URI);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔧 REPARACIÓN AUTOMÁTICA: FLUJO DE ONBOARDING');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Modo: ${DRY_RUN ? '🔍 DRY RUN (no modifica DB)' : '⚠️  APLICANDO CAMBIOS REALES'}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (DRY_RUN) {
      console.log('💡 Este es un DRY RUN. Los cambios NO se aplicarán.');
      console.log('   Para aplicar cambios reales, ejecuta: npm run fix-onboarding -- --apply\n');
    }

    const stats: RepairStats = {
      usersAnalyzed: 0,
      usersFixed: 0,
      resourcesInitialized: 0,
      packagesDelivered: 0,
      charactersAdded: 0,
      itemsAdded: 0,
      errors: []
    };

    // Buscar BaseCharacter rango D (necesario para el paquete pionero)
    const baseCharD = await BaseCharacter.findOne({ descripcion_rango: 'D' });
    if (!baseCharD) {
      console.error('❌ ERROR CRÍTICO: No se encontró BaseCharacter rango D');
      console.error('   Ejecuta: npm run seed para crear los personajes base');
      process.exit(1);
    }

    // Buscar items del paquete pionero
    const potion = await Consumable.findById(POTION_ID);
    const sword = await Equipment.findById(SWORD_ID);

    console.log('✅ Recursos necesarios encontrados:');
    console.log(`   - BaseCharacter rango D: ${baseCharD.nombre}`);
    console.log(`   - Poción: ${potion ? potion.nombre : '⚠️  NO ENCONTRADA'}`);
    console.log(`   - Espada: ${sword ? sword.nombre : '⚠️  NO ENCONTRADA'}\n`);

    // Obtener todos los usuarios
    const users = await User.find({});
    stats.usersAnalyzed = users.length;

    console.log(`📊 Analizando ${users.length} usuarios...\n`);

    for (const user of users) {
      let userModified = false;
      const fixes: string[] = [];

      // ═══════════════════════════════════════════════════════════
      // FIX 1: Recursos NULL/undefined
      // ═══════════════════════════════════════════════════════════
      if (user.val === null || user.val === undefined) {
        user.val = 0;
        userModified = true;
        fixes.push('VAL inicializado a 0');
        stats.resourcesInitialized++;
      }
      if (user.boletos === null || user.boletos === undefined) {
        user.boletos = 0;
        userModified = true;
        fixes.push('Boletos inicializados a 0');
        stats.resourcesInitialized++;
      }
      if (user.evo === null || user.evo === undefined) {
        user.evo = 0;
        userModified = true;
        fixes.push('EVO inicializado a 0');
        stats.resourcesInitialized++;
      }

      // ═══════════════════════════════════════════════════════════
      // FIX 2: Usuario verificado sin paquete pionero
      // ═══════════════════════════════════════════════════════════
      const hasPioneerFlag = (user as any).receivedPioneerPackage === true;
      
      if (user.isVerified && !hasPioneerFlag) {
        // Usuario verificado que nunca recibió su paquete → Entregar completo
        try {
          // Añadir personaje
          const pioneerCharacter = {
            personajeId: baseCharD.id,
            rango: 'D',
            nivel: 1,
            etapa: 1,
            progreso: 0,
            stats: baseCharD.stats,
            saludActual: baseCharD.stats.vida,
            saludMaxima: baseCharD.stats.vida,
            estado: 'saludable',
            fechaHerido: null,
            equipamiento: [],
            activeBuffs: []
          } as any;

          user.personajes.push(pioneerCharacter as any);
          user.val = (user.val || 0) + 50; // Paquete pionero otorga 50 VAL

          // Añadir consumibles (3 pociones)
          if (potion) {
            for (let i = 0; i < 3; i++) {
              (user as any).inventarioConsumibles.push({
                consumableId: POTION_ID,
                usos_restantes: potion.usos_maximos || 1
              });
            }
          }

          // Añadir equipamiento (espada)
          if (sword) {
            if (!(user.inventarioEquipamiento || []).some((id: any) => String(id) === String(SWORD_ID))) {
              (user as any).inventarioEquipamiento = user.inventarioEquipamiento || [];
              (user as any).inventarioEquipamiento.push(SWORD_ID);
            }
          }

          (user as any).receivedPioneerPackage = true;
          
          userModified = true;
          fixes.push('Paquete Pionero entregado (completo)');
          stats.packagesDelivered++;
          stats.charactersAdded++;
          stats.itemsAdded += (potion ? 3 : 0) + (sword ? 1 : 0);

        } catch (err: any) {
          stats.errors.push({
            email: user.email,
            error: 'Error al entregar paquete pionero',
            details: err.message
          });
        }
      }

      // ═══════════════════════════════════════════════════════════
      // FIX 3: Flag de paquete pero sin personaje
      // ═══════════════════════════════════════════════════════════
      else if (hasPioneerFlag && (!user.personajes || user.personajes.length === 0)) {
        try {
          const pioneerCharacter = {
            personajeId: baseCharD.id,
            rango: 'D',
            nivel: 1,
            etapa: 1,
            progreso: 0,
            stats: baseCharD.stats,
            saludActual: baseCharD.stats.vida,
            saludMaxima: baseCharD.stats.vida,
            estado: 'saludable',
            fechaHerido: null,
            equipamiento: [],
            activeBuffs: []
          } as any;

          user.personajes.push(pioneerCharacter as any);
          userModified = true;
          fixes.push('Personaje pionero añadido');
          stats.charactersAdded++;

        } catch (err: any) {
          stats.errors.push({
            email: user.email,
            error: 'Error al añadir personaje pionero',
            details: err.message
          });
        }
      }

      // ═══════════════════════════════════════════════════════════
      // FIX 4: Flag de paquete pero inventario vacío
      // ═══════════════════════════════════════════════════════════
      if (hasPioneerFlag) {
        const hasEquipment = user.inventarioEquipamiento && user.inventarioEquipamiento.length > 0;
        const hasConsumables = user.inventarioConsumibles && user.inventarioConsumibles.length > 0;

        if (!hasConsumables && potion) {
          try {
            for (let i = 0; i < 3; i++) {
              (user as any).inventarioConsumibles.push({
                consumableId: POTION_ID,
                usos_restantes: potion.usos_maximos || 1
              });
            }
            userModified = true;
            fixes.push('3 pociones añadidas');
            stats.itemsAdded += 3;
          } catch (err: any) {
            stats.errors.push({
              email: user.email,
              error: 'Error al añadir pociones',
              details: err.message
            });
          }
        }

        if (!hasEquipment && sword) {
          try {
            if (!(user.inventarioEquipamiento || []).some((id: any) => String(id) === String(SWORD_ID))) {
              (user as any).inventarioEquipamiento = user.inventarioEquipamiento || [];
              (user as any).inventarioEquipamiento.push(SWORD_ID);
              userModified = true;
              fixes.push('Espada añadida');
              stats.itemsAdded++;
            }
          } catch (err: any) {
            stats.errors.push({
              email: user.email,
              error: 'Error al añadir espada',
              details: err.message
            });
          }
        }

        // Verificar que tenga VAL del paquete
        if (user.val === 0 || user.val === null) {
          user.val = 50;
          userModified = true;
          fixes.push('50 VAL añadidos');
        }
      }

      // ═══════════════════════════════════════════════════════════
      // GUARDAR CAMBIOS
      // ═══════════════════════════════════════════════════════════
      if (userModified) {
        stats.usersFixed++;

        console.log(`🔧 Usuario: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Verificado: ${user.isVerified ? '✅' : '❌'}`);
        console.log(`   Fixes aplicados:`);
        fixes.forEach(fix => console.log(`     - ${fix}`));

        if (!DRY_RUN) {
          try {
            await user.save();
            console.log(`   ✅ Cambios guardados\n`);
          } catch (err: any) {
            console.log(`   ❌ Error al guardar: ${err.message}\n`);
            stats.errors.push({
              email: user.email,
              error: 'Error al guardar cambios',
              details: err.message
            });
          }
        } else {
          console.log(`   🔍 [DRY RUN] Cambios NO guardados\n`);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // REPORTE FINAL
    // ═══════════════════════════════════════════════════════════
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 REPORTE FINAL');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`👥 Usuarios analizados: ${stats.usersAnalyzed}`);
    console.log(`🔧 Usuarios reparados: ${stats.usersFixed}`);
    console.log(`💰 Recursos inicializados: ${stats.resourcesInitialized}`);
    console.log(`📦 Paquetes entregados: ${stats.packagesDelivered}`);
    console.log(`🎮 Personajes añadidos: ${stats.charactersAdded}`);
    console.log(`⚔️  Items añadidos: ${stats.itemsAdded}`);
    console.log(`❌ Errores: ${stats.errors.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (stats.errors.length > 0) {
      console.log('❌ ERRORES ENCONTRADOS:');
      stats.errors.forEach((err, i) => {
        console.log(`${i + 1}. Email: ${err.email}`);
        console.log(`   Error: ${err.error}`);
        console.log(`   Detalles: ${err.details}\n`);
      });
    }

    if (DRY_RUN && stats.usersFixed > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('💡 PRÓXIMOS PASOS');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Se repararon ${stats.usersFixed} usuarios en modo DRY RUN.`);
      console.log('Para aplicar los cambios REALES, ejecuta:');
      console.log('');
      console.log('   npx ts-node scripts/fix-onboarding-issues.ts --apply');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════\n');
    } else if (!DRY_RUN && stats.usersFixed > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('✅ REPARACIÓN COMPLETADA');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Se repararon ${stats.usersFixed} usuarios exitosamente.`);
      console.log('');
      console.log('Verifica los cambios con:');
      console.log('   npx ts-node scripts/diagnose-onboarding-flow.ts');
      console.log('═══════════════════════════════════════════════════════════\n');
    } else if (stats.usersFixed === 0) {
      console.log('✅ No se detectaron problemas que reparar.\n');
    }

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error crítico durante la reparación:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixOnboardingIssues();
