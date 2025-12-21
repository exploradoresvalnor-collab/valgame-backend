# 👥 TEAMS - EQUIPOS COOPERATIVOS

**Documentación completa del sistema de Teams (3 endpoints)**

---

## 📖 DESCRIPCIÓN

Sistema de equipos que permite a jugadores formar grupos cooperativos, compartir logros y participar en actividades grupales.

**Estado:** ⭐ NUEVO - Completamente omitido en documentación anterior

---

## 📡 ENDPOINTS (3)

### **1. Listar mis equipos**
```
GET /api/teams

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "name": "Dragon Slayers",
      "description": "Elite PvE team hunting rare dragons",
      "leaderId": "507f1f77bcf86cd799439002",
      "members": [
        {
          "userId": "507f1f77bcf86cd799439002",
          "username": "DragonSlayer",
          "level": 85,
          "role": "leader",
          "joinedAt": "2025-11-01T08:00:00Z"
        },
        {
          "userId": "507f1f77bcf86cd799439003",
          "username": "MageMaster",
          "level": 78,
          "role": "member",
          "joinedAt": "2025-11-15T10:30:00Z"
        }
      ],
      "memberCount": 2,
      "maxMembers": 5,
      "tier": "gold",
      "createdAt": "2025-11-01T08:00:00Z",
      "lastActivityAt": "2025-12-01T10:25:00Z"
    },
    { ... }
  ],
  "total": 3
}
```

---

### **2. Crear equipo**
```
POST /api/teams

Request:
{
  "name": "Dragon Slayers",
  "description": "Elite team for dungeons",
  "tier": "silver"  // "bronze" | "silver" | "gold" | "platinum"
}

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439001",
    "name": "Dragon Slayers",
    "description": "Elite team for dungeons",
    "leaderId": "507f1f77bcf86cd799439002",
    "members": [
      {
        "userId": "507f1f77bcf86cd799439002",
        "username": "DragonSlayer",
        "level": 85,
        "role": "leader"
      }
    ],
    "memberCount": 1,
    "maxMembers": 5,
    "tier": "silver",
    "createdAt": "2025-12-01T10:35:00Z"
  }
}
```

---

### **3. Detalles del equipo**
```
GET /api/teams/:id

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439001",
    "name": "Dragon Slayers",
    "description": "Elite PvE team",
    "leaderId": "507f1f77bcf86cd799439002",
    "members": [
      {
        "userId": "507f1f77bcf86cd799439002",
        "username": "DragonSlayer",
        "level": 85,
        "role": "leader",
        "joinedAt": "2025-11-01T08:00:00Z",
        "avatar": "avatar_url",
        "stats": {
          "dungeonKills": 450,
          "contribution": "high"
        }
      },
      { ... }
    ],
    "memberCount": 2,
    "maxMembers": 5,
    "tier": "gold",
    "stats": {
      "totalDungeonKills": 1200,
      "totalVALEarned": 50000,
      "avgMemberLevel": 80.5
    },
    "createdAt": "2025-11-01T08:00:00Z",
    "disbandedAt": null
  }
}
```

---

## 📊 MODELOS

### **Team**
```javascript
{
  _id: ObjectId,
  name: String,  // 1-50 caracteres
  description: String,  // 1-500 caracteres
  leaderId: ObjectId,
  members: [
    {
      userId: ObjectId,
      username: String,
      level: Number,
      role: "leader" | "moderator" | "member",
      joinedAt: Date,
      avatar: String,
      stats: {
        contribution: "very_high" | "high" | "medium" | "low",
        dungeonKills: Number,
        combatsWon: Number
      }
    }
  ],
  maxMembers: Number,  // Por tier
  tier: "bronze" | "silver" | "gold" | "platinum",
  logo: String,  // URL
  banner: String,  // URL
  isPublic: Boolean,  // Public/private
  joinRequests: [ObjectId],
  stats: {
    totalDungeonKills: Number,
    totalCombatsWon: Number,
    totalVALEarned: Number,
    avgMemberLevel: Number
  },
  permissions: {
    memberCanInvite: Boolean,
    memberCanKick: Boolean,
    autoApprove: Boolean
  },
  createdAt: Date,
  disbandedAt: Date,
  updatedAt: Date
}
```

---

## 🎯 TIERS Y LÍMITES

| Tier | Max Members | Features | Costo |
|------|-------------|----------|-------|
| **Bronze** | 3 | Básico | Gratis |
| **Silver** | 5 | + Storage | 1000 VAL |
| **Gold** | 10 | + Roles | 5000 VAL |
| **Platinum** | 20 | + All | 20000 VAL |

---

## 👥 ROLES

### **Leader**
```
Permisos:
├─ Modificar nombre/descripción
├─ Invitar/expulsar miembros
├─ Cambiar roles
├─ Disband team
└─ Ver stats del equipo

Limitaciones:
└─ Solo 1 líder
```

### **Moderator** (Gold+)
```
Permisos:
├─ Invitar miembros
├─ Expulsar miembros
└─ Moderar chat del team

Limitaciones:
└─ No puede cambiar líder
```

### **Member**
```
Permisos:
├─ Ver stats del team
├─ Participar en dungeons
└─ Usar chat

Limitaciones:
└─ No puede invitar (según permisos)
```

---

## 🔄 OPERACIONES ADICIONALES

### **Invitar miembro**
```
POST /api/teams/:id/invite

{
  "userId": "507f1f77bcf86cd799439004"
}

Response:
{
  "success": true,
  "invited": true,
  "message": "Invitación enviada"
}
```

### **Aceptar invitación**
```
POST /api/teams/:id/join

Response:
{
  "success": true,
  "joined": true,
  "memberCount": 3
}
```

### **Expulsar miembro**
```
DELETE /api/teams/:id/members/:userId

Response:
{
  "success": true,
  "removed": true
}
```

---

## 📱 WEBSOCKET EVENTS

```javascript
// Nuevo miembro se une
socket.on('team:member-joined', {
  teamId: "...",
  userId: "...",
  username: "NewPlayer",
  memberCount: 3
})

// Miembro expulsado
socket.on('team:member-removed', {
  teamId: "...",
  userId: "...",
  reason: "kicked"
})

// Stats del team se actualizan
socket.on('team:stats-updated', {
  teamId: "...",
  totalKills: 1250,
  avgLevel: 81.2
})
```

---

## 🎮 CARACTERÍSTICAS

### **Team Chat** (Futuro)
```
POST /api/teams/:id/chat

Mensajes privados del equipo
Solo miembros pueden ver
Persistencia: 30 días
```

### **Team Dungeon** (Futuro)
```
POST /api/teams/:id/start-dungeon

Todos los miembros entran en mismo dungeon
Combate cooperativo
Shared loot
```

### **Team Stats**
```
├─ Total kills colectivos
├─ Total VAL generado
├─ Promedio de nivel
├─ Win rate en combats
└─ Contribution per member
```

---

## 🔐 RATE LIMITING

```
POST /api/teams           → 5 req/15min
GET /api/teams            → Sin límite
GET /api/teams/:id        → Sin límite
Operaciones adicionales   → 20 req/15min
```

---

## 💾 PERSISTENCIA

```
Team data:
├─ Nombre, descripción
├─ Miembros, roles
├─ Stats, tier
└─ Fechas

Retención:
├─ Activos: Mientras exista
├─ Disband: 30 días (recover posible)
└─ Archivados: 90 días
```

---

## 🏆 ACHIEVEMENTS DE EQUIPO

```
first_team_member
  → Crear primer equipo

team_level_5
  → Team con 5 miembros

team_gold_tier
  → Alcanzar tier gold

team_100_kills
  → Team con 100 kills combinados

team_leaderboard
  → Top 100 en leaderboard de teams
```

---

## ✅ CHECKLIST

- [ ] Modelo Team
- [ ] POST /api/teams (crear)
- [ ] GET /api/teams (listar mis)
- [ ] GET /api/teams/:id (detalles)
- [ ] POST /api/teams/:id/invite
- [ ] POST /api/teams/:id/join
- [ ] DELETE /api/teams/:id/members/:userId
- [ ] Sistema de roles
- [ ] Sistema de tiers
- [ ] Socket.IO eventos
- [ ] Team chat (futuro)
- [ ] Team dungeon (futuro)
- [ ] Team stats
- [ ] Rate limiting
- [ ] Achievements

---

**Última actualización:** 1 de diciembre, 2025  
**Estado:** ⭐ NUEVO  
**Endpoints:** 3+  
**Futuro:** Team Dungeons, Chat compartido
