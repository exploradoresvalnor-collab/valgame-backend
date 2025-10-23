import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PackageModel from '../src/models/Package';
import BaseCharacter from '../src/models/BaseCharacter';
import { Item } from '../src/models/Item';
import { Equipment } from '../src/models/Equipment';
import { Consumable } from '../src/models/Consumable';
import Category from '../src/models/Category';
import Dungeon from '../src/models/Dungeon';
import GameSetting from '../src/models/GameSetting';
import LevelRequirement from '../src/models/LevelRequirement';

// Cargar variables de entorno
dotenv.config();

async function checkRealData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('\n✅ Conectado a MongoDB: Valnor\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 EXTRAYENDO TODA LA INFORMACIÓN DE LAS COLECCIONES');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Verificar Paquetes - DETALLADO
    const packages = await PackageModel.find().lean();
    console.log('📦 PAQUETES DISPONIBLES (DETALLE COMPLETO):');
    console.log('─────────────────────────────────────────────────────────────');
    packages.forEach((pkg: any, index) => {
      console.log(`\n${index + 1}. ${pkg.nombre}`);
      console.log(`   ID: ${pkg._id}`);
      console.log(`   Precio: ${pkg.precio_usdt} USDT`);
      console.log(`   Personajes por apertura: ${pkg.personajes}`);
      console.log(`   Descripción: ${pkg.descripcion || 'N/A'}`);
      
      if (pkg.categorias_garantizadas && pkg.categorias_garantizadas.length > 0) {
        console.log(`   Categorías garantizadas:`);
        pkg.categorias_garantizadas.forEach((cat: any) => {
          console.log(`      - ${cat.nombre}: ${cat.cantidad} personajes`);
        });
      }
      
      if (pkg.bonificaciones) {
        console.log(`   Bonificaciones:`);
        if (pkg.bonificaciones.val) console.log(`      - VAL: ${pkg.bonificaciones.val}`);
        if (pkg.bonificaciones.evo) console.log(`      - EVO: ${pkg.bonificaciones.evo}`);
        if (pkg.bonificaciones.items_extra) {
          console.log(`      - Items extra: ${pkg.bonificaciones.items_extra.length}`);
        }
      }
    });
    console.log(`\n   ✅ Total: ${packages.length} paquetes\n`);

    // Verificar Personajes Base - DETALLADO
    const baseChars = await BaseCharacter.find().lean();
    console.log('⚔️ PERSONAJES BASE (TODOS CON DETALLE):');
    console.log('─────────────────────────────────────────────────────────────');
    
    // Agrupar por rango
    const charsByRank = baseChars.reduce((acc: any, char: any) => {
      const rank = char.descripcion_rango || 'Sin rango';
      if (!acc[rank]) acc[rank] = [];
      acc[rank].push(char);
      return acc;
    }, {});

    Object.entries(charsByRank).forEach(([rank, chars]: [string, any]) => {
      console.log(`\n📊 Rango: ${rank} (${chars.length} personajes)`);
      chars.forEach((char: any, index: number) => {
        console.log(`\n   ${index + 1}. ${char.nombre}`);
        console.log(`      ID: ${char._id}`);
        console.log(`      Descripción: ${char.descripcion || 'N/A'}`);
        console.log(`      Stats base:`);
        console.log(`         - Vida: ${char.stats_base?.vida || 'N/A'}`);
        console.log(`         - Ataque: ${char.stats_base?.ataque || 'N/A'}`);
        console.log(`         - Defensa: ${char.stats_base?.defensa || 'N/A'}`);
        
        if (char.habilidades && char.habilidades.length > 0) {
          console.log(`      Habilidades:`);
          char.habilidades.forEach((hab: any) => {
            console.log(`         - ${hab.nombre}: ${hab.descripcion || 'N/A'}`);
          });
        }
        
        if (char.imagen_url) {
          console.log(`      Imagen: ${char.imagen_url}`);
        }
      });
    });
    
    console.log(`\n   ✅ Total: ${baseChars.length} personajes base\n`);

    // Verificar Categorías (rangos) - DETALLADO
    const categories = await Category.find().lean();
    console.log('🎲 CATEGORÍAS/RANGOS (PROBABILIDADES):');
    console.log('─────────────────────────────────────────────────────────────');
    
    if (categories.length > 0) {
      categories.forEach((cat: any, index) => {
        console.log(`\n${index + 1}. ${cat.nombre}`);
        console.log(`   ID: ${cat._id}`);
        console.log(`   Probabilidad: ${((cat.probabilidad || 0) * 100).toFixed(2)}%`);
        console.log(`   Descripción: ${cat.descripcion || 'N/A'}`);
        
        if (cat.rango) {
          console.log(`   Rango: ${cat.rango}`);
        }
        
        if (cat.color) {
          console.log(`   Color: ${cat.color}`);
        }
      });
    } else {
      console.log('   ⚠️ NO HAY CATEGORÍAS - Las probabilidades no están configuradas');
      console.log('   💡 Necesitas crear categorías (D, C, B, A, S, SS, SSS) con probabilidades');
    }
    
    console.log(`\n   Total: ${categories.length} categorías\n`);

    // Verificar TODOS los Items (Equipment + Consumables están en la colección 'items')
    const allItems = await Item.find().lean();
    console.log('🎒 ITEMS (EQUIPAMIENTO + CONSUMIBLES - COLECCIÓN UNIFICADA):');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`Total items en colección 'items': ${allItems.length}\n`);
    
    // Filtrar por tipoItem (discriminador)
    const equipment = allItems.filter((item: any) => item.tipoItem === 'Equipment');
    const consumables = allItems.filter((item: any) => item.tipoItem === 'Consumable');
    const otros = allItems.filter((item: any) => !item.tipoItem || (item.tipoItem !== 'Equipment' && item.tipoItem !== 'Consumable'));
    
    // Verificar Equipment
    console.log(`🗡️ EQUIPAMIENTO (tipoItem: 'Equipment'):`);
    console.log('─────────────────────────────────────────────────────────────');
    
    if (equipment.length > 0) {
      // Agrupar por tipo
      const equipByType = equipment.reduce((acc: any, item: any) => {
        const type = item.tipo || 'Sin tipo';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {});

      Object.entries(equipByType).forEach(([type, items]: [string, any]) => {
        console.log(`\n📌 Tipo: ${type} (${items.length} items)`);
        items.forEach((item: any, index: number) => {
          console.log(`\n   ${index + 1}. ${item.nombre}`);
          console.log(`      ID: ${item._id}`);
          console.log(`      Rango: ${item.rango}`);
          console.log(`      Descripción: ${item.descripcion || 'N/A'}`);
          console.log(`      Nivel mínimo: ${item.nivel_minimo_requerido || 1}`);
          
          if (item.stats) {
            console.log(`      Stats:`);
            console.log(`         - ATK: +${item.stats.atk || 0}`);
            console.log(`         - VIDA: +${item.stats.vida || 0}`);
            console.log(`         - DEF: +${item.stats.defensa || 0}`);
          }
          
          if (item.habilidades && item.habilidades.length > 0) {
            console.log(`      Habilidades: ${item.habilidades.join(', ')}`);
          }
          
          if (item.costo_val) {
            console.log(`      Precio: ${item.costo_val} VAL`);
          }
        });
      });
    } else {
      console.log('   ⚠️ NO HAY EQUIPAMIENTO (tipoItem: Equipment)');
      console.log('   💡 Deberías crear armas, armaduras, escudos, anillos');
    }
    
    console.log(`\n   ✅ Total equipamiento: ${equipment.length}\n`);

    // Verificar Consumibles
    console.log('🧪 CONSUMIBLES (tipoItem: \'Consumable\'):');
    console.log('─────────────────────────────────────────────────────────────');
    
    if (consumables.length > 0) {
      // Agrupar por tipo
      const consByType = consumables.reduce((acc: any, item: any) => {
        const type = item.tipo || 'Sin tipo';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {});

      Object.entries(consByType).forEach(([type, items]: [string, any]) => {
        console.log(`\n📌 Tipo: ${type} (${items.length} items)`);
        items.forEach((item: any, index: number) => {
          console.log(`\n   ${index + 1}. ${item.nombre}`);
          console.log(`      ID: ${item._id}`);
          console.log(`      Rango: ${item.rango}`);
          console.log(`      Descripción: ${item.descripcion || 'N/A'}`);
          console.log(`      Usos máximos: ${item.usos_maximos || 1}`);
          
          if (item.duracion_efecto_minutos) {
            console.log(`      Duración efecto: ${item.duracion_efecto_minutos} minutos`);
          }
          
          if (item.efectos) {
            console.log(`      Efectos:`);
            if (item.efectos.mejora_atk) console.log(`         - Mejora ATK: +${item.efectos.mejora_atk}`);
            if (item.efectos.mejora_defensa) console.log(`         - Mejora DEF: +${item.efectos.mejora_defensa}`);
            if (item.efectos.mejora_vida) console.log(`         - Mejora VIDA: +${item.efectos.mejora_vida}`);
            if (item.efectos.mejora_xp_porcentaje) console.log(`         - Mejora XP: +${item.efectos.mejora_xp_porcentaje}%`);
          }
          
          if (item.costo_val) {
            console.log(`      Precio: ${item.costo_val} VAL`);
          }
        });
      });
    } else {
      console.log('   ⚠️ NO HAY CONSUMIBLES (tipoItem: Consumable)');
      console.log('   💡 Deberías crear pociones, alimentos, pergaminos, frutos míticos');
    }
    
    console.log(`\n   ✅ Total consumibles: ${consumables.length}\n`);

    // Items sin tipoItem o con tipoItem desconocido
    if (otros.length > 0) {
      console.log('⚠️ ITEMS SIN TIPO O CON TIPO DESCONOCIDO:');
      console.log('─────────────────────────────────────────────────────────────');
      otros.forEach((item: any) => {
        console.log(`   - ${item.nombre} (tipoItem: ${item.tipoItem || 'undefined'}, ID: ${item._id})`);
      });
      console.log(`\n   Total: ${otros.length} items sin clasificar\n`);
    }

    // Verificar Mazmorras - DETALLADO
    const dungeons = await Dungeon.find().lean();
    console.log('🏰 MAZMORRAS (TODAS):');
    console.log('─────────────────────────────────────────────────────────────');
    
    if (dungeons.length > 0) {
      dungeons.forEach((dun: any, index) => {
        console.log(`\n${index + 1}. ${dun.nombre}`);
        console.log(`   ID: ${dun._id}`);
        console.log(`   Descripción: ${dun.descripcion || 'N/A'}`);
        
        if (dun.stats) {
          console.log(`   Stats:`);
          console.log(`      - Vida: ${dun.stats.vida}`);
          console.log(`      - Ataque: ${dun.stats.ataque}`);
          console.log(`      - Defensa: ${dun.stats.defensa}`);
        }
        
        if (dun.probabilidades) {
          console.log(`   Probabilidades:`);
          console.log(`      - Fallo ataque jugador: ${(dun.probabilidades.fallo_ataque_jugador * 100).toFixed(0)}%`);
          console.log(`      - Fallo ataque mazmorra: ${(dun.probabilidades.fallo_ataque_propio * 100).toFixed(0)}%`);
        }
        
        if (dun.recompensas) {
          console.log(`   Recompensas:`);
          console.log(`      - XP base: ${dun.recompensas.expBase}`);
          
          if (dun.recompensas.dropTable && dun.recompensas.dropTable.length > 0) {
            console.log(`      - Items drop (${dun.recompensas.dropTable.length}):`);
            dun.recompensas.dropTable.forEach((drop: any) => {
              console.log(`         * ${drop.tipoItem} (${(drop.probabilidad * 100).toFixed(1)}%)`);
            });
          }
        }
      });
    } else {
      console.log('   ⚠️ NO HAY MAZMORRAS configuradas');
      console.log('   💡 Deberías crear mazmorras para el combate PvE');
    }
    
    console.log(`\n   ✅ Total: ${dungeons.length} mazmorras\n`);

    // Verificar GameSettings - CONFIGURACIÓN DEL JUEGO
    const gameSettings = await GameSetting.find().lean();
    console.log('⚙️ GAME SETTINGS (CONFIGURACIÓN DEL JUEGO):');
    console.log('─────────────────────────────────────────────────────────────');
    
    if (gameSettings.length > 0) {
      gameSettings.forEach((setting: any, index) => {
        console.log(`\n${index + 1}. Configuración del Juego`);
        console.log(`   ID: ${setting._id}`);
        console.log(`\n   🎯 NIVELES Y EVOLUCIÓN:`);
        console.log(`      - Nivel para etapa 2: ${setting.nivel_evolucion_etapa_2}`);
        console.log(`      - Nivel para etapa 3: ${setting.nivel_evolucion_etapa_3}`);
        console.log(`      - Nivel máximo personaje: ${setting.nivel_maximo_personaje}`);
        
        console.log(`\n   💰 COSTOS Y ECONOMÍA:`);
        console.log(`      - Costo ticket (VAL): ${setting.costo_ticket_en_val}`);
        console.log(`      - Costo revivir personaje: ${setting.costo_revivir_personaje}`);
        if (setting.tasa_cambio_usdt) {
          console.log(`      - Tasa cambio USDT: ${setting.tasa_cambio_usdt}`);
        }
        
        console.log(`\n   ⚔️ COMBATE Y GAMEPLAY:`);
        console.log(`      - Max personajes por equipo: ${setting.MAX_PERSONAJES_POR_EQUIPO}`);
        console.log(`      - Puntos ranking por victoria: ${setting.puntos_ranking_por_victoria}`);
        console.log(`      - Permadeath timer (horas): ${setting.PERMADEATH_TIMER_HOURS}`);
        console.log(`      - Multiplicador XP global: ${setting.EXP_GLOBAL_MULTIPLIER}`);
        
        if (setting.aumento_stats_por_nivel) {
          console.log(`\n   📊 AUMENTO DE STATS POR NIVEL (por rango):`);
          const statsMap = setting.aumento_stats_por_nivel;
          if (statsMap instanceof Map) {
            statsMap.forEach((stats: any, rango: string) => {
              console.log(`      ${rango}: ATK +${stats.atk}, VIDA +${stats.vida}, DEF +${stats.defensa}`);
            });
          } else if (typeof statsMap === 'object') {
            Object.entries(statsMap).forEach(([rango, stats]: [string, any]) => {
              console.log(`      ${rango}: ATK +${stats.atk}, VIDA +${stats.vida}, DEF +${stats.defensa}`);
            });
          }
        }
        
        if (setting.costo_evo_etapa_2) {
          console.log(`\n   � COSTOS EVOLUCIÓN ETAPA 2:`);
          const costosEtapa2 = setting.costo_evo_etapa_2;
          if (costosEtapa2 instanceof Map) {
            costosEtapa2.forEach((costo: number, rango: string) => {
              console.log(`      ${rango}: ${costo} EVO`);
            });
          } else if (typeof costosEtapa2 === 'object') {
            Object.entries(costosEtapa2).forEach(([rango, costo]) => {
              console.log(`      ${rango}: ${costo} EVO`);
            });
          }
        }
        
        if (setting.costo_evo_etapa_3) {
          console.log(`\n   💎 COSTOS EVOLUCIÓN ETAPA 3:`);
          const costosEtapa3 = setting.costo_evo_etapa_3;
          if (costosEtapa3 instanceof Map) {
            costosEtapa3.forEach((costo: number, rango: string) => {
              console.log(`      ${rango}: ${costo} EVO`);
            });
          } else if (typeof costosEtapa3 === 'object') {
            Object.entries(costosEtapa3).forEach(([rango, costo]) => {
              console.log(`      ${rango}: ${costo} EVO`);
            });
          }
        }
      });
    } else {
      console.log('   ⚠️ NO HAY GAME SETTINGS configurados');
      console.log('   💡 Deberías crear configuraciones para el juego');
    }
    console.log(`\n   Total: ${gameSettings.length} configuraciones\n`);

    // Verificar LevelRequirements - REQUISITOS POR NIVEL
    const levelReqs = await LevelRequirement.find().sort({ nivel: 1 }).lean();
    console.log('📊 LEVEL REQUIREMENTS (REQUISITOS DE XP POR NIVEL):');
    console.log('─────────────────────────────────────────────────────────────');
    
    if (levelReqs.length > 0) {
      // Mostrar primeros 10 niveles
      console.log('\n📈 Primeros 10 niveles:');
      levelReqs.slice(0, 10).forEach((req: any) => {
        console.log(`   Nivel ${req.nivel}: ${req.experiencia_requerida} XP`);
      });

      // Mostrar niveles clave
      if (levelReqs.length > 10) {
        console.log('\n🎯 Niveles clave:');
        [20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(lvl => {
          const req = levelReqs.find((r: any) => r.nivel === lvl);
          if (req) {
            console.log(`   Nivel ${lvl}: ${(req as any).experiencia_requerida} XP`);
          }
        });
      }

      // Estadísticas
      const maxLevel = Math.max(...levelReqs.map((r: any) => r.nivel));
      const totalXpToMax = levelReqs.reduce((sum: number, r: any) => sum + r.experiencia_requerida, 0);
      
      console.log(`\n📈 Estadísticas:`);
      console.log(`   Nivel máximo configurado: ${maxLevel}`);
      console.log(`   Total XP para nivel máximo: ${totalXpToMax.toLocaleString()}`);
      console.log(`   XP promedio por nivel: ${Math.round(totalXpToMax / levelReqs.length).toLocaleString()}`);
    } else {
      console.log('   ⚠️ NO HAY LEVEL REQUIREMENTS configurados');
      console.log('   💡 Deberías crear requisitos de XP para niveles 1-100');
      console.log('      Ejemplo: Nivel 2 = 100 XP, Nivel 3 = 200 XP, etc.');
    }
    console.log(`\n   Total: ${levelReqs.length} niveles configurados\n`);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN EJECUTIVO:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ ${packages.length} paquetes`);
    console.log(`✅ ${baseChars.length} personajes base`);
    console.log(`${categories.length > 0 ? '✅' : '⚠️'} ${categories.length} categorías ${categories.length === 0 ? '(FALTA CONFIGURAR PROBABILIDADES)' : ''}`);
    console.log(`${allItems.length > 0 ? '✅' : '⚠️'} ${allItems.length} items totales (${equipment.length} equipamiento + ${consumables.length} consumibles)`);
    console.log(`${dungeons.length > 0 ? '✅' : '⚠️'} ${dungeons.length} mazmorras ${dungeons.length === 0 ? '(FALTA CREAR MAZMORRAS)' : ''}`);
    console.log(`${gameSettings.length > 0 ? '✅' : '⚠️'} ${gameSettings.length} game settings ${gameSettings.length === 0 ? '(FALTA CONFIGURAR)' : ''}`);
    console.log(`${levelReqs.length > 0 ? '✅' : '⚠️'} ${levelReqs.length} level requirements ${levelReqs.length === 0 ? '(FALTA CONFIGURAR NIVELES)' : ''}`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES PARA TESTS:');
    console.log('─────────────────────────────────────────────────────────────');
    
    if (packages.length > 0) {
      const pionero = packages.find(p => p.nombre.toLowerCase().includes('pionero'));
      if (pionero) {
        console.log(`✅ Usar paquete "${pionero.nombre}" (ID: ${pionero._id}) para tests`);
      }
    }
    
    if (baseChars.length > 0) {
      console.log(`✅ ${baseChars.length} personajes base disponibles para validar drops`);
      
      // Contar por rango
      const rankCount = baseChars.reduce((acc: any, char: any) => {
        const rank = char.descripcion_rango || 'Sin rango';
        acc[rank] = (acc[rank] || 0) + 1;
        return acc;
      }, {});
      
      console.log(`   Distribución por rango:`);
      Object.entries(rankCount).forEach(([rank, count]) => {
        console.log(`      - ${rank}: ${count} personajes`);
      });
    }
    
    if (categories.length === 0) {
      console.log('⚠️ CRÍTICO: Sin categorías, no se pueden validar probabilidades');
      console.log('   Necesitas crear: D (50%), C (25%), B (15%), A (7%), S (2.5%), SS (0.4%), SSS (0.1%)');
    }
    
    if (equipment.length === 0) {
      console.log('⚠️ Sin equipamiento, tests de items no funcionarán');
    }
    
    if (dungeons.length === 0) {
      console.log('⚠️ Sin mazmorras, tests de combate no funcionarán');
    }
    
    if (gameSettings.length === 0) {
      console.log('⚠️ Sin game settings, configuraciones del juego no están establecidas');
    }
    
    if (levelReqs.length === 0) {
      console.log('⚠️ Sin level requirements, sistema de niveles no está configurado');
    } else if (levelReqs.length < 100) {
      console.log(`⚠️ Solo ${levelReqs.length} niveles configurados, deberían ser 100`);
    }
    
    console.log('═══════════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRealData();
