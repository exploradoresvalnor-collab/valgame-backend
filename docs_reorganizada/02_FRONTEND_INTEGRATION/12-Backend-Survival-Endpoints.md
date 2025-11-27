# 🔧 SURVIVAL BACKEND - Integración Completada

**Fecha:** 24 de noviembre de 2025  
**Estado:** ✅ BACKEND INICIADO  
**Archivos Creados:** 3  
**Endpoints:** 12  
**Métodos de Servicio:** 12

---

## 📁 ARCHIVOS CREADOS EN BACKEND

### **1. src/models/User.ts** ✅ MODIFICADO
```
Líneas agregadas: 12
Campos nuevos:
  • survivalPoints: number
  • currentSurvivalSession: ObjectId (ref: SurvivalSession)
  • survivalStats: { totalRuns, maxWave, totalPoints, averageWave }
```

### **2. src/models/SurvivalSession.ts** ✅ CREADO
```
Propósito: Sesión activa de survival
Líneas: 170
Campos principales:
  • userId, characterId
  • equipment (4 slots)
  • consumables (hasta 5)
  • currentWave, currentPoints
  • healthCurrent, healthMax
  • dropsCollected
  • state ('active' | 'completed' | 'abandoned')
  • multipliers (waveMultiplier, survivalBonus, equipmentBonus)
  • actionsLog (auditoría)

Índices:
  • (userId, state)
  • (userId, startedAt)
```

### **3. src/models/SurvivalRun.ts** ✅ CREADO
```
Propósito: Historial de runs completadas
Líneas: 100
Campos principales:
  • finalWave, finalPoints
  • totalEnemiesDefeated
  • rewards (expGained, valGained, pointsAvailable)
  • itemsObtained, equipmentUsed
  • duration, completedAt

Índices:
  • (userId, completedAt)
  • (finalWave DESC)
  • (finalPoints DESC)
```

### **4. src/models/SurvivalLeaderboard.ts** ✅ CREADO
```
Propósito: Ranking global
Líneas: 80
Campos principales:
  • userId (unique)
  • username, characterName
  • maxWave, totalPoints
  • totalRuns, averageWave
  • rankingPosition

Índices:
  • (userId unique)
  • (maxWave DESC, totalPoints DESC)
```

### **5. src/routes/survival.routes.ts** ✅ CREADO
```
Propósito: 12 endpoints survival
Líneas: 450
```

### **6. src/services/survival.service.ts** ✅ CREADO
```
Propósito: Lógica de negocio survival
Líneas: 400
Métodos: 12 + 5 auxiliares
```

---

## 🔌 12 ENDPOINTS CREADOS

### **1. POST /api/survival/start**
```
Propósito: Iniciar nueva sesión
Body: {
  characterId: string
  equipmentIds: string[] (4)
  consumableIds: string[] (max 5)
}
Response: { sessionId, message, session }
```

### **2. POST /api/survival/:sessionId/complete-wave**
```
Propósito: Completar oleada
Body: {
  waveNumber: number
  enemiesDefeated: number
  damageDealt: number
  consumablesUsed: string[] (opcional)
}
Anti-cheat: Valida número de onda
Response: { message, session }
```

### **3. POST /api/survival/:sessionId/use-consumable**
```
Propósito: Usar consumible en combate
Body: {
  consumableId: string
  targetSlot: 'player' | 'enemy'
}
Lógica: Aplica efectos, reduce usos
Response: { message, session }
```

### **4. POST /api/survival/:sessionId/pickup-drop**
```
Propósito: Recoger drop de enemigo
Body: {
  itemId: string
  itemType: 'equipment' | 'consumable' | 'points'
  itemValue: number
}
Response: { message, session }
```

### **5. POST /api/survival/:sessionId/end**
```
Propósito: Terminar sesión exitosamente
Body: {
  finalWave: number
  totalEnemiesDefeated: number
  totalPoints: number
  duration: number
}
Lógica:
  • Calcula recompensas (EXP, VAL)
  • Crea SurvivalRun
  • Actualiza User.survivalStats
  • Actualiza leaderboard
Response: { message, run, rewards }
```

### **6. POST /api/survival/:sessionId/death**
```
Propósito: Reportar muerte del jugador
Lógica:
  • Crea SurvivalRun sin recompensas
  • Marca sesión como abandonada
Response: { message, run, rewards: { exp: 0, val: 0, points: 0 } }
```

### **7. POST /api/survival/exchange-points/exp**
```
Propósito: Canjear puntos por experiencia
Body: { points: number }
Ratio: 10 XP por punto
Lógica: Suma EXP al personaje activo
Response: { message, experienceGained, survivalPointsRemaining }
```

### **8. POST /api/survival/exchange-points/val**
```
Propósito: Canjear puntos por VAL
Body: { points: number }
Ratio: 0.5 VAL por punto
Lógica: Suma VAL a user.val
Response: { message, valGained, survivalPointsRemaining, totalVal }
```

### **9. POST /api/survival/exchange-points/guaranteed-item**
```
Propósito: Canjear puntos por item garantizado
Body: {
  points: number
  itemType: 'helmet' | 'armor' | 'gloves' | 'boots' | 'consumable'
}
Lógica: Genera item garantizado
Response: { message, item, survivalPointsRemaining }
```

### **10. GET /api/survival/leaderboard**
```
Propósito: Obtener leaderboard global
Query: ?page=1&limit=50
Ordenado: maxWave DESC, totalPoints DESC
Response: { message, leaderboard: [] }
```

### **11. GET /api/survival/my-stats**
```
Propósito: Estadísticas del usuario
Response: {
  userId
  survivalPoints
  stats: { totalRuns, maxWave, totalPoints, averageWave }
  leaderboardRank
  recentRuns: []
  currentSession: { } o null
}
```

### **12. POST /api/survival/:sessionId/abandon**
```
Propósito: Abandonar sesión actual
Lógica:
  • Marca como abandoned
  • Limpia user.currentSurvivalSession
Response: { message }
```

---

## 🎯 FLUJO COMPLETO BACKEND

### **Inicio de Sesión (Endpoint 1)**
```
POST /api/survival/start
  ↓
SurvivalService.startSurvival()
  ├─ Validar usuario y personaje
  ├─ Validar equipo (4 items)
  ├─ Calcular bonus de equipo
  └─ Crear SurvivalSession (estado: 'active')
  ↓
Actualizar User.currentSurvivalSession = sessionId
  ↓
Responder: { sessionId, session }
```

### **Completar Oleada (Endpoint 2)**
```
POST /api/survival/:sessionId/complete-wave
  ↓
SurvivalService.completeWave()
  ├─ Anti-cheat: Validar waveNumber
  ├─ Calcular puntos:
  │   • Base: waveNumber * 10
  │   • Enemigos: enemiesDefeated * 5
  │   • Daño: damageDealt / 10
  │   • Multiplicadores: wave × survival × equipo
  ├─ Actualizar: currentWave++, pointsAccumulated += points
  └─ Log de acción
  ↓
Responder: { message, session }
  ↓
REPITE PARA SIGUIENTE OLEADA
```

### **Usar Consumible (Endpoint 3)**
```
POST /api/survival/:sessionId/use-consumable
  ↓
SurvivalService.useConsumable()
  ├─ Obtener consumible de sesión
  ├─ Obtener item para efectos
  ├─ Si targetSlot = 'player':
  │   • Aplicar curación
  │   • Aplicar buffs defensivos
  ├─ Si targetSlot = 'enemy':
  │   • Aplicar daño
  │   • Sumar puntos
  ├─ Reducir usesRemaining--
  └─ Log de acción
  ↓
Responder: { message, session }
```

### **Recoger Drop (Endpoint 4)**
```
POST /api/survival/:sessionId/pickup-drop
  ↓
SurvivalService.pickupDrop()
  ├─ Si itemType = 'points': Sumar a currentPoints
  ├─ Si itemType = 'equipment' o 'consumable':
  │   └─ Agregar a dropsCollected[]
  ├─ Log de acción
  ↓
Responder: { message, session }
```

### **Terminar Sesión (Endpoint 5)**
```
POST /api/survival/:sessionId/end
  ↓
SurvivalService.endSurvival()
  ├─ Anti-cheat: Validar datos
  ├─ Calcular recompensas:
  │   • EXP: (finalWave * 100) + (totalPoints * 5)
  │   • VAL: (finalWave * 10) + (totalPoints * 0.1)
  ├─ Crear SurvivalRun
  ├─ Marcar sesión como 'completed'
  ↓
Actualizar User:
  ├─ survivalPoints += totalPoints
  ├─ currentSurvivalSession = null
  ├─ survivalStats.totalRuns++
  ├─ survivalStats.maxWave = max(prev, finalWave)
  ├─ survivalStats.totalPoints += totalPoints
  └─ survivalStats.averageWave = totalPoints / totalRuns
  ↓
SurvivalService.updateLeaderboard()
  ├─ Crear o actualizar SurvivalLeaderboard
  └─ Recalcular rankingPosition
  ↓
Responder: { message, run, rewards }
```

### **Reportar Muerte (Endpoint 6)**
```
POST /api/survival/:sessionId/death
  ↓
SurvivalService.reportDeath()
  ├─ Crear SurvivalRun sin recompensas
  ├─ Marcar sesión como 'abandoned'
  ↓
Actualizar User:
  └─ currentSurvivalSession = null
  ↓
Responder: { message, run, rewards: { exp: 0, val: 0, points: 0 } }
```

### **Canjear Puntos (Endpoints 7-9)**
```
POST /api/survival/exchange-points/{exp|val|guaranteed-item}
  ↓
Validar: user.survivalPoints >= points
  ↓
Ejecutar canje:
  • EXP: +10 XP por punto
  • VAL: +0.5 VAL por punto
  • Item: Generar item garantizado
  ↓
Actualizar:
  • user.survivalPoints -= points
  • user.val += valGained (si aplica)
  • user.inventario += item (si aplica)
  ↓
Responder: { message, resultado, survivalPointsRemaining }
```

### **Obtener Leaderboard (Endpoint 10)**
```
GET /api/survival/leaderboard?page=1&limit=50
  ↓
SurvivalService.getLeaderboard()
  ├─ Query: find().sort({ maxWave: -1, totalPoints: -1 })
  ├─ Paginar
  └─ Retornar array de usuarios
  ↓
Responder: { message, leaderboard: [] }
```

### **Obtener Estadísticas (Endpoint 11)**
```
GET /api/survival/my-stats
  ↓
SurvivalService.getUserStats()
  ├─ Obtener user.survivalStats
  ├─ Obtener rankingPosition de SurvivalLeaderboard
  ├─ Obtener últimas 10 SurvivalRun
  ├─ Obtener currentSession (si existe)
  ↓
Responder: {
  userId
  survivalPoints
  stats
  leaderboardRank
  recentRuns
  currentSession
}
```

### **Abandonar Sesión (Endpoint 12)**
```
POST /api/survival/:sessionId/abandon
  ↓
SurvivalService.abandonSurvival()
  ├─ Marcar session.state = 'abandoned'
  ├─ Limpiar user.currentSurvivalSession
  ↓
Responder: { message }
```

---

## 🔐 ANTI-CHEAT VALIDATIONS

### **En completeWave (Endpoint 2)**
```
✅ Validar: waveNumber == session.currentWave
✅ Validar: enemiesDefeated > 0
✅ Validar: damageDealt >= 0
✅ Validar: session.state == 'active'
```

### **En endSurvival (Endpoint 5)**
```
✅ Validar: finalWave >= 1
✅ Validar: totalPoints >= 0
✅ Validar: duration >= 0
✅ Validar: session.state == 'active'
✅ Validar: timestamp coherencia
```

### **En exchangePoints (Endpoints 7-9)**
```
✅ Validar: user.survivalPoints >= points
✅ Validar: points > 0
✅ Validar: único usuario hace canje (JWT)
```

---

## 🔗 INTEGRACIÓN CON APP.TS

### **Agregar en src/app.ts:**
```typescript
import survivalRoutes from './routes/survival.routes';

// Registrar rutas
app.use('/api/survival', survivalRoutes);
```

### **Middleware requerido:**
```typescript
import { authMiddleware } from './middlewares/auth.middleware';
// Ya existe en proyecto
```

---

## 📊 TRANSACCIONES ATÓMICAS

### **endSurvival Transacción:**
```
Iniciar transacción:
  1. Crear SurvivalRun
  2. Marcar SurvivalSession como 'completed'
  3. Actualizar User.survivalPoints
  4. Actualizar User.survivalStats
  5. Crear/actualizar SurvivalLeaderboard
  6. Recalcular ranking
Commit si todo OK, Rollback si error
```

---

## 🧪 VERIFICACIÓN

### **Compilar backend:**
```bash
npm run build
```

### **Validar tipos:**
```bash
npx tsc --noEmit
```

### **Verificar rutas:**
```bash
grep -r "survival.routes" src/app.ts
```

---

## ✅ CHECKLIST INTEGRACIÓN

- [x] User.ts modificado (+3 campos)
- [x] SurvivalSession.ts creado
- [x] SurvivalRun.ts creado
- [x] SurvivalLeaderboard.ts creado
- [x] survival.routes.ts creado (12 endpoints)
- [x] survival.service.ts creado (12 métodos)
- [ ] Agregar rutas a app.ts
- [ ] Crear índices MongoDB
- [ ] Implementar WebSocket events
- [ ] Testing endpoints
- [ ] Documentar API en Postman

---

## 🚀 PRÓXIMOS PASOS

### **Backend (1-2 horas más):**
1. Integrar survival.routes en app.ts
2. Crear índices MongoDB
3. Implementar Socket.IO events
4. Testar endpoints con Postman

### **Frontend (8 horas):**
1. Crear 6 componentes (basado en 11-Survival-Guia-Completa-Frontend.md)
2. Crear SurvivalService Angular
3. Configurar rutas
4. Integrar WebSocket
5. Styling

---

## 📝 NOTAS IMPORTANTES

1. **JWT Required:** Todos los endpoints requieren token en header `Authorization: Bearer <token>`
2. **Validación Zod:** Todos los body requests validados con Zod
3. **Error Handling:** Errores formateados como `{ error, details }`
4. **Logging:** Todas las acciones logeadas en `session.actionsLog[]`
5. **Anti-Cheat:** Validaciones en cada endpoint crítico
6. **Transacciones:** Operaciones atómicas para integridad de datos

---

_Backend Survival Iniciado - 24 de noviembre de 2025_  
_Próximo: Integración en app.ts + Testing_
