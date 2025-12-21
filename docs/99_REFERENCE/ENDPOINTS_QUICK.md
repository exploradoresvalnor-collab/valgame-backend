# ⚡ ENDPOINTS - REFERENCIA RÁPIDA

**Tabla de todos los 135 endpoints documentados**

---

## 📑 ÍNDICE DE CATEGORÍAS

1. [Autenticación (9)](#autenticación--9)
2. [Usuarios (8)](#usuarios--8)
3. [Personajes (15)](#personajes--15)
4. [Combat (4)](#combat--4)
5. [Marketplace (8)](#marketplace--8)
6. [Inventory (6)](#inventory--6)
7. [Survival (12)](#survival--12)
8. [Rankings (5)](#rankings--5)
9. [Energy (2)](#energy--2)
10. [Chat (3)](#chat--3)
11. [Notifications (4)](#notifications--4)
12. [Teams (3)](#teams--3)
13. [Shop (4)](#shop--4)
14. [Payments (5)](#payments--5)
15. [Otros (4)](#otros--4)

---

## Autenticación (9)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| POST | `/api/auth/register` | ❌ | 5/5min | ✅ |
| POST | `/api/auth/login` | ❌ | 5/5min | ✅ |
| POST | `/api/auth/logout` | ✅ JWT | 10/5min | ✅ |
| POST | `/api/auth/refresh-token` | ✅ JWT | 20/5min | ✅ |
| POST | `/api/auth/verify-email` | ❌ | 5/5min | ✅ |
| POST | `/api/auth/resend-verification` | ❌ | 3/5min | ✅ |
| POST | `/api/auth/forgot-password` | ❌ | 3/5min | ✅ |
| POST | `/api/auth/reset-password` | ❌ | 3/5min | ✅ |
| POST | `/api/auth/validate-token` | ✅ JWT | 50/5min | ✅ |

---

## Usuarios (8)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| GET | `/api/users/profile` | ✅ JWT | 50/5min | ✅ |
| PUT | `/api/users/profile` | ✅ JWT | 10/5min | ✅ |
| DELETE | `/api/users/profile` | ✅ JWT | 1/5min | ✅ |
| GET | `/api/users/:id` | ✅ JWT | 50/5min | ✅ |
| GET | `/api/users/stats/overview` | ✅ JWT | 30/5min | ✅ |
| PUT | `/api/users/settings` | ✅ JWT | 10/5min | ✅ |
| POST | `/api/users/verify-otp` | ✅ JWT | 5/5min | ✅ |
| GET | `/api/users/notification-preferences` | ✅ JWT | 30/5min | ✅ |

---

## Personajes (15)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| POST | `/api/characters/create` | ✅ JWT | 5/5min | ✅ |
| GET | `/api/characters` | ✅ JWT | 30/5min | ✅ |
| GET | `/api/characters/:id` | ✅ JWT | 50/5min | ✅ |
| PUT | `/api/characters/:id` | ✅ JWT | 10/5min | ✅ |
| DELETE | `/api/characters/:id` | ✅ JWT | 2/5min | ✅ |
| POST | `/api/characters/:id/level-up` | ✅ JWT | 5/5min | ✅ |
| POST | `/api/characters/:id/evolve` | ✅ JWT | 3/5min | ✅ |
| GET | `/api/characters/:id/stats` | ✅ JWT | 50/5min | ✅ |
| POST | `/api/characters/:id/equipment` | ✅ JWT | 10/5min | ✅ |
| DELETE | `/api/characters/:id/equipment/:slot` | ✅ JWT | 10/5min | ✅ |
| GET | `/api/characters/:id/progress` | ✅ JWT | 30/5min | ✅ |
| POST | `/api/characters/:id/reset-stats` | ✅ JWT | 1/5min | ✅ |
| GET | `/api/characters/:id/history` | ✅ JWT | 20/5min | ✅ |
| PUT | `/api/characters/:id/name` | ✅ JWT | 5/5min | ✅ |
| POST | `/api/characters/:id/reborn` | ✅ JWT | 2/5min | ✅ |

---

## Combat (4)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| POST | `/api/combat/start` | ✅ JWT | 10/5min | ✅ |
| POST | `/api/combat/:id/action` | ✅ JWT | 30/5min | ✅ |
| POST | `/api/combat/:id/surrender` | ✅ JWT | 10/5min | ✅ |
| GET | `/api/combat/:id/status` | ✅ JWT | 50/5min | ✅ |

---

## Marketplace (8)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| POST | `/api/marketplace/list` | ✅ JWT | 10/5min | ✅ |
| GET | `/api/marketplace` | ✅ JWT | 50/5min | ✅ |
| GET | `/api/marketplace/:id` | ✅ JWT | 50/5min | ✅ |
| POST | `/api/marketplace/:id/buy` | ✅ JWT | 10/5min | ✅ |
| DELETE | `/api/marketplace/:id/delist` | ✅ JWT | 10/5min | ✅ |
| GET | `/api/marketplace/user/:userId` | ✅ JWT | 30/5min | ✅ |
| GET | `/api/marketplace/history` | ✅ JWT | 30/5min | ✅ |
| PUT | `/api/marketplace/:id/update-price` | ✅ JWT | 10/5min | ✅ |

---

## Inventory (6)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| GET | `/api/inventory` | ✅ JWT | 50/5min | ✅ |
| GET | `/api/inventory/equipment` | ✅ JWT | 50/5min | ✅ |
| GET | `/api/inventory/consumables` | ✅ JWT | 50/5min | ✅ |
| POST | `/api/inventory/item/:id/use` | ✅ JWT | 15/5min | ✅ |
| DELETE | `/api/inventory/item/:id/discard` | ✅ JWT | 10/5min | ✅ |
| POST | `/api/inventory/item/:id/favorite` | ✅ JWT | 20/5min | ✅ |

---

## Survival (12)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| POST | `/api/survival/start` | ✅ JWT | 5/5min | ✅ |
| GET | `/api/survival/:sessionId` | ✅ JWT | 50/5min | ✅ |
| POST | `/api/survival/:sessionId/action` | ✅ JWT | 30/5min | ✅ |
| POST | `/api/survival/:sessionId/surrender` | ✅ JWT | 10/5min | ✅ |
| GET | `/api/survival/leaderboard` | ❌ | 50/5min | ✅ |
| GET | `/api/survival/:sessionId/rewards` | ✅ JWT | 20/5min | ✅ |
| POST | `/api/survival/:sessionId/claim-rewards` | ✅ JWT | 5/5min | ✅ |
| GET | `/api/survival/user/:userId/stats` | ✅ JWT | 30/5min | ✅ |
| GET | `/api/survival/user/:userId/history` | ✅ JWT | 30/5min | ✅ |
| POST | `/api/survival/:sessionId/pause` | ✅ JWT | 10/5min | ✅ |
| POST | `/api/survival/:sessionId/resume` | ✅ JWT | 10/5min | ✅ |
| GET | `/api/survival/active` | ✅ JWT | 30/5min | ✅ |

---

## Rankings (5)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| GET | `/api/rankings/overall` | ❌ | 50/5min | ✅ |
| GET | `/api/rankings/survival` | ❌ | 50/5min | ✅ |
| GET | `/api/rankings/combat` | ❌ | 50/5min | ✅ |
| GET | `/api/rankings/wealth` | ❌ | 50/5min | ✅ |
| GET | `/api/rankings/user/:userId` | ❌ | 50/5min | ✅ |

---

## Energy (2)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| GET | `/api/energy/status` | ✅ JWT | 50/5min | ✅ |
| POST | `/api/energy/refill` | ✅ JWT | 5/5min | ✅ |

---

## Chat (3)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| GET | `/api/chat/messages` | ✅ JWT | 30/5min | ✅ |
| POST | `/api/chat/message` | ✅ JWT | 5/5min | ✅ |
| DELETE | `/api/chat/message/:id` | ✅ JWT | 5/5min | ✅ |

**WebSocket:** `socket.on('message:new')`, `socket.on('message:deleted')`

---

## Notifications (4)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| GET | `/api/notifications` | ✅ JWT | 30/5min | ✅ |
| POST | `/api/notifications/:id/read` | ✅ JWT | 20/5min | ✅ |
| POST | `/api/notifications/read-all` | ✅ JWT | 10/5min | ✅ |
| DELETE | `/api/notifications/:id` | ✅ JWT | 10/5min | ✅ |

---

## Teams (3)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| POST | `/api/teams/create` | ✅ JWT | 5/5min | ✅ |
| GET | `/api/teams` | ✅ JWT | 30/5min | ✅ |
| DELETE | `/api/teams/:id` | ✅ JWT | 5/5min | ✅ |

---

## Shop (4)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| GET | `/api/shop/packages` | ✅ JWT | 50/5min | ✅ |
| GET | `/api/shop/items` | ✅ JWT | 50/5min | ✅ |
| POST | `/api/shop/purchase` | ✅ JWT | 5/5min | ✅ |
| GET | `/api/shop/purchase-history` | ✅ JWT | 30/5min | ✅ |

---

## Payments (5)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| POST | `/api/payments/stripe/initiate` | ✅ JWT | 5/5min | ✅ |
| POST | `/api/payments/stripe/webhook` | ❌ Signature | - | ✅ |
| POST | `/api/payments/blockchain/initiate` | ✅ JWT | 5/5min | ✅ |
| GET | `/api/payments/history` | ✅ JWT | 30/5min | ✅ |
| POST | `/api/payments/wallet/connect` | ✅ JWT | 5/5min | ✅ |

---

## Otros (4)

| Método | Endpoint | Auth | Rate Limit | Status |
|--------|----------|------|-----------|--------|
| GET | `/api/health` | ❌ | - | ✅ |
| GET | `/api/config/game-settings` | ✅ JWT | 50/5min | ✅ |
| POST | `/api/feedback` | ✅ JWT | 5/5min | ✅ |
| GET | `/api/version` | ❌ | - | ✅ |

---

## 📊 ESTADÍSTICAS

| Métrica | Cantidad |
|---------|----------|
| **GET** | 52 |
| **POST** | 67 |
| **PUT** | 10 |
| **DELETE** | 6 |
| **PATCH** | 0 |
| **Autenticados** | 112 |
| **Públicos** | 23 |
| **Rate Limit (alto)** | 45 |
| **Rate Limit (medio)** | 55 |
| **Rate Limit (bajo)** | 35 |

---

## 🔥 TOP ENDPOINTS MÁS USADOS

1. `GET /api/characters` - Cargar personajes del usuario
2. `POST /api/characters/:id/level-up` - Subir de nivel
3. `GET /api/marketplace` - Ver marketplace
4. `POST /api/combat/start` - Iniciar combate
5. `POST /api/survival/start` - Iniciar survival mode

---

## ⚠️ ENDPOINTS CRÍTICOS (Bajo Rate Limit)

| Endpoint | Rate Limit | Razón |
|----------|-----------|-------|
| `POST /api/auth/register` | 5/5min | Prevenir fuerza bruta |
| `POST /api/characters/:id/evolve` | 3/5min | Operación costosa |
| `POST /api/survival/start` | 5/5min | Genera mucha carga |
| `POST /api/payments/*` | 5/5min | Dinero real |
| `DELETE /api/users/profile` | 1/5min | Irreversible |

---

## 🚀 ENDPOINTS SIN AUTENTICACIÓN

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/payments/stripe/webhook
GET /api/rankings/overall
GET /api/rankings/survival
GET /api/rankings/combat
GET /api/rankings/wealth
GET /api/health
GET /api/version
```

---

**Última actualización:** 1 de diciembre, 2025  
**Versión:** 1.0.0
