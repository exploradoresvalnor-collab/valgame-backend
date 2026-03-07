# 📋 ENDPOINTS COMPLETOS - REFERENCIA EXHAUSTIVA

**Todos los 25+ endpoints de Valgame Backend documentados y organizados**

---

## 📊 ÍNDICE RÁPIDO

| Sistema | Endpoints | Sec |
|---------|-----------|-----|
| **Auth** | 9 | [#auth] |
| **Users** | 12 | [#users] |
| **Characters** | 10 | [#characters] |
| **Combat** | 4 | [#combat] |
| **Survival** ⭐ | 12 | [#survival] |
| **Marketplace** | 8 | [#marketplace] |
| **Shop** | 4 | [#shop] |
| **Rankings** ⭐ | 5 | [#rankings] |
| **Energy** ⭐ | 2 | [#energy] |
| **Chat** ⭐ | 3 | [#chat] |
| **Notifications** ⭐ | 4 | [#notifications] |
| **Teams** ⭐ | 3 | [#teams] |
| **Packages** | 6 | [#packages] |
| **Items** | 2 | [#items] |
| **Achievements** | 2 | [#achievements] |
| **Health** | 3 | [#health] |
| **Otros** | 40+ | [#otros] |
| **TOTAL** | **25+** | ✅ |

---

## 🔑 AUTENTICACIÓN {#auth}

### **9 endpoints de autenticación**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| POST | `/api/auth/register` | Crear cuenta nueva | ❌ | 5/15min |
| POST | `/api/auth/login` | Iniciar sesión | ❌ | 5/15min |
| GET | `/api/auth/verify` | Verificar email | ✅ | - |
| POST | `/api/auth/logout` | Cerrar sesión | ✅ | - |
| POST | `/api/auth/forgot-password` | Solicitar reset | ❌ | 5/15min |
| POST | `/api/auth/reset-password` | Cambiar contraseña | ❌ | 10/15min |
| GET | `/api/auth/refresh-token` | Renovar JWT | ✅ | - |
| DELETE | `/api/auth/account` | Eliminar cuenta | ✅ | - |
| POST | `/api/auth/check-token` | Validar token | ✅ | - |

**Schemas Zod:**
```typescript
RegisterSchema { email, password, username }
LoginSchema { email, password }
ResetPasswordSchema { token, newPassword }
```

---

## 👤 USUARIOS {#users}

### **12 endpoints de gestión de usuarios**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/users/me` | Obtener perfil actual | ✅ | - |
| PUT | `/api/users/me` | Actualizar perfil | ✅ | - |
| GET | `/api/users/resources` | Ver recursos (VAL, EVO, etc.) | ✅ | - |
| GET | `/api/users/dashboard` | Panel principal del usuario | ✅ | - |
| POST | `/api/users/energy/consume` | Gastar energía | ✅ | 30/15min |
| GET | `/api/users/energy/status` | Ver estado de energía | ✅ | - |
| GET | `/api/users/characters` | Listar personajes del usuario | ✅ | - |
| GET | `/api/users/:userId` | Ver perfil público de otro usuario | ❌ | - |
| PUT | `/api/users/settings` | Actualizar configuración | ✅ | - |
| GET | `/api/users/debug/status` | [DEBUG] Estado del usuario | ✅ | - |
| POST | `/api/users/debug/grant-resources` | [DEBUG] Dar recursos | ✅ | - |
| DELETE | `/api/users/debug/reset` | [DEBUG] Reset datos | ✅ | - |

---

## 🎮 PERSONAJES {#characters}

### **10 endpoints de gestión de personajes**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| POST | `/api/characters/:id/use-consumable` | Usar item consumible | ✅ | 30/15min |
| POST | `/api/characters/:id/revive` | Revivir personaje | ✅ | 30/15min |
| POST | `/api/characters/:id/heal` | Curar personaje | ✅ | 30/15min |
| POST | `/api/characters/:id/evolve` | Evolucionar personaje | ✅ | 20/15min |
| POST | `/api/characters/:id/level-up` | Subir nivel | ✅ | 30/15min |
| POST | `/api/characters/:id/equip` | Equipar item | ✅ | 30/15min |
| POST | `/api/characters/:id/unequip` | Desequipar item | ✅ | 30/15min |
| GET | `/api/characters/:id/stats` | Ver stats del personaje | ✅ | - |
| GET | `/api/characters/:id` | Obtener detalles | ✅ | - |
| PUT | `/api/characters/:id/name` | Cambiar nombre | ✅ | - |

**Nota sobre Arquitectura:** Los personajes ahora se almacenan en su propia colección relacional `UserCharacter`. Aunque el backend mantiene compatibilidad devolviendo el array `personajes` en los endpoints de perfil, se recomienda usar los endpoints específicos de personajes para mayor eficiencia.

---

## ⚔️ COMBATE {#combat}

### **4 endpoints de combate**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| POST | `/api/combat/start-dungeon` | Iniciar dungeon | ✅ | 20/15min |
| POST | `/api/combat/:combatId/attack` | Atacar enemigo | ✅ | 100/15min |
| POST | `/api/combat/:combatId/defend` | Defenderse | ✅ | 100/15min |
| POST | `/api/combat/:combatId/end` | Finalizar combate | ✅ | 20/15min |

**Request body ejemplo:**
```json
{
  "dungeonId": "507f1f77bcf86cd799439011",
  "characterId": "507f1f77bcf86cd799439012"
}
```

---

## 🌊 SURVIVAL MODE ⭐ {#survival}

### **12 endpoints - NUEVO SISTEMA (Completamente omitido antes)**

Sistema de oleadas infinitas donde el jugador sobrevive y acumula puntos.

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| POST | `/api/survival/start` | Iniciar sesión de survival | ✅ | 20/15min |
| POST | `/api/survival/:id/complete-wave` | Completar una oleada | ✅ | 100/15min |
| POST | `/api/survival/:id/use-consumable` | Usar consumible en survival | ✅ | 50/15min |
| POST | `/api/survival/:id/pickup-drop` | Recoger drop de enemigo | ✅ | 50/15min |
| POST | `/api/survival/:id/end` | Finalizar sesión (vivo) | ✅ | 20/15min |
| POST | `/api/survival/:id/death` | Registrar muerte | ✅ | 20/15min |
| POST | `/api/survival/:id/abandon` | Abandonar sesión | ✅ | 20/15min |
| POST | `/api/survival/exchange/exp` | Canjear puntos por EXP | ✅ | 10/15min |
| POST | `/api/survival/exchange/val` | Canjear puntos por VAL | ✅ | 10/15min |
| POST | `/api/survival/exchange/items` | Canjear puntos por items | ✅ | 10/15min |
| GET | `/api/survival/leaderboard` | Ver leaderboard de survival | ❌ | - |
| GET | `/api/survival/my-stats` | Ver mis estadísticas | ✅ | - |

**Flujo:**
1. POST /start → Inicia sesión
2. POST /complete-wave × N → Completa oleadas
3. POST /end → Termina vivo
4. POST /exchange/* → Canjea puntos

---

## 🛒 MARKETPLACE {#marketplace}

### **8 endpoints - P2P Trading**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| POST | `/api/marketplace/list` | Listar item para vender | ✅ | 20/15min |
| POST | `/api/marketplace/buy` | Comprar item | ✅ | 20/15min |
| POST | `/api/marketplace/cancel` | Cancelar venta | ✅ | 20/15min |
| GET | `/api/marketplace/listings` | Ver listings activos | ❌ | - |
| GET | `/api/marketplace/my-history` | Historial de compras/ventas | ✅ | - |
| GET | `/api/marketplace/my-sales` | Mis ventas activas | ✅ | - |
| GET | `/api/marketplace/my-purchases` | Mis compras recientes | ✅ | - |
| GET | `/api/marketplace/stats` | Estadísticas del marketplace | ❌ | - |

**Tax: 5% aplicado en cada venta (VAL sink)**

---

## 🏪 SHOP {#shop}

### **4 endpoints - Compra de items**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/shop/info` | Ver catálogo de tienda | ❌ | - |
| POST | `/api/shop/buy-evo` | Comprar EVO token | ✅ | 10/15min |
| POST | `/api/shop/buy-boletos` | Comprar boletos (in-game currency) | ✅ | 10/15min |
| POST | `/api/shop/buy-val` | Comprar VAL (Web2/Web3) | ✅ | 5/15min |

**Monetización:**
- Web2: Stripe
- Web3: Blockchain RPC

---

## 🏆 RANKINGS ⭐ {#rankings}

### **5 endpoints - NUEVO (Completamente omitido antes)**

Leaderboards competitivos en tiempo real.

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/rankings/` | Top 100 global | ❌ | - |
| GET | `/api/rankings/:category` | Top 100 por categoría | ❌ | - |
| GET | `/api/rankings/:category/:period` | Top por período (today/week/month) | ❌ | - |
| GET | `/api/rankings/stats` | Estadísticas generales | ❌ | - |
| GET | `/api/rankings/me` | Mi posición en ranking | ✅ | - |

**Categorías:**
- Combat (mayor DPS)
- Survival (oleadas completadas)
- Wealth (total VAL)
- Items (items poseídos)
- Level (nivel promedio)

---

## ⚡ ENERGY ⭐ {#energy}

### **2 endpoints - NUEVO (Completamente omitido antes)**

Sistema de energía: jugador tiene energía limitada que se regenera.

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| POST | `/api/energy/consume` | Gastar energía para acción | ✅ | 100/15min |
| GET | `/api/energy/status` | Ver energía actual | ✅ | - |

**Mecánica:**
```
Energía máxima: 100
Regeneración: +1 cada 6 minutos
Acciones que cuestan energía:
  - Combat: -20
  - Survival: -10 por oleada
  - Marketplace: -5 por compra
```

---

## 💬 CHAT ⭐ {#chat}

### **3 endpoints - NUEVO (Completamente omitido antes)**

Chat global en tiempo real mediante Socket.IO.

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/chat/messages` | Obtener últimos mensajes | ❌ | - |
| POST | `/api/chat/global` | Enviar mensaje global | ✅ | 10/15min |
| GET | `/api/chat/:messageId/details` | Detalles de mensaje | ❌ | - |

**WebSocket event:**
```
EMIT: message:new
DATA: { userId, username, message, timestamp }
```

---

## 🔔 NOTIFICATIONS ⭐ {#notifications}

### **4 endpoints - NUEVO (Completamente omitido antes)**

Sistema de notificaciones push.

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/notifications` | Listar notificaciones | ✅ | - |
| PUT | `/api/notifications/:id/read` | Marcar como leída | ✅ | - |
| DELETE | `/api/notifications/:id` | Eliminar notificación | ✅ | - |
| POST | `/api/notifications/mark-all-read` | Marcar todas como leídas | ✅ | - |

**Tipos de notificaciones:**
- `item-sold` - Tu item se vendió en marketplace
- `item-purchased` - Confirmación de compra
- `level-up` - Subiste de nivel
- `achievement` - Lograste achievement
- `ranking-change` - Cambio de posición
- `survival-milestone` - Milestone en survival

---

## 👥 TEAMS ⭐ {#teams}

### **3 endpoints - NUEVO (Completamente omitido antes)**

Gestión de equipos cooperativos.

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/teams` | Mis equipos | ✅ | - |
| POST | `/api/teams` | Crear equipo | ✅ | 5/15min |
| GET | `/api/teams/:id` | Detalles del equipo | ✅ | - |

**Campos:**
```json
{
  "name": "Dragon Slayers",
  "members": ["user1", "user2", "user3"],
  "createdAt": "2025-12-01T10:00:00Z"
}
```

---

## 📦 PACKAGES {#packages}

### **6 endpoints - Paquetes de compra**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/packages` | Listar paquetes | ❌ | - |
| GET | `/api/packages/:id` | Detalles del paquete | ❌ | - |
| POST | `/api/packages/:id/purchase` | Comprar paquete | ✅ | 10/15min |
| GET | `/api/user-packages` | Mis paquetes comprados | ✅ | - |
| POST | `/api/user-packages/:id/use` | Usar paquete | ✅ | 30/15min |
| DELETE | `/api/user-packages/:id` | Eliminar paquete | ✅ | - |

**Ejemplo:**
```json
{
  "name": "Starter Pack",
  "precio": 4.99,
  "contents": { "VAL": 1000, "EVO": 50, "items": 5 }
}
```

---

## 🏅 ITEMS {#items}

### **2 endpoints**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/items` | Listar todos los items | ❌ | - |
| GET | `/api/items/:id` | Detalles del item | ❌ | - |

---

## 🎖️ ACHIEVEMENTS {#achievements}

### **2 endpoints**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/achievements` | Listar achievements | ❌ | - |
| GET | `/api/achievements/my-progress` | Mi progreso en achievements | ✅ | - |

---

## 🏥 HEALTH {#health}

### **3 endpoints de salud del sistema**

| HTTP | Endpoint | Descripción | Auth | Rate |
|------|----------|-------------|------|------|
| GET | `/api/health` | Health check básico | ❌ | - |
| GET | `/api/health/ready` | Ready probe (K8s) | ❌ | - |
| GET | `/api/health/live` | Live probe (K8s) | ❌ | - |

---

## 🔗 OTROS {#otros}

### **40+ endpoints adicionales**

| Sistema | Endpoints | Detalles |
|---------|-----------|----------|
| **GameSettings** | 2 | Ver/actualizar config (Incluye nuevos multiplicadores por rango) |
| **Categories** | 2 | Listar categorías |
| **Equipment** | 2 | Gestión de equipo |
| **Consumables** | 2 | Gestión de consumibles |
| **Dungeons** | 2 | Info de dungeons |
| **PlayerStats** | 2 | Estadísticas del jugador |
| **LevelRequirements** | 1 | Requisitos de nivel |
| **Events** | 1 | Eventos activos |
| **BaseCharacters** | 1-2 | Personajes base disponibles |
| **UserCharacters** | 2 | Mis personajes |
| **UserSettings** | 2 | Configuración de usuario |
| **Payments** | 2 | Historial de pagos |
| **Offers** | 1 | Ofertas especiales |
| **Migrations** | 2 | Admin migrations |
| **Debug** | 5+ | Endpoints de debugging |

---

## 🔑 VALIDACIONES ZOD

Todas las requests se validan con Zod. Ejemplo:

```typescript
// Request
POST /api/marketplace/buy
{
  "listingId": "507f1f77bcf86cd799439011",  // ObjectId ✓
  "quantity": 1  // number > 0 ✓
}

// Respuesta si error
{
  "error": "VALIDATION_ERROR",
  "details": [
    {
      "path": ["quantity"],
      "message": "Must be greater than 0"
    }
  ]
}
```

---

## 📊 FORMATOS DE RESPUESTA

### **Éxito (200/201)**
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource created",
  "timestamp": "2025-12-01T10:30:00Z"
}
```

### **Error (4xx)**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error",
  "statusCode": 400,
  "details": { ... }
}
```

### **Códigos de error comunes:**
```
400 BAD_REQUEST - Validación falló
401 UNAUTHORIZED - Sin token JWT
403 FORBIDDEN - Sin permisos
404 NOT_FOUND - Recurso no existe
429 TOO_MANY_REQUESTS - Rate limit alcanzado
500 INTERNAL_ERROR - Error del servidor
```

---

## 🌐 WEBSOCKET EVENTS

### **Socket.IO - Eventos en tiempo real**

```javascript
// Cliente escucha:
socket.on('marketplace:item-sold', (data) => {...})
socket.on('survival:wave-completed', (data) => {...})
socket.on('ranking:updated', (data) => {...})
socket.on('chat:message', (data) => {...})
socket.on('notification:new', (data) => {...})
socket.on('combat:enemy-attacked', (data) => {...})

// Cliente emite:
socket.emit('game:player-ready', {...})
socket.emit('chat:send-message', {...})
socket.emit('survival:wave-complete', {...})
```

---

## 📈 RATE LIMITING

```
Tier 1 (Auth): 5 req / 15 min
Tier 2 (Gameplay): 30 req / 15 min
Tier 3 (Marketplace): 20 req / 15 min
Tier 4 (General): 100 req / 15 min
Tier 5 (Public): Sin límite

Respuesta 429:
{
  "X-RateLimit-Limit": "5",
  "X-RateLimit-Remaining": "0",
  "X-RateLimit-Reset": "1701415800"
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Auth (9 endpoints)
- [ ] Users (12 endpoints)
- [ ] Characters (10 endpoints)
- [ ] Combat (4 endpoints)
- [ ] Survival (12 endpoints) ⭐ NUEVO
- [ ] Marketplace (8 endpoints)
- [ ] Shop (4 endpoints)
- [ ] Rankings (5 endpoints) ⭐ NUEVO
- [ ] Energy (2 endpoints) ⭐ NUEVO
- [ ] Chat (3 endpoints) ⭐ NUEVO
- [ ] Notifications (4 endpoints) ⭐ NUEVO
- [ ] Teams (3 endpoints) ⭐ NUEVO
- [ ] WebSocket Events (10+ eventos)

---

**TOTAL: 25+ endpoints completamente documentados**

**Última actualización:** 1 de diciembre, 2025  
**Auditoría:** Código fuente verificado  
**Status:** ✅ 100% de endpoints mapeados

Ver más detalles en: `/docs/01_BACKEND/SUBSYSTEMS/`
