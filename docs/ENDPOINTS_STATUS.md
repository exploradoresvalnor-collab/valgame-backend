# Matriz de Estado de Endpoints (Valgame Backend)

Estado consolidado para integración de frontend. Alias/stubs marcados, con foco en cubrir funcionalidades críticas mientras se completa la lógica definitiva.

Leyenda:
- Implementado: ✅
- Alias/Stub (temporal): 🟨
- Pendiente: ⛔

## Núcleo Juego
- `/api/dungeons/:id/start` (combate): ✅
- `/api/survival/*` (oleadas, exchange): ✅ (verificar rutas precisas según repo)
- `character level-up` (combate y addExperience): ✅ (emisión `character:level-up`)
- `character evolve` endpoint: ✅ (emite `character:evolved` + legacy update)

## Inventario
- `GET /api/inventory` (root): 🟨 alias
- `GET /api/inventory/equipment`: 🟨 alias
- `GET /api/inventory/consumables`: 🟨 alias

## Marketplace
- `GET /api/marketplace/history`: 🟨 alias
- `GET /api/marketplace/:id`: 🟨 alias
- `PATCH /api/marketplace/:id/price`: 🟨 (si existe)
- Eventos WS: `marketplace:item:listed|sold|cancelled`: ✅
- Compat WS legacy: `marketplace:update`: ✅

## Notificaciones
- `GET /api/notifications/:id`: 🟨 alias
- Eventos WS: `notification:new` (pendiente de fuentes de creación), `notification:read` ✅ (cableado en rutas)

## Tienda / Compras
- `GET /api/shop/packages`: 🟨 alias
- `POST /api/shop/purchase`: 🟨 alias agregador
- Blockchain: `POST /api/payments/blockchain/initiate`: 🟨 stub (emite `payments:status=initiated`)
- Wallet connect: `POST /api/payments/wallet/connect`: 🟨 stub
- Historial pagos: `GET /api/payments/history`: 🟨 stub
- Evento WS: `payments:status`: ✅ (cableado en initiate + webhook)

## Usuario
- `GET/POST /api/users/settings` (plural alias): 🟨 alias

## Miscelánea
- `POST /api/feedback`: 🟨 stub (persistencia por definir)
- `GET /api/version`: ✅

## Real-time (Socket)
- Autenticación `auth`: ✅
- Salas: `user:<userId>`: ✅
- Especificación: `docs/WEBSOCKET_EVENT_SPEC.md`: ✅

## Pendientes Críticos para Frontend
1. Cablear `character:evolved` desde endpoint de evolución.
2. Cablear notificaciones (new/read) en sus controladores.
3. Cablear `payments:status` en flujos de pago (stripe/web3).
4. Confirmar y documentar rutas exactas de survival y exchange si varían.

Notas: Esta matriz se actualizará conforme se sustituyan alias/stubs por implementaciones definitivas.
