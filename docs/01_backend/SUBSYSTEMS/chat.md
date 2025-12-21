# 💬 CHAT EN TIEMPO REAL

**Documentación completa del sistema de Chat (3 endpoints)**

---

## 📖 DESCRIPCIÓN

Sistema de chat global en tiempo real usando Socket.IO. Jugadores pueden enviar mensajes que todos reciben instantáneamente.

**Estado:** ⭐ NUEVO - Completamente omitido en documentación anterior

---

## 📡 ENDPOINTS (3)

### **1. Obtener últimos mensajes**
```
GET /api/chat/messages

Query params:
  limit: 50 (default)
  offset: 0 (default)
  type: "global" | "party" | "private" (default: global)
  before: "messageId" (para paginación backwards)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "senderId": "507f1f77bcf86cd799439002",
      "senderName": "DragonSlayer",
      "senderAvatar": "avatar_url",
      "type": "global",
      "content": "¡Hola a todos!",
      "createdAt": "2025-12-01T10:30:00Z",
      "reactions": {
        "👍": 5,
        "❤️": 3
      },
      "replyTo": null
    },
    { "senderId": "...", ... },
    ...
  ],
  "hasMore": true,
  "total": 1247
}
```

---

### **2. Enviar mensaje global**
```
POST /api/chat/global

Request:
{
  "content": "¡Acabo de derrotar a Dragón!"
}

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439099",
    "senderId": "507f1f77bcf86cd799439002",
    "senderName": "DragonSlayer",
    "type": "global",
    "content": "¡Acabo de derrotar a Dragón!",
    "createdAt": "2025-12-01T10:31:15Z"
  }
}
```

---

### **3. Detalles de mensaje**
```
GET /api/chat/:messageId/details

Response:
{
  "success": true,
  "data": {
    "message": {
      "_id": "507f1f77bcf86cd799439001",
      "senderId": "507f1f77bcf86cd799439002",
      "senderName": "DragonSlayer",
      "content": "¡Hola a todos!",
      "createdAt": "2025-12-01T10:30:00Z"
    },
    "replies": 3,
    "reactions": {
      "👍": 5,
      "❤️": 3
    },
    "stats": {
      "views": 2847,
      "shares": 23
    }
  }
}
```

---

## 📊 MODELOS

### **ChatMessage**
```javascript
{
  _id: ObjectId,
  senderId: ObjectId,
  senderName: String,
  senderAvatar: String,  // URL
  senderLevel: Number,
  senderRank: String,
  type: "global" | "party" | "private",  // Por ahora solo global
  content: String,  // Max 500 caracteres
  attachments: [
    {
      type: "image" | "video" | "link",
      url: String,
      preview: String
    }
  ],
  reactions: {
    "👍": [userId1, userId2, ...],
    "❤️": [...],
    "😂": [...]
  },
  replyTo: ObjectId,  // Reference a otro mensaje (optional)
  edited: Boolean,
  editedAt: Date,
  deleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 TIPOS DE MENSAJE

### **Global**
```
Visible: Todos los jugadores
Frecuencia: Sin límite (excepto rate limit)
Permanencia: 30 días (después archivado)
```

### **Party** (futuro)
```
Visible: Solo miembros del equipo
Privado: No visible para otros
```

### **Private** (futuro)
```
Visible: Solo 2 usuarios
Chat 1-a-1
```

---

## 📱 WEBSOCKET EVENTS

### **Server envía (broadcast)**

```javascript
// Nuevo mensaje llega en tiempo real
socket.on('chat:message', {
  _id: "507f1f77bcf86cd799439099",
  senderId: "507f1f77bcf86cd799439002",
  senderName: "DragonSlayer",
  senderLevel: 85,
  senderRank: "Legendary",
  type: "global",
  content: "¡Acabo de derrotar a Dragón!",
  createdAt: "2025-12-01T10:31:15Z"
})

// Alguien añade reacción
socket.on('chat:reaction-added', {
  messageId: "507f1f77bcf86cd799439099",
  userId: "507f1f77bcf86cd799439003",
  reaction: "👍",
  totalReactions: 6
})

// Alguien está escribiendo...
socket.on('chat:user-typing', {
  userId: "507f1f77bcf86cd799439004",
  userName: "NewPlayer",
  type: "global"
})
```

### **Cliente emite**

```javascript
// Conectar al chat
socket.emit('chat:join', {
  type: "global"
})

// Enviar mensaje
socket.emit('chat:send-message', {
  type: "global",
  content: "¡Hola equipo!"
})

// Reacción a mensaje
socket.emit('chat:add-reaction', {
  messageId: "507f1f77bcf86cd799439099",
  reaction: "👍"
})

// Escribiendo...
socket.emit('chat:typing', {
  type: "global"
})

// Dejar de escribir
socket.emit('chat:stop-typing', {
  type: "global"
})
```

---

## 🔐 VALIDACIONES

```typescript
ChatMessageSchema {
  content: z.string().min(1).max(500),
  type: z.enum(['global', 'party', 'private']),
  replyTo: z.string().refine(isValidObjectId).optional()
}
```

---

## 🛡️ MODERACIÓN

### **Automática**
```
Palabras prohibidas: Filtrado automático
  - Si detecta: Reemplaza con ****
  - Ejemplo: "Hola badword123" → "Hola ****"

Spam detection:
  - Mismo mensaje 3+ veces en 5 min: Bloqueado
  - Más de 10 mensajes en 10 seg: Rate limit temporal

Links/invites:
  - Detecta y filtra URLs maliciosas
  - Permite solo dominios whitelisted
```

### **Manual** (Admin)
```
Mod puede:
├─ Eliminar mensaje
├─ Silenciar usuario (mute)
├─ Ban temporal
└─ Ban permanente
```

---

## 📊 RATE LIMITING

```
POST /api/chat/global      → 10 req/15min por usuario
GET /api/chat/messages     → Sin límite
GET /api/chat/:id/details  → Sin límite

WebSocket emit:
├─ chat:send-message       → 1 por segundo
├─ chat:typing             → 1 por segundo
└─ chat:add-reaction       → 3 por segundo
```

---

## 💾 ALMACENAMIENTO

```
Retención:
├─ Mensajes activos: 30 días
├─ Archivados: 6 meses
├─ Borrados: Soft delete (no eliminar)
└─ Índices: messageId, senderId, createdAt

Backup:
├─ Diario
├─ A almacenamiento frío (S3)
└─ Recuperable hasta 90 días
```

---

## 📈 ESTADÍSTICAS

### **Agregadas**
```
GET /api/chat/stats

{
  "totalMessages": 1247000,
  "activeUsers": 2847,
  "messagesPerMinute": 42,
  "averageMessageLength": 85,
  "mostCommonReaction": "👍",
  "topPosters": [
    { "username": "DragonSlayer", "messages": 2500 }
  ]
}
```

---

## 🎮 INTEGRACIÓN

### **Menciones**
```
Escribe: @username
Notifica: Usuario recibe notification
Enlace: Click abre perfil
```

### **Hashtags**
```
Escribe: #dragonfight
Crea: Tema busqueable
Filtro: Ver solo esos mensajes
```

### **Emojis**
```
Autocomplete: Escribe : → lista emojis
Reacciones: Click en emoji del mensaje
Compatibilidad: Unicode 14.0+
```

---

## 🔗 LINKS Y PREVIEWS

```javascript
Mensaje: "Mira este item: https://shop.valgame.com/item123"

Frontend detecta link y:
├─ Expande preview automático
├─ Muestra: Thumbnail, título, descripción
└─ Click abre recurso
```

---

## 📱 NOTIFICATIONS

```
Cuando recibo:
├─ Mención (@username) → Pop-up
├─ Reacción a mi mensaje → Badge
└─ Respuesta a mi mensaje → Badge
```

---

## 🎯 FEATURES FUTUROS

```
Fase 2:
├─ Party chat (solo equipo)
├─ Private messages (1-a-1)
├─ Voice messages
└─ File sharing

Fase 3:
├─ Guild/clan chat
├─ Language auto-translation
└─ Chat translations
```

---

## ✅ CHECKLIST

- [ ] Modelo ChatMessage
- [ ] GET /api/chat/messages
- [ ] POST /api/chat/global
- [ ] GET /api/chat/:id/details
- [ ] Socket.IO eventos
- [ ] Validaciones Zod
- [ ] Rate limiting
- [ ] Filtrado palabras prohibidas
- [ ] Spam detection
- [ ] Menciones (@username)
- [ ] Hashtags (#tema)
- [ ] Reacciones con emojis
- [ ] Link previews
- [ ] Persistencia en BD
- [ ] Moderación admin
- [ ] Notificaciones

---

**Última actualización:** 1 de diciembre, 2025  
**Estado:** ⭐ NUEVO  
**Endpoints:** 3  
**Real-time:** ✅ Socket.IO
