# ENDPOINTS_STATUS (Snapshot Actualizado)

Última actualización: {{fecha}}

Leyenda:
- ✅ Implementado
- 🟡 Alias / Stub (requiere lógica futura pero usable para frontend)
- 🔴 Pendiente (no existe todavía)

## Pagos / Monetización
- POST /api/payments/checkout ✅
- POST /api/payments/webhook ✅
- POST /api/payments/blockchain/initiate 🟡 (stub; falta lógica en service)
- POST /api/payments/wallet/connect ✅
- GET  /api/payments/history 🟡 (stub vacía)

## Inventario (Alias Normalizado)
- GET /api/inventory ✅
- GET /api/inventory/equipment ✅
- GET /api/inventory/consumables ✅

## Marketplace
- POST /api/marketplace/list ✅
- POST /api/marketplace/buy/:listingId ✅
- POST /api/marketplace/cancel/:listingId ✅
- GET  /api/marketplace/history 🟡 (alias stub)
- GET  /api/marketplace/:listingId ✅
- PATCH /api/marketplace/:listingId/price ✅ (opcional)

## Notificaciones
- GET /api/notifications ✅
- GET /api/notifications/unread/count ✅
- GET /api/notifications/:id ✅ (nuevo)
- PUT /api/notifications/:id/read ✅
- PUT /api/notifications/read-all ✅
- DELETE /api/notifications/:id ✅

## Tienda
- GET /api/shop/info ✅
- GET /api/shop/packages ✅ (alias de /api/packages)
- POST /api/shop/buy-evo ✅
- POST /api/shop/buy-boletos ✅
- POST /api/shop/buy-val ✅
- POST /api/shop/purchase ✅ (genérico multi tipo)

## Feedback & Versión
- GET /api/version ✅
- POST /api/feedback ✅ (memoria; futura persistencia)
- GET  /api/feedback ✅ (debug temporal)

## User Settings Alias
- GET/PUT ... /api/user/settings ✅ (original)
- Alias plural /api/users/settings ✅

## Próximos a Implementar (Pendientes reales)
- Historial real de pagos (persistencia) 🔴 (reemplazar stub)
- Lógica real blockchain initiate 🔴 (integración Web3)
- marketplace/history con datos reales 🔴 (usar service de transacciones)
- Persistencia feedback 🔴 (colección Feedback)
- Emisión de eventos WebSocket adicionales 🔴 (marketplace:item:listado, marketplace:item:vendido, chat:message:new, survival:wave:new, etc.)

## WebSocket (Estado Resumido)
Implementados actuales (según realtime.service): chat:history, chat:error, auth:success, auth:error, marketplace:update, rankings:update, game:event
Pendientes planificados: chat:message:new, marketplace:item:listado, marketplace:item:vendido, survival:wave:new, survival:end, survival:run:update, notifications:new, payments:status, feedback:received

---
Este archivo se actualizará conforme se completen stubs y se añadan los eventos WebSocket.
