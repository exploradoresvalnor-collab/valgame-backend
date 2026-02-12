# 🔔 NOTIFICACIONES

**Documentación completa del sistema de Notificaciones (4 endpoints)**

---

## 📖 DESCRIPCIÓN

Sistema de notificaciones push que alerta al jugador sobre eventos importantes del juego.

**Estado:** ⭐ NUEVO - Completamente omitido en documentación anterior

---

## 📡 ENDPOINTS (4)

### **1. Listar notificaciones**
```
GET /api/notifications?limit=20&unreadOnly=false

Query params:
  limit: 20 (default)
  offset: 0 (default)
  unreadOnly: false (default) - Solo no leídas
  type: "all" (default) - Filtrar por tipo

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "userId": "507f1f77bcf86cd799439002",
      "type": "item-sold",
      "title": "¡Tu item se vendió!",
      "message": "El item 'Espada Legendaria' fue vendido por 5000 VAL",
      "icon": "💎",
      "data": {
        "itemId": "507f1f77bcf86cd799439003",
        "itemName": "Espada Legendaria",
        "price": 5000,
        "buyerId": "507f1f77bcf86cd799439004"
      },
      "action": {
        "text": "Ver transacción",
        "route": "/marketplace/transaction/123"
      },
      "read": false,
      "createdAt": "2025-12-01T10:30:00Z",
      "expiresAt": "2025-12-08T10:30:00Z"
    },
    { ... },
    ...
  ],
  "unreadCount": 5,
  "total": 47
}
```

---

### **2. Marcar como leída**
```
PUT /api/notifications/:id/read

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439001",
    "read": true,
    "readAt": "2025-12-01T10:35:00Z"
  }
}
```

---

### **3. Eliminar notificación**
```
DELETE /api/notifications/:id

Response:
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### **4. Marcar todas como leídas**
```
POST /api/notifications/mark-all-read

Response:
{
  "success": true,
  "data": {
    "updatedCount": 12,
    "message": "12 notificaciones marcadas como leídas"
  }
}
```

---

## 📊 MODELOS

### **Notification**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,  // Ver tipos abajo
  title: String,
  message: String,
  icon: String,  // Emoji o URL
  data: Object,  // Datos específicos del tipo
  action: {
    text: String,
    route: String,  // Ruta a donde clickear
    url: String     // URL externa (opcional)
  },
  read: Boolean,
  readAt: Date,
  deleted: Boolean,
  deletedAt: Date,
  createdAt: Date,
  expiresAt: Date,  // Se elimina automáticamente
  priority: "low" | "normal" | "high",
  tags: [String]
}
```

---

## 🎯 TIPOS DE NOTIFICACIONES

### **Marketplace (tipo: `item-*`)**
```
item-sold
  Cuando: Tu item se vende en marketplace
  Datos: itemId, itemName, price, buyerId
  Acción: Ver transacción

item-purchased
  Cuando: Confirmar que compré item
  Datos: itemId, itemName, price, sellerId
  Acción: Ver item

listing-expired
  Cuando: Tu listing expiró
  Datos: itemId, itemName
  Acción: Volver a listar
```

### **Character (tipo: `character-*`)**
```
character-level-up
  Cuando: Subes de nivel
  Datos: characterId, newLevel, stats
  Acción: Ver stats

character-evolved
  Cuando: Evolucionas personaje
  Datos: characterId, newEtapa
  Acción: Ver personaje

character-died
  Cuando: Tu personaje muere
  Datos: characterId, cause, loot
  Acción: Revivir
```

### **Combat (tipo: `combat-*`)**
```
dungeon-completed
  Cuando: Completas un dungeon
  Datos: dungeonId, rewards, experience
  Acción: Coleccionar recompensas

dungeon-failed
  Cuando: Pierdes un dungeon
  Datos: dungeonId, defeatedBy
  Acción: Intentar de nuevo
```

### **Survival (tipo: `survival-*`)**
```
survival-wave-milestone
  Cuando: Alcanzas oleada importante (10, 25, 50...)
  Datos: waveReached, pointsEarned
  Acción: Ver stats

survival-new-record
  Cuando: Rompes tu récord personal
  Datos: previousRecord, newRecord, improvement
  Acción: Ver leaderboard
```

### **Ranking (tipo: `ranking-*`)**
```
ranking-position-up
  Cuando: Subes en ranking
  Datos: category, rankBefore, rankAfter, change
  Acción: Ver ranking

ranking-top-100
  Cuando: Entras al Top 100
  Datos: category, rank
  Acción: Ver leaderboard

ranking-top-10
  Cuando: Entras al Top 10
  Datos: category, rank
  Acción: Ver leaderboard
```

### **Achievement (tipo: `achievement-*`)**
```
achievement-unlocked
  Cuando: Desbloqueas achievement
  Datos: achievementId, achievementName, reward
  Acción: Ver achievements
```

### **Social (tipo: `social-*`)**
```
player-mentioned
  Cuando: Te mencionan en chat
  Datos: userId, userName, messageId, context
  Acción: Ver chat

player-followed
  Cuando: Alguien te sigue
  Datos: userId, userName
  Acción: Ver perfil
```

### **System (tipo: `system-*`)**
```
maintenance-scheduled
  Cuando: Mantenimiento programado
  Datos: startTime, duration, reason
  Acción: Más info

event-started
  Cuando: Nuevo evento activo
  Datos: eventId, eventName, duration
  Acción: Ver evento
```

---

## 📱 WEBSOCKET EVENTS

```javascript
// Servidor envía notificación en tiempo real
socket.on('notification:new', {
  _id: "507f1f77bcf86cd799439001",
  type: "item-sold",
  title: "¡Tu item se vendió!",
  message: "Espada Legendaria vendida por 5000 VAL",
  priority: "high"
})

// Actualizar contador de no leídas
socket.on('notification:unread-count', {
  count: 5
})

// Notificación marcada como leída
socket.on('notification:marked-read', {
  notificationId: "507f1f77bcf86cd799439001"
})

// Sistema: Todas marcadas como leídas
socket.on('notification:all-marked-read', {
  count: 12
})
```

---

## 🔐 RATE LIMITING

```
GET /api/notifications             → Sin límite
PUT /api/notifications/:id/read    → Sin límite
DELETE /api/notifications/:id      → Sin límite
POST /api/notifications/mark-all-read → Sin límite

(Lectura de notificaciones sin rate limit)
```

---

## 💾 RETENCIÓN

```
Por tipo:
├─ Importante (rankings, achievements): 30 días
├─ Normal (marketplace, combat): 14 días
├─ Temporal (system events): 7 días
└─ Transaccional: 90 días

Borrado automático: Mediante cron job
```

---

## 🔔 NOTIFICACIONES PUSH (Futuro)

```
Cuando: Usuario cierra sesión/está offline
Enviar: Push notifications

Métodos:
├─ Email
├─ SMS
├─ Firebase Cloud Messaging
└─ In-app cuando vuelve
```

---

## 📊 UI SUGERENCIAS

### **Badge**
```
┌─────────────────────┐
│ 🔔 Notificaciones   │
│    [5 nuevas] ← Badge
└─────────────────────┘
```

### **Centro de Notificaciones**
```
┌──────────────────────────────────────┐
│ 🔔 NOTIFICACIONES                    │
├──────────────────────────────────────┤
│ Marcar todas como leídas             │
├──────────────────────────────────────┤
│ 💎 [NUEVA] ¡Tu item se vendió!      │
│    Espada Legendaria × 5000 VAL     │
│    hace 5 minutos                   │
│    [✓ Marcar leída] [Ver]            │
│                                      │
│ 📈 Subiste a #23 en Combat         │
│    hace 1 hora                      │
│    [Ir a Rankings]                  │
│                                      │
│ 🏆 Desbloqueaste "Dragon Slayer"    │
│    hace 2 horas                     │
│    [Ver Achievements]               │
└──────────────────────────────────────┘
```

---

## 🔧 CONFIGURACIÓN POR USUARIO

```
GET /api/users/notification-settings

{
  "enabled": true,
  "types": {
    "marketplace": true,
    "character": true,
    "ranking": true,
    "achievement": true,
    "social": true,
    "system": true
  },
  "soundEnabled": true,
  "pushEnabled": false  // Desactiva push
}

PUT /api/users/notification-settings
{
  "types": {
    "marketplace": false  // Desactiva solo marketplace
  }
}
```

---

## ✅ CHECKLIST

- [ ] Modelo Notification
- [ ] GET /api/notifications
- [ ] PUT /api/notifications/:id/read
- [ ] DELETE /api/notifications/:id
- [ ] POST /api/notifications/mark-all-read
- [ ] Socket.IO eventos
- [ ] Rate limiting
- [ ] Retención automática (cron)
- [ ] UI components
- [ ] Badge de contador
- [ ] Sonidos/vibraciones (opcional)
- [ ] Push notifications (futuro)
- [ ] Configuración por usuario
- [ ] Filtrado por tipo

---

**Última actualización:** 1 de diciembre, 2025  
**Estado:** ⭐ NUEVO  
**Endpoints:** 4  
**Real-time:** ✅ Socket.IO
