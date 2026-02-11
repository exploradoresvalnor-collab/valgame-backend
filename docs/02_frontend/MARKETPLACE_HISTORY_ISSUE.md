# ISSUE: Historial de Marketplace (stub) y rutas duplicadas

## Resumen

- Problema principal: el endpoint de historial del marketplace (`/api/marketplace/history`) está implementado como **stub** en `src/routes/marketplace.routes.ts` y devuelve `{ success: true, stub: true, data: [] }` en lugar de devolver el historial real y paginado del usuario.
- Además: existe una **duplicidad de montaje** en `src/app.ts` que provoca rutas redundantes como `/api/marketplace/marketplace/history` y confunde la auditoría y el mantenimiento.

---

## Ubicación (archivos relevantes)

- Backend: `gui a de ejempli/valgame-backend`
  - `src/routes/marketplace.routes.ts` (handler stub: `router.get('/marketplace/history', ...)`)
  - `src/app.ts` (montado doble: `app.use('/api/marketplace', marketplaceRoutes)` y `app.use('/api', marketplaceControlRoutes)`)
  - Auditoría: `docs/02_frontend/ENDPOINTS_AUDIT_REPORT.json` (resultado del script `scripts/audit-endpoints-v2.ts`)
- Frontend: `src/services/marketplace.service.ts` usa `GET /api/marketplace/history`

---

## Reproducción (rápida)

1. Levantar backend (o ejecutar tests E2E/local):
   - `cd "gui a de ejempli/valgame-backend"`
   - `npm run dev` (u `npm start` si ya build)
2. Hacer petición (autenticada) a:
   - `GET /api/marketplace/history?page=0&limit=20`
3. Resultado actual:
   - `{ success: true, stub: true, data: [] }` (no devuelve historial real)

---

## Impacto

- El frontend espera historial paginado (historial personal de ventas/compras). Con el stub, la UX y funciones relacionadas no muestran datos.
- La duplicidad de rutas puede provocar respuestas inconsistentes y dificulta la auditoría y el mantenimiento.

---

## Solución propuesta (pasos concretos)

1. **Unificar monturas y rutas** (bajo `src/app.ts`):
   - Eliminar/evitar la montura duplicada `app.use('/api', marketplaceControlRoutes)` si apunta al mismo router.
   - Mantener `app.use('/api/marketplace', marketplaceRoutes)` como única montura para las rutas del marketplace.
2. **Normalizar rutas internas del router** (en `src/routes/marketplace.routes.ts`):
   - Cambiar rutas desde `/marketplace/...` a rutas relativas cortas como `/list`, `/buy/:id`, `/history`, `/cancel/:id`, etc.
   - Esto evita que, tras montar en `/api/marketplace`, se formen rutas con duplicidades (`/api/marketplace/marketplace/...`).
   - Nota: cambiará rutas efectivas; actualizar frontend si hace falta. Alternativa mínima: no cambiar rutas internas y asegurarse de que solo exista una montura.
3. **Implementar historial real** (reemplazar el stub por llamada al servicio):
   - Si existe `marketplaceTransactions.service` o similar, usarlo para obtener `my-history` filtrado por `req.userId` y con paginación (page, limit).
   - Ejemplo de handler:

```ts
// (en marketplace.routes.ts)
router.get('/history', auth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
    const page = Math.max(0, Number(req.query.page ?? 0));
    const limit = Math.min(100, Number(req.query.limit ?? 50));
    const transactionsService = require('../services/marketplaceTransactions.service').default;
    const result = await transactionsService.getMyHistory(req.userId, { page, limit });
    return res.json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) {
    console.error('Error getting marketplace history:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});
```

4. **Agregar tests**:
   - Unit/integration test que verifique `GET /api/marketplace/history` devuelve `200` y `pagination` con datos para un usuario autenticado.
   - Test E2E que crea listings y transacciones y luego verifica que aparecen en el historial.
5. **Actualizar documentación y auditoría**:
   - Ejecutar `npm run audit:endpoints` y verificar que `ENDPOINTS_AUDIT_REPORT.json` muestra `GET /api/marketplace/history` (sin duplicados).

---

## Criterios de aceptación

- `GET /api/marketplace/history?page=0&limit=20` devuelve `{ success: true, data: [...], pagination: { page, limit, total, hasMore } }` para usuarios autenticados.
- No existen rutas redundantes `/api/marketplace/marketplace/...` cuando el servidor está en producción.
- Tests unitarios y E2E añadidos pasan en CI (`npm test` / `npm run test:e2e`).

---

## Notas y riesgos

- Cambiar rutas internas (por ejemplo, de `/marketplace/history` a `/history`) es recomendado para claridad pero requiere actualizar frontend en paralelo. Si no quieres tocar el frontend ahora, elimina la montura duplicada en `app.ts` y/o deja las rutas como están y solo implementa el historial.
- Revisa permisos: el historial debe devolver solo datos del usuario (no datos de terceros), salvo que se pida explícitamente historial global (diferenciar endpoints).

---

## Pasos rápidos (comandos sugeridos)

- Ejecutar tests: `npm run test:e2e` / `npm run test:unit` (en `gui a de ejempli/valgame-backend`)
- Ejecutar auditoría: `npm run audit:endpoints`
- Crear branch: `git checkout -b fix/marketplace-history`
- Hacer PR con: `Implement marketplace history + remove duplicate mount` + tests

---

Si quieres, puedo ahora:
- crear el **issue** en el repo con este MD; o
- abrir un **PR** mínimo que implemente la ruta `/history` y modifique `app.ts` para quitar la duplicidad (incluir tests básicos).

Dime qué prefieres y lo hago.