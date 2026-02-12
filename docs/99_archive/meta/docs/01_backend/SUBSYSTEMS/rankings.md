# 🏆 RANKINGS & LEADERBOARDS

**Documentación completa del sistema de Rankings (5 endpoints)**

---

## 📖 DESCRIPCIÓN

Sistema de leaderboards competitivos globales. Jugadores se clasifican en múltiples categorías y períodos.

**Estado:** ⭐ NUEVO - Completamente omitido en documentación anterior

---

## 📡 ENDPOINTS (5)

### **1. Top 100 global**
```
GET /api/rankings/

Query params:
  limit: 100 (default)
  offset: 0 (default, para paginación)

Response:
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "507f1f77bcf86cd799439001",
      "username": "DragonSlayer",
      "score": 150000,
      "category": "overall",
      "achievements": 45,
      "level": 85
    },
    { "rank": 2, ... },
    ...
  ],
  "total": 2847
}
```

---

### **2. Rankings por categoría**
```
GET /api/rankings/:category

Categories:
  combat      - Mejor DPS en dungeons
  survival    - Oleadas alcanzadas
  wealth      - Total VAL poseído
  items       - Cantidad de items
  level       - Nivel promedio de personajes
  achievements - Achievements desbloqueados

Response:
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "username": "SurvivalKing",
      "score": 250,  // Oleadas alcanzadas
      "category": "survival",
      "details": {
        "sessionsPlayed": 42,
        "bestSession": 150,
        "averageWaves": 10.8
      }
    },
    ...
  ]
}
```

---

### **3. Rankings por período**
```
GET /api/rankings/:category/:period

Periods:
  today       - Últimas 24 horas
  week        - Últimos 7 días
  month       - Últimos 30 días
  all_time    - Histórico completo

Example:
GET /api/rankings/combat/week

Response:
{
  "success": true,
  "period": "week",
  "data": [
    {
      "rank": 1,
      "username": "CombatPro",
      "score": 5000,
      "dpsAverage": 850,
      "encountersWon": 48
    },
    ...
  ]
}
```

---

### **4. Estadísticas generales**
```
GET /api/rankings/stats

Response:
{
  "success": true,
  "data": {
    "totalPlayers": 2847,
    "playersWithRanking": 2156,
    "topPlayerScore": 450000,
    "averageScore": 45000,
    "categories": {
      "combat": { "players": 1500, "avg": 5000 },
      "survival": { "players": 1200, "avg": 3000 },
      "wealth": { "players": 2000, "avg": 50000 },
      "items": { "players": 1800, "avg": 75 },
      "level": { "players": 2100, "avg": 45 }
    },
    "lastUpdate": "2025-12-01T10:30:00Z"
  }
}
```

---

### **5. Mi posición en ranking**
```
GET /api/rankings/me

Response:
{
  "success": true,
  "data": {
    "overall": {
      "rank": 47,
      "score": 125000,
      "percentile": 98.3  // Top 1.7%
    },
    "categories": {
      "combat": {
        "rank": 23,
        "score": 45000,
        "percentile": 99.1
      },
      "survival": {
        "rank": 89,
        "score": 30000,
        "percentile": 96.0
      },
      "wealth": {
        "rank": 12,
        "score": 250000,
        "percentile": 99.6
      },
      "items": {
        "rank": 150,
        "score": 156,
        "percentile": 94.0
      },
      "level": {
        "rank": 34,
        "score": 75,  // Nivel promedio
        "percentile": 98.8
      }
    },
    "allTimeAchievements": 42,
    "currentStreak": 15,  // Días seguidos con puntos
    "lastUpdated": "2025-12-01T10:25:00Z"
  }
}
```

---

## 📊 MODELOS

### **Ranking**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  username: String,
  category: "overall" | "combat" | "survival" | "wealth" | "items" | "level",
  period: "all_time" | "month" | "week" | "today",
  score: Number,
  rank: Number,
  percentile: Number,
  details: {
    // Varía por categoría
  },
  updatedAt: Date,
  createdAt: Date
}
```

### **RankingHistory** (opcional, para track cambios)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  category: String,
  rankBefore: Number,
  rankAfter: Number,
  scoreBefore: Number,
  scoreAfter: Number,
  changeDate: Date
}
```

---

## 🎯 CATEGORÍAS DETALLADAS

### **1. COMBAT**
```
Score = Total DPS damage en dungeons
Calcula: average DPS per encounter

Details:
├─ Encounters: Cantidad de dungeons completados
├─ Encounters Won: Victorias
├─ DPS Average: Damage promedio
├─ Survival Rate: (Won / Total) %
└─ Preferred Class: Clase más usada
```

### **2. SURVIVAL**
```
Score = Highest wave reached

Details:
├─ Sessions Played: Total sesiones
├─ Best Session: Oleadas de la mejor
├─ Average Waves: Promedio por sesión
├─ Personal Best: Récord absoluto
└─ Total Points: Acumulados en survival
```

### **3. WEALTH**
```
Score = Total VAL poseído (actual)

Details:
├─ Liquid VAL: En mano
├─ Invested: En items/listings
├─ Trading Volume: Total transacciones
├─ Profit: Diferencia entrada-salida
└─ Net Worth: Valor total portfolio
```

### **4. ITEMS**
```
Score = Cantidad total de items únicos

Details:
├─ Rarity Distribution: % Epic, Legendary, etc
├─ Equipment: Equipados
├─ In Inventory: Disponibles
├─ Most Valuable: Item más caro
└─ Collections: Colecciones completadas
```

### **5. LEVEL**
```
Score = Promedio de niveles de personajes

Details:
├─ Max Level Character: Nivel más alto
├─ Characters: Cantidad de personajes
├─ Average Level: Promedio
├─ Total EXP: Experiencia total
└─ Max Prestige: Evoluciones alcanzadas
```

---

## 🔄 CÁLCULO DE RANKINGS

### **Actualización**
```
Realtime:
- Combat: Cuando termina dungeon
- Survival: Cuando termina sesión
- Items: Cuando se añade/quita item
- Level: Cuando sube nivel

Batch (cada 24h):
- Wealth: Recalcula todo
- Rankings overall: Agrega todas las categorías
```

### **Score Overall**
```
Overall Score = (Combat × 0.25) + 
                (Survival × 0.25) + 
                (Wealth × 0.25) + 
                (Items × 0.15) + 
                (Level × 0.10)

Ponderación:
- Combat: 25% (PvE skill)
- Survival: 25% (Endurance)
- Wealth: 25% (Economy)
- Items: 15% (Collection)
- Level: 10% (Progression)
```

---

## 📱 WEBSOCKET EVENTS

```javascript
// Cuando ranking cambia
socket.on('ranking:updated', {
  category: "overall",
  rankBefore: 50,
  rankAfter: 47,
  rankChange: 3,  // Positivo = mejora
  message: "¡Subiste 3 posiciones!"
})

socket.on('ranking:achievement', {
  type: "top_100",
  category: "survival",
  message: "¡Entraste al Top 100 de Survival!"
})

// Broadcast cuando alguien llega a Top 10
socket.on('ranking:milestone', {
  username: "NewChampion",
  category: "combat",
  rank: 10,
  message: "¡NewChampion llegó al Top 10 en Combat!"
})
```

---

## 🔐 RATE LIMITING

```
GET /api/rankings/              → Sin límite
GET /api/rankings/:category     → Sin límite
GET /api/rankings/:category/:period → Sin límite
GET /api/rankings/stats         → Sin límite
GET /api/rankings/me            → Sin límite

(Rankings son públicos, sin rate limit)
```

---

## 📈 NOTIFICACIONES AUTOMÁTICAS

Cuando ocurre:
```
Entrar al Top 100      → Notificación
Subir 10+ posiciones   → Notificación
Entrar al Top 10       → Broadcast global
Ser #1                 → Broadcast global (2h)
Ser sacado del Top 100 → Notificación
```

---

## 🎖️ ACHIEVEMENTS RELACIONADOS

```
top_100         → Top 100 en cualquier categoría
top_10          → Top 10 en cualquier categoría
top_1           → Ser #1 (por 1 hora mínimo)
rising_star     → Subir 50 posiciones en semana
consistent      → Estar en Top 100 por 1 mes
wealth_master   → Top 10 en Wealth
survival_legend → Top 10 en Survival
combat_master   → Top 10 en Combat
collector       → Top 10 en Items
```

---

## 📊 UI DESIGN SUGERENCIAS

### **Leaderboard View**
```
┌─────────────────────────────────────────┐
│ 🏆 RANKINGS                             │
├─────────────────────────────────────────┤
│ Overall | Combat | Survival | Wealth... │
├─────────────────────────────────────────┤
│ Period: [Today] [Week] [Month] [All...] │
├─────────────────────────────────────────┤
│ #1  DragonSlayer     450,000  ⭐⭐⭐   │
│ #2  SurvivalKing     420,000  ⭐⭐    │
│ #3  RichMerchant     380,000  ⭐⭐    │
│ ...                                     │
│ #47 [TÚ]             125,000  ✓        │
│ ...                                     │
│ #100 LateJoiner      45,000          │
└─────────────────────────────────────────┘
```

### **My Ranking Card**
```
┌──────────────────────────┐
│ 🎮 RANKING: #47 Overall  │
│ ▓▓▓▓▓▓▓░ 98.3 percentile  │
│                          │
│ Combat: #23 ⚔️          │
│ Survival: #89 🌊        │
│ Wealth: #12 💎          │
│ Items: #150 🎁          │
│ Level: #34 📈           │
│                          │
│ [Ver Leaderboard]        │
└──────────────────────────┘
```

---

## ✅ CHECKLIST

- [ ] Modelos Ranking, RankingHistory
- [ ] GET /rankings/
- [ ] GET /rankings/:category
- [ ] GET /rankings/:category/:period
- [ ] GET /rankings/stats
- [ ] GET /rankings/me
- [ ] Cálculo score overall
- [ ] Updates realtime
- [ ] Updates batch (24h)
- [ ] WebSocket events
- [ ] Notificaciones automáticas
- [ ] Achievements
- [ ] UI Components
- [ ] Performance optimization (índices)

---

**Última actualización:** 1 de diciembre, 2025  
**Estado:** ⭐ NUEVO  
**Endpoints:** 5  
**Categorías:** 5 (Combat, Survival, Wealth, Items, Level)
