# Plan de Orden y Limpieza del Proyecto

Objetivo: ordenar estructura, reducir duplicados, y documentar puntos de entrada claros sin romper flujos actuales.

## Fase 1 (aplicada hoy)
- [x] Índice unificado Front: `docs/02_frontend/README.md` y `DOCUMENTACION_FRONTEND.md` actualizado.
- [x] Checklist de integración: `docs/02_frontend/CHECKLIST_INTEGRACION.md`.
- [x] Alias de compatibilidad (Dungeons/Rankings) + eventos WS mínimos documentados.

## Fase 2 (propuesta)
- [ ] Unificar carpetas duplicadas en `docs/`:
  - `03_seguridad` y `03_systems/03_seguridad` → mantener `03_seguridad` (ES) o `03_security` (EN), acordar idioma.
  - `04_deployment` y `05_deployment` → consolidar en `04_deployment` y redirigir referencias.
  - `02_sistemas` vs `03_systems` → decidir convención (`sistemas` vs `systems`).
- [ ] Crear `docs/02_frontend/WEBSOCKET.md` con guía completa (auth, reconexión, patrones, anti‑flicker).
- [ ] Generar índice de endpoints desde código (mejorar `scripts/audit-endpoints.ts` resolviendo basePath) y publicar reporte en `docs/02_frontend/ENDPOINTS_AUDIT_REPORT.json`.
- [ ] Limpieza de raíz (MD/TXT sueltos): usar `scripts/cleanup-repo.js` (dry-run por defecto). Ejecutar con `--apply` para mover a `docs/reportes/` o `docs/99_archive/` y generar `docs/99_archive/cleanup-report.json`.

## Fase 3 (opcional)
- [ ] Deprecar documentos antiguos moviéndolos a `docs/99_archive/` con nota.
- [ ] Estandarizar nombres: kebab-case en archivos de doc y rutas.
- [ ] Añadir `CONTRIBUTING.md` y convenciones de commits.

## Consideraciones
- Cambios destructivos (renombres/mover) requieren coordinar con Front y CI/CD.
- Mantener alias y redirecciones en docs para no romper enlaces externos.
