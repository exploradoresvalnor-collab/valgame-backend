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

- **Autenticación:** Registro, login con JWT, verificación por email
- **Seguridad:** httpOnly cookies, rate limiting, validación Zod
- **Personajes:** Niveles, evolución, curación, revivir, permadeath (24h)
- **Combate:** Mazmorras con combate automático, recompensas
- **Inventario:** Equipamiento, consumibles, límites configurables
- **Marketplace:** P2P compra/venta, filtros avanzados, transacciones atómicas
- **Gacha:** Paquetes con probabilidades, sistema de duplicados
- **WebSocket:** Tiempo real con Socket.IO (autenticado)
- **Cron Jobs:** Permadeath automático, expiración de listings
- **Onboarding:** Paquete del Pionero automático al verificar email

### 🔧 En Desarrollo

- Sistema de eventos temporales
- Daily rewards con streaks
- Leaderboards de mazmorras

---

## 🏗️ Estructura del Proyecto

```
valgame-backend/
├── src/
│   ├── app.ts                    # Punto de entrada (Express server)
│   ├── seed.ts                   # Datos iniciales
│   ├── config/                   # Configuración (DB, mailer)
│   ├── models/                   # Esquemas MongoDB
│   ├── controllers/              # Lógica de negocio
│   ├── services/                 # Servicios especializados
│   ├── middlewares/              # Auth, rate limits, errors
│   ├── routes/                   # Endpoints API
│   ├── validations/              # Esquemas Zod
│   └── utils/                    # Utilidades
│
├── tests/
│   ├── e2e/                      # Tests de flujo completo
│   └── security/                 # Tests de seguridad
│
├── scripts/                      # Scripts de utilidad
├── docs/                         # Documentación completa
├── FRONTEND_STARTER_KIT/         # Guías para frontend
│
├── .env                          # Variables (no subir a Git)
├── .env.example                  # Ejemplo de variables
├── package.json                  # Dependencias npm
├── tsconfig.json                 # Config TypeScript
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

**Última actualización:** 27 de octubre de 2025  
**Versión:** 1.0.0
