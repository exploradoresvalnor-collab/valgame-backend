/**
 * 🔍 SCRIPT DE DIAGNÓSTICO COMPLETO: FLUJO DE ONBOARDING
 * 
 * Verifica el estado del flujo completo de usuarios nuevos:
 * - Registro → Verificación → Login → Paquete Pionero → Inventario
 * 
 * DETECTA:
 * ❌ Usuarios verificados sin Paquete Pionero
 * ❌ Usuarios con flag `receivedPioneerPackage` pero sin personaje
 * ❌ Usuarios con flag `receivedPioneerPackage` pero sin recursos (VAL, items)
 * ❌ Usuarios con recursos NULL o undefined
 * ❌ Usuarios con inventarios vacíos que deberían tener items
 * 
 * USO:
 * npx ts-node scripts/diagnose-onboarding-flow.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User';
import BaseCharacter from '../src/models/BaseCharacter';
import { Consumable } from '../src/models/Consumable';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/valgame';

interface DiagnosticReport {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  
  // Paquete Pionero
  usersWithPioneerPackage: number;
  usersWithoutPioneerPackage: number;
  verifiedButNoPioneerPackage: any[];
  
  // Recursos NULL/undefined
  usersWithNullResources: any[];
  
  // Personajes
  usersWithCharacters: number;
  usersWithoutCharacters: number;
  pioneerFlagButNoCharacter: any[];
  
  // Inventario
  usersWithEquipment: number;
  usersWithConsumables: number;
  pioneerFlagButEmptyInventory: any[];
  
  // Inconsistencias críticas
  criticalIssues: any[];
}

async function diagnoseOnboardingFlow() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB:', MONGODB_URI);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔍 DIAGNÓSTICO COMPLETO: FLUJO DE ONBOARDING');
    console.log('═══════════════════════════════════════════════════════════\n');

    const users = await User.find({}).select(
      'email username isVerified receivedPioneerPackage val boletos evo ' +
      'personajes inventarioEquipamiento inventarioConsumibles fechaRegistro'
    );

    const report: DiagnosticReport = {
      totalUsers: users.length,
      verifiedUsers: 0,
      unverifiedUsers: 0,
      usersWithPioneerPackage: 0,
      usersWithoutPioneerPackage: 0,
      verifiedButNoPioneerPackage: [],
      usersWithNullResources: [],
      usersWithCharacters: 0,
      usersWithoutCharacters: 0,
      pioneerFlagButNoCharacter: [],
      usersWithEquipment: 0,
      usersWithConsumables: 0,
      pioneerFlagButEmptyInventory: [],
      criticalIssues: []
    };

    console.log(`📊 Analizando ${users.length} usuarios...\n`);

    for (const user of users) {
      // Verificación
      if (user.isVerified) {
        report.verifiedUsers++;
      } else {
        report.unverifiedUsers++;
      }

      // Paquete Pionero
      const hasPioneerFlag = (user as any).receivedPioneerPackage === true;
      if (hasPioneerFlag) {
        report.usersWithPioneerPackage++;
      } else {
        report.usersWithoutPioneerPackage++;
      }

      // 🔴 ISSUE 1: Usuario verificado pero sin Paquete Pionero
      if (user.isVerified && !hasPioneerFlag) {
        report.verifiedButNoPioneerPackage.push({
          email: user.email,
          username: user.username,
          fechaRegistro: user.fechaRegistro
        });
      }

      // 🔴 ISSUE 2: Recursos NULL o undefined
      const nullResources = [];
      if (user.val === null || user.val === undefined) nullResources.push('val');
      if (user.boletos === null || user.boletos === undefined) nullResources.push('boletos');
      if (user.evo === null || user.evo === undefined) nullResources.push('evo');

      if (nullResources.length > 0) {
        report.usersWithNullResources.push({
          email: user.email,
          username: user.username,
          nullResources: nullResources.join(', '),
          values: {
            val: user.val,
            boletos: user.boletos,
            evo: user.evo
          }
        });
      }

      // Personajes
      const hasCharacters = user.personajes && user.personajes.length > 0;
      if (hasCharacters) {
        report.usersWithCharacters++;
      } else {
        report.usersWithoutCharacters++;
      }

      // 🔴 ISSUE 3: Flag de paquete pionero pero sin personaje
      if (hasPioneerFlag && !hasCharacters) {
        report.pioneerFlagButNoCharacter.push({
          email: user.email,
          username: user.username,
          personajesCount: user.personajes?.length || 0
        });
      }

      // Inventario
      const hasEquipment = user.inventarioEquipamiento && user.inventarioEquipamiento.length > 0;
      const hasConsumables = user.inventarioConsumibles && user.inventarioConsumibles.length > 0;

      if (hasEquipment) report.usersWithEquipment++;
      if (hasConsumables) report.usersWithConsumables++;

      // 🔴 ISSUE 4: Flag de paquete pionero pero inventario vacío
      if (hasPioneerFlag && !hasEquipment && !hasConsumables) {
        report.pioneerFlagButEmptyInventory.push({
          email: user.email,
          username: user.username,
          equipmentCount: user.inventarioEquipamiento?.length || 0,
          consumablesCount: user.inventarioConsumibles?.length || 0
        });
      }

      // 🔴 ISSUE 5: CRÍTICO - Flag de paquete pionero pero recursos en 0 o NULL
      if (hasPioneerFlag && (user.val === 0 || user.val === null || user.val === undefined)) {
        report.criticalIssues.push({
          type: 'PIONEER_PACKAGE_NO_VAL',
          email: user.email,
          username: user.username,
          val: user.val,
          description: 'Usuario tiene flag receivedPioneerPackage pero VAL es 0 o NULL'
        });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // REPORTE VISUAL
    // ═══════════════════════════════════════════════════════════

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN GENERAL');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`👥 Total de usuarios: ${report.totalUsers}`);
    console.log(`✅ Verificados: ${report.verifiedUsers}`);
    console.log(`⏳ No verificados: ${report.unverifiedUsers}`);
    console.log();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📦 PAQUETE PIONERO');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Con paquete entregado: ${report.usersWithPioneerPackage}`);
    console.log(`❌ Sin paquete entregado: ${report.usersWithoutPioneerPackage}`);
    console.log();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎮 PERSONAJES');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Con personajes: ${report.usersWithCharacters}`);
    console.log(`❌ Sin personajes: ${report.usersWithoutCharacters}`);
    console.log();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎒 INVENTARIO');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`⚔️  Con equipamiento: ${report.usersWithEquipment}`);
    console.log(`🧪 Con consumibles: ${report.usersWithConsumables}`);
    console.log();

    // ═══════════════════════════════════════════════════════════
    // PROBLEMAS DETECTADOS
    // ═══════════════════════════════════════════════════════════

    let hasIssues = false;

    if (report.verifiedButNoPioneerPackage.length > 0) {
      hasIssues = true;
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔴 PROBLEMA 1: USUARIOS VERIFICADOS SIN PAQUETE PIONERO');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Encontrados: ${report.verifiedButNoPioneerPackage.length}\n`);
      report.verifiedButNoPioneerPackage.forEach((u, i) => {
        console.log(`${i + 1}. Email: ${u.email}`);
        console.log(`   Username: ${u.username}`);
        console.log(`   Registrado: ${u.fechaRegistro}`);
        console.log();
      });
    }

    if (report.usersWithNullResources.length > 0) {
      hasIssues = true;
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔴 PROBLEMA 2: USUARIOS CON RECURSOS NULL/UNDEFINED');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Encontrados: ${report.usersWithNullResources.length}\n`);
      report.usersWithNullResources.forEach((u, i) => {
        console.log(`${i + 1}. Email: ${u.email}`);
        console.log(`   Recursos NULL: ${u.nullResources}`);
        console.log(`   Valores: VAL=${u.values.val}, Boletos=${u.values.boletos}, EVO=${u.values.evo}`);
        console.log();
      });
    }

    if (report.pioneerFlagButNoCharacter.length > 0) {
      hasIssues = true;
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔴 PROBLEMA 3: PAQUETE ENTREGADO PERO SIN PERSONAJE');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Encontrados: ${report.pioneerFlagButNoCharacter.length}\n`);
      report.pioneerFlagButNoCharacter.forEach((u, i) => {
        console.log(`${i + 1}. Email: ${u.email}`);
        console.log(`   Personajes: ${u.personajesCount}`);
        console.log();
      });
    }

    if (report.pioneerFlagButEmptyInventory.length > 0) {
      hasIssues = true;
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔴 PROBLEMA 4: PAQUETE ENTREGADO PERO INVENTARIO VACÍO');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Encontrados: ${report.pioneerFlagButEmptyInventory.length}\n`);
      report.pioneerFlagButEmptyInventory.forEach((u, i) => {
        console.log(`${i + 1}. Email: ${u.email}`);
        console.log(`   Equipamiento: ${u.equipmentCount} items`);
        console.log(`   Consumibles: ${u.consumablesCount} items`);
        console.log();
      });
    }

    if (report.criticalIssues.length > 0) {
      hasIssues = true;
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🚨 PROBLEMAS CRÍTICOS');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Encontrados: ${report.criticalIssues.length}\n`);
      report.criticalIssues.forEach((issue, i) => {
        console.log(`${i + 1}. Tipo: ${issue.type}`);
        console.log(`   Email: ${issue.email}`);
        console.log(`   Descripción: ${issue.description}`);
        console.log(`   VAL actual: ${issue.val}`);
        console.log();
      });
    }

    // ═══════════════════════════════════════════════════════════
    // CONCLUSIÓN
    // ═══════════════════════════════════════════════════════════

    console.log('═══════════════════════════════════════════════════════════');
    if (hasIssues) {
      console.log('❌ SE DETECTARON PROBLEMAS EN EL FLUJO DE ONBOARDING');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log('📋 ACCIONES RECOMENDADAS:');
      console.log('');
      if (report.verifiedButNoPioneerPackage.length > 0) {
        console.log(`1. Ejecutar migración para ${report.verifiedButNoPioneerPackage.length} usuario(s) verificado(s) sin paquete`);
      }
      if (report.usersWithNullResources.length > 0) {
        console.log(`2. Inicializar recursos NULL para ${report.usersWithNullResources.length} usuario(s)`);
      }
      if (report.pioneerFlagButNoCharacter.length > 0) {
        console.log(`3. Re-entregar personaje pionero a ${report.pioneerFlagButNoCharacter.length} usuario(s)`);
      }
      if (report.pioneerFlagButEmptyInventory.length > 0) {
        console.log(`4. Re-entregar items del paquete a ${report.pioneerFlagButEmptyInventory.length} usuario(s)`);
      }
      if (report.criticalIssues.length > 0) {
        console.log(`5. CRÍTICO: Revisar ${report.criticalIssues.length} usuario(s) con inconsistencias graves`);
      }
      console.log('');
      console.log('💡 Ejecuta: npx ts-node scripts/fix-onboarding-issues.ts');
    } else {
      console.log('✅ FLUJO DE ONBOARDING CORRECTO');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('No se detectaron problemas. Todos los usuarios tienen:');
      console.log('- Paquete Pionero entregado correctamente');
      console.log('- Recursos inicializados (VAL, boletos, EVO)');
      console.log('- Personaje base asignado');
      console.log('- Items en inventario');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

    // Guardar reporte JSON para análisis
    const reportPath = './temp/onboarding-diagnostic-report.json';
    const fs = await import('fs');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Reporte guardado en: ${reportPath}`);

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
    process.exit(hasIssues ? 1 : 0);

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

diagnoseOnboardingFlow();
