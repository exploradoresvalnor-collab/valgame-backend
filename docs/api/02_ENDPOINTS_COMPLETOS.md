# 📡 Referencia Completa de Endpoints - Valgame Backend v2.1.0

**Total de Endpoints:** ~25+  
**Última actualización:** 24 de noviembre, 2025  
**Estado:** ✅ Auditoría completada  

---

## 📊 Tabla de Contenidos

- [Endpoints Públicos (11)](#endpoints-públicos)
- [Autenticación (9)](#autenticación)
- [Usuarios (12)](#usuarios)
- [Personajes (10)](#personajes)
- [Combate (4)](#combate)
- [Survival (12)](#survival)
- [Marketplace (8)](#marketplace)
- [Tienda (4)](#tienda)
- [Rankings (5)](#rankings)
- [Paquetes (6)](#paquetes)
- [Salud (3)](#salud)
- [Otros Sistemas (30+)](#otros-sistemas)

---

## 🌍 ENDPOINTS PÚBLICOS

**Autenticación requerida:** ❌ No

| # | HTTP | Ruta | Descripción | Estado |
|----|------|------|-------------|--------|
| 1 | GET | `/health` | Health check rápido | ✅ Vivo |
| 2 | GET | `/api/packages` | Listar paquetes disponibles | ✅ |
| 3 | GET | `/api/base-characters` | Catálogo de personajes | ✅ |
| 4 | GET | `/api/equipment` | Equipamiento disponible | ✅ |
| 5 | GET | `/api/consumables` | Consumibles disponibles | ✅ |
| 6 | GET | `/api/game-settings` | Configuración del juego | ✅ |
| 7 | GET | `/api/offers` | Ofertas activas | ✅ |
| 8 | GET | `/api/dungeons` | Listar mazmorras | ✅ |
| 9 | POST | `/api/payments/webhook` | Webhook de pagos | ✅ |
| 10 | GET | `/api/health/ready` | Readiness probe | ✅ |
| 11 | GET | `/api/health/live` | Liveness probe | ✅ |

---

## 🔐 AUTENTICACIÓN

**Ruta base:** `/auth`  
**Autenticación requerida:** Algunas sí, otras no

| # | HTTP | Ruta | Autenticación | Descripción |
|----|------|------|---------------|-------------|
| 12 | POST | `/auth/register` | ❌ | Registrar usuario |
| 13 | POST | `/auth/login` | ❌ | Iniciar sesión |
| 14 | POST | `/auth/logout` | ✅ | Cerrar sesión |
| 15 | GET | `/auth/verify/:token` | ❌ | Verificar email |
| 16 | POST | `/auth/resend-verification` | ❌ | Reenviar verificación |
| 17 | POST | `/auth/forgot-password` | ❌ | Solicitar recuperación |
| 18 | GET | `/auth/reset-form/:token` | ❌ | Formulario de cambio |
| 19 | GET | `/auth/reset-password/validate/:token` | ❌ | Validar token |
| 20 | POST | `/auth/reset-password/:token` | ❌ | Cambiar contraseña |

---

## 👤 USUARIOS

**Ruta base:** `/api/users`  
**Autenticación requerida:** ✅ Sí (excepto profile público)

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 21 | GET | `/api/users/` | Listar usuarios (admin) |
| 22 | GET | `/api/users/profile/:userId` | Perfil público |
| 23 | GET | `/api/users/me` | Mi perfil completo |
| 24 | GET | `/api/users/resources` | Recursos (VAL, boletos, etc) |
| 25 | GET | `/api/users/dashboard` | Datos consolidados dashboard |
| 26 | PUT | `/api/users/tutorial/complete` | Marcar tutorial completado |
| 27 | POST | `/api/users/characters/add` | Agregar personaje |
| 28 | PUT | `/api/users/set-active-character/:personajeId` | Personaje activo |
| 29 | GET | `/api/users/debug/my-data` | Datos crudos (debug) |
| 30 | DELETE | `/api/users/characters/:personajeId` | Eliminar personaje |
| 31 | POST | `/api/users/energy/consume` | Consumir energía |
| 32 | GET | `/api/users/energy/status` | Estado de energía |

---

## 🎮 PERSONAJES

**Ruta base:** `/api/characters`  
**Autenticación requerida:** ✅ Sí

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 33 | POST | `/api/characters/:characterId/use-consumable` | Usar consumible |
| 34 | POST | `/api/characters/:characterId/revive` | Revivir personaje |
| 35 | POST | `/api/characters/:characterId/damage` | Simular daño (test) |
| 36 | POST | `/api/characters/:characterId/heal` | Curar personaje |
| 37 | POST | `/api/characters/:characterId/evolve` | Evolucionar personaje |
| 38 | POST | `/api/characters/:characterId/add-experience` | Añadir EXP |
| 39 | POST | `/api/characters/:characterId/equip` | Equipar item |
| 40 | POST | `/api/characters/:characterId/unequip` | Desequipar item |
| 41 | GET | `/api/characters/:characterId/stats` | Obtener stats |
| 42 | PUT | `/api/characters/:characterId/level-up` | Subir nivel |

**Nota sobre Arquitectura (Marzo 2026):** Los personajes ahora residen en la colección `UserCharacter`. Se recomienda al frontend usar los endpoints de esta sección para gestionar el inventario de héroes de forma eficiente.

---

## ⚔️ COMBATE

**Rutas base:** `/api/combat`, `/api/dungeons`  
**Autenticación requerida:** ✅ Sí

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 43 | POST | `/api/dungeons/:dungeonId/start` | Iniciar combate |
| 44 | POST | `/api/combat/attack` | Realizar ataque |
| 45 | POST | `/api/combat/defend` | Defender |
| 46 | POST | `/api/combat/end` | Finalizar combate |

---

## 🌲 SURVIVAL

**Ruta base:** `/api/survival`  
**Autenticación requerida:** ✅ Sí

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 47 | POST | `/api/survival/start` | Iniciar sesión |
| 48 | POST | `/api/survival/:sessionId/complete-wave` | Completar onda |
| 49 | POST | `/api/survival/:sessionId/use-consumable` | Usar consumible |
| 50 | POST | `/api/survival/:sessionId/pickup-drop` | Recoger item |
| 51 | POST | `/api/survival/:sessionId/end` | Terminar exitoso |
| 52 | POST | `/api/survival/:sessionId/death` | Reportar muerte |
| 53 | POST | `/api/survival/:sessionId/abandon` | Abandonar sesión |
| 54 | POST | `/api/survival/exchange-points/exp` | Puntos → EXP |
| 55 | POST | `/api/survival/exchange-points/val` | Puntos → VAL |
| 56 | POST | `/api/survival/exchange-points/guaranteed-item` | Puntos → Item |
| 57 | GET | `/api/survival/leaderboard` | Leaderboard global |
| 58 | GET | `/api/survival/my-stats` | Mis estadísticas |

---

## 🛒 MARKETPLACE

**Ruta base:** `/api/marketplace`, `/api/marketplace-transactions`  
**Autenticación requerida:** ✅ Sí

### Listings:

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 59 | POST | `/api/marketplace/marketplace/list` | Crear listing (vender) |
| 60 | POST | `/api/marketplace/marketplace/buy/:listingId` | Comprar item |
| 61 | DELETE | `/api/marketplace/marketplace/cancel/:listingId` | Cancelar listing |

### Transacciones:

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 62 | GET | `/api/marketplace-transactions/my-history` | Historial |
| 63 | GET | `/api/marketplace-transactions/my-sales` | Mis ventas |
| 64 | GET | `/api/marketplace-transactions/my-purchases` | Mis compras |
| 65 | GET | `/api/marketplace-transactions/stats` | Estadísticas |
| 66 | GET | `/api/marketplace-transactions/:listingId` | Transacciones listing |

---

## 🛍️ TIENDA

**Ruta base:** `/api/shop`  
**Autenticación requerida:** Parcial

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 67 | GET | `/api/shop/info` | Info tienda (público) |
| 68 | POST | `/api/shop/buy-evo` | Comprar EVO cristales |
| 69 | POST | `/api/shop/buy-boletos` | Comprar boletos |
| 70 | POST | `/api/shop/buy-val` | Comprar VAL |

---

## 📊 RANKINGS

**Ruta base:** `/api/rankings`  
**Autenticación requerida:** Parcial

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 71 | GET | `/api/rankings/` | Ranking global |
| 72 | GET | `/api/rankings/leaderboard/:category` | Leaderboard categoría |
| 73 | GET | `/api/rankings/period/:periodo` | Ranking por periodo |
| 74 | GET | `/api/rankings/stats` | Estadísticas ranking |
| 75 | GET | `/api/rankings/me` | Mi ranking |

---

## 📦 PAQUETES

**Rutas base:** `/api/packages`, `/api/user-packages`  
**Autenticación requerida:** Parcial

### Paquetes del Juego:

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 76 | GET | `/api/packages` | Listar paquetes |
| 77 | GET | `/api/packages/:id` | Detalles paquete |

### Paquetes del Usuario:

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 78 | GET | `/api/user-packages` | Mis paquetes |
| 79 | GET | `/api/user-packages/:userId` | Paquetes usuario (admin) |
| 80 | POST | `/api/user-packages/agregar` | Agregar paquete (admin) |
| 81 | POST | `/api/user-packages/quitar` | Quitar paquete (admin) |

---

## 🏥 SALUD

**Ruta base:** `/api/health`  
**Autenticación requerida:** ❌ No

| # | HTTP | Ruta | Descripción |
|----|------|------|-------------|
| 82 | GET | `/api/health` | Health check |
| 83 | GET | `/api/health/ready` | Readiness probe |
| 84 | GET | `/api/health/live` | Liveness probe |

---

## 🔧 OTROS SISTEMAS

### Notificaciones (`/api/notifications`):

| # | HTTP | Ruta |
|----|------|------|
| 85 | GET | `/api/notifications` |
| 86 | GET | `/api/notifications/:id` |
| 87 | PUT | `/api/notifications/:id/read` |
| 88 | DELETE | `/api/notifications/:id` |

### Categorías (`/api/categories`):

| # | HTTP | Ruta |
|----|------|------|
| 89 | GET | `/api/categories` |
| 90 | POST | `/api/categories` |

### Items (`/api/items`):

| # | HTTP | Ruta |
|----|------|------|
| 91 | GET | `/api/items` |
| 92 | POST | `/api/items` |

### Configuración (`/api/game-settings`):

| # | HTTP | Ruta |
|----|------|------|
| 93 | GET | `/api/game-settings` | Ver config (incluye multiplicadores de XP/VAL/Drop) |
| 94 | PUT | `/api/game-settings` | Actualizar config (Admin) |

### Eventos (`/api/events`):

| # | HTTP | Ruta |
|----|------|------|
| 95 | GET | `/api/events` |

### Estadísticas Jugador (`/api/player-stats`):

| # | HTTP | Ruta |
|----|------|------|
| 96 | GET | `/api/player-stats` |
| 97 | POST | `/api/player-stats` |

### Logros (`/api/achievements`):

| # | HTTP | Ruta |
|----|------|------|
| 98 | GET | `/api/achievements` |
| 99 | POST | `/api/achievements` |

### Equipos (`/api/teams`):

| # | HTTP | Ruta |
|----|------|------|
| 100 | GET | `/api/teams` |
| 101 | POST | `/api/teams` |
| 102 | PUT | `/api/teams/:id` |

### Personajes del Usuario (`/api/user-characters`):

| # | HTTP | Ruta |
|----|------|------|
| 103 | GET | `/api/user-characters` |
| 104 | GET | `/api/user-characters/:id` |

### Chat (`/api/chat`):

| # | HTTP | Ruta |
|----|------|------|
| 105 | GET | `/api/chat/messages` |
| 106 | POST | `/api/chat/global` |
| 107 | POST | `/api/chat/party` |

### Configuración Usuario (`/api/user/settings`):

| # | HTTP | Ruta |
|----|------|------|
| 108 | GET | `/api/user/settings` |
| 109 | PUT | `/api/user/settings` |

### Requisitos Nivel (`/api/level-requirements`):

| # | HTTP | Ruta |
|----|------|------|
| 110 | GET | `/api/level-requirements` |

### Ofertas (`/api/offers`):

| # | HTTP | Ruta |
|----|------|------|
| 111 | GET | `/api/offers` |

### Pagos (`/api/payments`):

| # | HTTP | Ruta |
|----|------|------|
| 112 | POST | `/api/payments/webhook` |
| 113 | POST | `/api/payments/initiate-stripe` |
| 114 | POST | `/api/payments/verify-blockchain` |

### Personajes Base (`/api/base-characters`):

| # | HTTP | Ruta |
|----|------|------|
| 115 | GET | `/api/base-characters` |
| 116 | GET | `/api/base-characters/:id` |

---

## 🔌 WEBSOCKET EVENTS

**Conector:** Socket.IO en `/socket.io`  
**Autenticación:** JWT token

### Eventos Disponibles:

```
// Autenticación
auth → Autenticar con token
auth:success → Conexión autenticada
auth:error → Error de autenticación

// Usuario
user:update → Datos del usuario actualizados
user:resources → Recursos modificados
user:notification → Nueva notificación

// Personajes
character:update → Personaje modificado
character:level-up → Personaje subió nivel
character:evolution → Personaje evolucionó

// Marketplace
marketplace:new-listing → Nuevo item en venta
marketplace:listing-sold → Item vendido
marketplace:listing-cancelled → Venta cancelada

// Survival
survival:wave-completed → Onda completada
survival:session-ended → Sesión finalizada

// Chat
chat:message → Nuevo mensaje
chat:user-online → Usuario conectado
chat:user-offline → Usuario desconectado

// Combat
combat:started → Combate iniciado
combat:turn → Turno en combate
combat:ended → Combate finalizado

// Rankings
ranking:updated → Rankings actualizados
leaderboard:updated → Leaderboard actualizado
```

---

## 📈 Estadísticas de Endpoints

| Categoría | Endpoints | % |
|-----------|-----------|-----|
| Públicos | 11 | 8.5% |
| Autenticación | 9 | 7% |
| Usuarios | 12 | 9.3% |
| Personajes | 10 | 7.8% |
| Combate | 4 | 3.1% |
| Survival | 12 | 9.3% |
| Marketplace | 8 | 6.2% |
| Tienda | 4 | 3.1% |
| Rankings | 5 | 3.9% |
| Paquetes | 6 | 4.7% |
| Salud | 3 | 2.3% |
| Otros | 35+ | 27.3% |
| **Total** | **~25+** | **100%** |

---

## 🔒 Autenticación por Categoría

| Tipo | Públicos | Privados | Mixtos | Total |
|------|----------|----------|--------|-------|
| Endpoints | 11 | 60+ | 20+ | 25+ |
| % | 8.5% | 60% | 20% | 100% |

---

## 📝 Notas Importantes

### Rate Limiting Aplicado

```
Auth endpoints:       5 req / 15 min
Gameplay:            100 req / 15 min
Slow gameplay:        Limited (dungeons, evolve)
Marketplace:         50 req / 15 min
General API:        200 req / 15 min
```

### Validaciones Zod

Todos los endpoints validan entrada con schemas Zod. Los errores devuelven:

```json
{
  "error": "Validation Error",
  "details": [...]
}
```

### Manejo de Errores

Respuestas estándar:

```
200 OK              - Éxito
201 Created         - Recurso creado
400 Bad Request     - Validación fallida
401 Unauthorized    - Sin autenticación
403 Forbidden       - Sin permiso
404 Not Found       - Recurso no existe
409 Conflict        - Conflicto (ej: usuario existe)
429 Too Many Requests - Rate limit excedido
500 Internal Error  - Error del servidor
503 Service Unavailable - Base de datos no disponible
```

### Paginación

Endpoints con listas soportan:

```
?page=1
?limit=50
?skip=0
```

---

## 🚀 Próximos Pasos

1. ✅ Generar documentación OpenAPI/Swagger
2. ✅ Crear ejemplos cURL para cada endpoint
3. ✅ Documentar frontend basado en estos 25+ endpoints
4. ✅ Crear guías de integración por módulo
5. ✅ Mejorar tests e2e para cobertura total

---

**Total de endpoints auditados:** ~25+ ✅  
**Documentación:** Completa  
**Status:** Listo para desarrollo frontend  

Generado: 24 de noviembre, 2025
