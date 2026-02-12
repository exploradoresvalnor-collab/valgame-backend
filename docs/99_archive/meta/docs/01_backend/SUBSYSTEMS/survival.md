# 🌊 SURVIVAL MODE - SISTEMA DE OLEADAS

**Documentación completa del sistema de Survival (12 endpoints)**

---

## 📖 DESCRIPCIÓN

Sistema de oleadas infinitas donde el jugador enfrenta enemigos cada vez más fuertes, acumula puntos y puede canjearlos por EXP, VAL o items.

**Estado:** ⭐ NUEVO - Completamente omitido en documentación anterior

---

## 🎮 FLUJO DEL JUEGO

```
1. POST /api/survival/start
   └─ Crear sesión de survival
   └─ Jugador elige dificultad

2. POST /api/survival/:id/complete-wave (x N)
   └─ Completar oleada i
   └─ Recibe recompensas

3. POST /api/survival/:id/pickup-drop (opcional)
   └─ Recoge items de enemigos

4. POST /api/survival/:id/death O /end
   └─ Sesión termina (muere o se retira)

5. POST /api/survival/exchange/*
   └─ Canjea puntos acumulados
```

---

## 📡 ENDPOINTS (12)

### **1. Iniciar sesión**
```
POST /api/survival/start

Request:
{
  "characterId": "507f1f77bcf86cd799439011",
  "difficulty": "normal"  // "easy" | "normal" | "hard"
}

Response:
{
  "success": true,
  "data": {
    "survivalId": "507f1f77bcf86cd799439020",
    "characterId": "507f1f77bcf86cd799439011",
    "startedAt": "2025-12-01T10:30:00Z",
    "currentWave": 0,
    "pointsEarned": 0,
    "status": "active"
  }
}
```

---

### **2. Completar oleada**
```
POST /api/survival/:id/complete-wave

Request:
{
  "waveNumber": 1,
  "damage": 150,  // Damage hecho al enemigo
  "timeSpent": 45  // Segundos
}

Response:
{
  "success": true,
  "data": {
    "waveCompleted": 1,
    "pointsEarned": 100,
    "totalPoints": 100,
    "nextEnemyHealth": 250,
    "rewards": {
      "exp": 50,
      "val": 10,
      "items": ["item_id"]
    }
  }
}
```

---

### **3. Usar consumible**
```
POST /api/survival/:id/use-consumable

Request:
{
  "consumableId": "507f1f77bcf86cd799439015"
}

Response:
{
  "success": true,
  "data": {
    "consumable": { ... },
    "effect": "heal",
    "value": 50,
    "characterHealth": 150
  }
}
```

---

### **4. Recoger drop**
```
POST /api/survival/:id/pickup-drop

Request:
{
  "dropId": "507f1f77bcf86cd799439016"
}

Response:
{
  "success": true,
  "data": {
    "item": { ... },
    "addedToInventory": true
  }
}
```

---

### **5. Finalizar sesión (vivo)**
```
POST /api/survival/:id/end

Request:
{
  "reason": "player_quit"
}

Response:
{
  "success": true,
  "data": {
    "wavesCompleted": 15,
    "pointsEarned": 1500,
    "reward": {
      "exp": 750,
      "val": 150
    },
    "sessionDuration": "00:45:30",
    "leaderboardPosition": 12
  }
}
```

---

### **6. Registrar muerte**
```
POST /api/survival/:id/death

Request:
{
  "cause": "enemy_attack"  // "enemy_attack" | "time_expired"
}

Response:
{
  "success": true,
  "data": {
    "died": true,
    "wavesReached": 8,
    "pointsEarned": 800,
    "sessionDuration": "00:20:15"
  }
}
```

---

### **7. Abandonar sesión**
```
POST /api/survival/:id/abandon

Response:
{
  "success": true,
  "data": {
    "abandoned": true,
    "pointsLost": 50,  // Penalidad
    "pointsKept": 450
  }
}
```

---

### **8. Canjear por EXP**
```
POST /api/survival/exchange/exp

Request:
{
  "pointsToExchange": 500
}

Response:
{
  "success": true,
  "data": {
    "pointsSpent": 500,
    "expGained": 250,
    "remainingPoints": 500,
    "newLevel": 15
  }
}
```

---

### **9. Canjear por VAL**
```
POST /api/survival/exchange/val

Request:
{
  "pointsToExchange": 300
}

Response:
{
  "success": true,
  "data": {
    "pointsSpent": 300,
    "valGained": 150,
    "remainingPoints": 700
  }
}
```

---

### **10. Canjear por items**
```
POST /api/survival/exchange/items

Request:
{
  "pointsToExchange": 200,
  "itemId": "507f1f77bcf86cd799439017"
}

Response:
{
  "success": true,
  "data": {
    "pointsSpent": 200,
    "item": { ... },
    "remainingPoints": 700
  }
}
```

---

### **11. Ver leaderboard**
```
GET /api/survival/leaderboard?limit=100&period=week

Response:
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "507f1f77bcf86cd799439001",
      "username": "DragonSlayer",
      "wavesReached": 150,
      "pointsEarned": 15000,
      "bestSession": "02:30:00"
    },
    { ... }
  ]
}
```

---

### **12. Ver mis estadísticas**
```
GET /api/survival/my-stats

Response:
{
  "success": true,
  "data": {
    "totalSessions": 42,
    "totalWavesCompleted": 456,
    "averageWavesPerSession": 10.8,
    "bestStreak": 25,
    "totalPointsEarned": 45000,
    "totalPointsSpent": 30000,
    "currentLeaderboardPosition": 47,
    "achievements": [
      "wave_10", "wave_25", "wave_50", "survival_master"
    ]
  }
}
```

---

## 📊 MODELOS

### **SurvivalSession**
```javascript
{
  _id: ObjectId,
  playerId: ObjectId,
  characterId: ObjectId,
  difficulty: "easy" | "normal" | "hard",
  status: "active" | "completed" | "died" | "abandoned",
  startedAt: Date,
  endedAt: Date,
  wavesCompleted: Number,
  pointsEarned: Number,
  pointsSpent: Number,
  pointsRemaining: Number,
  reward: {
    exp: Number,
    val: Number,
    items: [ObjectId]
  },
  leaderboardPosition: Number
}
```

### **SurvivalRun**
```javascript
{
  _id: ObjectId,
  survivalSessionId: ObjectId,
  waveNumber: Number,
  enemyHealth: Number,
  damage: Number,
  duration: Number,
  pointsGained: Number,
  itemsDropped: [ObjectId],
  completedAt: Date
}
```

### **SurvivalLeaderboard**
```javascript
{
  _id: ObjectId,
  playerId: ObjectId,
  rank: Number,
  period: "all_time" | "month" | "week",
  wavesReached: Number,
  pointsEarned: Number,
  sessionsPlayed: Number,
  updatedAt: Date
}
```

---

## 🎯 MECÁNICAS

### **Puntos**
```
Puntos se ganan por:
├─ Completar oleada:  100 puntos
├─ Vencer enemigo difícil: +50 bonus
├─ Tiempo rápido: +25 bonus
└─ Usar consumible: -10 penalidad
```

### **Dificultades**
```
Easy:
├─ Enemigos débiles
├─ 50 puntos por oleada
└─ Ideal para principiantes

Normal:
├─ Balance
├─ 100 puntos por oleada
└─ Recomendado

Hard:
├─ Enemigos muy fuertes
├─ 200 puntos por oleada
└─ Challenge high-risk
```

### **Canjes**
```
Ratios de canje:
├─ 100 puntos → 50 EXP
├─ 100 puntos → 50 VAL
└─ 100 puntos → 1 item
```

---

## 🏆 LEADERBOARDS

### **Cálculo de ranking**
```
Posición = Ordenar por:
1. Oleadas alcanzadas (desc)
2. Puntos totales (desc)
3. Mejor session time (asc)
4. Fecha sesión (desc)
```

### **Períodos**
```
all_time   → Histórico completo
month      → Últimos 30 días
week       → Últimos 7 días
today      → Hoy (00:00-23:59)
```

---

## 🎖️ ACHIEVEMENTS EN SURVIVAL

```
wave_10         → Alcanzar oleada 10
wave_25         → Alcanzar oleada 25
wave_50         → Alcanzar oleada 50
wave_100        → Alcanzar oleada 100
perfect_session → Completar sin consumibles
survival_master → 100 sesiones completadas
rich_survivor   → Ganar 100,000 puntos
lucky_drops     → Recoger 50 drops
```

---

## ⚡ RATE LIMITING

```
POST /api/survival/start           → 20 req/15min
POST /api/survival/:id/complete-wave → 100 req/15min
POST /api/survival/exchange/*      → 10 req/15min
GET  /api/survival/my-stats        → Sin límite
```

---

## 🔄 INTEGRACIÓN CON OTROS SISTEMAS

### **Inventory**
- Items dropeados añaden a inventario
- Consumibles gastados descuentan de inventario

### **Character**
- Canjeo de EXP afecta character.experiencia
- Death registra en LevelHistory

### **Leaderboard**
- Posición se actualiza en tiempo real
- WebSocket event: `survival:leaderboard-updated`

### **Notifications**
- Notificación cuando alcanzas milestone
- Notificación cuando subes/bajas en ranking

---

## 📱 WEBSOCKET EVENTS

```javascript
// Server → Client (broadcast)
socket.on('survival:wave-completed', {
  survivalId: "...",
  waveNumber: 15,
  pointsEarned: 100
})

socket.on('survival:player-died', {
  playerId: "...",
  wavesReached: 12,
  cause: "enemy_attack"
})

socket.on('survival:leaderboard-updated', {
  position: 47,
  rank: "↑ 2 posiciones"
})
```

---

## 🐛 ERRORES COMUNES

| Código | Causa | Solución |
|--------|-------|----------|
| 400 | Falta energy | Consumir energía primero |
| 404 | Sesión no existe | Verificar survivalId |
| 409 | Ya hay sesión activa | Finalizar antes o abandonar |
| 429 | Rate limit | Esperar 15 minutos |

---

## ✅ CHECKLIST

- [ ] Iniciación de sesión
- [ ] Sistema de oleadas (15+)
- [ ] Consumibles en survival
- [ ] Sistema de drops
- [ ] Finalización sesión
- [ ] Mecánica muerte
- [ ] Abandonar con penalidad
- [ ] Canjeo por EXP
- [ ] Canjeo por VAL
- [ ] Canjeo por items
- [ ] Leaderboard global
- [ ] Mis estadísticas
- [ ] WebSocket events
- [ ] Achievements

---

**Última actualización:** 1 de diciembre, 2025  
**Estado:** ⭐ NUEVO  
**Endpoints:** 12
