# Convenciones de Documentación

- Idioma canónico: Español (ES). Stubs en inglés redirigen a las carpetas ES.
- Dónde va cada cosa:
  - Reportes temporales/operativos: `docs/reportes/`
  - Históricos/obsoletos: `docs/99_archive/`
  - Frontend (guías de integración): `docs/02_frontend/`
  - Seguridad: `docs/03_seguridad/` (canónico)
  - Sistemas: `docs/02_sistemas/` (canónico)
  - Despliegue: `docs/04_deployment/`
- Raíz del repo:
  - Mantener solo README.md, INDEX.md y documentos de navegación/mandatorios.
  - El resto de MD/TXT debe vivir en `docs/`.
- Herramientas:
  - Auditoría de endpoints: `scripts/audit-endpoints-v2.ts`
  - Limpieza de raíz: `scripts/cleanup-repo.js` (dry-run por defecto)
