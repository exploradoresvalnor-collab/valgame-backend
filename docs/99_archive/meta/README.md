# 📁 Meta - Configuración y Herramientas del Proyecto

Esta carpeta contiene toda la configuración, documentación, herramientas de desarrollo y archivos compilados del proyecto Valgame Backend.

## 📂 Estructura

```
meta/
├── config/           # Configuraciones del proyecto
│   ├── .env.example  # Variables de entorno de ejemplo
│   └── proxy.conf.json # Configuración de proxy para desarrollo
├── dev-tools/        # Scripts y herramientas de desarrollo
│   ├── testing/      # Scripts de testing de endpoints
│   ├── cleanup/      # Scripts de limpieza y mantenimiento
│   ├── consolidation/# Scripts de consolidación de docs
│   └── maintenance/  # Scripts de mantenimiento git
├── dist/             # Código compilado (JavaScript desde TypeScript)
│   ├── app.js        # Aplicación principal compilada
│   ├── config/       # Configuraciones compiladas
│   ├── controllers/  # Controladores compilados
│   ├── models/       # Modelos de datos compilados
│   ├── routes/       # Rutas API compiladas
│   ├── services/     # Servicios de negocio compilados
│   └── utils/        # Utilidades compiladas
└── docs/             # Documentación completa del proyecto
    ├── 00_inicio/    # Inicio y navegación
    ├── 01_backend/   # Arquitectura y APIs
    ├── 02_frontend/  # Guías para frontend
    ├── 03_security/  # Seguridad
    ├── 04_deployment/# Despliegue
    ├── 05_database/  # Base de datos
    ├── 99_reference/ # Referencia rápida
    └── analysis/     # Análisis y auditorías
```

## 🎯 Propósito de Cada Carpeta

### ⚙️ config/
- **.env.example**: Plantilla de variables de entorno (DB, JWT, SMTP, etc.)
- **proxy.conf.json**: Configuración para desarrollo con proxy (útil para Angular/Vue)

### 🛠️ dev-tools/
Scripts organizados por función para desarrollo, testing y mantenimiento.

### 📦 dist/
Código JavaScript compilado desde TypeScript. Se genera con `npm run build`.
- **No editar directamente** - Los cambios deben hacerse en `src/`
- **Para producción** - Este código se despliega

### 📚 docs/
Documentación exhaustiva del proyecto:
- Arquitectura completa
- APIs y endpoints (25+ documentados)
- Guías para frontend
- Seguridad y deployment
- Base de datos y esquemas

## 🚀 Uso

- **Desarrollo**: Usa `src/` para código fuente
- **Build**: `npm run build` genera `dist/`
- **Testing**: Scripts en `dev-tools/testing/`
- **Documentación**: Lee `docs/00_inicio/README.md`

## 📅 Última Actualización
12 de febrero, 2026 - Consolidación de carpetas meta</content>
<parameter name="filePath">c:\Users\Usuario\Desktop\trabajo\Valnor-full\gui a de ejempli\valgame-backend\meta\README.md