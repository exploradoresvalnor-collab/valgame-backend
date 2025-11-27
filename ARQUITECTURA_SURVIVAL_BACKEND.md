# 🎮 Arquitectura Backend - Sistema Survival por Oleadas

**Fecha:** 24 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** Planificación Pre-Desarrollo

---

## 📋 Resumen Ejecutivo

Para implementar **Survival por Oleadas** necesitas:
- **3 nuevas colecciones** MongoDB
- **2 updates** a colecciones existentes
- **12 nuevos endpoints**
- **1 nueva estructura de transacciones atómicas**
- **Socket.IO events** para tiempo real

---

## 🗂️ NUEVAS COLECCIONES

### 1️⃣ **SurvivalSession** (Sesión activa)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Usuario
  characterId: ObjectId,      // Personaje seleccionado
  state: "active" | "completed" | "abandoned",
  
  // Equipo seleccionado
  equipment: {
    head: { itemId: ObjectId, rareza: "común", bonusAtaque: 5 },
    body: { itemId: ObjectId, rareza: "rara", bonusDefensa: 10 },
    hands: { itemId: ObjectId, rareza: "común", bonusDefensa: 2 },
    feet: { itemId: ObjectId, rareza: "rara", bonusVelocidad: 8 }
  },
  
  // Consumibles activos
  consumables: [
    {
      itemId: ObjectId,
      nombre: "Poción de Vida",
      usos_restantes: 3,
      efecto: { tipo: "heal", valor: 50 }
    }
  ],
  
  // Progresión actual
  currentWave: 1,
  currentPoints: 0,
  totalPointsAccumulated: 0,
  enemiesDefeated: 0,
  healthCurrent: 100,
  
  // Multipliers dinámicos
  multipliers: {
    waveMultiplier: 1.1,      // Aumenta cada oleada
    survivalBonus: 1.0,        // Bonus por tiempo vivo
    equipmentBonus: 1.15       // Bonus por equipo raro
  },
  
  // Drops recolectados
  dropsCollected: [
    {
      itemId: ObjectId,
      nombre: "Espada Épica",
      rareza: "épica",
      timestamp: Date
    }
  ],
  
  // Timeline
  startedAt: Date,
  lastActionAt: Date,
  completedAt: null,
  
  // Validación anti-cheat
  actionsLog: [
    { type: "wave_complete", wave: 1, timestamp: Date, serverTime: Date },
    { type: "item_drop", itemId: ObjectId, timestamp: Date },
    { type: "consumable_used", itemId: ObjectId, timestamp: Date }
  ]
}
```

### 2️⃣ **SurvivalRun** (Historial - después de completada)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  characterId: ObjectId,
  
  // Resultados finales
  finalWave: 15,
  finalPoints: 5000,
  totalEnemiesDefeated: 347,
  
  // Items obtenidos
  itemsObtained: [
    { itemId: ObjectId, rareza: "épica", obtainedAtWave: 3 },
    { itemId: ObjectId, rareza: "rara", obtainedAtWave: 6 }
  ],
  
  // Recompensas
  rewards: {
    expGained: 2500,
    valGained: 150,
    pointsAvailable: 5000  // Para canjear después
  },
  
  // Equipo usado
  equipmentUsed: {
    head: { itemId: ObjectId, rareza: "común" },
    body: { itemId: ObjectId, rareza: "rara" },
    hands: { itemId: ObjectId, rareza: "común" },
    feet: { itemId: ObjectId, rareza: "rara" }
  },
  
  // Ranking
  positionInRanking: 45,
  
  // Timestamps
  startedAt: Date,
  completedAt: Date,
  duration: 3600000  // ms
}
```

### 3️⃣ **SurvivalLeaderboard** (Ranking global)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  username: String,
  characterName: String,
  
  // Estadísticas
  totalRuns: 42,
  averageWave: 8,
  maxWave: 32,
  totalPoints: 125000,
  
  // Top run
  topRunId: ObjectId,
  topRunWave: 32,
  topRunPoints: 15000,
  
  // Ranking
  rankingPosition: 12,
  seasonRankingPosition: 8,
  
  // Rewards (puntos pendientes de canjear)
  pointsAvailable: 5000,
  
  // Últimas actualizaciones
  lastRunAt: Date,
  updatedAt: Date
}
```

---

## 📝 UPDATES A COLECCIONES EXISTENTES

### **User Collection** - ADD

```javascript
{
  // Existente...
  
  // NUEVO: Puntos survival acumulados
  survivalPoints: {
    total: 25000,        // Total histórico
    available: 5000,     // Listos para canjear
    lastUpdated: Date
  },
  
  // NUEVO: Sesión actual
  currentSurvivalSession: {
    sessionId: ObjectId,
    status: "active" | "none",
    startedAt: Date
  },
  
  // NUEVO: Estadísticas de survival
  survivalStats: {
    totalRuns: 42,
    maxWaveReached: 32,
    averageWave: 8.5,
    totalEnemiesDefeated: 5647,
    bestRunId: ObjectId
  }
}
```

### **Item Collection** - ADD

```javascript
{
  // Existente...
  
  // NUEVO: Información para survival
  survivalMeta: {
    dropRatePercentage: 0.05,    // 5% chance de drop
    waveMinimum: 3,              // Minimum wave donde puede dropear
    rarityWeight: 1.5,           // Multiplier por rarity
    bonusAttribute: "ataque",    // ataque | defensa | velocidad
    bonusValue: 15
  }
}
```

---

## 🔗 NUEVOS ENDPOINTS

### **1. INICIAR SESIÓN SURVIVAL**
```
POST /api/survival/start

Request:
{
  characterId: ObjectId,
  equipment: {
    head: ObjectId,
    body: ObjectId,
    hands: ObjectId,
    feet: ObjectId
  },
  consumables: [ObjectId, ObjectId]  // Max 5
}

Response:
{
  sessionId: ObjectId,
  characterName: "Héroe",
  healthMax: 150,
  currentWave: 1,
  pointsMultiplier: 1.0,
  equipmentBonus: 1.15
}

Errors:
- 400: Equipment inválido
- 400: Consumibles no pertenecen al user
- 400: Character no pertenece al user
- 409: Ya hay una sesión activa
```

---

### **2. COMPLETAR OLEADA**
```
POST /api/survival/:sessionId/complete-wave

Request:
{
  waveNumber: 5,
  enemiesDefeated: 8,
  damageTaken: 25,
  consumablesUsed: [{ itemId: ObjectId, waveUsed: 5 }],
  clientTimestamp: 1732443600000  // Para anti-cheat
}

Response:
{
  waveCompleted: 5,
  pointsGained: 250,
  totalPoints: 1250,
  nextWaveEnemyCount: 10,
  itemDropped: {
    itemId: ObjectId,
    name: "Espada Épica",
    rareza: "épica",
    dropChance: 0.08
  },
  multiplierApplied: 1.1,
  currentHealth: 125,
  estimatedRunDuration: "3:45"
}

Errors:
- 404: Session no encontrada
- 409: Session no activa
- 400: waveNumber no coincide con currentWave
- 403: Detección de cheat (timestamps)
```

---

### **3. USAR CONSUMIBLE**
```
POST /api/survival/:sessionId/use-consumable

Request:
{
  consumableItemId: ObjectId,
  waveNumber: 5,
  clientTimestamp: 1732443600000
}

Response:
{
  consumableUsed: "Poción de Vida",
  effectApplied: { type: "heal", valor: 50 },
  healthAfter: 150,
  remainingUses: 2
}

Errors:
- 404: Session no encontrada
- 404: Consumible no en inventario
- 400: Consumible sin usos restantes
- 409: Consumible no en lista de la sesión
```

---

### **4. RECOLECTAR ITEM DROPPADO**
```
POST /api/survival/:sessionId/pickup-drop

Request:
{
  dropId: ObjectId,  // Del array dropsCollected
  waveNumber: 5,
  clientTimestamp: 1732443600000
}

Response:
{
  itemPickedUp: "Espada Épica",
  rareza: "épica",
  addedToInventory: true,
  inventorySlotsFree: 12
}

Errors:
- 404: Session no encontrada
- 404: Drop no encontrado
- 400: Inventory lleno
```

---

### **5. TERMINAR SURVIVAL (Voluntario)**
```
POST /api/survival/:sessionId/end

Request:
{
  waveReached: 12,
  totalPoints: 3000,
  clientTimestamp: 1732443600000
}

Response:
{
  runCompleted: true,
  waveReached: 12,
  totalPointsEarned: 3000,
  itemsObtained: [
    { itemId: ObjectId, rareza: "épica" }
  ],
  rewards: {
    expGained: 1500,
    valGained: 100,
    pointsAvailable: 3000
  },
  recordSaved: true
}

Errors:
- 404: Session no encontrada
- 409: Session ya completada
```

---

### **6. ACTIVAR GAME OVER (Muerte)**
```
POST /api/survival/:sessionId/death

Request:
{
  waveReached: 8,
  totalPoints: 1500,
  lastEnemyId: ObjectId,
  clientTimestamp: 1732443600000
}

Response:
{
  gameOverConfirmed: true,
  waveReached: 8,
  pointsEarned: 1500,
  itemsObtained: [
    { itemId: ObjectId, rareza: "rara" }
  ],
  rewards: {
    expGained: 750,        // 50% por morir
    valGained: 50,         // 50% por morir
    pointsAvailable: 1500
  }

Errors:
- 404: Session no encontrada
- 409: Session ya completada
```

---

### **7. CANJEAR PUNTOS → EXP**
```
POST /api/survival/exchange-points/exp

Request:
{
  pointsToExchange: 500  // 500 puntos = 2500 EXP
}

Response:
{
  pointsExchanged: 500,
  expGained: 2500,
  characterLevel: 25,
  leveledUp: false,
  pointsRemaining: 4500
}

Errors:
- 400: Puntos insuficientes
- 404: User no encontrado
- 409: Transaction error
```

---

### **8. CANJEAR PUNTOS → VAL**
```
POST /api/survival/exchange-points/val

Request:
{
  pointsToExchange: 1000  // 1000 puntos = 500 VAL
}

Response:
{
  pointsExchanged: 1000,
  valGained: 500,
  balanceAfter: 5000,
  pointsRemaining: 4000
}

Errors:
- 400: Puntos insuficientes
- 409: Transaction error
```

---

### **9. CANJEAR PUNTOS → ITEM GARANTIZADO**
```
POST /api/survival/exchange-points/guaranteed-item

Request:
{
  pointsToExchange: 250  // 250 puntos = Item raro garantizado
}

Response:
{
  pointsExchanged: 250,
  itemReceived: {
    itemId: ObjectId,
    name: "Casco Legendario",
    rareza: "legendaria",
    bonusAtaque: 25
  },
  addedToInventory: true,
  pointsRemaining: 4750
}

Errors:
- 400: Puntos insuficientes
- 400: Inventory lleno
```

---

### **10. OBTENER LEADERBOARD SURVIVAL**
```
GET /api/survival/leaderboard

Query params:
?timeframe=all | seasonal | weekly
?limit=100
?page=1

Response:
{
  leaderboard: [
    {
      rank: 1,
      username: "Héroe123",
      characterName: "Asesino",
      maxWave: 45,
      totalPoints: 250000,
      averageWave: 15,
      lastRun: Date
    },
    {
      rank: 2,
      username: "Guerrero456",
      characterName: "Paladin",
      maxWave: 42,
      totalPoints: 235000,
      averageWave: 14
    }
    // ... más
  ],
  totalPlayers: 1245,
  userRanking: {
    rank: 87,
    maxWave: 18,
    totalPoints: 45000
  }
}
```

---

### **11. OBTENER ESTADÍSTICAS PERSONALES**
```
GET /api/survival/my-stats

Response:
{
  totalRuns: 42,
  maxWaveReached: 32,
  averageWave: 8.5,
  totalPointsEarned: 125000,
  pointsAvailable: 5000,
  totalEnemiesDefeated: 5647,
  
  bestRun: {
    runId: ObjectId,
    waveReached: 32,
    pointsEarned: 15000,
    date: Date
  },
  
  recentRuns: [
    { waveReached: 12, pointsEarned: 3000, date: Date },
    { waveReached: 8, pointsEarned: 1500, date: Date }
  ],
  
  achievementsUnlocked: [
    "Survivalista (Ola 10)",
    "Cazador de Items (10 épicos)",
    "Campeón (Ola 30)"
  ]
}
```

---

### **12. ABANDONAR SESIÓN**
```
POST /api/survival/:sessionId/abandon

Request:
{
  clientTimestamp: 1732443600000
}

Response:
{
  sessionAbandoned: true,
  waveReached: 5,
  pointsEarned: 500,
  rewards: {
    expGained: 250,
    valGained: 25
  }
}

Errors:
- 404: Session no encontrada
- 409: Session ya completada
```

---

## 🔐 ANTI-CHEAT VALIDATIONS

### **En cada endpoint:**

```javascript
// 1. Verificar timing
const timeDiff = Math.abs(Date.now() - clientTimestamp);
if (timeDiff > 30000) {  // 30 segundos de tolerance
  throw new Error("Posible cheat detectado: timestamp desincronizado");
}

// 2. Verificar progresión lineal
if (waveNumber !== session.currentWave + 1) {
  throw new Error("Wave no progresiva: posible jump");
}

// 3. Verificar stats físicos
if (pointsPerWave > maxExpectedPoints * 1.5) {
  throw new Error("Puntos sospechosamente altos");
}

// 4. Verificar items en inventario
const consumableExists = user.inventarioConsumibles.find(c => c._id === consumableId);
if (!consumableExists) {
  throw new Error("Consumible no en inventario del user");
}

// 5. Log todo para auditoría
survivalSession.actionsLog.push({
  type: "wave_complete",
  wave: waveNumber,
  clientTimestamp,
  serverTimestamp: Date.now(),
  pointsGained,
  wasValidated: true
});
```

---

## 💾 TRANSACCIÓN ATÓMICA PRINCIPAL

### **Completar run + obtener rewards**

```javascript
// PSEUDOCODE: MongoDB Session Transaction
const session = db.startSession();
session.startTransaction();

try {
  // 1. Validar todo
  const survivalSession = SurvivalSession.findById(sessionId);
  const user = User.findById(userId);
  const character = Character.findById(characterId);
  
  if (!survivalSession) throw new Error("Session no encontrada");
  if (survivalSession.state !== "active") throw new Error("Session no activa");
  
  // 2. Calcular rewards
  const multiplier = 
    survivalSession.multipliers.waveMultiplier *
    survivalSession.multipliers.survivalBonus *
    survivalSession.multipliers.equipmentBonus;
    
  const expReward = Math.floor(finalWave * 100 * multiplier);
  const valReward = Math.floor(finalWave * 10 * multiplier * 0.5);
  const pointsReward = finalWave * 250 * multiplier;
  
  // 3. Crear SurvivalRun record
  const survivalRun = await SurvivalRun.create([{
    userId,
    characterId,
    finalWave,
    finalPoints: finalWave * 250 * multiplier,
    itemsObtained: dropsCollected,
    rewards: {
      expGained: expReward,
      valGained: valReward,
      pointsAvailable: pointsReward
    },
    startedAt: survivalSession.startedAt,
    completedAt: new Date()
  }], { session });
  
  // 4. Actualizar User stats
  await User.updateOne(
    { _id: userId },
    {
      $inc: {
        "survivalStats.totalRuns": 1,
        "survivalStats.totalEnemiesDefeated": enemiesDefeated,
        "survivalPoints.total": pointsReward,
        "survivalPoints.available": pointsReward
      },
      $set: {
        "survivalStats.maxWaveReached": Math.max(
          user.survivalStats.maxWaveReached,
          finalWave
        ),
        "survivalPoints.lastUpdated": new Date(),
        currentSurvivalSession: { status: "none" }
      }
    },
    { session }
  );
  
  // 5. Actualizar Character level + exp
  const newExp = character.experiencia + expReward;
  const levelUpThreshold = character.nivel * 1000;
  const levelsGained = Math.floor(newExp / levelUpThreshold);
  
  await Character.updateOne(
    { _id: characterId },
    {
      $inc: { experiencia: expReward, nivel: levelsGained },
      $set: { 
        rango: calculateRango(character.nivel + levelsGained),
        saludActual: character.saludMaxima
      }
    },
    { session }
  );
  
  // 6. Agregar VAL
  await User.updateOne(
    { _id: userId },
    { $inc: { valBalance: valReward } },
    { session }
  );
  
  // 7. Agregar items al inventario
  for (const drop of dropsCollected) {
    await UserItem.create([{
      userId,
      itemId: drop.itemId,
      cantidad: 1,
      addedAt: new Date()
    }], { session });
  }
  
  // 8. Marcar SurvivalSession como completada
  await SurvivalSession.updateOne(
    { _id: sessionId },
    { 
      $set: { 
        state: "completed",
        completedAt: new Date()
      }
    },
    { session }
  );
  
  // 9. Actualizar Leaderboard
  const runStats = await SurvivalRun.aggregate([
    { $match: { userId } },
    { $group: {
      _id: "$userId",
      totalRuns: { $sum: 1 },
      maxWave: { $max: "$finalWave" },
      totalPoints: { $sum: "$finalPoints" }
    }}
  ]);
  
  await SurvivalLeaderboard.updateOne(
    { userId },
    {
      $set: {
        totalRuns: runStats[0].totalRuns,
        maxWave: runStats[0].maxWave,
        totalPoints: runStats[0].totalPoints,
        updatedAt: new Date()
      }
    },
    { session }
  );
  
  await session.commitTransaction();
  
  return {
    success: true,
    survivalRunId: survivalRun[0]._id,
    rewards: { expReward, valReward, pointsReward }
  };
  
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  await session.endSession();
}
```

---

## 🔌 SOCKET.IO EVENTS

### **Del Backend al Frontend (Emit)**

```javascript
// Nueva ola comenzó
socket.emit('survival:wave-started', {
  waveNumber: 5,
  enemyCount: 12,
  enemyTypes: ['Goblin', 'Orc', 'Troll'],
  difficulty: 1.15
});

// Item droppeo
socket.emit('survival:item-dropped', {
  itemId: ObjectId,
  itemName: 'Espada Épica',
  rareza: 'épica',
  waveNumber: 5,
  dropChance: 0.08
});

// Consumible usado
socket.emit('survival:consumable-used', {
  itemName: 'Poción de Vida',
  effectValue: 50,
  remainingUses: 2
});

// Leaderboard update en tiempo real
socket.emit('survival:leaderboard-updated', {
  playerRank: 87,
  newPosition: 85,
  maxWaveReached: 18
});

// Session terminada
socket.emit('survival:session-ended', {
  waveReached: 12,
  totalPoints: 3000,
  itemsObtained: 2,
  rewards: { exp: 1500, val: 100 }
});
```

### **Del Frontend al Backend (On)**

```javascript
// Ola completada
socket.on('survival:wave-completed', {
  sessionId, waveNumber, enemiesDefeated,
  damageTaken, clientTimestamp
});

// Consumible usado
socket.on('survival:use-consumible', {
  sessionId, consumableId, waveNumber, clientTimestamp
});

// Item recogido
socket.on('survival:pickup-item', {
  sessionId, dropId, waveNumber, clientTimestamp
});

// Solicitar actualización leaderboard
socket.on('survival:request-leaderboard', { timeframe, limit });
```

---

## 📊 MODELOS MONGOOSE

### **Actualizar schema existente: User**

```typescript
// En src/models/User.ts - ADD

survivalPoints: {
  type: {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  default: {}
},

currentSurvivalSession: {
  type: {
    sessionId: Schema.Types.ObjectId,
    status: { type: String, enum: ["active", "none"], default: "none" },
    startedAt: Date
  },
  default: { status: "none" }
},

survivalStats: {
  type: {
    totalRuns: { type: Number, default: 0 },
    maxWaveReached: { type: Number, default: 0 },
    averageWave: { type: Number, default: 0 },
    totalEnemiesDefeated: { type: Number, default: 0 },
    bestRunId: Schema.Types.ObjectId
  },
  default: {}
}
```

### **Crear nuevo schema: SurvivalSession**

```typescript
// src/models/SurvivalSession.ts

const survivalSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  state: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  
  equipment: {
    head: { itemId: Schema.Types.ObjectId, rareza: String, bonusAtaque: Number },
    body: { itemId: Schema.Types.ObjectId, rareza: String, bonusDefensa: Number },
    hands: { itemId: Schema.Types.ObjectId, rareza: String, bonusDefensa: Number },
    feet: { itemId: Schema.Types.ObjectId, rareza: String, bonusVelocidad: Number }
  },
  
  consumables: [{
    itemId: Schema.Types.ObjectId,
    nombre: String,
    usos_restantes: Number,
    efecto: {
      tipo: String,
      valor: Number
    }
  }],
  
  currentWave: { type: Number, default: 1 },
  currentPoints: { type: Number, default: 0 },
  totalPointsAccumulated: { type: Number, default: 0 },
  enemiesDefeated: { type: Number, default: 0 },
  healthCurrent: { type: Number, required: true },
  
  multipliers: {
    waveMultiplier: { type: Number, default: 1.0 },
    survivalBonus: { type: Number, default: 1.0 },
    equipmentBonus: { type: Number, default: 1.0 }
  },
  
  dropsCollected: [{
    itemId: Schema.Types.ObjectId,
    nombre: String,
    rareza: String,
    timestamp: Date
  }],
  
  startedAt: { type: Date, default: Date.now },
  lastActionAt: Date,
  completedAt: Date,
  
  actionsLog: [{
    type: String,
    wave: Number,
    timestamp: Date,
    serverTime: Date
  }]
});
```

### **Crear nuevo schema: SurvivalRun**

```typescript
// src/models/SurvivalRun.ts

const survivalRunSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  
  finalWave: Number,
  finalPoints: Number,
  totalEnemiesDefeated: Number,
  
  itemsObtained: [{
    itemId: Schema.Types.ObjectId,
    rareza: String,
    obtainedAtWave: Number
  }],
  
  rewards: {
    expGained: Number,
    valGained: Number,
    pointsAvailable: Number
  },
  
  equipmentUsed: {
    head: { itemId: Schema.Types.ObjectId, rareza: String },
    body: { itemId: Schema.Types.ObjectId, rareza: String },
    hands: { itemId: Schema.Types.ObjectId, rareza: String },
    feet: { itemId: Schema.Types.ObjectId, rareza: String }
  },
  
  positionInRanking: Number,
  
  startedAt: Date,
  completedAt: Date,
  duration: Number
});
```

### **Crear nuevo schema: SurvivalLeaderboard**

```typescript
// src/models/SurvivalLeaderboard.ts

const survivalLeaderboardSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: String,
  characterName: String,
  
  totalRuns: { type: Number, default: 0 },
  averageWave: { type: Number, default: 0 },
  maxWave: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  
  topRunId: Schema.Types.ObjectId,
  topRunWave: Number,
  topRunPoints: Number,
  
  rankingPosition: Number,
  seasonRankingPosition: Number,
  
  pointsAvailable: Number,
  
  lastRunAt: Date,
  updatedAt: { type: Date, default: Date.now }
});
```

---

## 🚀 RESUMEN: LO QUE NECESITAS IMPLEMENTAR EN BACKEND

| Item | Cantidad | Prioridad |
|------|----------|-----------|
| **Nuevas Colecciones** | 3 | ⭐⭐⭐ |
| **Updates a Colecciones** | 2 | ⭐⭐⭐ |
| **Nuevos Endpoints** | 12 | ⭐⭐⭐ |
| **Transacciones Atómicas** | 1 (principal) | ⭐⭐⭐ |
| **Socket.IO Events** | 5 emit + 4 on | ⭐⭐ |
| **Validaciones Anti-Cheat** | 5 capas | ⭐⭐⭐ |

---

## 📝 CHECKLIST PRE-FRONTEND

Antes de empezar a programar el **FRONTEND**, asegúrate que el **BACKEND** tenga:

- [ ] **3 colecciones** creadas (SurvivalSession, SurvivalRun, SurvivalLeaderboard)
- [ ] **User schema** actualizado con survival fields
- [ ] **Item schema** actualizado con survivalMeta
- [ ] **12 endpoints** implementados y testeados
- [ ] **Transacción atómica** funcionando (test sin cheat)
- [ ] **Socket.IO events** enviando datos en tiempo real
- [ ] **Anti-cheat validations** activas
- [ ] **Índices MongoDB** creados (userId, sessionId, currentWave)
- [ ] **Cron job** para limpiar sesiones abandonadas (>1 hora sin actividad)
- [ ] **Unit tests** para cada endpoint
- [ ] **E2E test** de una run completa (start → oleadas → end)

---

## 🎮 ENTONCES PARA FRONTEND

Una vez el backend esté listo, el frontend será **mucho más simple**:

```
Frontend necesitará:
├─ SurvivalService (call endpoints)
├─ SurvivalComponent (UI principal)
├─ WaveProgressComponent (visual de oleada)
├─ PointsDisplayComponent (puntos acumulados)
├─ ItemDropComponent (mostrar drop)
├─ LeaderboardComponent (ranking)
└─ ExchangePointsComponent (canjear)
```

**Espera a confirmar que backend esté listo antes de programar todo esto.**

---

_Documento de Arquitectura Backend - Sistema Survival  
Valgame v2.0 - 24 de noviembre de 2025_
