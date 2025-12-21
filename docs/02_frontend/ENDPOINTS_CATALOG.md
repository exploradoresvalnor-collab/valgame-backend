# Catálogo de Endpoints (v2)

Este catálogo lista todos los endpoints HTTP expuestos por el backend (135 rutas), agrupados por módulo. Incluye método, path base y notas de auth. Usa `API_URL` como base (por defecto `http://localhost:8080/api`).

- Autenticación: enviar JWT en `Authorization: Bearer <token>` salvo que se indique `public`.
- Rate limiting: revisar `ERRORS_AND_LIMITS.md`.
- Respuestas de error: `ERRORS_AND_LIMITS.md`.

## Índice
- Auth
- Users
- User Settings
- User Characters
- Achievements
- Items / Equipment / Consumables / Inventory
- Characters (acciones sobre personaje)
- Dungeons / Combat / Survival
- Rankings / Player Stats
- Marketplace / Transactions / Offers / Packages / Shop
- Payments
- Teams
- User Packages
- Marketplace Transactions
- Notifications
- Feedback
- Level Requirements
- Game Settings / Base Characters / Categories / Events
- Health / Version

---

## Auth
- POST `/auth/register` (public)
- GET `/auth/verify/:token` (public)
- POST `/auth/login` (public)
- POST `/auth/logout` (auth)
- POST `/auth/resend-verification` (public)
- POST `/auth/forgot-password` (public)
- GET `/auth/reset-form/:token` (public)
- GET `/auth/reset-password/validate/:token` (public)
- POST `/auth/reset-password/:token` (public)
- GET `/auth/test` (public, dev)

## Users
- GET `/users` (auth)
- GET `/users/profile/:userId` (public)
- GET `/users/me` (auth)
- GET `/users/resources` (auth)
- GET `/users/dashboard` (auth)
- PUT `/users/tutorial/complete` (auth)
- POST `/users/characters/add` (auth)
- PUT `/users/set-active-character/:personajeId` (auth)
- GET `/users/debug/my-data` (auth)
- DELETE `/users/characters/:personajeId` (auth)
- POST `/users/energy/consume` (auth)
- GET `/users/energy/status` (auth)

## User Settings
- GET `/user-settings` (auth)
- PUT `/user-settings` (auth)
- POST `/user-settings/reset` (auth)

## User Characters (detalle del usuario)
- GET `/user-characters` (auth)
- GET `/user-characters/:id` (auth)

## Achievements
- GET `/achievements` (public)
- GET `/achievements/:userId` (public)
- POST `/achievements/:userId/unlock` (auth)

## Items / Equipment / Consumables / Inventory
- GET `/items` (public)
- GET `/equipment` (public)
- GET `/consumables` (public)
- GET `/inventory` (auth)
- GET `/inventory/equipment` (auth)
- GET `/inventory/consumables` (auth)

## Characters (acciones sobre personaje)
- POST `/characters/:characterId/use-consumable` (auth)
- POST `/characters/:characterId/revive` (auth)
- POST `/characters/:characterId/damage` (auth)
- POST `/characters/:characterId/heal` (auth)
- POST `/characters/:characterId/evolve` (auth)
- POST `/characters/:characterId/add-experience` (auth)
- POST `/characters/:characterId/equip` (auth)
- POST `/characters/:characterId/unequip` (auth)
- GET `/characters/:characterId/stats` (auth)
- PUT `/characters/:characterId/level-up` (auth)

## Dungeons
- GET `/dungeons` (public)
- GET `/dungeons/:id` (public)
- POST `/dungeons/:dungeonId/start` (auth)
- GET `/dungeons/:dungeonId/progress` (auth)

## Combat
- POST `/combat/dungeons/:dungeonId/start` (auth)
- POST `/combat/attack` (auth)
- POST `/combat/defend` (auth)
- POST `/combat/end` (auth)

## Survival (sesiones roguelite)
- POST `/survival/start` (auth)
- POST `/survival/:sessionId/complete-wave` (auth)
- POST `/survival/:sessionId/use-consumable` (auth)
- POST `/survival/:sessionId/pickup-drop` (auth)
- POST `/survival/:sessionId/end` (auth)
- POST `/survival/:sessionId/death` (auth)
- POST `/survival/exchange-points/exp` (auth)
- POST `/survival/exchange-points/val` (auth)
- POST `/survival/exchange-points/guaranteed-item` (auth)
- GET `/survival/leaderboard` (auth)
- GET `/survival/my-stats` (auth)
- POST `/survival/:sessionId/abandon` (auth)

## Rankings / Player Stats
- GET `/rankings` (public)
- GET `/rankings/leaderboard/:category` (public)
- GET `/rankings/period/:periodo` (public)
- GET `/rankings/stats` (public)
- GET `/rankings/me` (auth)
- POST `/player-stats` (public)
- GET `/player-stats/usuario/:userId` (public)
- GET `/player-stats/personaje/:personajeId` (public)

## Energy System
**Nota**: No hay endpoints dedicados `/api/energy/*`. La energía se consulta como parte del perfil de usuario.

- GET `/api/users/profile/:userId` → Incluye en la respuesta:
  - `energia` (número actual)
  - `energiaMaxima` (capacidad total)
  - `tiempoParaSiguienteRegeneracionEnergia` (timestamp ISO)

## Marketplace
- POST `/marketplace/list` (auth)
- POST `/marketplace/buy/:listingId` (auth)
- POST `/marketplace/cancel/:listingId` (auth)
- GET `/marketplace/history` (auth)
- GET `/marketplace/:listingId` (public)
- PATCH `/marketplace/:listingId/price` (auth)

## Marketplace Transactions (alias analíticos)
- GET `/marketplace-transactions/my-history` (auth)
- GET `/marketplace-transactions/my-sales` (auth)
- GET `/marketplace-transactions/my-purchases` (auth)
- GET `/marketplace-transactions/stats` (auth)
- GET `/marketplace-transactions/:listingId` (auth)

## Offers / Packages / Shop
- GET `/offers` (public)
- GET `/packages` (public)
- GET `/shop/info` (public)
- GET `/shop/packages` (public)
- POST `/shop/buy-evo` (auth)
- POST `/shop/buy-boletos` (auth)
- POST `/shop/buy-val` (auth)
- POST `/shop/purchase` (auth)
- POST `/user-packages/agregar` (auth)
- POST `/user-packages/quitar` (auth)
- GET `/user-packages/:userId` (auth)
- POST `/user-packages/por-correo` (auth)
- POST `/user-packages/:id/open` (auth)
- POST `/user-packages/open` (auth)

## Payments
- POST `/payments/checkout` (public)
- POST `/payments/webhook` (public, Stripe/webhook)
- POST `/payments/blockchain/initiate` (auth)
- POST `/payments/wallet/connect` (auth)
- GET `/payments/history` (auth)

---

## Notas
- Campos y validaciones: ver los esquemas Zod/Typescript en `src/validations` y modelos en `src/models`.
- Realtime: ver `WEBSOCKET_LISTENERS_GUIDE.md` para eventos y payloads.
- Errores: ver `ERRORS_AND_LIMITS.md`.
- Este catálogo se genera a partir de los archivos de rutas y puede cambiar; mantener sincronía en PRs.
	- `POST /user-packages/open`: abre el paquete pendiente más antiguo del usuario de forma atómica (lock), alternativa a `POST /user-packages/:id/open` cuando no se especifica id.

### Alias de compatibilidad (Dungeons y Rankings)

- Dungeons:
	- POST `/api/dungeons/enter/:dungeonId` — Alias de `POST /api/dungeons/:dungeonId/start` (auth)
	- GET `/api/dungeons/:dungeonId/session/:sessionId` — Alias de `GET /api/dungeons/:dungeonId/progress` (auth)
- Rankings:
	- GET `/api/rankings/period/:period` — Alias de `GET /api/rankings/period/:periodo`
