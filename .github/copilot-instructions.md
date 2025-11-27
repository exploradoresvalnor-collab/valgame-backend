# AI Agent Instructions - Valgame Backend

## Project Overview
**Valgame** is a full-stack RPG gaming platform (v2.0) with a Node.js/Express backend using TypeScript and MongoDB. The system manages character progression, combat, an P2P marketplace, and hybrid monetization (Web2/Web3).

### Architecture Layers
```
API Routes (src/routes) → Controllers → Services → Models (MongoDB)
       ↓
Validation (Zod schemas) & Middleware (auth, rate-limiting)
       ↓
WebSocket (Socket.IO) for real-time events
```

## Critical Knowledge

### 1. Data Model Hierarchy
**Core Entities** (src/models):
- **User**: Holds `personajes` (Character array), `inventarioEquipamiento`, `inventarioConsumibles`, `valBalance`
- **Character** (embedded in User): `rango`, `nivel`, `etapa`, `stats`, `saludActual`, `experiencia`
- **Item** (base type with discriminators):
  - `Equipment`: Permanent stat bonuses
  - `Consumable`: Limited uses (`usos_maximos`), tracked per-instance in inventory
- **Listing** (Marketplace): Links itemId → sellerId → precio + metadata
- **GameSetting**: Global game balance configs (evolution levels, costs, tax rates)

**Key Pattern**: Consumables use a hybrid approach - metadata in `Consumable` model, per-instance state (`usos_restantes`) in User's `inventarioConsumibles` array.

### 2. Business Logic Flows

#### Character Progression
1. **Level Up**: Gain EXP in combat → `character.experiencia` reaches threshold → triggers level increase
   - File: `src/services/character.service.ts` - handles stat increases per rank
   - Records in `LevelHistory` collection for audit trail
   
2. **Evolution**: Requires level + resources (VAL + EVO tokens)
   - File: `src/routes/characters.routes.ts` → `POST /:characterId/evolve`
   - Atomic transaction: validate prereqs → consume resources → update character
   - Etapas: 1 (base) → 2 (Nivel 40) → 3 (Nivel 100)

#### Marketplace (P2P)
- **Atomic Transactions**: Prevent race conditions during buy/sell
  - File: `src/services/marketplace.service.ts` (31KB - largest service)
  - Buy flow: Reserve listing → validate inventory → transfer item + VAL → cleanup
- **Expiration Cron**: `node-cron` job every 5 min marks stale listings as `expirado`, returns items
- **5% Tax**: Applied on every sale as VAL sink

#### Monetization
- **Web2 (Stripe)**: `POST /api/purchases/initiate-stripe` → webhook verification → accreditation
- **Web3 (Blockchain)**: Listener monitors chain events, verifies signatures with `nonce` system
- File: `src/services/payment.service.ts`

### 3. Code Patterns & Conventions

#### Validation
- **Tool**: Zod schemas in `src/validations/`
- **Pattern**: Define schema, use `zodResolver` in middleware or controllers
  ```typescript
  // Example: src/validations/character.schemas.ts
  export const EvolutionSchema = z.object({
    characterId: z.string().refine(isValidObjectId),
    requirementsMetAt: z.date()
  });
  ```
- **Apply**: Use `validationMiddleware(schema)` before route handlers

#### Service Structure
- Services handle pure business logic (no Express dependencies)
- Return typed objects or throw domain-specific errors
- File naming: `{entity}.service.ts`
- Example: `src/services/character.service.ts` exports `CharacterService` class with methods like `levelUpCharacter()`

#### Controllers
- Entry point for routes, delegates to services
- Format: `handleRequest(req, res) → service call → res.json(result)`
- File pattern: `src/controllers/{entity}.controller.ts`

#### Error Handling
- Custom error class hierarchy (not found in src, but used in controllers)
- Middleware catches and formats errors to `{ error, code, message }`
- Rate-limit responses: 429 status + `X-RateLimit-*` headers

#### Real-time (WebSocket)
- Socket.IO integrated in `src/app.ts`
- JWT authentication on socket connection
- Event handlers emit broadcasts (e.g., marketplace updates)
- File: `src/services/realtime.service.ts` - coordinates socket events

### 4. Developer Workflows

#### Start Development
```bash
npm run dev              # ts-node-dev with auto-reload
npm run check-env      # Validate .env before running
```

#### Database Operations
```bash
npm run seed           # Populate with base data (items, characters, packages)
npm run init-db        # Clean slate initialization
npm run migrate:collections  # Schema migrations
npm run setup-marketplace    # Bootstrap marketplace config
```

#### Testing
```bash
npm run test:master    # Main e2e flow (register → combat → marketplace)
npm run test:e2e       # All e2e tests
npm run test:unit      # Unit tests only
npm run test:coverage  # Coverage report
```

#### Validation Pipeline
```bash
npm run lint           # ESLint check
npm run build          # TypeScript compilation
npm run validate       # lint + build + test (all checks)
```

#### Debugging Tools
```bash
npm run diagnose:onboarding  # Check onboarding flow issues
npm run fix:onboarding       # Auto-fix common onboarding problems
npm run verify:game-settings # Validate GameSetting config
```

### 5. Integration Points

#### API Clients (Frontend/Mobile)
- **Base URL**: Environment variable `API_URL` (default: localhost:8080)
- **Auth**: JWT token in `Authorization: Bearer <token>` header
- **Real-time**: Connect to WebSocket endpoint `/socket.io` with same JWT
- **Rate Limits**: Check `X-RateLimit-Remaining` header; 429 response = back off

#### External Services
- **Stripe**: Webhook validation via `process.env.STRIPE_WEBHOOK_SECRET`
- **Blockchain RPC**: `process.env.RPC_URL` for Web3 purchases
- **Email (Nodemailer)**: SMTP config in `.env` - used for verification + password reset

### 6. File Organization
```
src/
  app.ts               # Express setup, middleware chain
  config/              # Connection strings, env validation
  models/              # Mongoose schemas (Item, User, Character, etc.)
  services/            # Business logic (largest: marketplace.service.ts)
  controllers/         # Route handlers (delegates to services)
  routes/              # Route definitions (groups by entity)
  validations/         # Zod schemas (one per major entity)
  middlewares/         # Auth, validation, error handling
  utils/               # Helpers (non-business logic)
  types/               # TypeScript interfaces (if not in models)

docs/architectura/     # Architectural decisions & frontend blueprint
docs/guias/            # Setup guides, security rotation
docs/planificacion/    # ROADMAP, future tasks
docs/reportes/         # Implementation status, migration logs
```

### 7. Common Tasks & How-Tos

**Add a new character stat**:
1. Update `User.personajes[].stats` schema in `src/models/User.ts`
2. Add calculation in `src/services/character.service.ts` → `calculateStatIncrease()`
3. Add validation in `src/validations/character.schemas.ts`
4. Test with `npm run test:unit` filtering character tests

**Fix marketplace bug**:
1. Start with `src/services/marketplace.service.ts` (search by operation: buy/cancel/list)
2. Trace backwards to controller in `src/controllers/marketplace.controller.ts`
3. Check Zod validation in `src/validations/marketplace.validations.ts`
4. Test with e2e: `npm run test:e2e` + filter to marketplace tests

**Add new endpoint**:
1. Define Zod schema in `src/validations/{entity}.schemas.ts`
2. Create service method in `src/services/{entity}.service.ts`
3. Add controller handler in `src/controllers/{entity}.controller.ts`
4. Register route in `src/routes/{entity}.routes.ts`
5. Apply middleware: `router.post('/path', validationMiddleware(Schema), handler)`

### 8. Environment Variables (Required)
```
MONGODB_URI              # MongoDB connection
JWT_SECRET              # Secret for token signing
NODE_ENV                # development|production|test
API_PORT                # Server port (default 8080)
STRIPE_SECRET_KEY       # Stripe API key
RPC_URL                 # Blockchain RPC endpoint
SMTP_*                  # Email configuration
```

See `.env.example` or docs for full list.

### 9. Testing Strategy
- **Unit**: Individual service methods (e.g., `calculateExp()`)
- **E2E**: Full flows: register → create character → level up → list item → buy
- **Database**: Tests run on MongoDB Memory Server (in-memory during test)
- Test setup: `src/tests/e2e/setup.ts` seeds game data before each test

### 10. Performance Considerations
- **Marketplace**: Uses atomic transactions to prevent double-spending
- **Inventory**: Separate arrays (Equipment vs. Consumables) for query efficiency
- **Caching**: None implemented; Redis optional for future optimization
- **Indexes**: Critical on `User._id`, `Listing.sellerId`, `Listing.estado` (create via `npm run create-indexes`)

---

**Last Updated**: November 24, 2025  
**Maintainers**: Valgame Team  
**For questions**: Reference `docs/` folder for detailed architecture & guides

# Guía para el Frontend - Integración con el Backend

## Rutas y Endpoints

### Chat
- **GET /api/chat/messages**: Obtener mensajes.
  ```json
  {
    "type": "global", // Opcional: "global", "party", "private"
    "limit": 50,       // Opcional: Número máximo de mensajes
    "before": "<id>" // Opcional: ID para paginación
  }
  ```
- **POST /api/chat/global**: Enviar mensaje global.
  ```json
  {
    "content": "Hola a todos!"
  }
  ```

### Equipos (Teams)
- **GET /api/teams**: Obtener equipos del usuario.
- **POST /api/teams**: Crear un nuevo equipo.
  ```json
  {
    "name": "Equipo Alfa",
    "characters": ["charId1", "charId2"]
  }
  ```

### Personajes (User Characters)
- **GET /api/user-characters**: Obtener personajes del usuario.
- **GET /api/user-characters/:id**: Obtener detalles de un personaje.

## Modelos y Esquemas

### ChatMessage
```json
{
  "senderId": "userId",
  "senderName": "Usuario",
  "type": "global",
  "content": "Mensaje",
  "createdAt": "2025-11-24T00:00:00Z"
}
```

### Team
```json
{
  "userId": "userId",
  "name": "Equipo Alfa",
  "characters": ["charId1", "charId2"],
  "isActive": true
}
```

### UserCharacter
```json
{
  "userId": "userId",
  "name": "Héroe",
  "level": 10,
  "stats": {
    "health": 100,
    "attack": 50
  }
}
```

## Validaciones

### Chat
- **Enviar mensaje global**:
  ```json
  {
    "content": "string (1-500 caracteres)"
  }
  ```

### Equipos
- **Crear equipo**:
  ```json
  {
    "name": "string (1-50 caracteres)",
    "characters": ["charId1", "charId2"]
  }
  ```

## Autenticación y Seguridad
- **JWT**: Enviar el token en el header `Authorization: Bearer <token>`.
- **CORS**: El backend permite dominios configurados en `FRONTEND_ORIGIN`.

## Ejemplos Prácticos

### Axios: Obtener mensajes
```javascript
import axios from 'axios';

const fetchMessages = async () => {
  const response = await axios.get('/api/chat/messages', {
    headers: {
      Authorization: `Bearer <token>`
    }
  });
  console.log(response.data);
};
```

### Fetch: Crear equipo
```javascript
const createTeam = async () => {
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer <token>`
    },
    body: JSON.stringify({
      name: 'Equipo Alfa',
      characters: ['charId1', 'charId2']
    })
  });
  const data = await response.json();
  console.log(data);
};
```

---

**Última Actualización**: 24 de noviembre de 2025
