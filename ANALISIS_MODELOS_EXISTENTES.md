# 🔍 ANÁLISIS PROFUNDO - Colecciones Existentes vs Survival

**Fecha:** 24 de noviembre de 2025  
**Revisión:** A fondo de modelos existentes  
**Estado:** Análisis completado

---

## 📊 COLECCIONES EXISTENTES ENCONTRADAS

```
✅ User.ts (230 líneas)
✅ Ranking.ts (22 líneas)
✅ userCharacter.ts (100 líneas)
✅ Item.ts (44 líneas)
✅ Listing.ts (83 líneas)
✅ MarketplaceTransaction.ts (121 líneas)
+ 18 más (Category, Consumable, Dungeon, Equipment, Package, etc.)
```

---

## 🔴 COLECCIONES QUE HAY QUE TOCAR

### **1️⃣ USER.TS** ⭐ CRÍTICA

**Estado Actual:**
```typescript
export interface IUser extends Document {
  val: number;
  boletos: number;
  evo: number;
  personajes: Types.DocumentArray<IPersonajeSubdocument>;
  dungeon_progress: Map<string, {...}>;
  dungeon_stats: { total_victorias, total_derrotas, mejor_racha };
  // ❌ NO TIENE: survival points, survival stats
}
```

**QUÉ HAY QUE AGREGAR:**

```typescript
// NUEVO: Puntos de Survival
survivalPoints: {
  total: number;           // Total histórico
  available: number;       // Listos para canjear
  lastUpdated: Date;
}

// NUEVO: Sesión actual
currentSurvivalSession: {
  sessionId: ObjectId;
  status: "active" | "none";
  startedAt: Date;
}

// NUEVO: Estadísticas de Survival
survivalStats: {
  totalRuns: number;
  maxWaveReached: number;
  averageWave: number;
  totalEnemiesDefeated: number;
  bestRunId: ObjectId;
}
```

**Cambios en Schema:**
```typescript
survivalPoints: {
  type: new Schema({
    total: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }, { _id: false }),
  default: () => ({ total: 0, available: 0 })
},

currentSurvivalSession: {
  type: new Schema({
    sessionId: { type: Schema.Types.ObjectId, ref: 'SurvivalSession' },
    status: { type: String, enum: ['active', 'none'], default: 'none' },
    startedAt: { type: Date }
  }, { _id: false }),
  default: () => ({ status: 'none' })
},

survivalStats: {
  type: new Schema({
    totalRuns: { type: Number, default: 0, min: 0 },
    maxWaveReached: { type: Number, default: 0, min: 0 },
    averageWave: { type: Number, default: 0, min: 0 },
    totalEnemiesDefeated: { type: Number, default: 0, min: 0 },
    bestRunId: { type: Schema.Types.ObjectId, ref: 'SurvivalRun' }
  }, { _id: false }),
  default: () => ({ totalRuns: 0, maxWaveReached: 0, averageWave: 0, totalEnemiesDefeated: 0 })
}
```

**Por qué:**
- Necesitas trackear puntos acumulados
- Necesitas saber si hay una sesión activa
- Necesitas estadísticas para leaderboard
- ✅ **NO afecta a:** val, boletos, evo, personajes, marketplace, dungeons

---

### **2️⃣ RANKING.TS** ⭐ CRÍTICA

**Estado Actual:**
```typescript
export interface IRanking extends Document {
  userId: ObjectId;
  puntos: number;
  victorias: number;
  derrotas: number;
  ultimaPartida: Date;
  boletosUsados: number;
  periodo: string;
  // ❌ NO TIENE: survival específico
}
```

**¿POR QUÉ TOCAR?**

Tienes **DOS opciones**:

#### **OPCIÓN A: Crear nueva colección** (Recomendado) ✅
```
Mantener: Ranking.ts (para rankings de dungeons/PvP)
Crear: SurvivalLeaderboard.ts (solo para survival)
```

#### **OPCIÓN B: Extender Ranking.ts**
```typescript
// AGREGAR:
survivalStats: {
  maxWave: number;
  totalPoints: number;
  totalRuns: number;
}

tipo: "dungeon" | "survival" | "pvp"  // Discriminador
```

**Mi recomendación: OPCIÓN A** ✅
- Mantiene Ranking limpia (dungeons/PvP)
- SurvivalLeaderboard solo tiene stats relevantes
- Más fácil de mantener

---

### **3️⃣ ITEM.TS** ⭐ NECESARIO REVISAR

**Estado Actual:** (44 líneas - probablemente pequeño)

**Necesitas agregar:**
```typescript
survivalMeta: {
  dropRatePercentage: number;   // 0.05 = 5% chance
  waveMinimum: number;           // Ola mínima donde puede dropear
  rarityWeight: number;          // Multiplier por rarity
  bonusAttribute: string;        // "ataque" | "defensa" | "velocidad"
  bonusValue: number;            // Valor del bonus
}
```

**Por qué:**
- Items pueden droppear durante survival
- Necesitas definir probabilidad de drop
- Necesitas saber qué bonus dan

---

## 🟢 COLECCIONES QUE NO NECESITAN CAMBIOS

### **Listing.ts** ✅ NO TOCAR

```typescript
// Estado actual: Perfecta para marketplace
interface IListing {
  itemId: string;
  type: 'personaje' | 'equipamiento' | 'consumible' | 'especial';
  sellerId: ObjectId;
  precio: number;
  estado: 'activo' | 'vendido' | 'cancelado' | 'expirado';
  // ... más
}
```

**Por qué NO tocar:**
- Marketplace es independiente de Survival
- No hay items de survival en marketplace (por ahora)
- Transacciones ya están optimizadas
- **0 impacto en Survival**

---

### **MarketplaceTransaction.ts** ✅ NO TOCAR

```typescript
// Estado actual: Perfecta para auditoría
interface IMarketplaceTransaction {
  listingId: ObjectId;
  sellerId: ObjectId;
  buyerId: ObjectId;
  action: 'listed' | 'sold' | 'cancelled' | 'expired';
  balanceSnapshot: {...};
  // ... más
}
```

**Por qué NO tocar:**
- Survival no usa marketplace
- Ya tiene todo lo que necesita
- Cambios romperían auditoría
- **0 impacto en Survival**

---

### **userCharacter.ts** ✅ NO TOCAR

```typescript
// Estado actual: OK para personajes en dungeons/marketplace
interface IUserCharacter {
  userId: ObjectId;
  baseCharacterId: ObjectId;
  level: number;
  experience: number;
  stats: { health, attack, defense, speed };
  // ... más
}
```

**Por qué NO tocar:**
- Survival usa personajes del User principal
- No necesita tabla separada
- userCharacter es para otro sistema
- **0 impacto en Survival**

---

### **Dungeon.ts** ✅ NO TOCAR

- Dungeons existentes funcionan bien
- Survival es **completamente independiente**
- No hay overlap en lógica

---

## 📋 RESUMEN: QUÉ MODIFICAR

### **A. Archivos a MODIFICAR (2)**

| Archivo | Líneas | Cambios | Impacto |
|---------|--------|---------|---------|
| **User.ts** | +50 líneas | Agregar 3 campos | Alto (stats) |
| **Item.ts** | +20 líneas | Agregar survivalMeta | Bajo (opcional) |

### **B. Archivos a CREAR (3)**

| Archivo | Líneas | Propósito |
|---------|--------|----------|
| **SurvivalSession.ts** | ~80 | Sesión activa |
| **SurvivalRun.ts** | ~60 | Historial runs |
| **SurvivalLeaderboard.ts** | ~50 | Ranking survival |

### **C. Archivos a DEJAR IGUAL (6+)**

```
✅ Listing.ts (Marketplace no afecta)
✅ MarketplaceTransaction.ts (Auditoría intacta)
✅ userCharacter.ts (Sistema separado)
✅ Dungeon.ts (Independiente)
✅ Ranking.ts (O creas SurvivalLeaderboard.ts)
✅ Consumable.ts (Usada en Survival)
✅ Equipment.ts (Usada en Survival)
✅ + 12 más
```

---

## 🎯 PLAN EXACTO DE MODIFICACIONES

### **PASO 1: Modificar User.ts**

Después del campo `dungeon_stats`, agregar:

```typescript
// === SURVIVAL SYSTEM ===
survivalPoints: {
  type: new Schema({
    total: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }, { _id: false }),
  default: () => ({ total: 0, available: 0 })
},

currentSurvivalSession: {
  type: new Schema({
    sessionId: { type: Schema.Types.ObjectId, ref: 'SurvivalSession' },
    status: { type: String, enum: ['active', 'none'], default: 'none' },
    startedAt: { type: Date }
  }, { _id: false }),
  default: () => ({ status: 'none' })
},

survivalStats: {
  type: new Schema({
    totalRuns: { type: Number, default: 0, min: 0 },
    maxWaveReached: { type: Number, default: 0, min: 0 },
    averageWave: { type: Number, default: 0, min: 0 },
    totalEnemiesDefeated: { type: Number, default: 0, min: 0 },
    bestRunId: { type: Schema.Types.ObjectId, ref: 'SurvivalRun' }
  }, { _id: false }),
  default: () => ({ totalRuns: 0, maxWaveReached: 0, averageWave: 0, totalEnemiesDefeated: 0 })
}
```

Y actualizar la interfaz:

```typescript
export interface IUser extends Document {
  // ... existente ...
  
  // NUEVO: Survival
  survivalPoints: {
    total: number;
    available: number;
    lastUpdated: Date;
  };
  currentSurvivalSession: {
    sessionId?: Types.ObjectId;
    status: 'active' | 'none';
    startedAt?: Date;
  };
  survivalStats: {
    totalRuns: number;
    maxWaveReached: number;
    averageWave: number;
    totalEnemiesDefeated: number;
    bestRunId?: Types.ObjectId;
  };
}
```

---

### **PASO 2: Modificar Item.ts (Opcional)**

Agregar field para survival drops:

```typescript
export interface IItem extends Document {
  // ... existente ...
  
  // NUEVO: Información para Survival
  survivalMeta?: {
    dropRatePercentage: number;    // 0.05 = 5%
    waveMinimum: number;           // Min wave
    rarityWeight: number;          // Multiplier
    bonusAttribute: string;        // ataque | defensa | velocidad
    bonusValue: number;            // Valor del bonus
  };
}

// Schema:
survivalMeta: {
  type: new Schema({
    dropRatePercentage: { type: Number, default: 0, min: 0, max: 1 },
    waveMinimum: { type: Number, default: 1, min: 1 },
    rarityWeight: { type: Number, default: 1, min: 0.5, max: 3 },
    bonusAttribute: { type: String, enum: ['ataque', 'defensa', 'velocidad'] },
    bonusValue: { type: Number, default: 0, min: 0 }
  }, { _id: false })
}
```

---

### **PASO 3: Crear SurvivalSession.ts**

Nuevo archivo con ~80 líneas (ver documento ARQUITECTURA_SURVIVAL_BACKEND.md)

---

### **PASO 4: Crear SurvivalRun.ts**

Nuevo archivo con ~60 líneas (ver documento ARQUITECTURA_SURVIVAL_BACKEND.md)

---

### **PASO 5: Crear SurvivalLeaderboard.ts**

Nuevo archivo con ~50 líneas (ver documento ARQUITECTURA_SURVIVAL_BACKEND.md)

---

## 🚀 PASO A PASO IMPLEMENTACIÓN

### **Orden recomendado:**

```
1. ✅ Modificar User.ts
   └─ Agregar 3 campos (survivalPoints, currentSurvivalSession, survivalStats)

2. ✅ Crear SurvivalSession.ts
   └─ Sesión activa de usuario

3. ✅ Crear SurvivalRun.ts
   └─ Historial de runs completadas

4. ✅ Crear SurvivalLeaderboard.ts
   └─ Ranking global

5. ✅ Modificar Item.ts (OPCIONAL)
   └─ Agregar survivalMeta para drops
   └─ Si no lo haces ahora, puedes hacerlo después

6. ✅ Crear Ranking.ts OR extender
   └─ Si usas SurvivalLeaderboard → no toques Ranking
   └─ Si quieres todo en uno → extender Ranking (más complejo)
```

---

## ❓ RESPUESTAS A TUS PREGUNTAS

### **"¿Hay que tocar Ranking?"**
- **Respuesta**: NO necesariamente. Puedes crear `SurvivalLeaderboard.ts` separada.
- **Por qué**: Ranking actual es para dungeons. Survival es diferente.
- **Beneficio**: Mantiene sistemas independientes y limpios.

### **"¿Hay que tocar Marketplace?"**
- **Respuesta**: NO. Absolutamente 0 cambios.
- **Razón**: Marketplace y Survival son completamente independientes.
- **Validado**: Listing, MarketplaceTransaction no se afectan.

### **"¿Hay que tocar Listing o MarketplaceTransaction?"**
- **Respuesta**: NO.
- **Razón**: Items de survival NO van al marketplace.
- **Impacto**: 0%.

---

## 📝 ARCHIVOS A ENTREGAR

Para que modifiques en tu backend:

1. **User.ts** - MODIFICACIÓN
   - Agregar 3 campos survival
   - Líneas: ~230 → ~280

2. **SurvivalSession.ts** - CREAR
   - Nuevo modelo
   - Líneas: ~80

3. **SurvivalRun.ts** - CREAR
   - Nuevo modelo
   - Líneas: ~60

4. **SurvivalLeaderboard.ts** - CREAR
   - Nuevo modelo
   - Líneas: ~50

5. **Item.ts** - MODIFICACIÓN OPCIONAL
   - Agregar survivalMeta
   - Líneas: ~44 → ~65

---

## ✅ CHECKLIST FINAL

- [ ] User.ts modificado (3 campos agregados)
- [ ] SurvivalSession.ts creado
- [ ] SurvivalRun.ts creado
- [ ] SurvivalLeaderboard.ts creado
- [ ] Item.ts modificado (opcional)
- [ ] Índices MongoDB creados
- [ ] Tests unitarios para modelos
- [ ] Marketplace verificado (NO cambios)
- [ ] Ranking verificado (NO cambios)
- [ ] Listing verificado (NO cambios)

---

_Análisis completado: 24 de noviembre de 2025_
