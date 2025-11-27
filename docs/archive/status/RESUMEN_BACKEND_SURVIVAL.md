# ✅ BACKEND SURVIVAL - ESTADO COMPLETADO

**Fecha:** 24 de noviembre de 2025  
**Fase:** Backend Implementation  
**Estado:** ✅ INICIADO Y DOCUMENTADO

---

## 📊 RESUMEN DE CAMBIOS

### **Archivos Modificados: 1**

```
✅ src/models/User.ts
   └─ Agregados 3 campos Survival:
      • survivalPoints: number
      • currentSurvivalSession: ObjectId
      • survivalStats: { totalRuns, maxWave, totalPoints, averageWave }
```

### **Archivos Creados: 5**

```
✅ src/models/SurvivalSession.ts (170 líneas)
✅ src/models/SurvivalRun.ts (100 líneas)
✅ src/models/SurvivalLeaderboard.ts (80 líneas)
✅ src/routes/survival.routes.ts (450 líneas)
✅ src/services/survival.service.ts (400 líneas)
```

### **Documentación Creada: 2**

```
✅ docs_reorganizada/02_FRONTEND_INTEGRATION/11-Survival-Guia-Completa-Frontend.md (1,200+ líneas)
✅ docs_reorganizada/02_FRONTEND_INTEGRATION/12-Backend-Survival-Endpoints.md (400+ líneas)
```

**TOTAL:** 6 archivos de código + 2 documentos

---

## 🔧 DETALLES TÉCNICOS

### **1. Modelos MongoDB**

#### SurvivalSession.ts
```
Propósito: Sesión activa (en progreso)
Campos:
  • userId, characterId
  • equipment[4], consumables[n]
  • currentWave, currentPoints, totalPointsAccumulated
  • healthCurrent/Max
  • dropsCollected
  • state ('active'|'completed'|'abandoned')
  • multipliers (wave, survival, equipment bonus)
  • actionsLog (auditoría completa)
  • startedAt, completedAt

Índices:
  • userId + state (búsqueda rápida)
  • userId + startedAt (histórico)
```

#### SurvivalRun.ts
```
Propósito: Registro histórico de cada run
Campos:
  • userId, characterId
  • finalWave, finalPoints
  • totalEnemiesDefeated
  • rewards { expGained, valGained, pointsAvailable }
  • itemsObtained (drops)
  • equipmentUsed, consumablesUsed
  • duration (ms)
  • completedAt

Índices:
  • userId + completedAt -1 (búsqueda rápida)
  • finalWave -1 (ordenamiento)
  • finalPoints -1 (ordenamiento)
```

#### SurvivalLeaderboard.ts
```
Propósito: Ranking global en tiempo real
Campos:
  • userId (unique)
  • username, characterName
  • maxWave, totalPoints, totalRuns, averageWave
  • rankingPosition
  • topRunId (referencia a mejor run)
  • pointsAvailable

Índices:
  • userId (unique, búsqueda rápida)
  • maxWave DESC, totalPoints DESC (ordenamiento leaderboard)
```

### **2. Endpoints (12 Total)**

```
1. POST   /api/survival/start                          → Iniciar sesión
2. POST   /api/survival/:sessionId/complete-wave       → Completar oleada
3. POST   /api/survival/:sessionId/use-consumable      → Usar consumible
4. POST   /api/survival/:sessionId/pickup-drop         → Recoger drop
5. POST   /api/survival/:sessionId/end                 → Terminar sesión
6. POST   /api/survival/:sessionId/death               → Reportar muerte
7. POST   /api/survival/exchange-points/exp            → Canjear por EXP
8. POST   /api/survival/exchange-points/val            → Canjear por VAL
9. POST   /api/survival/exchange-points/guaranteed-item → Canjear por item
10. GET   /api/survival/leaderboard                    → Obtener leaderboard
11. GET   /api/survival/my-stats                       → Obtener estadísticas
12. POST  /api/survival/:sessionId/abandon             → Abandonar sesión
```

### **3. SurvivalService (12 Métodos)**

```
1. startSurvival()                → Crear nueva sesión
2. completeWave()                 → Actualizar oleada + calcular puntos
3. useConsumable()                → Aplicar efectos + reducir usos
4. pickupDrop()                   → Agregar item a dropsCollected
5. endSurvival()                  → Terminar con recompensas
6. reportDeath()                  → Crear run sin recompensas
7. exchangePointsForExp()         → Convertir puntos a EXP
8. exchangePointsForVal()         → Convertir puntos a VAL
9. exchangePointsForItem()        → Generar item garantizado
10. getLeaderboard()              → Obtener ranking global
11. getUserStats()                → Estadísticas del usuario
12. updateLeaderboard()           → Actualizar ranking + recalcular posiciones

Métodos auxiliares (+5):
  • calculateEquipmentBonus()     → Bonificación de equipo
  • calculateWavePoints()         → Puntos ganados por oleada
  • calculateExperience()         → EXP ganada al terminar
  • calculateVAL()                → VAL ganada al terminar
  • generateGuaranteedItem()      → Crear item aleatorio
  • updateRankingPositions()      → Recalcular posiciones en leaderboard
```

### **4. Validación (Zod Schemas)**

```
✅ StartSurvivalSchema
   • characterId (string, requerido)
   • equipmentIds (array de 4 strings)
   • consumableIds (array máx 5 strings)

✅ CompleteWaveSchema
   • waveNumber (number > 0)
   • enemiesDefeated (number > 0)
   • damageDealt (number ≥ 0)
   • consumablesUsed (array opcional)

✅ UseConsumableSchema
   • consumableId (string, requerido)
   • targetSlot ('player' | 'enemy', opcional)

✅ PickupDropSchema
   • itemId (string, requerido)
   • itemType ('equipment' | 'consumable' | 'points')
   • itemValue (number ≥ 0, opcional)

✅ EndSessionSchema
   • finalWave (number > 0)
   • totalEnemiesDefeated (number ≥ 0)
   • totalPoints (number ≥ 0)
   • duration (number ≥ 0)

✅ ExchangePointsSchema
   • points (number > 0)

✅ ExchangeItemSchema
   • points (number > 0)
   • itemType ('helmet'|'armor'|'gloves'|'boots'|'consumable')
```

### **5. Anti-Cheat Validations**

```
🔐 En completeWave:
   ✓ waveNumber == session.currentWave
   ✓ enemiesDefeated > 0
   ✓ session.state == 'active'

🔐 En endSurvival:
   ✓ finalWave >= 1
   ✓ totalPoints >= 0
   ✓ duration >= 0
   ✓ session.state == 'active'

🔐 En exchangePoints:
   ✓ user.survivalPoints >= points
   ✓ points > 0
   ✓ JWT validates ownership

🔐 Timestamp coherence:
   ✓ startedAt <= completedAt
   ✓ No retroactivo (createdAt >= now)
```

---

## 🎯 FLUJOS IMPLEMENTADOS

### **Flujo 1: Iniciar Sesión**
```
Client: POST /api/survival/start
        { characterId, equipmentIds[4], consumableIds[n] }
          ↓
Server: Validar usuario + personaje
        Validar equipo (4 items)
        Calcular bonus de equipo
        Crear SurvivalSession
        Actualizar User.currentSurvivalSession
          ↓
Response: { sessionId, session }
```

### **Flujo 2: Loop de Oleadas**
```
Repetir N veces:
  1. Client combate contra enemigos
  2. POST /api/survival/:sessionId/complete-wave
     { waveNumber, enemiesDefeated, damageDealt }
  3. Server: Anti-cheat check + calcular puntos
  4. Response: { session con wave++, puntos actualizados }
```

### **Flujo 3: Usar Consumibles**
```
Durante combate:
  POST /api/survival/:sessionId/use-consumable
  { consumableId, targetSlot: 'player'|'enemy' }
    ↓
  Aplicar efectos (curación, buffs, daño)
  Reducir usesRemaining
    ↓
  Response: { session actualizado }
```

### **Flujo 4: Recoger Drops**
```
Enemigo derrotado:
  POST /api/survival/:sessionId/pickup-drop
  { itemId, itemType, itemValue }
    ↓
  Si points: Sumar directamente
  Si item: Agregar a dropsCollected[]
    ↓
  Response: { session actualizado }
```

### **Flujo 5: Terminar Sesión**
```
Player presiona "Terminar":
  POST /api/survival/:sessionId/end
  { finalWave, totalEnemiesDefeated, totalPoints, duration }
    ↓
  Calcular recompensas (EXP, VAL)
  Crear SurvivalRun
  Marcar sesión como 'completed'
    ↓
  Actualizar User:
    • survivalPoints += totalPoints
    • survivalStats.totalRuns++
    • survivalStats.maxWave = max
    • survivalStats.totalPoints += totalPoints
    • survivalStats.averageWave = calc
    ↓
  Actualizar SurvivalLeaderboard
  Recalcular ranking
    ↓
  Response: { message, run, rewards: { exp, val, points } }
```

### **Flujo 6: Muerte del Player**
```
Player muere:
  POST /api/survival/:sessionId/death
    ↓
  Crear SurvivalRun SIN recompensas
  Marcar sesión como 'abandoned'
  Limpiar User.currentSurvivalSession
    ↓
  Response: { message, run, rewards: { exp: 0, val: 0, points: 0 } }
```

### **Flujo 7: Canjes de Puntos**
```
Player en pantalla de canje:
  
  Opción A: Experiencia
    POST /api/survival/exchange-points/exp
    { points: 100 }
      → EXP: 100 * 10 = 1000
      
  Opción B: VAL
    POST /api/survival/exchange-points/val
    { points: 100 }
      → VAL: 100 * 0.5 = 50
      
  Opción C: Item garantizado
    POST /api/survival/exchange-points/guaranteed-item
    { points: 100, itemType: 'helmet' }
      → Item: Helmet aleatorio de rareza
    ↓
  Actualizar User.survivalPoints -= points
  Responder con resultado
```

### **Flujo 8: Obtener Leaderboard**
```
Player accede a leaderboard:
  GET /api/survival/leaderboard?page=1&limit=50
    ↓
  Consultar SurvivalLeaderboard
  Ordenar: maxWave DESC, totalPoints DESC
  Paginar: skip=(page-1)*limit, limit
    ↓
  Response: { leaderboard: [ { rank, player, maxWave, totalPoints }, ... ] }
```

### **Flujo 9: Obtener Estadísticas**
```
Player abre "Mi Perfil Survival":
  GET /api/survival/my-stats
    ↓
  Obtener User.survivalStats
  Consultar SurvivalLeaderboard para ranking
  Obtener últimas 10 SurvivalRun
  Obtener currentSession (si existe)
    ↓
  Response: {
    survivalPoints,
    stats: { totalRuns, maxWave, totalPoints, averageWave },
    leaderboardRank,
    recentRuns: [ ... ],
    currentSession: { ... } o null
  }
```

---

## 🔗 INTEGRACIÓN REQUERIDA

### **En src/app.ts (agregar):**
```typescript
// En imports
import survivalRoutes from './routes/survival.routes';

// En middleware setup
app.use('/api/survival', survivalRoutes);
```

### **Verificación:**
```bash
# Compilar
npm run build

# Verificar tipos
npx tsc --noEmit

# Revisar imports
grep -r "import.*survival" src/
```

---

## 📈 ESTADÍSTICAS

### **Código Backend:**
```
Models:     3 archivos, 350 líneas
Routes:     1 archivo,  450 líneas
Services:   1 archivo,  400 líneas
─────────────────────────────────
TOTAL:      5 archivos, 1,200 líneas
```

### **Endpoints:**
```
POST requests:  9
GET requests:   2
TOTAL:         12 endpoints
```

### **Métodos de Servicio:**
```
Principales:   12
Auxiliares:    5+
TOTAL:        17+ métodos
```

### **Colecciones MongoDB:**
```
Nuevas:        3
Modificadas:   1 (User.ts)
TOTAL:         4 cambios en DB
```

---

## ✅ CHECKLIST

- [x] User.ts modificado
- [x] SurvivalSession.ts creado
- [x] SurvivalRun.ts creado
- [x] SurvivalLeaderboard.ts creado
- [x] survival.routes.ts creado (12 endpoints)
- [x] survival.service.ts creado (12 métodos + auxiliares)
- [x] Validación Zod implementada
- [x] Anti-cheat validations
- [x] Documentación de endpoints
- [x] Documentación de flujos
- [ ] Agregar a app.ts
- [ ] Crear índices MongoDB
- [ ] Implementar WebSocket
- [ ] Testing E2E

---

## 🚀 PRÓXIMOS PASOS

### **Paso 1: Integración (15 min)**
```
1. Copiar líneas de survival.routes en app.ts
2. Verificar npm run build
```

### **Paso 2: Índices MongoDB (10 min)**
```
db.survivalSessions.createIndex({ userId: 1, state: 1 })
db.survivalruns.createIndex({ userId: 1, completedAt: -1 })
db.survivalLeaderboards.createIndex({ maxWave: -1, totalPoints: -1 })
```

### **Paso 3: WebSocket (1 hora)**
```
Implementar Socket.IO eventos:
  • wave-started
  • item-dropped
  • enemy-defeated
  • leaderboard-updated
  • session-ended
```

### **Paso 4: Frontend (8 horas)**
```
Basado en 11-Survival-Guia-Completa-Frontend.md
```

---

## 📚 DOCUMENTACIÓN REFERENCIAS

- **Endpoints Completos:** `12-Backend-Survival-Endpoints.md`
- **Frontend Guide:** `11-Survival-Guia-Completa-Frontend.md`
- **Arquitectura Dual Game:** `ARQUITECTURA_DUAL_GAME.md`
- **Análisis de Modelos:** `ANALISIS_MODELOS_EXISTENTES.md`

---

_Backend Survival Completado - 24 de noviembre de 2025_  
_Estado: ✅ INICIADO Y DOCUMENTADO_  
_Próximo: Integración + Testing_
