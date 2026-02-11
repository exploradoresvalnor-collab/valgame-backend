# Puertos, variables de entorno y uso operativo 🔧

Última actualización: 2026-02-11

## Resumen rápido
Este documento describe los puertos que utiliza la aplicación, las variables de entorno críticas y los pasos básicos para ejecutar, testear y desplegar. Los cambios recientes han sido integrados en `main` (sin ramas activas pendientes por merge).

---

## Puertos principales
- **APP (HTTP)**: Default **8080**. Puedes cambiarlo con la variable de entorno `PORT`.
  - Lectura en el código: `const PORT = Number(process.env.PORT || 8080);` (archivo: `src/app.ts`).
- **SMTP**: Variable `SMTP_PORT`. Default recomendado **587** (STARTTLS). Usada por el transportador de nodemailer (`src/config/mailer.ts`).
- **MongoDB**: No es un puerto de la app, pero la URI `MONGODB_URI` debe apuntar al servicio Mongo (ej. `mongodb://host:27017/dbname`).

---

## Variables de entorno críticas
- `MONGODB_URI` — Cadena de conexión a MongoDB (requerida en dev/prod).
- `PORT` — Puerto donde escucha la API (default 8080).
- `JWT_SECRET` — Clave para firmar JWTs (requerida).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Config para envío de correos.
- `PAYMENT_WEBHOOK_SECRET` — Secreto HMAC para verificar webhooks del proveedor de pagos. Si no está configurado, el webhook acepta (dev mode).
- `PAYMENT_PROVIDER` — Nombre del proveedor (opcional; por defecto `mock`).
- `RPC_URL` — Endpoint RPC para integraciones on-chain (si aplica).

Notas adicionales:
- Webhook: la ruta `POST /api/payments/webhook` requiere el `raw` body para poder verificar la firma (se monta con `express.raw({ type: 'application/json' })` antes de `express.json()`). No añadas middlewares que parseen JSON antes de esa ruta.

---

## Comandos útiles (desarrollo)
- `npm run dev` — Iniciar servidor en modo desarrollo (auto reload). (Revisa `package.json` para scripts específicos.)
- `npm run seed` — Seed de datos (items, paquetes, personajes).
- `npm run test:unit` — Ejecutar suite de tests unitarios (recomendado antes de push).
- `npm run test:e2e` — Ejecutar tests E2E (requiere entorno y seeds correctas).

---

## Scripts y migraciones
- `scripts/migrate-add-currency.ts` — Script idempotente para añadir el campo `currency` a `Listing` y `MarketplaceTransaction`. Ejecutarlo con ts-node en staging/producción:
  - Dry run: `ts-node scripts/migrate-add-currency.ts --dryRun`
  - Ejecutar: `ts-node scripts/migrate-add-currency.ts`
- `scripts/db-checks.js` — Utilidad para inspección rápida de colecciones y datos.

---

## Notas de seguridad/operación
- Asegúrate de almacenar `PAYMENT_WEBHOOK_SECRET`, `JWT_SECRET` y `SMTP_*` en un vault o secretos de CI/CD. Nunca los subas a repositorio.
- Habilitar verificación de firmar el webhook en staging/producción estable para evitar reconciliaciones falsas.

---

## Política de ramas y workflow (actual)
Según lo solicitado, todos los cambios ya integrados están en `main` y **puedes trabajar directamente en `main`** si esa es la política del equipo. Recomendación profesional: mantener PRs y ramas por feature para revisión y trazabilidad, pero respetaré la indicación de trabajar sobre `main` si así lo prefieres.

---

Si quieres, agrego un checklist de despliegue (staging → validate tests → run migrations → promote to production) y un ejemplo de `docker-compose` con puertos expuestos. ¿Lo incluyo ahora?