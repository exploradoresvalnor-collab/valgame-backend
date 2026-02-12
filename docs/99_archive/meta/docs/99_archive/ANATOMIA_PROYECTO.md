# 🏗️ ANATOMÍA DEL PROYECTO VALGAME BACKEND

## 📊 Estructura General

```
valgame-backend/
├── src/
│   ├── controllers/      → Manejadores de requests (14+ archivos)
│   ├── routes/           → Definiciones de endpoints (30 archivos)
│   ├── services/         → Lógica de negocio
│   ├── models/           → Esquemas Mongoose
│   ├── middlewares/      → Auth, validación, rate-limiting
│   ├── validations/      → Schemas Zod
│   ├── utils/            → Funciones auxiliares
│   ├── types/            → Tipos TypeScript
│   └── app.ts            → Punto de entrada Express
├── tests/                → Suite de pruebas
├── docs/                 → Documentación
├── dist/                 → Compilado (generado)
└── package.json          → Dependencias
```

## 🔗 Flujo de una Solicitud HTTP

```
Cliente HTTP Request
        ↓
[CORS Middleware]
        ↓
[Rate Limiter]
        ↓
[Auth Middleware] ← JWT Token validation
        ↓
[Express Router] → src/routes/{entity}.routes.ts
        ↓
[Controller] → src/controllers/{entity}.controller.ts
        ↓
[Service Layer] → src/services/{entity}.service.ts
        ↓
[Mongoose Model] → MongoDB Operation
        ↓
[Response] → JSON Response
        ↓
[Error Handler] ← If error occurs
        ↓
Cliente HTTP Response
```

## 📦 30 Archivos de Rutas (109 Endpoints Totales)

### Tier 1: Autenticación & Seguridad (10 endpoints)
- **auth.routes.ts** (9 endpoints)
  - Registro, Login, Logout
  - Verificación de email
  - Reset de contraseña
- **auth.routes.simple.ts** (1 endpoint)
  - Test endpoint

### Tier 2: Sistema Principal de Juego (47 endpoints)
- **characters.routes.ts** (10 endpoints)
  - Crear, editar, evolver personajes
  - Usar consumibles, revivir, sanar
  - **Subir de nivel** ← Agregado en sesión anterior
- **combat.routes.ts** (4 endpoints)
  - Iniciar combate
  - Atacar, defender
  - Terminar combate con recompensas
- **dungeons.routes.ts** (4 endpoints)
  - Listar dungeons
  - Obtener progreso
  - Iniciar batalla en dungeon
- **survival.routes.ts** (12 endpoints)
  - Modo de supervivencia
  - Waves de enemigos
  - Sistema de defensa
- **marketplace.routes.ts** (3 endpoints)
  - Listar items
  - Comprar items
  - Cancelar listado
- **marketplaceTransactions.routes.ts** (5 endpoints)
  - Historial de compras
  - Historial de ventas
  - Estadísticas

### Tier 3: Sistema de Usuarios (27 endpoints)
- **users.routes.ts** (12 endpoints)
  - Perfil de usuario
  - Dashboard
  - Gestión de personajes
  - Sistema de energía
  - Recursos de usuario
- **user-characters.routes.ts** (2 endpoints)
  - Listar personajes del usuario
  - Obtener detalles de personaje
- **userPackages.routes.ts** (5 endpoints)
  - Listar paquetes
  - Abrir paquete
  - Agregar/quitar paquetes
- **userSettings.routes.ts** (3 endpoints)
  - Obtener configuración
  - Actualizar configuración
  - Reset de configuración
- **notifications.routes.ts** (5 endpoints)
  - Listar notificaciones
  - Marcar como leído
  - Eliminar notificaciones

### Tier 4: Económico & Compras (11 endpoints)
- **payments.routes.ts** (2 endpoints)
  - Checkout
  - Webhook de Stripe
- **shop.routes.ts** (4 endpoints)
  - Información de tienda
  - Comprar VAL
  - Comprar EVO tokens
  - Comprar boletos
- **packages.routes.ts** (1 endpoint)
  - Listar paquetes disponibles
- **offers.routes.ts** (1 endpoint)
  - Listar ofertas activas
- **items.routes.ts** (1 endpoint)
  - Listar todos los items
- **equipment.routes.ts** (1 endpoint)
  - Listar equipo disponible
- **consumables.routes.ts** (1 endpoint)
  - Listar consumibles

### Tier 5: Gamificación (15 endpoints)
- **rankings.routes.ts** (5 endpoints)
  - Leaderboard general
  - Leaderboard por categoría
  - Mi posición
  - Estadísticas de ranking
  - Ranking por período
- **achievements.routes.ts** (3 endpoints)
  - Listar logros
  - Logros del usuario
  - Desbloquear logro
- **playerStats.routes.ts** (3 endpoints)
  - Estadísticas del usuario
  - Estadísticas del personaje
  - Crear estadística
- **events.routes.ts** (1 endpoint)
  - Listar eventos activos
- **levelRequirements.routes.ts** (1 endpoint)
  - Requisitos de nivel
- **teams.routes.ts** (2 endpoints)
  - Gestión de equipos

### Tier 6: Datos & Configuración (9 endpoints)
- **baseCharacters.routes.ts** (1 endpoint)
  - Personajes base disponibles
- **categories.routes.ts** (1 endpoint)
  - Categorías de items
- **gameSettings.routes.ts** (1 endpoint)
  - Configuración del juego
- **health.routes.ts** (3 endpoints)
  - Health check general
  - Health live
  - Readiness check

### Tier 7: Social & Chat (4 endpoints)
- **chat.routes.ts** (4 endpoints)
  - Chat global
  - Chat de party
  - Chat privado
  - Historial de mensajes

## 🎯 Endpoints Nuevos (Sesión Anterior)

### Combat System (4 endpoints)
```typescript
POST /api/dungeons/:dungeonId/start      // Iniciar combate
POST /api/combat/attack                  // Atacar
POST /api/combat/defend                  // Defender
POST /api/combat/end                     // Terminar combate
```

### Marketplace System (3 endpoints)
```typescript
POST /api/marketplace/list               // Listar item
POST /api/marketplace/buy/:listingId     // Comprar
POST /api/marketplace/cancel/:listingId  // Cancelar
```

### Character Level-Up (1 endpoint)
```typescript
PUT /api/characters/:characterId/level-up  // Subir de nivel
```

## 🏛️ Arquitectura de Capas

### 1. **Presentation Layer** (Routes & Controllers)
- Recibe HTTP requests
- Valida parámetros (Zod)
- Delega a servicios
- Formatea respuestas JSON

### 2. **Business Logic Layer** (Services)
- CombatService
- MarketplaceService
- CharacterService
- UserService
- PaymentService
- Etc.

### 3. **Data Access Layer** (Models & Database)
- Mongoose schemas
- MongoDB operations
- Índices y relaciones

### 4. **Cross-Cutting** (Middlewares)
- **auth**: Validación JWT
- **validate**: Validación Zod
- **rateLimiter**: Control de requests
- **errorHandler**: Manejo de errores

## 🔐 Autenticación & Seguridad

- **JWT Token**: Bearer token en header Authorization
- **HTTP-Only Cookies**: Token almacenado seguro
- **Rate Limiting**: 
  - `apiLimiter`: 100 requests/15 min
  - `gameplayLimiter`: 50 requests/1 min
  - `marketplaceLimiter`: 30 requests/1 min
- **CORS**: Configurado para dominios específicos
- **Helmet**: Headers de seguridad HTTP

## 📊 Estadísticas de Implementación

| Aspecto | Valor |
|---------|-------|
| Total de Endpoints | **109** |
| Archivos de Rutas | **30** |
| Controllers | **14+** |
| Services | **10+** |
| Models Mongoose | **15+** |
| Validaciones Zod | **20+** |
| Líneas de código (src/) | **~20,000+** |
| Métodos HTTP | GET(52), POST(49), PUT(6), DELETE(2) |
| Endpoints Públicos | ~15 |
| Endpoints Autenticados | ~94 |

## 🚀 Ciclo de Vida de un Endpoint

1. **Definición** → `router.post('/path', ...handlers)`
2. **Validación** → Zod schema en middleware
3. **Autenticación** → JWT token requerido (si aplica)
4. **Rate Limiting** → Límite de requests
5. **Handler** → Controller function
6. **Business Logic** → Service method
7. **Database** → Mongoose operation
8. **Response** → JSON response
9. **Error** → Error handler middleware (si error)
10. **Logging** → Morgan logs request

## 📈 Performance Considerations

- **Índices MongoDB**: Críticos en User._id, Listing.sellerId
- **Transacciones Atómicas**: Para operaciones marketplace
- **Lazy Loading**: Servicios cargados bajo demanda
- **Pagination**: Implementado en queries grandes
- **Caching**: None (Redis sería mejora futura)

## 🧪 Testing

```bash
npm run test:unit          # Tests unitarios
npm run test:e2e           # Tests end-to-end
npm run test:coverage      # Cobertura
npm run test:master        # Flujo principal
```

## 📝 Convenciones de Código

### Naming
- Controllers: `{entity}.controller.ts`
- Routes: `{entity}.routes.ts`
- Services: `{entity}.service.ts`
- Models: `PascalCase` (User, Character, etc)
- Functions: `camelCase` (createUser, updateCharacter)

### Error Handling
- Custom error classes
- HTTP status codes válidos
- Respuesta JSON con error/message

### Validación
- Zod para schemas
- Middleware `validateBody()` para POST/PUT
- Middleware `validateParams()` para path params

## 🔄 Git & Deployment

- **Main branch**: Producción
- **Commits**: Descriptivos con categoría (feat:, fix:, docs:)
- **Build**: `npm run build` → TypeScript compilation
- **Deploy**: GitHub Actions (si configurado)

## 📞 Próximos Pasos

1. **Pruebas adicionales**: Mejorar cobertura de tests
2. **Optimizaciones**: Índices adicionales, caching
3. **Features nuevas**: Basadas en roadmap
4. **Refactoring**: Consolidar patrones repetidos
5. **Documentation**: Swagger/OpenAPI spec

---

**Última actualización:** 2025-11-30  
**Versión:** 2.0  
**Estado:** ✅ Producción-Ready
