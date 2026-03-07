# 🎮 Valgame Backend v2.0

Backend del juego RPG **Valgame** — API REST + WebSocket en tiempo real.

**Versión:** 2.0.0 · **Runtime:** Node.js 22 · **Framework:** Express 5 · **DB:** MongoDB 8 (Atlas)  
**Última actualización:** Marzo 2026

---

## ⚡ Quick Start

```bash
git clone <repo-url> && cd valgame-backend
npm install && cp .env.example .env   # Configura tus credenciales
npm run dev                           # Servidor corriendo en :8080
```

### Variables de Entorno Requeridas (`.env`)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/Valnor?retryWrites=true&w=majority
JWT_SECRET=tu-secreto-super-seguro
PORT=8080
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:4200
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM=noreply@valgame.com
```

### Health Check

```bash
curl http://localhost:8080/health   # → {"ok": true}
```

---

## 🏗️ Arquitectura

```
src/
├── config/          # Conexión a DB, mailer, JWT
├── models/          # Esquemas Mongoose (User, UserCharacter, Item, etc.)
├── controllers/     # Lógica de API y orquestación
├── services/        # Reglas de negocio puras (combat, marketplace, survival, etc.)
├── routes/          # Definición de endpoints REST
├── middlewares/     # Auth JWT, rate limiting, validación
├── validations/     # Schemas Zod para input validation
├── types/           # Extensiones de TypeScript (express.d.ts)
└── utils/           # Errores custom, helpers
```

### Decisiones Clave

- **Personajes desacoplados:** Los personajes del usuario viven en su propia colección `UserCharacter` (no embebidos en `User`), evitando el límite de 16MB de MongoDB y mejorando la escalabilidad.
- **Transacciones atómicas:** Marketplace, paquetes y evoluciones usan sesiones de MongoDB para evitar estados inconsistentes.
- **Cron Jobs:** Permadeath automático cada hora y expiración de listings cada 5 minutos.
- **DNS:** Se fuerzan los DNS de Google (`8.8.8.8`) para resolver registros SRV de MongoDB Atlas en redes que bloquean SRV.

---

## 🔑 Endpoints Principales

### Autenticación (`/auth`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registro con email |
| POST | `/auth/login` | Login → JWT en cookie httpOnly |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/auth/verify/:token` | Verificar email |
| POST | `/auth/forgot-password` | Solicitar recuperación |
| POST | `/auth/reset-password/:token` | Resetear contraseña |

### Usuarios (`/api/users`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users/me` | Perfil completo del usuario |
| GET | `/api/users/dashboard` | Dashboard resumido |
| GET | `/api/users/resources` | Solo recursos (ligero) |
| GET | `/api/users/profile/:userId` | Perfil público |
| PUT | `/api/users/tutorial/complete` | Marcar tutorial como completado |

### Personajes (`/api/characters` y `/api/user-characters`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/user-characters` | Mis personajes |
| POST | `/api/characters/heal` | Curar personaje (VAL) |
| POST | `/api/characters/revive` | Revivir personaje (VAL) |
| POST | `/api/characters/evolve` | Evolucionar personaje (EVO) |

### Combate y Progresión

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dungeons` | Mazmorras disponibles |
| POST | `/api/dungeons/:id/enter` | Entrar a mazmorra |
| POST | `/api/survival/start` | Iniciar modo survival |
| POST | `/api/combat/attack` | Ejecutar ataque |

### Marketplace (`/api/marketplace`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/marketplace` | Listar items (filtros avanzados) |
| POST | `/api/marketplace/list` | Publicar item a la venta |
| POST | `/api/marketplace/buy/:id` | Comprar item |
| DELETE | `/api/marketplace/cancel/:id` | Cancelar listing |

### Economía

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/packages` | Paquetes disponibles |
| POST | `/api/packages/:id/open` | Abrir paquete |
| POST | `/api/shop/buy-evo` | Comprar EVO con VAL |
| POST | `/api/shop/buy-boletos` | Comprar boletos con VAL |

### Social y Rankings

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/rankings` | Ranking global |
| GET | `/api/rankings/me` | Mi posición |
| GET | `/api/notifications` | Mis notificaciones |
| GET | `/api/player-stats` | Estadísticas del jugador |
| GET | `/api/game-settings` | Configuración del juego |

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Runtime | Node.js 22.16.0 |
| Framework | Express 5.1.0 |
| Lenguaje | TypeScript 5.9.3 |
| Base de Datos | MongoDB 8.0 (Atlas) |
| ODM | Mongoose 8.20.0 |
| Auth | JWT + bcrypt + cookies httpOnly |
| Validación | Zod 4.1.11 |
| WebSocket | Socket.IO 4.8.1 |
| Cron | node-cron |
| Testing | Jest + Supertest |

---

## 💾 Modelos de Datos

### Colecciones Principales

| Modelo | Colección | Descripción |
|--------|-----------|-------------|
| `User` | `users` | Cuenta del jugador (recursos, inventario, configuración) |
| `UserCharacter` | `usercharacters` | Personajes del usuario (stats, nivel, equipo) |
| `BaseCharacter` | `basecharacters` | Plantillas base de personajes |
| `Item` | `items` | Catálogo de items (equipo, consumibles) |
| `Team` | `teams` | Equipos de personajes |
| `Dungeon` | `dungeons` | Definición de mazmorras |
| `Listing` | `listings` | Items en el marketplace |
| `GameSetting` | `game_settings` | Configuración global del juego (1 doc) |

### Colecciones de Historial

| Modelo | Colección | Descripción |
|--------|-----------|-------------|
| `Purchase` | `purchases` | Compras con pasarelas externas (Fiat/Crypto) |
| `PurchaseTransaction` | `purchase_transactions` | Compras internas (tienda del juego) |
| `PurchaseLog` | `purchase_logs` | Auditoría de apertura de paquetes |
| `MarketplaceTransaction` | `marketplace_transactions` | Historial del marketplace |
| `SurvivalSession` | `survivalsessions` | Sesiones de survival activas |
| `SurvivalRun` | `survivalruns` | Historial de runs completados |

---

## 🎮 Sistemas del Juego

### Progresión de Personajes
- **Rangos:** D → C → B → A → S → SS → SSS
- **Niveles:** 1–100 (max configurable en `game_settings`)
- **Evolución:** Requiere cristales EVO, boost masivo de stats
- **Permadeath:** Personajes heridos 24h sin curar son eliminados automáticamente

### Economía
- **VAL:** Moneda principal (combate, marketplace, tienda)
- **Boletos:** Para abrir paquetes gacha
- **EVO:** Para evolucionar personajes
- **Energía:** Se regenera con el tiempo, necesaria para mazmorras

### Configuración (`game_settings`)
Toda la economía del juego se controla desde un único documento en MongoDB:

| Parámetro | Valor por defecto | Descripción |
|-----------|-------------------|-------------|
| `nivel_maximo_personaje` | 100 | Nivel máximo |
| `costo_revivir_personaje` | 50 VAL | Costo de resurrección |
| `costo_ticket_en_val` | 50 VAL | Precio de boletos |
| `costo_evo_por_val` | 100 VAL | Tasa de cambio VAL→EVO |
| `PERMADEATH_TIMER_HOURS` | 24 | Horas antes de muerte permanente |
| `EXP_GLOBAL_MULTIPLIER` | 1 | Multiplicador global de XP |
| `MAX_PERSONAJES_POR_EQUIPO` | 9 | Máximo de personajes por equipo |
| `aumento_stats_por_nivel` | Map D→SSS | Stats ganadas al subir nivel |
| `exp_req_multiplier_por_rango` | Map D→SSS | Dificultad de XP por rango |
| `exp_gain_multiplier_por_rango` | Map D→SSS | Ganancia de XP por rango |
| `reward_val_multiplier_por_rango` | Map D→SSS | Recompensa VAL por rango |
| `drop_rate_boost_por_rango` | Map D→SSS | Boost de drops por rango |

---

## 🔐 Seguridad

- **JWT** en cookies httpOnly (7 días de expiración)
- **bcrypt** para hashing de contraseñas
- **Helmet** para headers HTTP seguros
- **Rate Limiting** por endpoint
- **Zod** para validación estricta de inputs
- **Transacciones atómicas** en operaciones de dinero

---

## 📋 Comandos

```bash
# Desarrollo
npm run dev              # Servidor con hot-reload (ts-node-dev)
npm run build            # Compilar TypeScript → dist/
npm start                # Ejecutar build de producción

# Base de Datos
npm run seed             # Poblar datos iniciales
npm run init-db          # Inicializar colecciones
npm run create-indexes   # Crear índices de rendimiento

# Testing
npm test                 # Test maestro E2E
npm run test:e2e         # Todos los tests E2E
npm run test:unit        # Tests unitarios

# Calidad
npm run lint             # ESLint check
npm run validate         # Lint + Build + Test
```

---

## 🚀 Producción

**Hosting:** Render.com  
**URL:** `https://valgame-backend.onrender.com`

```bash
# Validar antes de deploy
npm run validate

# El deploy es automático vía Render.com
```

> **Nota para frontend:** Todas las peticiones deben incluir `credentials: 'include'` (fetch) o `withCredentials: true` (axios) para que las cookies httpOnly funcionen.

---

## 📂 Estructura de Carpetas

```
valgame-backend/
├── src/                    # Código fuente TypeScript
│   ├── app.ts              # Punto de entrada
│   ├── config/             # DB, mailer, JWT
│   ├── models/             # Esquemas Mongoose
│   ├── controllers/        # Lógica de endpoints
│   ├── services/           # Lógica de negocio
│   ├── routes/             # Definición de rutas
│   ├── middlewares/        # Auth, rate limit
│   ├── validations/        # Schemas Zod
│   ├── types/              # Tipado TypeScript
│   └── utils/              # Helpers
├── tests/                  # E2E, unit, security
├── scripts/                # Utilidades y mantenimiento
├── docs/                   # Documentación detallada
├── FRONTEND_STARTER_KIT/   # Guías para integración frontend
├── .env.example            # Ejemplo de configuración
├── tsconfig.json           # Config TypeScript
└── package.json            # Dependencias
```

---

**Repositorio:** [exploradoresvalnor-collab/valgame-backend](https://github.com/exploradoresvalnor-collab/valgame-backend)  
**Licencia:** ISC
