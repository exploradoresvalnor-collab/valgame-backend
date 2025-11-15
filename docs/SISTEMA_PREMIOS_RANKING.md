# 🎁 SISTEMA DE PREMIOS POR RANKING - PROPUESTA

**Fecha:** 3 de noviembre de 2025  
**Estado:** Propuesta de diseño

---

## 📊 CONCEPTO GENERAL

Sistema de **recompensas automáticas** basado en la posición final del jugador en el ranking mensual/semanal.

### Funcionamiento

```
1. Fin de periodo (último día del mes)
2. Sistema calcula top posiciones
3. Distribuye premios automáticamente
4. Resetea ranking del periodo
5. Notifica a ganadores
```

---

## 🏅 ESTRUCTURA DE PREMIOS

### Ranking Mensual

| Posición | VAL | EVO | Boletos | Título Especial |
|----------|-----|-----|---------|-----------------|
| 🥇 #1 | 5,000 | 50 | 100 | "Campeón del Mes" |
| 🥈 #2-3 | 3,000 | 30 | 50 | "Maestro de Élite" |
| 🥉 #4-10 | 2,000 | 20 | 30 | "Guerrero Legendario" |
| 🏅 #11-50 | 1,000 | 10 | 20 | "Veterano Distinguido" |
| 🎖️ #51-100 | 500 | 5 | 10 | "Explorador Experimentado" |

### Ranking Semanal (premios menores)

| Posición | VAL | EVO | Boletos |
|----------|-----|-----|---------|
| 🥇 #1 | 1,000 | 10 | 20 |
| 🥈 #2-5 | 500 | 5 | 10 |
| 🥉 #6-20 | 250 | 3 | 5 |

---

## 🗂️ MODELO DE DATOS

### Nueva Colección: `RankingReward`

```typescript
// src/models/RankingReward.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IRankingReward extends Document {
  periodo: string;              // "2025-11" (mes) o "2025-W45" (semana)
  posicion_min: number;         // 1
  posicion_max: number;         // 3
  recompensas: {
    val: number;                // 3000
    evo: number;                // 30
    boletos: number;            // 50
    titulo?: string;            // "Maestro de Élite"
    icono_especial?: string;    // URL del badge
  };
  activo: boolean;              // true/false
}

const RankingRewardSchema = new Schema<IRankingReward>({
  periodo: { type: String, required: true, index: true },
  posicion_min: { type: Number, required: true },
  posicion_max: { type: Number, required: true },
  recompensas: {
    val: { type: Number, default: 0 },
    evo: { type: Number, default: 0 },
    boletos: { type: Number, default: 0 },
    titulo: { type: String },
    icono_especial: { type: String }
  },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

export const RankingReward = model<IRankingReward>('RankingReward', RankingRewardSchema, 'ranking_rewards');
```

---

### Nueva Colección: `RankingHistory`

```typescript
// src/models/RankingHistory.ts
export interface IRankingHistory extends Document {
  userId: Types.ObjectId;
  periodo: string;              // "2025-11"
  posicion_final: number;       // 5
  puntos_final: number;         // 1250
  victorias: number;            // 125
  recompensa_recibida: {
    val: number;
    evo: number;
    boletos: number;
    titulo?: string;
  };
  fecha_distribucion: Date;     // Cuándo se entregó el premio
}
```

**Propósito:** Historial permanente de premios recibidos por el jugador.

---

## 🔧 IMPLEMENTACIÓN

### 1. Script de Seed de Premios

```typescript
// scripts/seed-ranking-rewards.ts
import { RankingReward } from '../models/RankingReward';
import { connectDB } from '../config/db';

async function seedRankingRewards() {
  await connectDB(process.env.MONGODB_URI!);
  
  // Premios MENSUALES
  const monthlyRewards = [
    {
      periodo: 'mensual',
      posicion_min: 1,
      posicion_max: 1,
      recompensas: {
        val: 5000,
        evo: 50,
        boletos: 100,
        titulo: '🏆 Campeón del Mes'
      },
      activo: true
    },
    {
      periodo: 'mensual',
      posicion_min: 2,
      posicion_max: 3,
      recompensas: {
        val: 3000,
        evo: 30,
        boletos: 50,
        titulo: '⚔️ Maestro de Élite'
      },
      activo: true
    },
    {
      periodo: 'mensual',
      posicion_min: 4,
      posicion_max: 10,
      recompensas: {
        val: 2000,
        evo: 20,
        boletos: 30,
        titulo: '🌟 Guerrero Legendario'
      },
      activo: true
    },
    {
      periodo: 'mensual',
      posicion_min: 11,
      posicion_max: 50,
      recompensas: {
        val: 1000,
        evo: 10,
        boletos: 20,
        titulo: '🎖️ Veterano Distinguido'
      },
      activo: true
    },
    {
      periodo: 'mensual',
      posicion_min: 51,
      posicion_max: 100,
      recompensas: {
        val: 500,
        evo: 5,
        boletos: 10
      },
      activo: true
    }
  ];
  
  // Premios SEMANALES
  const weeklyRewards = [
    {
      periodo: 'semanal',
      posicion_min: 1,
      posicion_max: 1,
      recompensas: {
        val: 1000,
        evo: 10,
        boletos: 20,
        titulo: '⭐ Campeón Semanal'
      },
      activo: true
    },
    {
      periodo: 'semanal',
      posicion_min: 2,
      posicion_max: 5,
      recompensas: {
        val: 500,
        evo: 5,
        boletos: 10
      },
      activo: true
    },
    {
      periodo: 'semanal',
      posicion_min: 6,
      posicion_max: 20,
      recompensas: {
        val: 250,
        evo: 3,
        boletos: 5
      },
      activo: true
    }
  ];
  
  await RankingReward.deleteMany({});
  await RankingReward.insertMany([...monthlyRewards, ...weeklyRewards]);
  
  console.log('✅ Premios de ranking seeded correctamente');
  process.exit(0);
}

seedRankingRewards();
```

---

### 2. Servicio de Distribución de Premios

```typescript
// src/services/rankingRewards.service.ts
import { Ranking } from '../models/Ranking';
import { RankingReward } from '../models/RankingReward';
import { RankingHistory } from '../models/RankingHistory';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

/**
 * Distribuye premios del ranking mensual/semanal
 * Se ejecuta automáticamente al final del periodo
 */
export async function distributeRankingRewards(
  periodo: string,  // "2025-11" o "2025-W45"
  tipo: 'mensual' | 'semanal'
) {
  console.log(`[RANKING] Distribuyendo premios ${tipo} para periodo: ${periodo}`);
  
  // 1. Obtener ranking ordenado
  const rankings = await Ranking.find({ periodo })
    .sort({ puntos: -1 })  // Mayor a menor
    .populate('userId')
    .lean();
  
  if (rankings.length === 0) {
    console.log('No hay rankings para este periodo');
    return;
  }
  
  // 2. Obtener configuración de premios
  const rewardTiers = await RankingReward.find({ 
    periodo: tipo,
    activo: true 
  }).sort({ posicion_min: 1 });
  
  let usuariosPremiadosCount = 0;
  
  // 3. Distribuir premios según posición
  for (let i = 0; i < rankings.length; i++) {
    const ranking = rankings[i];
    const posicion = i + 1;
    
    // Buscar tier de premio correspondiente
    const rewardTier = rewardTiers.find(
      tier => posicion >= tier.posicion_min && posicion <= tier.posicion_max
    );
    
    if (!rewardTier) continue; // No hay premio para esta posición
    
    const user = await User.findById(ranking.userId);
    if (!user) continue;
    
    // 4. Entregar premios al usuario
    user.val += rewardTier.recompensas.val;
    user.evo = (user.evo || 0) + rewardTier.recompensas.evo;
    user.boletos += rewardTier.recompensas.boletos;
    
    // Si hay título especial, agregarlo
    if (rewardTier.recompensas.titulo) {
      if (!user.titulos_especiales) {
        user.titulos_especiales = [];
      }
      user.titulos_especiales.push({
        titulo: rewardTier.recompensas.titulo,
        fecha_obtencion: new Date(),
        periodo: periodo
      });
    }
    
    await user.save();
    
    // 5. Registrar en historial
    await RankingHistory.create({
      userId: user._id,
      periodo: periodo,
      posicion_final: posicion,
      puntos_final: ranking.puntos,
      victorias: ranking.victorias,
      recompensa_recibida: rewardTier.recompensas,
      fecha_distribucion: new Date()
    });
    
    // 6. Notificar al usuario
    await Notification.create({
      userId: user._id,
      tipo: 'ranking_reward',
      titulo: `¡Recompensa de Ranking ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}!`,
      mensaje: `Terminaste en el puesto #${posicion}. Has recibido: ${rewardTier.recompensas.val} VAL, ${rewardTier.recompensas.evo} EVO, ${rewardTier.recompensas.boletos} Boletos`,
      leido: false,
      metadata: {
        posicion,
        periodo,
        recompensas: rewardTier.recompensas
      }
    });
    
    usuariosPremiadosCount++;
  }
  
  console.log(`✅ ${usuariosPremiadosCount} usuarios premiados para periodo ${periodo}`);
  
  // 7. Resetear ranking del periodo
  await Ranking.deleteMany({ periodo });
  console.log(`🔄 Ranking del periodo ${periodo} reseteado`);
  
  return { usuariosPremiadosCount };
}
```

---

### 3. Cron Job para Distribución Automática

```typescript
// src/services/rankingCron.service.ts
import cron from 'node-cron';
import { distributeRankingRewards } from './rankingRewards.service';
import { getCurrentPeriod } from '../utils/rankingHelpers';

/**
 * Cron que se ejecuta:
 * - Domingos a las 23:59 (fin de semana)
 * - Último día del mes a las 23:59
 */
export function startRankingRewardsCron() {
  
  // ═══════════════════════════════════════════════════════════
  // DISTRIBUCIÓN SEMANAL (Domingos a las 23:59)
  // ═══════════════════════════════════════════════════════════
  cron.schedule('59 23 * * 0', async () => {
    console.log('[CRON] Iniciando distribución de premios semanales...');
    
    try {
      const periodoSemana = getCurrentPeriod('weekly');
      await distributeRankingRewards(periodoSemana, 'semanal');
      console.log('[CRON] ✅ Premios semanales distribuidos');
    } catch (error) {
      console.error('[CRON] ❌ Error distribuyendo premios semanales:', error);
    }
  });
  
  // ═══════════════════════════════════════════════════════════
  // DISTRIBUCIÓN MENSUAL (Último día del mes a las 23:59)
  // ═══════════════════════════════════════════════════════════
  cron.schedule('59 23 28-31 * *', async () => {
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);
    
    // Solo ejecutar si mañana es el primer día del mes
    if (mañana.getDate() === 1) {
      console.log('[CRON] Iniciando distribución de premios mensuales...');
      
      try {
        const periodoMes = getCurrentPeriod('monthly');
        await distributeRankingRewards(periodoMes, 'mensual');
        console.log('[CRON] ✅ Premios mensuales distribuidos');
      } catch (error) {
        console.error('[CRON] ❌ Error distribuyendo premios mensuales:', error);
      }
    }
  });
  
  console.log('[CRON] ⏰ Cron de premios de ranking iniciado');
}
```

**Registrar en `app.ts`:**

```typescript
// src/app.ts
import { startRankingRewardsCron } from './services/rankingCron.service';

// Después de conectar DB
connectDB(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`[API] Servidor corriendo en http://localhost:${PORT}`);
    startPermadeathCron();
    startMarketplaceExpirationCron();
    startRankingRewardsCron();  // ← NUEVO
  });
});
```

---

### 4. Endpoints de Consulta

```typescript
// src/routes/ranking.routes.ts

// Ver historial de premios del usuario
router.get('/my-rewards', auth, async (req: AuthRequest, res: Response) => {
  try {
    const history = await RankingHistory.find({ userId: req.userId })
      .sort({ fecha_distribucion: -1 })
      .limit(12);  // Último año
    
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Ver premios disponibles (tabla de premios)
router.get('/rewards', async (req: Request, res: Response) => {
  try {
    const tipo = req.query.tipo || 'mensual';
    const rewards = await RankingReward.find({ 
      periodo: tipo,
      activo: true 
    }).sort({ posicion_min: 1 });
    
    res.json({ rewards });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener premios' });
  }
});

// Proyección de premio (qué premio recibiría si termina ahora)
router.get('/my-projection', auth, async (req: AuthRequest, res: Response) => {
  try {
    const periodo = getCurrentPeriod('monthly');
    const tipo = 'mensual';
    
    // Obtener posición actual
    const ranking = await Ranking.findOne({ 
      userId: req.userId, 
      periodo 
    });
    
    if (!ranking) {
      return res.json({ message: 'No estás en el ranking aún' });
    }
    
    // Calcular posición
    const posicion = await Ranking.countDocuments({
      periodo,
      puntos: { $gt: ranking.puntos }
    }) + 1;
    
    // Buscar premio correspondiente
    const rewardTier = await RankingReward.findOne({
      periodo: tipo,
      activo: true,
      posicion_min: { $lte: posicion },
      posicion_max: { $gte: posicion }
    });
    
    res.json({
      posicion_actual: posicion,
      puntos: ranking.puntos,
      premio_proyectado: rewardTier?.recompensas || null,
      mensaje: rewardTier 
        ? `Si terminas en el puesto ${posicion}, recibirás estos premios`
        : `Debes estar en el top 100 para recibir premios`
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular proyección' });
  }
});
```

---

## 🎨 EXPERIENCIA DE USUARIO

### 1. Notificación al Finalizar Periodo

```
╔════════════════════════════════════════╗
║  🏆 ¡RECOMPENSA DE RANKING MENSUAL!    ║
╠════════════════════════════════════════╣
║  Posición final: #5 de 342 jugadores   ║
║                                        ║
║  Has recibido:                         ║
║  💰 2,000 VAL                          ║
║  💎 20 EVO                             ║
║  🎫 30 Boletos                         ║
║  🌟 Título: "Guerrero Legendario"     ║
║                                        ║
║  ¡Sigue así el próximo mes!            ║
╚════════════════════════════════════════╝
```

### 2. Pantalla de Rankings con Premios

```
┌──────────────────────────────────────┐
│  🏆 RANKING MENSUAL - NOVIEMBRE 2025 │
├──────────────────────────────────────┤
│                                      │
│  TU POSICIÓN: #42                    │
│  Puntos: 1,850                       │
│  Victorias: 185                      │
│                                      │
│  🎁 PREMIO PROYECTADO:               │
│  💰 1,000 VAL                        │
│  💎 10 EVO                           │
│  🎫 20 Boletos                       │
│  🎖️ "Veterano Distinguido"          │
│                                      │
│  ⏰ Quedan 5 días para el fin de mes│
│                                      │
├──────────────────────────────────────┤
│  🥇 #1  DragonSlayer    12,500 pts   │
│  🥈 #2  ShadowNinja      9,800 pts   │
│  🥉 #3  FireMage         8,200 pts   │
│  ⚔️  #4  DarkKnight      7,100 pts   │
│  ...                                 │
│  🎖️ #42 TÚ              1,850 pts   │
└──────────────────────────────────────┘
```

### 3. Historial de Premios

```
┌──────────────────────────────────────┐
│  📜 HISTORIAL DE PREMIOS             │
├──────────────────────────────────────┤
│  OCTUBRE 2025                        │
│  Posición: #38                       │
│  Premio: 1,000 VAL + 10 EVO          │
│                                      │
│  SEPTIEMBRE 2025                     │
│  Posición: #52                       │
│  Premio: 500 VAL + 5 EVO             │
│                                      │
│  Racha de premios: 2 meses           │
└──────────────────────────────────────┘
```

---

## 🔧 EDITAR PREMIOS DESDE ADMIN

### Endpoint de Administración

```typescript
// src/routes/admin.routes.ts (protegido con rol admin)

// Actualizar premios
router.put('/rewards/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const reward = await RankingReward.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    
    res.json({ message: 'Premios actualizados', reward });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

// Activar/desactivar premios
router.patch('/rewards/:id/toggle', isAdmin, async (req, res) => {
  const reward = await RankingReward.findById(req.params.id);
  reward.activo = !reward.activo;
  await reward.save();
  
  res.json({ message: `Premios ${reward.activo ? 'activados' : 'desactivados'}` });
});
```

---

## 📊 MÉTRICAS Y ANALYTICS

### Dashboard Administrativo

```typescript
// Estadísticas de premios distribuidos
router.get('/admin/reward-stats', isAdmin, async (req, res) => {
  const stats = await RankingHistory.aggregate([
    {
      $group: {
        _id: null,
        total_val_distribuido: { $sum: '$recompensa_recibida.val' },
        total_evo_distribuido: { $sum: '$recompensa_recibida.evo' },
        total_jugadores_premiados: { $sum: 1 },
        promedio_posicion: { $avg: '$posicion_final' }
      }
    }
  ]);
  
  res.json({ stats });
});
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear modelo `RankingReward`
- [ ] Crear modelo `RankingHistory`
- [ ] Script de seed de premios
- [ ] Servicio de distribución de premios
- [ ] Cron job para ejecución automática
- [ ] Endpoints de consulta (historial, proyección, tabla)
- [ ] Endpoints de admin (editar premios)
- [ ] Sistema de notificaciones
- [ ] Títulos especiales en perfil de usuario
- [ ] Frontend: pantalla de rankings con premios
- [ ] Frontend: historial de premios
- [ ] Tests E2E del flujo completo

---

**Última actualización:** 3 de noviembre de 2025  
**Prioridad:** ALTA (retención de jugadores)  
**Tiempo estimado:** 6-8 horas de desarrollo
