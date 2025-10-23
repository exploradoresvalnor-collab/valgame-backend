# 🎮 Valgame Backend# Valgame Backend



Backend del juego RPG Valgame, construido con Node.js, Express, TypeScript y MongoDB.Backend del juego Valgame, implementado con Node.js, Express y TypeScript.



---## Requisitos

- Node 18+ y npm

## 🚀 Quick Start- MongoDB Atlas o local



### Requisitos Previos## Instalación

- Node.js 18+ y npm```bash

- MongoDB Atlas o MongoDB localnpm install

```

### Instalación

```bash## Variables de entorno (archivo `.env`)

# Instalar dependencias- MONGODB_URI: URI de conexión a MongoDB

npm install- JWT_SECRET: Clave secreta para tokens JWT

- PORT: Puerto para el servidor (opcional)

# Copiar archivo de ejemplo de variables de entorno- FRONTEND_ORIGIN: URL del frontend (opcional)

cp .env.example .env

## Comandos útiles

# Editar .env con tus credenciales```bash

# MONGODB_URI, JWT_SECRET, etc.# Comprueba que las env necesarias están definidas

npm run check-env

# Verificar configuración

npm run check-env# Desarrollo (recarga automática)

npm run dev

# Iniciar en modo desarrollo

npm run dev# Compilar TypeScript

```npm run build



---# Ejecutar build

npm start

## 📦 Variables de Entorno```



Configurar en archivo `.env`:## Estructura del Proyecto



```bash### 📁 src/

# Base de datosDirectorio principal del código fuente.

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/valgame

#### 📁 src/@types

# Seguridad- Definiciones de tipos TypeScript personalizados

JWT_SECRET=tu-secreto-super-seguro-aqui- Extensiones de tipos para Express



# Servidor#### 📁 src/config

PORT=3000- `db.ts`: Configuración de conexión a MongoDB

NODE_ENV=development- `mailer.ts`: Configuración del sistema de correos



# Frontend#### 📁 src/controllers

FRONTEND_ORIGIN=http://localhost:5173Controladores que manejan la lógica de negocio:

- `characters.controller.ts`: Gestión de personajes

# Email (opcional, para verificación)- `dungeons.controller.ts`: Lógica de mazmorras

SMTP_HOST=smtp.ethereal.email

SMTP_PORT=587#### 📁 src/middlewares

SMTP_USER=your-email@ethereal.emailMiddlewares de Express:

SMTP_PASS=your-password- `auth.ts`: Autenticación y autorización

```- `errorHandler.ts`: Manejo centralizado de errores

- `rateLimits.ts`: Limitación de peticiones

---

#### 📁 src/models

## 🛠️ Comandos DisponiblesModelos de MongoDB/Mongoose:

- `BaseCharacter.ts`: Modelo base para personajes

### Desarrollo- `Category.ts`: Categorías del juego

```bash- `Consumable.ts`: Items consumibles

npm run dev              # Servidor con recarga automática- `Dungeon.ts`: Mazmorras y sus propiedades

npm run check-env        # Validar variables de entorno- `Equipment.ts`: Equipamiento de personajes

npm run seed             # Poblar base de datos con datos iniciales- `Event.ts`: Eventos del juego

```- `GameSetting.ts`: Configuraciones globales

- `Item.ts`: Items base

### Testing- `LevelHistory.ts`: Historial de niveles

```bash- `LevelRequirement.ts`: Requisitos de nivel

npm test                 # Ejecutar test maestro E2E- `Offer.ts`: Ofertas del marketplace

npm run test:master      # Test maestro (flujo completo)- `Package.ts`: Paquetes de items

npm run test:e2e         # Todos los tests E2E- `PlayerStat.ts`: Estadísticas de jugadores

npm run test:unit        # Tests unitarios- `Purchase.ts`: Registro de compras

npm run test:coverage    # Cobertura de tests- `Ranking.ts`: Sistema de rankings

```- `Transaction.ts`: Transacciones económicas

- `User.ts`: Modelo de usuario

### Producción- `UserPackage.ts`: Paquetes de usuario

```bash

npm run build            # Compilar TypeScript#### 📁 src/routes

npm start                # Ejecutar versión compiladaRutas de la API:

npm run validate         # Lint + Build + Test- Rutas para autenticación

npm run validate:full    # Validación completa pre-deployment- Rutas para gestión de personajes

```- Rutas para marketplace

- Rutas para eventos y mazmorras

### Utilidades

```bash#### 📁 src/services

npm run lint             # Ejecutar ESLintServicios de lógica de negocio:

npm run lint:fix         # Corregir errores de ESLint automáticamente- `character.service.ts`: Lógica de personajes

npm run create-indexes   # Crear índices de base de datos- `marketplace.service.ts`: Sistema de marketplace

```- `onboarding.service.ts`: Proceso de registro

- `permadeath.service.ts`: Sistema de muerte permanente

---- `realtime.service.ts`: Servicios en tiempo real



## 🏗️ Arquitectura del Proyecto#### 📁 src/utils

Utilidades y helpers:

```- `errors.ts`: Definiciones de errores

valgame-backend/

├── 📁 src/                      # Código fuente#### 📁 src/validations

│   ├── 📁 config/               # Configuración (DB, mailer)Esquemas de validación:

│   ├── 📁 controllers/          # Controladores de rutas- `game.schemas.ts`: Validaciones específicas del juego

│   ├── 📁 middlewares/          # Auth, error handling, rate limits- `schemas.ts`: Validaciones generales

│   ├── 📁 models/               # Modelos de MongoDB (Mongoose)

│   ├── 📁 routes/               # Definición de rutas API### 📁 tests/

│   ├── 📁 services/             # Lógica de negocioTests del sistema:

│   ├── 📁 utils/                # Utilidades y helpers- `e2e/`: Tests de integración end-to-end

│   ├── 📁 validations/          # Esquemas de validación (Zod)  - `auth.e2e.test.ts`: Tests de autenticación

│   └── app.ts                   # Aplicación Express principal  - `onboarding.e2e.test.ts`: Tests de registro

│  - `setup.ts`: Configuración común de tests

├── 📁 tests/                    # Tests

│   ├── 📁 e2e/                  # Tests end-to-end### 📁 scripts/

│   │   ├── master-complete-flow.e2e.test.ts ⭐ (Test maestro)Scripts de utilidad:

│   │   ├── setup.ts             # Configuración de tests- `check-env.js`: Validación de variables de entorno

│   │   └── ...                  # Tests específicos- `migrate-and-seed-items.ts`: Migración y población de items

│   └── 📁 unit/                 # Tests unitarios

│### Archivos de Configuración

├── 📁 scripts/                  # Scripts de utilidad- `ARQUITECTURA.md`: Documentación de la arquitectura del sistema

│   ├── check-env.js             # Validación de .env- `DOCUMENTACION.md`: Documentación general del proyecto

│   ├── create-purchase-index.js # Índices de DB- `ROADMAP.md`: Plan de desarrollo futuro

│   └── seed_game_settings.ts    # Seed de configuración- `jest.config.cjs`: Configuración de Jest para testing

│- `package.json`: Dependencias y scripts npm

├── 📁 docs/                     # Documentación- `tsconfig.json`: Configuración de TypeScript

│   ├── 📁 arquitectura/         # Documentación técnica

│   ├── 📁 guias/                # Guías de desarrollo## Documentación Adicional

│   └── API_REFERENCE.md         # Referencia de API- Para detalles de la arquitectura, ver [ARQUITECTURA.md](./ARQUITECTURA.md)

│- Para documentación general, ver [DOCUMENTACION.md](./DOCUMENTACION.md)

├── 📁 FRONTEND_STARTER_KIT/     # Guía para frontend- Para el plan de desarrollo, ver [ROADMAP.md](./ROADMAP.md)
│
├── .env.example                 # Template de variables de entorno
├── Dockerfile                   # Configuración Docker
├── jest.config.cjs              # Configuración de tests
├── tsconfig.json                # Configuración TypeScript
└── package.json                 # Dependencias y scripts
```

---

## 🎯 Características Principales

### Sistema de Autenticación
- ✅ Registro de usuarios con email
- ✅ Verificación de email
- ✅ Login con JWT tokens
- ✅ Paquete de bienvenida automático

### Sistema de Personajes
- ✅ Catálogo de personajes base
- ✅ Sistema de rangos (D, C, B, A, S, SS, SSS)
- ✅ Progresión por niveles y etapas
- ✅ Evolución de personajes
- ✅ Estadísticas dinámicas (ATK, DEF, HP)

### Sistema de Items
- ✅ Equipamiento (armas, armaduras, accesorios)
- ✅ Consumibles (pociones, buffs)
- ✅ Inventario separado por tipo
- ✅ Sistema de rareza

### Sistema de Mazmorras
- ✅ Combate por turnos
- ✅ Recompensas de XP y VAL
- ✅ Drop table de items
- ✅ Dificultad escalable

### Sistema de Economía
- ✅ Moneda virtual (VAL)
- ✅ Marketplace entre jugadores
- ✅ Sistema de impuestos (5%)
- ✅ Listings con expiración
- ✅ Transacciones seguras

### Sistema de Permadeath
- ✅ Estados: saludable/herido/muerto
- ✅ Recuperación con VAL
- ✅ Sistema de curación

### Sistema de Paquetes
- ✅ Paquetes de items
- ✅ Apertura aleatoria
- ✅ Rareza por rango

---

## 📚 Documentación

### Para Desarrolladores Backend
- [Arquitectura del Sistema](./docs/arquitectura/ARQUITECTURA.md)
- [Guía de Seguridad](./docs/guias/SECURITY_ROTATION_GUIDE.md)
- [Test Maestro](./TEST_MAESTRO_RESUMEN.md)

### Para Desarrolladores Frontend
- [Frontend Starter Kit](./FRONTEND_STARTER_KIT/)
- [API Reference](./docs/API_REFERENCE.md)

---

## 🧪 Testing

El proyecto incluye un **Test Maestro E2E** que valida TODO el flujo del juego:

```bash
npm run test:master
```

**Cobertura del Test Maestro (18 tests):**
- ✅ Registro y autenticación completa
- ✅ Sistema de personajes y equipamiento
- ✅ Mazmorras y combate
- ✅ Progresión y evolución
- ✅ Marketplace (compra/venta entre usuarios)
- ✅ Sistema de permadeath

Si este test pasa, **el sistema completo funciona correctamente** 🎉

---

## 🐳 Docker

```bash
# Build de imagen
docker build -t valgame-backend .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env valgame-backend
```

---

## 🚀 Deployment

### Pre-deployment Checklist
```bash
# 1. Validación completa
npm run validate:full

# 2. Verificar build
npm run build

# 3. Verificar variables de entorno
npm run check-env
```

### Plataformas Recomendadas
- **Render** (recomendado)
- **Railway**
- **Heroku**
- **AWS Elastic Beanstalk**

---

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto es privado y pertenece a Exploradores Valnor.

---

## 📞 Soporte

Para dudas o soporte, contactar al equipo de desarrollo.
