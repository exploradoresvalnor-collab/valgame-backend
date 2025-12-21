# Auditoría de Endpoints

## Script v2 (recomendado)
- Archivo: `scripts/audit-endpoints-v2.ts`
- Requisitos: Node 18+, `ts-node` o `tsx` (ejecución directa de TS).

## Ejecutar
```bash
# con tsx (recomendado)
npx tsx scripts/audit-endpoints-v2.ts

# o con ts-node
npx ts-node scripts/audit-endpoints-v2.ts
```

Salida:
- Genera `docs/02_frontend/ENDPOINTS_AUDIT_REPORT.json` con todos los endpoints combinando basePath de `src/app.ts` + rutas de `src/routes/*`.
