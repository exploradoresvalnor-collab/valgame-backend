# 📁 Estructura del Proyecto Valgame Backend v2.1.0

## 🎯 Guía de Navegación Rápida

### 🚀 Comenzar Rápido
- **README.md** - Introducción general del proyecto
- **QUICK_START_FIXES.md** - Soluciones rápidas comunes
- **package.json** - Scripts disponibles (`npm run dev`, `npm run test`, etc.)

### 💻 Código Fuente Principal
```
src/
├── app.ts                    # Express app + middlewares
├── config/                   # Configuración (DB, env)
├── controllers/              # Handlers de rutas
├── middlewares/              # Express middlewares (auth, validation, error, connection)
├── models/                   # Mongoose schemas
├── routes/                   # Definición de rutas
├── services/                 # Lógica de negocio
├── types/                    # TypeScript interfaces
├── utils/                    # Utilidades (retry, errors, validators)
└── validations/              # Zod schemas para validación
```

### 🧪 Tests
```
tests/
├── e2e/                      # Tests end-to-end
├── unit/                     # Tests unitarios
└── setup.ts                  # Setup compartido
```

### 📚 Documentación Principal
```
docs/
├── README_MASTER.md          # Índice maestro de documentación
├── 00_INICIO/                # Guías de inicio (setup, env, instalación)
├── 01_BACKEND_CORE/          # Arquitectura, patrones, modelos
├── 02_FRONTEND_INTEGRATION/  # Guías para integración con frontend
├── 03_GAME_SYSTEMS/          # Sistemas de juego (combate, marketplace, etc.)
├── 04_SECURITY/              # Seguridad, JWT, CORS, rate-limiting
├── 05_DEPLOYMENT/            # Deploy a Render, Docker, CI/CD
├── 06_ARCHIVE/               # Documentación antigua/archivada
└── archive/
    ├── analisis/             # Análisis técnicos detallados (archivados)
    ├── status/               # Reportes de estado y resumen (archivados)
    └── guides/               # Guías antiguas (archivadas)
```

### 🎨 Documentación Frontend
```
FRONTEND_STARTER_KIT/
├── 00_INDICE_MAESTRO.md                    # Índice principal
├── 00_LEEME_PRIMERO.md                     # Quick start (4-5 min)
├── 00_BACKEND_API_REFERENCE.md             # Referencia de endpoints
├── 01_GUIA_INICIO_RAPIDO.md                # Setup paso a paso
├── 02_API_REFERENCE.md                     # API detallada
├── 03_MODELOS_TYPESCRIPT.md                # DTO/Interfaces TypeScript
├── 04_SERVICIOS_BASE.md                    # Servicios Angular
├── 05_COMPONENTES_EJEMPLO.md               # Ejemplos de componentes
├── 28_COMPONENTE_OFFLINE_INDICATOR.md      # Indicador de conexión
├── 29_GUIA_RAPIDA_ERROR_HANDLING.md        # Error handling (NEW!)
├── ... (más guías especializadas)
```

### 🛠️ Scripts y Herramientas
```
scripts/
├── tools/                    # Scripts de utilidad y debug
│   ├── get-verification-token.js
│   ├── verify-user.js
│   ├── update-section*.js
│   ├── cookies.txt
│   └── bash.exe.stackdump
└── tests/                    # Scripts de testing específicos
```

### ⚙️ Configuración
```
.env                          # Variables de entorno (local, NO VERSIONAR)
.env.example                  # Plantilla de variables
.gitignore                    # Archivos ignorados por git
tsconfig.json                 # Configuración TypeScript
eslint.config.js              # Reglas ESLint
jest.config.cjs               # Configuración de tests
proxy.conf.json               # Proxy para desarrollo
package.json                  # Dependencias y scripts
```

---

## 📖 Tabla de Referencia Rápida

| Necesito... | Ubicación | Archivo |
|-----------|-----------|---------|
| **Empezar rápido** | Raíz | `QUICK_START_FIXES.md` |
| **Entender arquitectura** | `docs/01_BACKEND_CORE/` | `00-Arquitectura-General.md` |
| **Integrar en Angular** | `FRONTEND_STARTER_KIT/` | `00_LEEME_PRIMERO.md` |
| **Ver endpoints disponibles** | `FRONTEND_STARTER_KIT/` | `00_BACKEND_API_REFERENCE.md` |
| **Entender modelos BD** | `src/models/` | `*.ts` |
| **Ver servicios de negocio** | `src/services/` | `*.service.ts` |
| **Hacer tests** | `tests/` | `*.test.ts` |
| **Entender error handling** | `FRONTEND_STARTER_KIT/` | `29_GUIA_RAPIDA_ERROR_HANDLING.md` |
| **Análisis técnico antiguo** | `docs/archive/analisis/` | `*.md` |
| **Reportes de estado** | `docs/archive/status/` | `*.md` |
| **Scripts de debug** | `scripts/tools/` | `*.js` |

---

## 🎯 Flujos Comunes de Trabajo

### ✅ Agregar un Nuevo Endpoint
1. Crear validación en `src/validations/{entity}.schemas.ts`
2. Crear método en `src/services/{entity}.service.ts`
3. Crear handler en `src/controllers/{entity}.controller.ts`
4. Registrar ruta en `src/routes/{entity}.routes.ts`
5. Documentar en `FRONTEND_STARTER_KIT/00_BACKEND_API_REFERENCE.md`

### 🐛 Arreglar un Bug
1. Reproducir con test en `tests/e2e/`
2. Identificar servicio afectado en `src/services/`
3. Revisar validación en `src/validations/`
4. Revisar middleware/controller
5. Actualizar documentación
6. Commit: `git commit -m "fix: descripción del fix"`

### 📝 Entender el Código
1. Leer `docs/01_BACKEND_CORE/00-Arquitectura-General.md`
2. Navegar por `src/models/` para entender esquemas
3. Ver `src/services/` para lógica principal
4. Revisar `src/routes/` para puntos de entrada

### 🚀 Hacer Deploy
1. Ver `docs/05_DEPLOYMENT/00-Deploy-Render.md`
2. Verificar `.env` en producción
3. Correr tests: `npm run test:master`
4. Commit y push a `main`
5. Render detecta cambios automáticamente

---

## 🗂️ Estructura Detallada

### src/
- **app.ts**: Express setup, middleware chain, route registration
- **config/**: Configuración de conexión a BD, validación de env
- **controllers/**: Request handlers (entry point de rutas)
- **middlewares/**: Authentication, validation, error handling, connection monitoring
- **models/**: Mongoose schemas (User, Character, Item, Listing, etc.)
- **services/**: Business logic (CharacterService, MarketplaceService, PaymentService)
- **types/**: TypeScript interfaces y tipos compartidos
- **utils/**: Helper functions (retry logic, error classes, validators)
- **validations/**: Zod schemas para validar requests

### docs/
- **00_INICIO/**: Setup, instalación, configuración inicial
- **01_BACKEND_CORE/**: Arquitectura, patrones, modelos de datos
- **02_FRONTEND_INTEGRATION/**: Guías de integración para frontend
- **03_GAME_SYSTEMS/**: Detalles de sistemas (combate, marketplace, etc.)
- **04_SECURITY/**: Seguridad, autenticación, rate-limiting
- **05_DEPLOYMENT/**: Docker, Render, CI/CD, producción
- **06_ARCHIVE/**: Documentación antigua (referencia)

### FRONTEND_STARTER_KIT/
- Documentación específica para desarrolladores frontend
- Ejemplos de integración con Angular
- Referencia completa de API
- Guías de componentes

### tests/
- **e2e/**: Flujos completos (register → combat → marketplace)
- **unit/**: Tests de servicios individuales
- **setup.ts**: Configuración compartida de tests

### scripts/tools/
- Utilidades para debug, verificación, y mantenimiento
- NO son parte del código de producción

---

## 🌟 Nuevas Funcionalidades (v2.1.0 - Nov 27)

### ✨ Error Handling & Offline Support
- **Conexión**: Detección automática de desconexiones
- **Retry**: Lógica con exponential backoff (4 presets)
- **Health Check**: Endpoints `/api/health`, `/ready`, `/live`
- **Indicadores**: Headers HTTP especiales para cliente
- **Frontend**: Componente `OfflineIndicatorComponent` + `ConnectionMonitorService`

**Integración frontend: 10 minutos** → Ver `FRONTEND_STARTER_KIT/29_GUIA_RAPIDA_ERROR_HANDLING.md`

---

## 📋 Checklist para Nuevos Developers

- [ ] Clonar repo
- [ ] Leer `README.md` (5 min)
- [ ] Leer `QUICK_START_FIXES.md` (5 min)
- [ ] Ver `docs/01_BACKEND_CORE/00-Arquitectura-General.md` (10 min)
- [ ] Setup local: `npm install && npm run dev` (5 min)
- [ ] Correr tests: `npm run test:master` (10 min)
- [ ] Explorar `src/` (20 min)
- [ ] Leer una guía específica según task asignado

**Total: ~1 hora para estar operativo**

---

## 📞 Preguntas Frecuentes

### ¿Por qué hay carpeta docs/ y docs_reorganizada/?
- `docs/` → Nueva estructura limpia (usar esta)
- `docs_reorganizada/` → Antigua (referencia, no usar)

### ¿Dónde están los documentos de análisis?
- `docs/archive/analisis/` → Documentos técnicos antiguos (referencia)

### ¿Cómo integro error handling en frontend?
- Leer: `FRONTEND_STARTER_KIT/29_GUIA_RAPIDA_ERROR_HANDLING.md` (10 min)

### ¿Scripts sueltos a qué se usan?
- `scripts/tools/` → Debug, verificación (NO parte del código)

### ¿Qué es FRONTEND_STARTER_KIT?
- Kit completo de integración para desarrolladores frontend
- Documentación + código listo para copiar
- Actualizado con últimos cambios del backend

---

## 🔗 Enlaces Útiles

- **Documentación completa**: `docs/README_MASTER.md`
- **Frontend quick start**: `FRONTEND_STARTER_KIT/00_LEEME_PRIMERO.md`
- **API Reference**: `FRONTEND_STARTER_KIT/00_BACKEND_API_REFERENCE.md`
- **Error Handling**: `FRONTEND_STARTER_KIT/29_GUIA_RAPIDA_ERROR_HANDLING.md`
- **Problemas comunes**: `QUICK_START_FIXES.md`

---

**Última actualización**: 27 de noviembre de 2025  
**Versión**: 2.1.0  
**Status**: ✅ Production Ready
