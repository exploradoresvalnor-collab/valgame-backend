# Marketplace — Historial implementado & próximos pasos 🔧

> Resumen corto: Implementamos el endpoint de historial paginado del marketplace, eliminamos una montura duplicada que generaba rutas redundantes y añadimos tests (unit + e2e mínimo). A continuación documentamos cómo funciona actualmente el marketplace, la moneda utilizada, los errores detectados y el plan de trabajo para completar soporte multi-moneda y pagos.

---

## 1) Qué hicimos (hechos ✅)

- **Reemplazo del stub de historial**
  - Endpoint: `GET /api/marketplace/history?page=0&limit=20` ahora devuelve:
    ```json
    { "success": true, "data": [...], "pagination": { "page", "limit", "total", "hasMore" } }
    ```
  - Implementación: consulta `MarketplaceTransaction` filtrada por usuario (`sellerId` OR `buyerId`) con paginación (page & limit).
  - Tests: añadí E2E que cubre flow list → buy → history (`tests/e2e/marketplace.history.e2e.test.ts`).

- **Eliminación de montura duplicada**
  - Se quitó la montura accidental `app.use('/api', marketplaceControlRoutes)` que generaba rutas `/api/marketplace/marketplace/*`.

- **Normalización de rutas del Marketplace**
  - Rutas ahora relativas y consistentes, montadas en `/api/marketplace` desde `app.ts`:
    - `POST /api/marketplace/listings`
    - `POST /api/marketplace/listings/:listingId/buy`
    - `POST /api/marketplace/listings/:listingId/cancel`
    - `GET  /api/marketplace/history`
  - Los controladores delegan en `marketplace.service` para garantizar transacciones atómicas y auditoría en `MarketplaceTransaction`.

- **Tests añadidos**
  - Unit: `tests/unit/marketplace.routes.test.ts` (verifica no-exposición de rutas duplicadas y existencia de `/api/marketplace/history`).
  - E2E: `tests/e2e/marketplace.history.e2e.test.ts` (list → buy → history paginado).

---

## 2) Estado actual del Marketplace — moneda y flujo 💱

- **Moneda en uso (actual):**
  - El **Marketplace opera con VAL** como moneda por defecto (balances `User.val`).
  - Las tarifas/commissions actuales: **5% de impuesto** en cada venta (aplicado en `marketplace.service`).

- **Boletos ("boletos")**
  - **Regla confirmada:** 1 boleto = 100 VAL (decisión de negocio – aplicada a los tests y a la documentación).
  - `buyBoletos` actual permite comprar boletos con VAL en el endpoint `POST /api/shop/buy-boletos`.

- **Registro de transacciones:**
  - Todas las acciones (`listed`, `sold`, `cancelled`, `expired`) se graban en `MarketplaceTransaction` para auditoría.
  - Actualmente no se almacena un campo `currency` en `Listing` ni `MarketplaceTransaction` (por defecto VAL).

---

## 3) Problemas detectados y priorización (lo que sale mal) ⚠️

1. **Falta `currency` en modelos (ALTA)**
   - Problema: No hay `currency` en `Listing` ni `MarketplaceTransaction`, lo que impide soportar oficialmente listados o transacciones en **Boletos**. Actualmente Marketplace asume VAL.
   - Riesgo: futuras confusiones si listados deben permitirse en boletos o si se permite pago en otra moneda.

2. **Inconsistencia en `getShopInfo()` sobre boletos (MEDIA)**
   - Antes: `getShopInfo()` mostraba `boletosPerVal: 100` (lo que sugiere 1 VAL → 100 boletos).
   - Implementación real en `buyBoletos()` usa `COST_PER_BOLETO = 100` (100 VAL → 1 boleto). **Decisión actual:** 1 boleto = 100 VAL → actualizar `getShopInfo()` para mostrar `costPerBoleto: 100 VAL` o usar `GameSetting.costo_ticket_en_val`.

3. **`POST /api/shop/buy-val` no implementado (MEDIA)**
   - Checkout/flow existe parcialmente en `payment.service` (webhook) pero falta endpoint para iniciar checkout y asociarlo a usuario.

4. **Warnings en tests por `RealtimeService` no inicializado (BAJA)**
   - No crítico pero hay logs repetidos en tests; podemos mockear el service en tests o suprimir logs en test env.

5. **Pruebas faltantes importantes**
   - Race condition: dos compradores simultáneos comprando el mismo listing.
   - Tests E2E para compra con dinero real (simulación webhook) y para compra de boletos/listings con currency si se añade.

---

## 4) Plan de trabajo y próximos pasos (con prioridades) 🛠️

### Fase A — Correcciones rápidas (hoy — 1 día)
- [x] **Actualizar `getShopInfo()`** para exponer valores coherentes y usar `GameSetting.costo_ticket_en_val` (ya aplicado).
  - Mostrar: `costPerBoleto: <valor>` y `boletosPerVal: <valor>` calculado automáticamente.
- [x] **Documentar** (este archivo ya queda en repo) la regla: **1 boleto = 100 VAL**.
- [ ] **Mock RealtimeService en tests** o suprimir warnings en NODE_ENV=test.
- [x] **Alinear `buyBoletos()` con `GameSetting.costo_ticket_en_val`**: ahora `buyBoletos` usa `costo_ticket_en_val` (se actualizó el seed a 100 para tests).

### Fase B — Soporte multi-moneda y DB (alta prioridad — 2 días)
- [ ] **Modelo:** añadir `currency` a `Listing` (default: 'VAL') y a `MarketplaceTransaction` (default: 'VAL').
  - Recomendación: usar enum `['VAL','BOLETOS']` y permitir future expansion (eg. 'USD', 'EVO').
- [ ] **Servicios:** actualizar validaciones en `marketplace.service` para validar saldos en la moneda del listing.
  - Cuando `currency === 'BOLETOS'` utilizar `user.boletos` en lugar de `user.val`.
  - Añadir validación defensiva: rechazo si `currency` no soportada.

#### Plan de migración (detallado)
- Objetivo: backfill idempotente que añade `currency: 'VAL'` a todos los documentos `Listing` y `MarketplaceTransaction` que no lo tengan.
- Script creado: `scripts/migrate-add-currency.ts` (TypeScript, ejecutable con ts-node).
- Comportamiento del script:
  - Detecta documentos sin `currency` y actualiza en batches (configurable via `--batchSize`).
  - Soporta `--dryRun` para simular y `--batchSize` para controlar el tamaño.
  - Loguea conteos: `updated`, `skipped`, `errors`.
  - Re-ejecutable (idempotente).

Ejemplo de uso:
```bash
# simular los cambios sin escribir (recomendado inicialmente)
npx ts-node -r dotenv/config scripts/migrate-add-currency.ts --dryRun --batchSize=500

# ejecución real (ejecutar en ventana de mantenimiento)
npx ts-node -r dotenv/config scripts/migrate-add-currency.ts --batchSize=1000
# o vía script npm: npm run migrate:add-currency -- --batchSize=1000
```

- Copia de seguridad y rollback:
  - Antes de correr, crear snapshot/export de las colecciones `listings` y `marketplaceTransactions`.
  - Rollback: restaurar desde snapshot si hay errores críticos.

- Tests y CI:
  - Añadir `tests/unit/migrations/add-currency.test.ts` que arranca MongoMemory, inserta docs sin `currency`, ejecuta el migrador y verifica que todos tienen `currency: 'VAL'`.
  - Incorporar test de integración que simule un run `--dryRun` y un run real.

- Índices y performance:
  - Evaluar añadir índice compuesto si consultas frecuentes filtran por `currency` (eg. `{ currency: 1, estado: 1 }`).

- [ ] **Backfill/Migration:** actualizar registros existentes (default a VAL) y añadir índice si es necesario.
- [ ] **Tests unitarios:** cubrir list & buy en VAL y BOLETOS.

### Fase C — Shop & pagos con dinero real (medio plazo — 3 días)
- [ ] **Implementar `POST /api/shop/buy-val`**: crea checkout (createCheckout) y devuelve `externalPaymentId`/checkoutUrl.
- [ ] **Webhook:** asegurarse de idempotencia & asignación de paquete + acreditación VAL (ya parcialmente implementado).
- [ ] **E2E:** simular webhook (status succeeded) y verificar acreditación de VAL y creación de `Purchase`.

### Fase D — Robustez y Docs (final)
- [ ] Race condition tests E2E
- [ ] Actualizar docs frontend (`docs/02_frontend`) y endpoints quick reference.
- [ ] PRs separados y revisables (model changes, service changes, shop/checkout changes).

---

## 5) Criterios de aceptación (QA)
- `GET /api/marketplace/history?page=0&limit=20` devuelve transacciones reales + pagination para usuarios autenticados. ✅
- `POST /api/shop/buy-boletos` compra boletos con **costPerBoleto = 100 VAL** y actualiza `user.val` y `user.boletos`. ✅
- `Listing.currency` y `MarketplaceTransaction.currency` existen y las rutas/listas respetan la moneda indicada. ✅
- `POST /api/shop/buy-val` inicia un checkout y `handleWebhook` completa la acreditación en `succeeded` (simulación E2E). ✅
- Tests: unitarios + integración/E2E pasan en CI. ✅

---

## 6) Notas de implementación (snippets y sugerencias) 💡
- Sugerencia para corregir `getShopInfo()` (usar `GameSetting.costo_ticket_en_val`):
```ts
// reemplazar la sección de boletos por:
const costPerBoleto = gameSettings?.costo_ticket_en_val || 100;
res.json({
  exchangeRates: {
    costPerBoleto, // valor en VAL
    valPerBoleto: 1 / costPerBoleto
  },
  ...
});
```

- Para añadir `currency` al `Listing` y `MarketplaceTransaction`, seguir el patrón ya usado (enum y default 'VAL').

---

## 8) Integración Frontend — Qué cambia y cómo adaptarse 🧭
A continuación se describen los cambios que debe conocer el frontend para soportar el nuevo campo `currency`, la migración y las banderas de compatibilidad.

### Cambios clave que afectan al frontend
- **Nuevos campos en respuestas API**:
  - `Listing` ahora incluye `currency: 'VAL' | 'BOLETOS'`.
  - `MarketplaceTransaction` ahora incluye `currency: 'VAL' | 'BOLETOS'`.
- **Comportamiento por defecto**: todos los registros existentes se backfillearán con `currency: 'VAL'` mediante la migración; el frontend debe tolerar temporalmente la ausencia del campo y asumir `VAL` si no existe.
- **Visibilidad pública**: `GET /api/shop/info` es público y devuelve `costPerBoleto` (en VAL) para mostrar en la UI de la tienda.

### Recomendaciones para el Frontend (checklist)
1. Mostrar `currency` en las tarjetas/listas del Marketplace (ej. etiqueta o icono: `VAL` o `🎫 Boletos`).
2. Al crear un listing (formulario de venta), añadir selector de moneda (`currency`) con **valor por defecto `VAL`** y validación por el lado cliente (solo permitir monedas soportadas).
3. Filtros del marketplace: añadir filtro `currency` para que usuarios puedan buscar por `VAL` o `BOLETOS`.
4. Cartera/Balance: mostrar saldos separados (ej. `VAL` y `Boletos`) y usar el saldo correcto según `currency` del listing. Ejemplo: si `currency === 'BOLETOS'` el botón de compra debe chequear `user.boletos` en vez de `user.val`.
5. Historial de transacciones: mostrar `currency` y el monto en la moneda indicada (ej. `100 VAL`, `2 BOLETOS`).
6. Pago de boletos (shop): usar `costPerBoleto` de `GET /api/shop/info` para calcular precios en UI y en validaciones locales.
7. Rollout: primero desplegar backend + ejecutar migración en staging; luego desplegar frontend con soporte para `currency` y finalmente ejecutar migración en producción.

### Ejemplos de respuesta (ejemplos para integrar)
- Listing (GET /api/marketplace/listings):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "itemId": "it_123",
  "precio": 200,
  "currency": "VAL",
  "estado": "activo",
  "metadata": { "nombre": "Espada de Prueba" }
}
```

- Transacción (GET /api/marketplace/history):
```json
{
  "listingId": "507f1f77bcf86cd799439011",
  "sellerId": "60f7e6a9f9b3a8a1e4c3a111",
  "buyerId": "60f7e6a9f9b3a8a1e4c3a222",
  "precioOriginal": 200,
  "precioFinal": 190,
  "impuesto": 10,
  "currency": "VAL",
  "action": "sold",
  "timestamp": "2026-02-11T12:34:56.789Z"
}
```

### Pruebas E2E y QA (sugeridas para frontend)
- Testar listado y filtrado por `currency` (VAL/BOLETOS).
- Comprar listing en VAL (activar flujo normal). Verificar descontado `user.val` y registro en history con `currency: 'VAL'`.
- Comprar listing en BOLETOS (cuando se habilite). Verificar descontado `user.boletos` y registro con `currency: 'BOLETOS'`.
- Verificar fallback: si `currency` no existe (antes del rollout), frontend asume `VAL` y muestra advertencia en consola para capturar casos antiguos.

### Rollout y coordinación
- Orden recomendado:
  1. Desplegar backend con cambios en modelos, endpoints y migración script (en modo `--dryRun` primero). 🧪
  2. Desplegar frontend compatible con `currency` y filtros. 🔁
  3. Ejecutar migración real en DB (ventana de mantenimiento corta) y monitorear errores. ⚠️
  4. Ejecutar pruebas E2E completas y abrir PRs de hotfix si fallan.

---

## 7) Comandos útiles
- Ejecutar unit tests: `npm run test -- tests/unit --runInBand --detectOpenHandles`
- Ejecutar E2E marketplace: `npx jest tests/e2e/marketplace.history.e2e.test.ts --runInBand`
- Linter/Build/Typecheck: `npm run lint`, `npm run build`, `npx tsc -p tsconfig.json --noEmit`

---

> Si quieres, empiezo con las correcciones **rápidas** ahora (actualizar `getShopInfo` y documentar `costPerBoleto=100 VAL`) y luego implemento la **Fase B** (añadir `currency` en modelos). ¿Confirmas que empiece con eso? ✅

---

**Archivo generado:** `docs/marketplace/HISTORY_AND_NEXT_STEPS.md` (puedes revisarlo y sugerir cambios).

<!-- Fin del documento -->