#!/bin/bash
# ============================================================================
# FINAL CLEANUP - Elimina archivos duplicados de /docs/
# ============================================================================

cd c:/Users/Haustman/Desktop/valgame-backend

echo "🗑️  LIMPIANDO ARCHIVOS ANTIGUOS DE /docs/..."
echo ""

# Lista de archivos a eliminar (duplicados/viejos en git)
rm -f docs/04_GUIA_FRONTEND_DEBE_HACER.md
rm -f docs/RESUMEN_EJECUTIVO_AUDITORIA.md
rm -f docs/VISUALIZACION_ENDPOINTS.md
rm -f docs/INDEX.md

echo "✅ Archivos viejos eliminados"
echo ""
echo "📁 Estructura final de /docs/:"
find docs -type f -name "*.md" | sort
