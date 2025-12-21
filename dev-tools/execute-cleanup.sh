#!/bin/bash
# Cleanup de archivos duplicados en /docs/

cd "c:\\Users\\Haustman\\Desktop\\valgame-backend"

echo "🗑️  Eliminando 4 archivos duplicados/misplaced de /docs/..."
echo ""

# Eliminar duplicados
rm -f "docs/04_GUIA_FRONTEND_DEBE_HACER.md"
rm -f "docs/RESUMEN_EJECUTIVO_AUDITORIA.md"  
rm -f "docs/VISUALIZACION_ENDPOINTS.md"
rm -f "docs/INDEX.md"

echo "✅ Archivos eliminados"
echo ""
echo "📊 Archivos restantes en /docs/:"
ls -la docs/*.md 2>/dev/null | wc -l
echo ""

# Verificar estructura
echo "📁 Estructura final:"
find docs -type f -name "*.md" 2>/dev/null | sort

echo ""
echo "✅ Limpieza completada"
