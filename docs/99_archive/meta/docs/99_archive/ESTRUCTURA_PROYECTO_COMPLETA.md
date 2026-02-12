# 🗂️ ESTRUCTURA DEL PROYECTO - VALGAME BACKEND v2.0

**Scope**: Análisis completo de arquitectura y organización de archivos  
**Enfoque**: Modo Survival (nueva feature)

---

## 📁 ÁRBOL DE DIRECTORIOS

```
valgame-backend/
├── src/
│   ├── app.ts                          # Express app principal ✅
│   ├── app.backup.ts                   # Backup (ignore)
│   ├── app.minimal.ts                  # Versión minimal (ignore)
│   │
│   ├── config/
│   │   ├── db.ts                       # MongoDB connection ✅
│   │   ├── mailer.ts                   # Email config ✅
│   │   └── security.ts                 # Security validation ✅
│   │
│   ├── models/
│   │   ├── User.ts                     # Usuario (modificado) ✅
│   │   ├── BaseCharacter.ts            # Personaje base
│   │   ├── Category.ts                 # Categoría de items
│   │   ├── Consumable.ts               # Item consumible
│   │   ├── Equipment.ts                # Item equipo
│   │   ├── Item.ts                     # Item genérico
│   │   ├── Event.ts                    # Evento del juego
│   │   ├── GameSetting.ts              # Configuración global
│   │   ├── LevelHistory.ts             # Histórico de levels
│   │   ├── LevelRequirement.ts         # Req. de level
│   │   ├── Listing.ts                  # Marketplace listing
│   │   ├── MarketplaceTransaction.ts   # Transacción marketplace
│   │   ├── Notification.ts             # Notificación del usuario
│   │   ├── Offer.ts                    # Oferta P2P
│   │   ├── Package.ts                  # Paquete de compra
│   │   ├── Purchase.ts                 # Compra de jugador
│   │   ├── PurchaseLog.ts              # Histórico de compras
│   │   ├── Ranking.ts                  # Ranking general
│   │   ├── UserPackage.ts              # Paquete del usuario
│   │   ├── UserSettings.ts             # Configuración del usuario
│   │   ├── TokenBlacklist.ts           # Token invalidado
│   │   ├── userCharacter.ts            # Personaje del usuario
│   │   │
│   │   ├── chat/
│   │   │   └── ChatMessage.ts          # Mensaje de chat
│   │   │
│   │   ├── teams/
│   │   │   ├── Team.ts                 # Equipo de jugadores
│   │   │   └── TeamInvite.ts           # Invitación a equipo
│   │   │
│   │   └── 🆕 SURVIVAL MODELS:
│   │       ├── SurvivalSession.ts      # Sesión activa ⚠️
│   │       ├── SurvivalRun.ts          # Histórico de run ⚠️
│   │       ├── SurvivalLeaderboard.ts  # Ranking global ✅
│   │       └── SurvivalScenario.ts     # Escenario/hitos ✅
│   │
│   ├── services/
│   │   ├── character.service.ts        # Lógica de personajes
│   │   ├── chat.service.ts             # Lógica de chat
│   │   ├── combat.service.ts           # Lógica de combate
│   │   ├── energy.service.ts           # Gestión de energía
│   │   ├── marketplace.service.ts      # Transacciones marketplace (31KB!)
│   │   ├── marketplace-expiration.service.ts # Expiración listings
│   │   ├── onboarding.service.ts       # Flujo onboarding
│   │   ├── payment.service.ts          # Pagos (Stripe/Blockchain)
│   │   ├── permadeath.service.ts       # Sistema permadeath
│   │   ├── realtime.service.ts         # WebSocket events
│   │   │
│   │   └── 🆕 SURVIVAL SERVICES:
│   │       ├── survival.service.ts      # Lógica principal (545 líneas) ⚠️
│   │       └── survivalMilestones.service.ts # Recompensas (107 líneas) ✅
│   │
│   ├── controllers/
│   │   ├── characters.controller.ts    # Manejo rutas /characters
│   │   ├── equipment.controller.ts     # Manejo rutas /equipment
│   │   ├── rankings.controller.ts      # Manejo rutas /rankings
│   │   ├── shop.controller.ts          # Manejo rutas /shop
│   │   ├── dungeons.controller.ts      # Manejo rutas /dungeons
│   │   │
│   │   ├── chat/
│   │   │   └── chat.controller.ts      # Manejo chat
│   │   │
│   │   ├── teams/
│   │   │   └── teams.controller.ts     # Manejo teams
│   │   │
│   │   └── user-characters/
│   │       └── userCharacters.controller.ts # Manejo user chars
│   │
│   ├── routes/
│   │   ├── auth.routes.ts              # Auth endpoints (17.9KB) ✅
│   │   ├── auth.routes.simple.ts       # Auth simplificado (backup)
│   │   ├── users.routes.ts             # User endpoints (16KB) ✅
│   │   ├── characters.routes.ts        # Character endpoints ✅
│   │   ├── marketplace.routes.ts       # Marketplace P2P ✅
│   │   ├── marketplaceTransactions.routes.ts # Transacciones ✅
│   │   ├── dungeons.routes.ts          # Dungeon endpoints ✅
│   │   ├── shop.routes.ts              # Shop endpoints ✅
│   │   ├── rankings.routes.ts          # Rankings endpoints ✅
│   │   ├── notifications.routes.ts     # Notificaciones ✅
│   │   ├── payments.routes.ts          # Pagos ✅
│   │   ├── userPackages.routes.ts      # Paquetes usuario (14KB) ✅
│   │   ├── userSettings.routes.ts      # Configuración usuario ✅
│   │   ├── gameSettings.routes.ts      # Config global ✅
│   │   ├── chat.routes.ts              # Chat WebSocket ✅
│   │   ├── equipment.routes.ts         # Equipment endpoints ✅
│   │   ├── consumables.routes.ts       # Consumible endpoints ✅
│   │   ├── items.routes.ts             # Item endpoints ✅
│   │   ├── baseCharacters.routes.ts    # Base char endpoints ✅
│   │   ├── categories.routes.ts        # Category endpoints ✅
│   │   ├── levelRequirements.routes.ts # Level requirements ✅
│   │   ├── packages.routes.ts          # Packages endpoints ✅
│   │   ├── offers.routes.ts            # Offers endpoints ✅
│   │   ├── playerStats.routes.ts       # Player stats ✅
│   │   ├── events.routes.ts            # Events endpoints ✅
│   │   │
│   │   ├── teams/
│   │   │   └── teams.routes.ts         # Team endpoints ✅
│   │   │
│   │   ├── user-characters.routes.ts   # User char endpoints ✅
│   │   │
│   │   └── 🆕 SURVIVAL ROUTES:
│   │       └── survival.routes.ts      # 12 endpoints (580 líneas) ⚠️
│   │
│   ├── middlewares/
│   │   ├── auth.ts                     # JWT authentication ✅
│   │   ├── errorHandler.ts             # Error handling ✅
│   │   ├── rateLimits.ts               # Rate limiting ✅
│   │   └── validate.ts                 # Zod validation ✅
│   │
│   ├── validations/
│   │   ├── character.schemas.ts        # Zod schemas for characters
│   │   ├── marketplace.validations.ts  # Zod schemas for marketplace
│   │   └── ... (más schemas)
│   │
│   ├── types/
│   │   └── (TypeScript types si existen)
│   │
│   ├── utils/
│   │   └── (Helper functions)
│   │
│   ├── seed.ts                         # Base de datos seed ✅
│   │
│   └── scripts/
│       ├── init-db.ts                  # Inicializar BD
│       ├── setup-marketplace.ts        # Setup marketplace
│       ├── migrate-collections.ts      # Migraciones
│       ├── create-purchase-index.js    # Crear índices
│       ├── diagnose-onboarding-flow.ts # Debug onboarding
│       └── ... (más scripts)
│
├── tests/
│   ├── e2e/
│   │   ├── master-complete-flow.e2e.test.ts  # Flujo completo
│   │   ├── auth.e2e.test.ts            # Auth tests
│   │   ├── complete-game-validation.e2e.test.ts
│   │   ├── consumables.e2e.test.ts     # Consumible tests
│   │   ├── ... (más tests e2e)
│   │   └── archived_tests/
│   │       ├── full-system.e2e.test.ts
│   │       ├── marketplace_full.e2e.test.ts
│   │       └── ... (tests deprecated)
│   │
│   ├── unit/
│   │   ├── auth.unit.test.ts
│   │   ├── ... (más unit tests)
│   │   └── (FALTA: tests para survival)
│   │
│   ├── api/
│   │   ├── test-api.http              # REST client tests
│   │   ├── test-auth-recovery.http
│   │   ├── test-ranking-completo.http
│   │   └── ... (más tests HTTP)
│   │
│   ├── security/
│   │   └── (Security tests)
│   │
│   ├── websocket/
│   │   └── (WebSocket tests)
│   │
│   └── flujo-completo-juego.test.js   # Test JavaScript
│
├── docs/
│   ├── architectura/
│   │   └── (Decisiones arquitectónicas)
│   ├── guias/
│   │   ├── setup.md
│   │   ├── security-rotation.md
│   │   └── ...
│   ├── planificacion/
│   │   ├── ROADMAP.md
│   │   └── ...
│   └── reportes/
│       └── (Status reports)
│
├── 📄 CONFIGURACIÓN:
│   ├── .env                            # Variables de entorno (local)
│   ├── .env.example                    # Plantilla .env
│   ├── .eslintrc                       # ESLint config
│   ├── .gitignore                      # Git ignore
│   ├── eslint.config.js                # ESLint nuevo config
│   ├── jest.config.cjs                 # Jest config
│   ├── tsconfig.json                   # TypeScript config ✅
│   ├── package.json                    # Dependencies ✅
│   ├── package-lock.json               # Lock file
│   │
│   └── 📄 ARCHIVOS NUEVOS (ANÁLISIS):
│       ├── ANALISIS_SURVIVAL_COMPLETO.md  # Análisis detallado
│       ├── FIXES_SURVIVAL_CRITICOS.md     # Soluciones
│       ├── RESUMEN_ANALISIS_EJECUTIVO.md  # Resumen
│       └── QUICK_START_FIXES.md           # Guía rápida
│
├── README.md                           # Documentación principal
├── proxy.conf.json                     # Proxy config
├── WEBHOOKS_DIAGNOSTICO.md             # Diagnóstico webhooks
├── WEBSOCKET_DIAGNOSTICO.md            # Diagnóstico WebSocket
└── ... (más archivos de root)

```

---

## 📊 ESTADÍSTICAS

### Código Survival (Nueva Funcionalidad)
```
Modelos:        4 (SurvivalSession, SurvivalRun, SurvivalLeaderboard, SurvivalScenario)
Servicios:      2 (survival.service.ts, survivalMilestones.service.ts)
Rutas:          1 (survival.routes.ts con 12 endpoints)
Controllers:    0 (lógica directa en rutas)
Total líneas:   ~1,600
```

### Código Total
```
Modelos:        30+
Servicios:      14+
Rutas:          30+
Controllers:    8+
Middlewares:    4
Total líneas:   ~10,000+
```

### Tests
```
E2E tests:      8+
Unit tests:     5+
HTTP tests:     10+
Total tests:    ~25+
Cobertura:      ~60% (estimado, sin report)
```

---

## 🔗 FLUJO DE DATOS

### Inicio de Sesión Survival
```
1. POST /api/survival/start (routes/survival.routes.ts:76)
   ↓
2. ValidationMiddleware (Zod schema)
   ↓
3. AuthMiddleware (JWT verify)
   ↓
4. Controller logic (inline en route)
   ↓
5. survivalService.startSurvival() 
   ↓
6. Crear SurvivalSession (modelo)
   ↓
7. Guardar en MongoDB
   ↓
8. Retornar JSON con sessionId
```

### Finalización de Sesión
```
1. POST /api/survival/:sessionId/end
   ↓
2. Validación (session existe, belong to user)
   ↓
3. survivalService.endSurvival()
   ↓
4. Crear SurvivalRun (histórico)
   ↓
5. SurvivalMilestonesService.applyForRun()
   ↓
6. Aplicar recompensas (EXP, VAL, items)
   ↓
7. Actualizar User
   ↓
8. survivalService.updateLeaderboard()
   ↓
9. Retornar run completo
```

---

## ⚡ ENDPOINTS SURVIVAL

### Activos ✅
```
GET  /api/survival/leaderboard              # Ver ranking
GET  /api/survival/my-stats                 # Ver estadísticas personales
POST /api/survival/exchange-points/exp      # Canjear puntos → EXP
POST /api/survival/exchange-points/val      # Canjear puntos → VAL
POST /api/survival/exchange-points/guaranteed-item  # Canjear → Item
```

### Parcialmente activos ⚠️ (con bugfixes)
```
POST /api/survival/start                    # Iniciar sesión
POST /api/survival/:sessionId/complete-wave # Completar oleada
POST /api/survival/:sessionId/use-consumable # Usar consumible
POST /api/survival/:sessionId/pickup-drop   # Recoger drop
POST /api/survival/:sessionId/end           # Finalizar exitoso
POST /api/survival/:sessionId/report-death  # Reportar muerte
POST /api/survival/:sessionId/abandon       # Abandonar sesión
```

---

## 🔐 SEGURIDAD

### Implementado ✅
- ✅ JWT en todas las rutas survival
- ✅ Validación Zod de inputs
- ✅ Anti-cheat en wave completion (validar número)
- ✅ Ownership check (session.userId === req.userId)
- ✅ Rate limiting en marketplace
- ✅ Helmet para headers HTTP
- ✅ CORS configurado

### Faltante ⚠️
- ⚠️ Validación de ObjectIds en todos lados
- ⚠️ Logging de auditoría
- ⚠️ Tests de seguridad específicos

---

## 📦 DEPENDENCIAS CLAVE

```json
{
  "express": "^5.1.0",           // Framework HTTP
  "mongoose": "^8.20.0",         // ODM MongoDB
  "zod": "^4.1.11",              // Validación de tipos
  "jsonwebtoken": "^9.0.2",      // JWT auth
  "bcryptjs": "^3.0.2",          // Password hashing
  "socket.io": "^4.8.1",         // Real-time
  "node-cron": "^4.2.1",         // Task scheduling
  "helmet": "^7.0.0",            // Security headers
  "cors": "^2.8.5",              // CORS
  "nodemailer": "^7.0.6",        // Email
  "express-rate-limit": "^7.0.0" // Rate limiting
}
```

---

## 🎯 PUNTOS DE ENTRADA

### Aplicación Principal
- **Archivo**: `src/app.ts`
- **Función**: Setup Express, middleware, rutas, BD
- **Survival**: Montado en línea 156

### Servidor
- **Comando**: `npm run dev` (ts-node-dev)
- **Puerto**: 8080 (por defecto)
- **Hot reload**: Sí

### Base de Datos
- **Proveedor**: MongoDB (local o Atlas)
- **Conexión**: `src/config/db.ts`
- **Seed**: `npm run seed`

---

## 🧪 EJECUCIÓN DE TESTS

```bash
# Todo
npm run test

# E2E
npm run test:e2e

# Unitarios
npm run test:unit

# Coverage
npm run test:coverage

# Master flow (más importante)
npm run test:master
```

---

## 📝 CONVENCIONES DE CÓDIGO

### Estructura de Servicios
```typescript
export class MyService {
  async publicMethod(...): Promise<Type> {
    try {
      // lógica
      return result;
    } catch (error: any) {
      throw new Error(`Context: ${error.message}`);
    }
  }
  
  private helperMethod(): void {
    // utilidades
  }
}
```

### Estructura de Rutas
```typescript
router.post(
  '/path',
  auth,
  validationMiddleware(Schema),
  async (req: Request, res: Response) => {
    try {
      const result = await service.method();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

### Validación Zod
```typescript
const MySchema = z.object({
  field: z.string().min(1),
  number: z.number().min(0),
  optional: z.string().optional()
});
```

---

## 🚀 DEPLOYMENT

### Compilación
```bash
npm run build  # TypeScript → JavaScript en /dist
```

### Producción
```bash
npm start  # Ejecuta /dist/app.js
```

### Variables de entorno requeridas
```
MONGODB_URI=...
JWT_SECRET=...
NODE_ENV=production
API_PORT=8080
STRIPE_SECRET_KEY=...
RPC_URL=...
FRONTEND_ORIGIN=...
```

---

## 📌 NOTAS IMPORTANTES

### Survival Mode
- 🆕 Feature completamente nueva
- ⚠️ 2 bugs críticos de type mismatch
- ✅ Bien integrada en arquitectura existente
- 🟡 Necesita tests unitarios
- 🟡 Falta logging de auditoría

### Otros Sistemas
- ✅ Auth robusto (JWT + sesiones)
- ✅ Marketplace con transacciones atómicas
- ✅ Dungeons con progresión por usuario
- ✅ Monetización híbrida (Stripe + Blockchain)
- ✅ Chat real-time (WebSocket)
- ✅ Teams (nuevo, necesita validación)

---

**Última actualización**: 27 de Noviembre, 2025  
**Versión del proyecto**: 2.0.0  
**Estado**: ⚠️ Funcionalmente completo (con bugfixes pendientes)

