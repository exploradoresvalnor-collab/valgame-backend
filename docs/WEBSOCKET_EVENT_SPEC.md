# Especificación de Eventos WebSocket (Valgame Backend)

Esta especificación normaliza los nombres de eventos, payloads y triggers del tiempo real. Se mantiene compatibilidad con eventos legacy donde aplica.

## Convenciones
- Namespace global por defecto (Socket.IO), autenticación vía evento `auth` con JWT → sala `user:<userId>`.
- Timestamps en ISO8601 bajo clave `timestamp`.
- Eventos por usuario se emiten a su sala dedicada; eventos globales se emiten a todos.

## Eventos Implementados

### chat:message:new
- Alcance: global (o por sala si aplica en el futuro)
- Payload:
  - `id?`: string
  - `senderId`: string
  - `senderName?`: string
  - `content`: string
  - `type`: "global" | "party" | "private"
  - `createdAt`: string (ISO)
- Trigger: `RealtimeService.notifyChatMessageNew()`
- Compat: legacy `chat:message` si la capa de chat lo mantiene.

### marketplace:item:listed
- Alcance: global
- Payload: `{ listing, timestamp }`
- Trigger: `RealtimeService.notifyMarketplaceItemListed()`
- Compat: legacy `marketplace:update` con `{ type: 'new', data }`

### marketplace:item:sold
- Alcance: global
- Payload: `{ listingId, buyerId, priceVal, timestamp }`
- Trigger: `RealtimeService.notifyMarketplaceItemSold()`
- Compat: legacy `marketplace:update` con `{ type: 'sold', data }`

### marketplace:item:cancelled
- Alcance: global
- Payload: `{ listingId, reason?, timestamp }`
- Trigger: `RealtimeService.notifyMarketplaceItemCancelled()`
- Compat: legacy `marketplace:update` con `{ type: 'cancelled', data }`

### survival:wave:new
- Alcance: global
- Payload: `{ sessionId, waveNumber, enemiesRemaining, timestamp }`
- Trigger: `RealtimeService.notifySurvivalWaveNew()`

### survival:end
- Alcance: global
- Payload: `{ sessionId, totalWaves, durationMs, rewards, timestamp }`
- Trigger: `RealtimeService.notifySurvivalEnd()`

### character:level-up
- Alcance: por usuario (sala `user:<userId>`)
- Payload: `{ characterId, level, levelsGained, statsDelta: { atk?, defensa?, vida? }, timestamp }`
- Trigger: `RealtimeService.notifyCharacterLevelUp()`
- Emisor actual: `dungeons.controller` al resolver victoria y aplicar `handleLevelUp`.

### character:evolved
- Alcance: por usuario
- Payload: `{ characterId, etapa, timestamp }`
- Trigger: `RealtimeService.notifyCharacterEvolved()`
- Emisor actual: `characters.controller.evolveCharacter` tras actualizar etapa.

### notification:new
- Alcance: por usuario
- Payload: `{ notification, timestamp }`
- Trigger: `RealtimeService.notifyNotificationNew()`
- Emisores actuales:
  - `payment.service.handleWebhook` cuando `status = succeeded` (crea notificación y emite)
  - `characters.controller.evolveCharacter` tras evolución exitosa (crea notificación y emite)

### notification:read
- Alcance: por usuario
- Payload: `{ notificationId, timestamp }`
- Trigger: `RealtimeService.notifyNotificationRead()`
- Emisor actual: `PUT /api/notifications/:id/read` y `PUT /api/notifications/read-all`.

### payments:status
- Alcance: por usuario
- Payload: `{ provider: 'stripe'|'blockchain'|'manual', state: 'initiated'|'pending'|'confirmed'|'failed'|'refunded', meta?, timestamp }`
- Trigger: `RealtimeService.notifyPaymentStatus()`
- Emisores actuales:
  - `POST /api/payments/blockchain/initiate`: state=`initiated` (stub o real)
  - `payment.service.handleWebhook`: state según `status` recibido (confirmed/pending/failed/refunded)

### Otros existentes
- `inventory:update` (por usuario): `notifyInventoryUpdate()`
- `reward:received` (por usuario): `notifyReward()`
- `character:update` (por usuario): `notifyCharacterUpdate()`
- `game:event` (global): `notifyGlobalEvent()`
- `rankings:update` (global): `notifyRankingUpdate()`
- `battle:update` (sala `battle:<id>`): `notifyBattleUpdate()`

## Eventos Pendientes / Próximos
- `character:evolved`: cablear desde endpoint de evolución.
- `achievement:unlocked`: emisión desde servicio de logros.
- `system:announcement`: canalizaciones de anuncios globales.
- `rankings:me:update`: variante por usuario.
- `payments:blockchain:*`: granular si se requiere (apoyarse en `payments:status`).

## Autenticación Socket
- Evento `auth` con JWT → `verifyToken` → agregación a sala `user:<userId>`.
- Fallo → `auth:error` y desconexión.
