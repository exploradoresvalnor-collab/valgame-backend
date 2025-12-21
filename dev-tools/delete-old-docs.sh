#!/bin/bash

# Script para eliminar archivos de documentación antigua
# Estos archivos fueron reemplazados por la nueva estructura en /docs/

echo "🗑️  Eliminando archivos de documentación antigua..."

# Archivos en raíz que deben eliminarse
rm -f "04_GUIA_FRONTEND_DEBE_HACER.md"
rm -f "DEPLOYMENT.md"
rm -f "DATABASE.md"
rm -f "ENDPOINTS_QUICK.md"
rm -f "ERRORS.md"
rm -f "GLOSSARY.md"
rm -f "TROUBLESHOOTING.md"
rm -f "INDEX.md"
rm -f "RESUMEN_EJECUTIVO_AUDITORIA.md"
rm -f "VISUALIZACION_ENDPOINTS.md"

# Archivos viejos en /docs/ que fueron reemplazados
rm -f "docs/04_GUIA_FRONTEND_DEBE_HACER.md" 2>/dev/null || true
rm -f "docs/DEPLOYMENT.md" 2>/dev/null || true
rm -f "docs/DATABASE.md" 2>/dev/null || true
rm -f "docs/ENDPOINTS_QUICK.md" 2>/dev/null || true
rm -f "docs/ERRORS.md" 2>/dev/null || true
rm -f "docs/GLOSSARY.md" 2>/dev/null || true
rm -f "docs/TROUBLESHOOTING.md" 2>/dev/null || true
rm -f "docs/INDEX.md" 2>/dev/null || true

echo "✅ Archivos antiguos eliminados"
echo "📁 Nueva documentación disponible en: /docs/INDEX.md"
