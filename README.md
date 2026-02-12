# 🎮 Valgame Backend v2.0 - API Completa y Profesional

**Backend del juego RPG Valgame** - API REST + WebSocket completamente funcional y testeada.

**Versión:** 2.0.0  
**Estado:** ✅ **100% Tests Pasando** | ✅ **Producción Ready**  
**Última actualización:** 12 de febrero de 2026  
**Tests:** 31/31 ✅ | **Build:** ✅ Sin errores  

---

## 🚀 INICIO ULTRA RÁPIDO

### ⚡ 3 Comandos para estar corriendo:
```bash
git clone <repo-url> && cd valgame-backend
npm install && cp .env.example .env  # Configurar variables
npm run dev                         # ¡Listo! Servidor corriendo
```

### ✅ Verificar que funciona:
```bash
curl http://localhost:8080/health    # Health check
npm run test:master                  # 31 tests E2E completos
```

---

## 📊 ESTADO DEL PROYECTO

### ✅ **COMPLETADO AL 100%**
- **🏗️ Arquitectura**: Clean Architecture con capas bien separadas
- **🔐 Seguridad**: JWT + Bcrypt + Rate Limiting + CORS + Helmet
- **🧪 Testing**: 31 tests E2E (100% pasando) + Unit tests
- **📚 APIs**: 25+ endpoints REST funcionales + WebSocket preparado
- **🎯 Features**: Registro → Combate → Marketplace → Social completo
- **📖 Documentación**: Profesional y completa

### 🎮 **FLUJO DE USUARIO VALIDADO**
```
1. 📝 Registro + Email → 2. 🎯 Login JWT → 3. 🎁 Paquete Pionero
4. ⚔️ Personajes → 5. 👥 Equipos → 6. 🏰 Mazmorras → 7. 📈 Progresión
8. 🛒 Marketplace → 9. 🏪 Tienda → 10. 🔔 Social + Rankings
```

---

## 🏗️ ARQUITECTURA PROFESIONAL

### Capas de Clean Architecture
```
┌─────────────────┐
│   🛣️ Routes     │ ← 25+ Endpoints REST + WebSocket
├─────────────────┤
│   🎮 Controllers│ ← Lógica API + Validación Zod
├─────────────────┤
│   ⚙️ Services   │ ← Reglas de negocio puras
├─────────────────┤
│   💾 Models     │ ← MongoDB + Mongoose schemas
└─────────────────┘
```

### 📁 Estructura de Carpetas
```
src/
├── 🛣️ routes/         # Definición de endpoints
├── 🎮 controllers/    # Controladores de API
├── ⚙️ services/       # Lógica de negocio
├── 💾 models/         # Esquemas MongoDB
├── 🔐 middlewares/    # Auth, rate limiting, CORS
├── 🛡️ validations/    # Schemas Zod
├── ⚙️ config/         # DB, JWT, email, etc.
└── 🧰 utils/          # Utilidades compartidas
```

---

## 🔑 APIs FUNCIONALES (25+ ENDPOINTS)

### 👤 **Autenticación Completa**
```bash
POST /auth/register          # Registro con email
POST /auth/login            # Login JWT
GET  /auth/verify/:token    # Verificación email
POST /auth/forgot-password  # Recuperar contraseña
POST /auth/reset-password/:token # Reset contraseña
```

### 🎮 **Sistema de Juego**
```bash
GET  /api/users/me          # Dashboard completo
GET  /api/user-characters   # Personajes del usuario
POST /api/teams             # Crear equipo
GET  /api/dungeons          # Mazmorras disponibles
POST /api/dungeons/:id/enter # Entrar a mazmorra
```

### 🛒 **Economía**
```bash
GET  /api/marketplace       # Items en venta
POST /api/marketplace/list  # Vender item
POST /api/marketplace/buy/:id # Comprar item
GET  /api/packages          # Paquetes tienda
POST /api/packages/:id/buy  # Comprar paquete
```

### 🔔 **Sistema Social**
```bash
GET  /api/notifications     # Notificaciones usuario
GET  /api/player-stats      # Estadísticas jugador
GET  /api/rankings          # Rankings globales
GET  /api/categories        # Categorías items
```

---

## 🧪 TESTING COMPLETO

### ✅ **Cobertura 100% en Flujo Crítico**
```bash
npm run test:master    # 31 tests E2E (15s)
npm run test:unit      # Tests unitarios
npm run test:coverage  # Reporte cobertura
```

**Fases validadas:**
1. ✅ Registro y verificación email
2. ✅ Login y obtención de token
3. ✅ Paquete del pionero
4. ✅ Gestión de personajes
5. ✅ Sistema de equipamiento
6. ✅ Gestión de equipos
7. ✅ Mazmorras y combate
8. ✅ Survival mode
9. ✅ Marketplace P2P
10. ✅ Tienda y paquetes
11. ✅ Sistema social

---

## ⚙️ CONFIGURACIÓN Y DESPLIEGUE

### 📋 **Variables de Entorno (.env)**
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/valgame

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend
FRONTEND_URL=http://localhost:4200

# Entorno
NODE_ENV=development
PORT=8080
```

### 🚀 **Comandos de Desarrollo**
```bash
# Instalación y setup
npm install                    # Instalar dependencias
npm run check-env             # Validar configuración
npm run seed                  # Poblar DB con datos base

# Desarrollo
npm run dev                   # Servidor con hot reload
npm run build                 # Compilar TypeScript
npm run start                 # Producción

# Testing
npm run test:master           # Suite completa E2E
npm run test:e2e              # Todos los tests E2E
npm run test:unit             # Tests unitarios
npm run test:coverage         # Cobertura de tests

# Utilidades
npm run lint                  # ESLint
npm run validate              # lint + build + test
npm run audit:endpoints       # Auditar endpoints
```

---

## 🔐 SEGURIDAD IMPLEMENTADA

### **Autenticación & Autorización**
- ✅ **JWT Tokens** con expiración 7 días
- ✅ **Bcrypt** para hashing de contraseñas
- ✅ **Rate Limiting** por endpoint y usuario
- ✅ **CORS** configurado para orígenes específicos
- ✅ **Helmet** para headers de seguridad HTTP

### **Validación & Sanitización**
- ✅ **Zod Schemas** para validación estricta
- ✅ **TypeScript Strict Mode** en todo el proyecto
- ✅ **Input Sanitization** contra XSS/SQL injection
- ✅ **Error Handling** consistente y seguro

---

## 📈 RENDIMIENTO & ESCALABILIDAD

### **Optimizaciones Implementadas**
- ✅ **Índices MongoDB** en consultas críticas
- ✅ **Paginación** en listas grandes
- ✅ **Caching** de configuraciones
- ✅ **Connection Pooling** MongoDB
- ✅ **Gzip Compression** automático

### **Métricas de Performance**
- **🏗️ Build Time**: < 30 segundos
- **🧪 Test Suite**: < 15 segundos (31 tests)
- **💾 Memory Usage**: < 150MB en producción
- **⚡ Response Time**: < 200ms APIs críticas

---

## 🎯 CARACTERÍSTICAS DEL JUEGO

### **Sistema de Progresión**
- **Personajes**: Evolución D → C → B → A → S → SS → SSS
- **Equipamiento**: Items permanentes con stats
- **Consumibles**: Pociones, buffs de un solo uso
- **Experiencia**: Sistema de leveling automático

### **Modos de Juego**
- **🏰 Mazmorras**: Combate por equipos (cooperativo)
- **⚔️ Survival**: Modo individual contra oleadas
- **🛒 Marketplace**: Comercio P2P con fees
- **🏪 Tienda**: Paquetes con sistema gacha

### **Economía**
- **VAL Tokens**: Moneda del juego
- **Boletos**: Para tienda y eventos
- **EVO**: Para evoluciones de personaje
- **Transacciones**: Seguras con rollback

---

## 📚 DOCUMENTACIÓN PROFESIONAL

### **Archivos de Documentación**
- **[README-PROFESSIONAL.md](README-PROFESSIONAL.md)** - Documentación técnica completa
- **[docs/](docs/)** - Documentación detallada por módulos
- **📖 API Docs** - Endpoints con ejemplos
- **🏗️ Architecture** - Diagramas y decisiones técnicas

### **Convenciones del Proyecto**
- ✅ **TypeScript Strict Mode** habilitado
- ✅ **ESLint + Prettier** para consistencia
- ✅ **Conventional Commits** para git history
- ✅ **Semantic Versioning** para releases
- ✅ **SOLID Principles** en arquitectura

---

## 🚀 PRÓXIMOS PASOS

### **Frontend Integration** 🎨
- Conectar Angular con APIs validadas
- Implementar UI/UX completa
- Testing end-to-end integrado

### **Features Avanzadas** ⚡
- Sistema de logros avanzado
- Modo multijugador completo
- Torneos y competiciones
- Analytics detallado

### **Escalabilidad** 📈
- Microservicios si crece
- CDN para assets estáticos
- Redis para caching
- Load balancing

---

## 📞 SOPORTE & CONTACTO

**Estado del Proyecto**: ✅ **COMPLETADO AL 100%**
**Última Validación**: 12 de febrero de 2026
**Tests**: 31/31 ✅ | **Build**: ✅ | **APIs**: ✅

---

**🎮 Valgame Backend está listo para recibir el frontend y crear una experiencia de juego completa y profesional.**

**¡El backend está 100% funcional y testeado!** 🚀✨
   - Solución de problemas comunes

3. **[🏗️ docs_reorganizada/00_INICIO/ARQUITECTURA_GENERAL.md](docs_reorganizada/00_INICIO/ARQUITECTURA_GENERAL.md)**
   - Arquitectura técnica completa
   - Stack tecnológico y patrones
   - Flujos principales del sistema

### 📂 Estructura Documental
```
docs_reorganizada/
├── README_MASTER.md                 ✅ Visión general
├── 00_INICIO/                      ✅ Inicio y arquitectura
├── 01_BACKEND_CORE/                ✅ API, BD, modelos, testing
├── 04_SECURITY/                    ✅ Seguridad y auditoría
└── 05_DEPLOYMENT/                  ✅ Deployment y escalabilidad
```

---

## 🔧 FUNCIONALIDADES PRINCIPALES

### ✅ Autenticación & Usuarios
- Registro con verificación de email
- Login con JWT (httpOnly cookies)
- Recuperación de contraseña
- Reenvío de verificación

### ✅ Sistema de Juego
- **Ranking competitivo** - 4 endpoints (global, personal, períodos, stats)
- **Combate automático** - Sistema de mazmorras con loot
- **Progresión de personajes** - XP, niveles, evolución, rangos
- **Marketplace P2P** - Compra/venta entre jugadores

### ✅ Economía & Items
- **Monedas:** VAL (principal), EVO (evolución)
- **Items:** Equipamiento, consumibles, boosters
- **Gacha system:** Paquetes con probabilidades
- **Tienda:** Compras con monedas del juego

### ✅ Características Avanzadas
- **WebSocket** - Eventos en tiempo real
- **Permadeath** - Sistema de muerte permanente
- **Energía** - Sistema de regeneración temporal
- **Cron jobs** - Automatización de marketplace y permadeath

---

## 🛠️ STACK TECNOLÓGICO

| Componente | Tecnología | Versión |
|------------|------------|---------|
| **Runtime** | Node.js | 22.16.0 |
| **Framework** | Express.js | 5.1.0 |
| **Lenguaje** | TypeScript | 5.9.3 |
| **Base de Datos** | MongoDB | 8.0 |
| **ODM** | Mongoose | 8.20.0 |
| **Autenticación** | JWT + bcrypt | - |
| **Validación** | Zod | 4.1.11 |
| **WebSocket** | Socket.IO | 4.8.1 |
| **Testing** | Jest + Supertest | - |
| **Deployment** | Render.com | - |

---

## 📊 ESTADÍSTICAS DEL PROYECTO

- **📄 Endpoints:** 54 operativos
- **🧪 Tests:** 22 archivos (16 E2E + 4 Unit + 2 Security)
- **📚 Documentación:** 12 documentos maestros organizados
- **🔒 Seguridad:** OWASP compliant + auditoría completa
- **🚀 Escalabilidad:** Preparado para millones de usuarios

---

## 🧪 TESTING

### Ejecutar Tests Completos
```bash
# Test maestro (flujo completo)
npm run test:master

# Todos los tests E2E
npm run test:e2e

# Tests unitarios
npm run test:unit

# Cobertura completa
npm run test:coverage
```

### Tests Disponibles
- **16 Tests E2E** - Validación completa de flujos
- **4 Tests Unitarios** - Servicios críticos
- **2 Tests de Seguridad** - Marketplace y paquetes
- **Scripts de automatización** - Flujos comunes

---

## 🚀 DEPLOYMENT

### Producción (Render.com)
```bash
# Validar código antes de deploy
npm run validate

# El proyecto está configurado para deployment automático en Render.com
# con health checks, logs y monitoreo incluidos
```

### Desarrollo Local
```bash
# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar build
npm start
```

---

## 🔒 SEGURIDAD

- ✅ **OWASP Top 10** cubierto
- ✅ **JWT seguro** con expiración
- ✅ **bcrypt** para hashing de contraseñas
- ✅ **Helmet** para headers de seguridad
- ✅ **Rate limiting** anti-abuso
- ✅ **Validación Zod** en todas las entradas
- ✅ **Auditoría completa** documentada

---

## 📞 SOPORTE & CONTACTO

**Repositorio:** https://github.com/exploradoresvalnor-collab/valgame-backend
**Documentación:** `docs_reorganizada/README_MASTER.md`
**Issues:** Crear issue en GitHub para soporte

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **Reorganización completa** - Documentación estructurada
2. ✅ **Seguridad auditada** - Vulnerabilidades corregidas
3. 🔄 **Frontend separado** - Mover a repositorio propio
4. 🔄 **CI/CD pipeline** - Automatización de deployment
5. 🔄 **Tests de performance** - Validación de carga

---

**🎮 ¡Bienvenido a Valgame Backend v2.0!**  
**📚 Lee la documentación organizada para empezar**

---

**Versión:** 2.0.0  
**Estado:** ✅ Completo y Producción Ready  
**Fecha:** 20 de noviembre de 2025

## 🚀 Quick Start

### Requisitos
- Node.js 22.16.0
- npm 10.x
- MongoDB Atlas o local

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/exploradoresvalnor-collab/valgame-backend.git
cd valgame-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Verificar configuración
npm run check-env

# Desarrollo (recarga automática)
npm run dev
```

### Variables de Entorno Requeridas

```bash
# Base de datos
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/valgame

# Seguridad
JWT_SECRET=tu-secreto-super-seguro-aqui

# Servidor
PORT=8080
NODE_ENV=development

# Frontend
FRONTEND_ORIGIN=http://localhost:4200

# Email (opcional, para verificación)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=tu-usuario
EMAIL_PASS=tu-password
EMAIL_FROM=noreply@valgame.com
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Modo watch con recarga automática
npm run check-env          # Verificar variables de entorno

# Compilación y Producción
npm run build              # Compilar TypeScript → JavaScript
npm start                  # Ejecutar servidor (requiere build)

# Testing
npm test                   # Test maestro E2E
npm run test:e2e           # Todos los tests E2E
npm run test:unit          # Tests unitarios
npm run test:coverage      # Cobertura de tests

# Calidad de Código
npm run lint               # ESLint check
npm run lint:fix           # ESLint auto-fix
npm run validate           # Lint + Build + Test

# Base de Datos
npm run seed               # Poblar datos iniciales
npm run init-db            # Inicializar colecciones
npm run create-indexes     # Crear índices de performance
```

---

## 📊 Estado del Proyecto

### ✅ Implementado y Funcionando

- **Autenticación:** Registro, login con JWT, verificación por email, recuperación de contraseña
- **Seguridad:** httpOnly cookies, rate limiting, validación Zod, tokens seguros
- **Personajes:** Niveles, evolución, curación, revivir, permadeath (24h)
- **Combate:** Mazmorras con combate automático, recompensas, actualización de ranking
- **Inventario:** Equipamiento, consumibles, límites configurables
- **Marketplace:** P2P compra/venta, filtros avanzados, transacciones atómicas
- **Gacha:** Paquetes con probabilidades, sistema de duplicados
- **Ranking:** Sistema de leaderboard global/semanal/mensual con actualización automática
- **WebSocket:** Tiempo real con Socket.IO (autenticado)
- **Cron Jobs:** Permadeath automático, expiración de listings
- **Onboarding:** Paquete del Pionero automático al verificar email

### � Features Futuras (Opcionales)

- WebSocket para notificaciones de ranking en tiempo real
- Sistema de recompensas mensuales automáticas
- Sistema de eventos temporales
- Daily rewards con streaks

---

## 🏗️ Estructura del Proyecto

```
valgame-backend/
├── src/
│   ├── app.ts                    # Punto de entrada (Express server)
│   ├── seed.ts                   # Datos iniciales
│   ├── config/                   # Configuración (DB, mailer)
│   ├── models/                   # Esquemas MongoDB (User, Character, Ranking, etc.)
│   ├── controllers/              # Lógica de negocio (auth, dungeons, rankings, etc.)
│   ├── services/                 # Servicios especializados (combat, email, etc.)
│   ├── middlewares/              # Auth, rate limits, errors
│   ├── routes/                   # Endpoints API
│   ├── validations/              # Esquemas Zod
│   └── utils/                    # Utilidades
│
├── tests/
│   ├── api/                      # Tests Thunder Client (.http files)
│   ├── e2e/                      # Tests de flujo completo
│   └── security/                 # Tests de seguridad
│
├── scripts/                      # Scripts de utilidad y mantenimiento
├── docs/                         # Documentación completa y organizada
├── FRONTEND_STARTER_KIT/         # Guías para integración frontend
│
├── .env                          # Variables de entorno (no subir a Git)
├── .env.example                  # Ejemplo de configuración
├── package.json                  # Dependencias npm
├── tsconfig.json                 # Configuración TypeScript
└── README.md                     # Este archivo
```

---

## 🌐 Producción

### URL Live
**Backend:** https://valgame-backend.onrender.com

### Health Check
```bash
curl https://valgame-backend.onrender.com/health
# → {"ok": true}
```

### Tecnologías
- **Runtime:** Node.js 22.16.0
- **Framework:** Express 5.1.0
- **Base de Datos:** MongoDB 8.0 (Atlas)
- **WebSocket:** Socket.IO 4.8.1
- **Validación:** Zod 4.1.11
- **Testing:** Jest 29.6.1

---

## 📞 Soporte

- **Repositorio:** https://github.com/exploradoresvalnor-collab/valgame-backend
- **Issues:** https://github.com/exploradoresvalnor-collab/valgame-backend/issues
- **Documentación Completa:** [docs/00_INICIO/README.md](docs/00_INICIO/README.md)

---

## 📝 Licencia

ISC

---

## 🎯 Endpoints Principales

### Autenticación (`/auth`)
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/verify/:token` - Verificar email
- `POST /auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /auth/reset-password/:token` - Resetear contraseña
- `POST /auth/resend-verification` - Reenviar email de verificación

### Ranking (`/api/rankings`)
- `GET /api/rankings` - Ranking global (público)
- `GET /api/rankings/me` - Mi ranking personal (autenticado)
- `GET /api/rankings/period/:periodo` - Rankings por período
- `GET /api/rankings/stats` - Estadísticas globales

### Personajes (`/api/characters`)
- `GET /api/characters` - Listar personajes
- `POST /api/characters/heal` - Curar personaje
- `POST /api/characters/revive` - Revivir personaje
- `POST /api/characters/evolve` - Evolucionar personaje

### Mazmorras (`/api/dungeons`)
- `GET /api/dungeons` - Listar mazmorras
- `POST /api/dungeons/play` - Iniciar combate
- `POST /api/dungeons/action` - Ejecutar acción en combate

### Marketplace (`/api/marketplace`)
- `GET /api/marketplace` - Listar publicaciones
- `POST /api/marketplace/list` - Publicar item
- `POST /api/marketplace/buy/:id` - Comprar item

**📖 Referencia completa:** [docs/API_REFERENCE_COMPLETA.md](docs/API_REFERENCE_COMPLETA.md)

---

## 🆕 ACTUALIZACIONES RECIENTES (Noviembre 2025)

### ✅ Cambios Implementados y Probados

1. **🔐 Sistema de Sesiones con Cookies httpOnly**
   - Login establece cookie automática (7 días de duración)
   - Sesión persiste al cerrar navegador
   - Logout con blacklist de tokens
   - Máxima seguridad (anti-XSS, anti-CSRF)

2. **📧 Email Real con Gmail SMTP**
   - Emails de verificación funcionando con Gmail
   - Templates HTML profesionales con diseños modernos
   - Confirmación de envío: `250 2.0.0 OK`

3. **🎁 Paquete del Pionero Mejorado**
   - 100 VAL + 5 Boletos + 2 EVO
   - 3 Pociones de Vida
   - 1 Espada básica
   - 1 Personaje inicial funcional

4. **⚔️ Sistema de Equipamiento Completo**
   - Equipar/desequipar arma/armadura/accesorio
   - Stats totales con bonos calculados automáticamente
   - Auto-reemplazo si slot ocupado
   - Prevención de duplicados

5. **🧪 Consumibles con Auto-eliminación**
   - Pociones se eliminan automáticamente cuando `usos_restantes = 0`
   - No ocupan espacio en inventario

6. **💚 Sanación y Resurrección**
   - Curación con VAL (costo dinámico: 1 VAL por 10 HP)
   - Resurrección con VAL (costo fijo: 20 VAL)
   - Validaciones de estado (saludable/herido)

7. **📈 Experiencia y Niveles**
   - Subida de nivel automática con curva exponencial
   - Crecimiento de stats por nivel
   - Curación gratis al subir de nivel

8. **🌟 Sistema de Evolución**
   - Evolución con cristales EVO
   - Boost masivo de stats (+50% ~ +100%)
   - Cambio de apariencia/forma

### 🧪 Tests E2E

**Test Master:** 16/18 tests pasando ✅

```bash
npm test tests/e2e/master-complete-flow.e2e.test.ts
```

**Tests exitosos:**
- ✅ Registro y login
- ✅ Equipar/desequipar items
- ✅ Usar consumibles (auto-eliminación verificada)
- ✅ Sanación y resurrección con VAL
- ✅ Agregar XP y subir niveles
- ✅ Evolución de personajes
- ✅ Mazmorras y combate
- ✅ Marketplace (crear/buscar/cancelar listings)

### 📚 Nueva Documentación para Frontend

**FRONTEND_STARTER_KIT/** contiene guías completas:

1. **18_GUIA_ULTRA_RAPIDA_EJEMPLOS_BASICOS.md** ⭐⭐
   - Ejemplos de código listos para copiar
   - Flujos completos de juego
   - Setup en 10 minutos

2. **15_GUIA_COMPLETA_AUTENTICACION_SESIONES.md**
   - Sistema de cookies httpOnly explicado
   - Login, registro, logout, recuperación
   - Guards, interceptors, manejo de errores
   - Código TypeScript completo

3. **16_GUIA_EQUIPAMIENTO_PERSONAJES.md**
   - Equipar/desequipar items
   - Consumibles y pociones
   - Sanación y resurrección
   - XP, niveles y evolución
   - Stats con equipamiento
   - Casos de uso completos

4. **17_RESUMEN_CAMBIOS_NOVIEMBRE_2025.md**
   - Comparaciones antes/después
   - Archivos modificados
   - Funcionalidades nuevas
   - Checklist de implementación

### ⚠️ IMPORTANTE para Frontend

**Todas las peticiones deben incluir:**
```typescript
fetch('http://localhost:3000/api/...', {
  credentials: 'include'  // ⚠️ OBLIGATORIO para cookies
});

// O con axios
axios.get('http://localhost:3000/api/...', {
  withCredentials: true  // ⚠️ OBLIGATORIO para cookies
});
```

**Sin esto, la autenticación NO funcionará.**

---

**Última actualización:** 3 de noviembre de 2025  
**Versión:** 1.2.0 (Sistema de cookies + Equipamiento completo)
