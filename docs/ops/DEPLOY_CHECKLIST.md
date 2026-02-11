# Checklist de despliegue (staging → production) 🔁

Última actualización: 2026-02-11

Este documento define pasos operativos claros y reproducibles para desplegar en *staging* y promover a *production*. Está pensado para equipos que requieren trazabilidad, backups, validación de migraciones y pruebas E2E antes de hacer el promote final.

---

## Pre-requisitos
- Acceso a la cuenta de deployment (CI/CD, SSH a servidores, etc.).
- Secretos listos: `MONGODB_URI`, `JWT_SECRET`, `SMTP_*`, `PAYMENT_WEBHOOK_SECRET`, `RPC_URL`.
- Acceso a la herramienta `mongodump` y `mongorestore` (para backups/restore).
- `node` >= 18, `npm`, `ts-node` y dependencias instaladas en el entorno que ejecutará la migración.

---

## Paso A — Preparación (antes del deploy)
1. Actualizar `main` con el release branch que se va a promover. Asegúrate que `main` esté en estado green (todos los unit tests pasan). Ejecute:
   - `git checkout main`  
   - `git pull origin main`  
   - `npm ci`  
   - `npm run test:unit`  

2. Verificar E2E en ambiente de integración (local/CI). Ejecuta E2E en un entorno lo más cercano a staging:
   - `npm run test:e2e` o `npx jest tests/e2e --runInBand`  

3. Confirmar la migración es idempotente: ejecutar dry-run local
   - `ts-node scripts/migrate-add-currency.ts --dryRun`
   - Revisar reporte en la consola: `listingsChecked, listingsUpdated, txChecked, txUpdated`.

---

## Paso B — Backups (staging)
> Antes de aplicar migraciones críticas, crear un backup de la base de datos.

1. Backup rápido con mongodump:
   - `mongodump --uri="$MONGODB_URI" --archive=backup-$(date +%Y%m%d-%H%M).gz --gzip`
2. Verificar tamaño del backup y que se haya generado correctamente.

---

## Paso C — Ejecutar migraciones / cambios de esquema
1. Ejecútalo en modo no-dry run en staging (después de backup):
   - `ts-node scripts/migrate-add-currency.ts`
2. Revisar salida y logs. Si algo falla, restaurar desde backup:
   - `mongorestore --uri="$MONGODB_URI" --archive=<backup-file> --gzip --drop`

---

## Paso D — Validación (smoke tests & E2E)
1. Ejecutar unit tests (rápido): `npm run test:unit`.
2. Ejecutar E2E completos: `npm run test:e2e`.
3. Pruebas de humo manuales:
   - GET `/api/health` → 200
   - POST `/auth/login` → login + verify flows
   - POST `/api/shop/buy-val` → inicia checkout (mock ok)
   - POST `/api/items/:id/buy` → compra y revisar `purchase_transactions` y balances
   - POST `/api/user-packages/:id/open` → abrir paquete y validar inventario
4. Revisar logs de error y métricas (Sentry/CloudWatch/Stackdriver) para rangos de error durante la ventana del deploy.

---

## Paso E — Promover a production (política recomendada)
1. Repetir pasos A-C en producción (backup antes de migración).  
2. Si todo valida en staging: desplegar release (tag + release notes).  
3. Monitorear 15-30 minutos por regressions (errores de 5xx o problemas de integraciones).

---

## Rollback
- Si la migración es irreversible, restaurar usando `mongorestore` desde el backup creado antes del Step B.
- Para revertir código: revertir a commit previo en `main` y redeploy.

---

## Notas importantes
- **Webhook**: asegúrate que `PAYMENT_WEBHOOK_SECRET` esté presente y que el proveedor firme los payloads (en staging usar un valor secreto conocido y verificar con Webhook dry-run).  
- **Pruebas idempotencia**: ejecutar pruebas que simulan webhooks duplicados y compras simultáneas después de migración.  
- Mantener comunicación con equipos de producto/ops cuando se realice migración de datos que impacten el marketplace o balances de usuarios.

---

¿Deseas que añada un `workflow` de GitHub Actions para ejecutar los pasos de validación (migración dry-run + unit tests + e2e) mediante `workflow_dispatch` para usar desde la UI de GitHub? Responde "Sí" y lo agrego con variables de ejemplo para staging. 🔧