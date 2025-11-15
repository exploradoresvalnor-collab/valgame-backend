# 🎮 Valgame Backend

Backend del juego RPG Valgame, construido con Node.js, Express, TypeScript y MongoDB.

---

## 📚 DOCUMENTACIÓN COMPLETA

### 🎯 Documentos Esenciales (Leer en este orden)

1. **[📦 DEPENDENCIAS_PRODUCCION.md](docs/DEPENDENCIAS_PRODUCCION.md)**
   - Node 22.16.0, MongoDB 8.0, versiones exactas de npm packages
   - Configuración de Render.com (producción en vivo)
   - Variables de entorno requeridas (.env)
   - Comandos de instalación y despliegue

2. **[🗺️ MAPA_BACKEND.md](docs/MAPA_BACKEND.md)**
   - Estructura de código completa (carpetas y archivos explicados)
   - Flujo de usuario completo (12 funcionalidades principales)
   - Endpoints críticos resumidos
   - Seguridad explicada visualmente

3. **[📖 DOCUMENTACION.md](docs/DOCUMENTACION.md)**
   - Sistemas del juego (combate, progresión, marketplace)
   - Economía del juego (VAL, EVO, items)
   - Mecánicas detalladas (permadeath, evolución, gacha)

### 📂 Índice General
👉 **[docs/00_INICIO/README.md](docs/00_INICIO/README.md)** - Índice maestro de toda la documentación

---

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
