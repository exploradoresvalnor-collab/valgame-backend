#!/usr/bin/env bash
set -euo pipefail

# Script simple para ejecutar migración y pruebas en staging.
# Uso: ./scripts/staging-deploy.sh --dry-run

DRY_RUN=0
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
  esac
done

MONGO_URI=${MONGODB_URI:-}
if [ -z "$MONGO_URI" ]; then
  echo "ERROR: MONGODB_URI no está configurada. Exporta MONGODB_URI antes de ejecutar."
  exit 1
fi

echo "[STAGING-DEPLOY] Backup DB (mongodump)..."
BACKUP_FILE="backup-$(date +%Y%m%d-%H%M).gz"
if command -v mongodump >/dev/null 2>&1; then
  mongodump --uri="$MONGO_URI" --archive="$BACKUP_FILE" --gzip
  echo "Backup creado: $BACKUP_FILE"
else
  echo "mongodump no disponible. Saltando backup. Asegúrate de tener backups manuales."
fi

if [ $DRY_RUN -eq 1 ]; then
  echo "[STAGING-DEPLOY] Ejecutando migración en dry-run"
  npx ts-node scripts/migrate-add-currency.ts --dryRun
  echo "[STAGING-DEPLOY] Dry-run completado. Revisa la salida y confirma antes de ejecutar sin --dry-run."
  exit 0
fi

# Ejecutar migración real
echo "[STAGING-DEPLOY] Ejecutando migración..."
npx ts-node scripts/migrate-add-currency.ts

echo "[STAGING-DEPLOY] Ejecutando tests unitarios..."
npm run test:unit --silent || { echo 'Unit tests fallaron'; exit 1; }

# Ejecutar E2E (puede tardar)
echo "[STAGING-DEPLOY] Ejecutando E2E (puede tardar)..."
npm run test:e2e || { echo 'E2E tests fallaron'; exit 1; }

echo "[STAGING-DEPLOY] Validaciones locales completadas. Si todo OK, procede a deploy en staging/prod con monitoreo."

# Nota: rollback con mongorestore: mongorestore --uri="$MONGO_URI" --archive=<backup-file> --gzip --drop

exit 0
