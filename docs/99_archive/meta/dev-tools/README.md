# Dev Tools - Scripts y Herramientas de Desarrollo

Esta carpeta contiene scripts temporales, herramientas de desarrollo y archivos de testing que se han movido desde la raíz del proyecto para mantener el workspace organizado.

## Nueva Estructura Organizada

```
dev-tools/
├── testing/
│   ├── mega-test.sh          # Suite exhaustiva de testing de 25+ endpoints
│   └── test-endpoints.sh     # Testing específico de endpoints nuevos
├── cleanup/
│   ├── cleanup-docs-folder.sh    # Limpieza de carpeta docs/
│   ├── cleanup-old-docs.sh       # Limpieza de docs antiguos
│   ├── delete-old-docs.sh        # Eliminación de docs obsoletos
│   ├── execute-cleanup.sh        # Ejecutor general de limpieza
│   └── final-cleanup.sh          # Limpieza final
├── consolidation/
│   ├── PASOS_FINALES.sh          # Checklist de consolidación
│   └── EJECUTAR_CONSOLIDACION.sh # Script general de consolidación
├── maintenance/
│   └── git-consolidate.sh        # Consolidación de git
└── README.md                     # Esta documentación
```

## Contenido por Carpeta

### 🧪 testing/ - Scripts de Testing
- **`mega-test.sh`** - Suite completa de testing de todos los 25+ endpoints usando curl
- **`test-endpoints.sh`** - Testing específico de endpoints nuevos con token JWT

### 🧹 cleanup/ - Scripts de Limpieza
Scripts para eliminar archivos antiguos y mantener el proyecto organizado:
- `cleanup-docs-folder.sh` - Limpia archivos específicos de docs/
- `cleanup-old-docs.sh` - Eliminación de documentación antigua
- `delete-old-docs.sh` - Eliminación de docs obsoletos
- `execute-cleanup.sh` - Ejecutor general de limpieza
- `final-cleanup.sh` - Limpieza final

### 📋 consolidation/ - Scripts de Consolidación
- `PASOS_FINALES.sh` - Checklist detallada para consolidación de documentación
- `EJECUTAR_CONSOLIDACION.sh` - Script general de consolidación

### 🔧 maintenance/ - Scripts de Mantenimiento
- `git-consolidate.sh` - Para consolidar commits o repositorios git

## Notas
- Estos archivos se movieron desde la raíz para mantener el proyecto organizado
- Algunos pueden ser útiles para desarrollo futuro o debugging
- Se pueden eliminar si ya no son necesarios después de verificar que no contienen información importante
- Los scripts están actualizados con los números correctos (25+ endpoints en lugar de 109)