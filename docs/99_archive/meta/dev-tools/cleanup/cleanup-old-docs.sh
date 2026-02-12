#!/bin/bash

# Eliminar archivos de documentación antigua usando git
echo "🗑️  Eliminando archivos de documentación antigua..."

# Lista de archivos a eliminar (versiones antiguas)
git rm -f "04_GUIA_FRONTEND_DEBE_HACER.md" 2>/dev/null || echo "✓ Omitido: 04_GUIA_FRONTEND_DEBE_HACER.md"
git rm -f "RESUMEN_EJECUTIVO_AUDITORIA.md" 2>/dev/null || echo "✓ Omitido: RESUMEN_EJECUTIVO_AUDITORIA.md"
git rm -f "VISUALIZACION_ENDPOINTS.md" 2>/dev/null || echo "✓ Omitido: VISUALIZACION_ENDPOINTS.md"

# Versiones viejas que tienen nuevas versiones en /docs/
git rm -f "DEPLOYMENT.md" 2>/dev/null || echo "✓ Omitido: DEPLOYMENT.md"
git rm -f "DATABASE.md" 2>/dev/null || echo "✓ Omitido: DATABASE.md"
git rm -f "ENDPOINTS_QUICK.md" 2>/dev/null || echo "✓ Omitido: ENDPOINTS_QUICK.md"
git rm -f "ERRORS.md" 2>/dev/null || echo "✓ Omitido: ERRORS.md"
git rm -f "GLOSSARY.md" 2>/dev/null || echo "✓ Omitido: GLOSSARY.md"
git rm -f "TROUBLESHOOTING.md" 2>/dev/null || echo "✓ Omitido: TROUBLESHOOTING.md"
git rm -f "INDEX.md" 2>/dev/null || echo "✓ Omitido: INDEX.md"

echo ""
echo "✅ Limpieza completada"
echo "📁 Nueva documentación en: /docs/INDEX.md"
echo ""
echo "Para hacer commit:"
echo "  git commit -m 'docs: consolidate documentation into /docs/ folder (135 endpoints, 100% coverage)'"
