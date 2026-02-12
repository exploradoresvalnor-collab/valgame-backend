#!/bin/bash
# ============================================================================
# CLEANUP DOCS FOLDER - Elimina archivos viejos y reorganiza
# ============================================================================
# Limpia la carpeta /docs/ dejando solo la estructura organizada correcta

echo "═════════════════════════════════════════════════════════════════"
echo "  CLEANUP: Carpeta /docs/"
echo "═════════════════════════════════════════════════════════════════"
echo ""

# Archivos a eliminar (están en raíz o mal ubicados)
echo "🗑️  Eliminando archivos antiguos/mal ubicados..."
echo ""

cd "$(dirname "$0")" || exit 1

# Eliminar archivos viejos en raíz de docs/
files_to_delete=(
    "docs/04_GUIA_FRONTEND_DEBE_HACER.md"
    "docs/RESUMEN_EJECUTIVO_AUDITORIA.md"
    "docs/VISUALIZACION_ENDPOINTS.md"
    "docs/INDEX.md"
)

for file in "${files_to_delete[@]}"; do
    if [ -f "$file" ]; then
        echo "   ❌ Eliminando: $file"
        rm "$file"
    fi
done

# Limpiar carpetas vacías
echo ""
echo "🧹 Limpiando carpetas vacías..."

find docs -type d -empty -exec rmdir {} \; 2>/dev/null

echo ""
echo "═════════════════════════════════════════════════════════════════"
echo ""
echo "✅ CLEANUP COMPLETADO"
echo ""
echo "📁 Estructura final de /docs/:"
echo ""
find docs -type f -name "*.md" | sort | sed 's|^docs/||' | sed 's|^|- |'
echo ""
echo "═════════════════════════════════════════════════════════════════"
