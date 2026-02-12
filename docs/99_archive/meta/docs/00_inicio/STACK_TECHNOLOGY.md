# 🏗️ STACK TECHNOLOGY

**Descripción completa del stack tecnológico de Valgame Backend**

---

## 📊 ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA FRONTEND                           │
│         (React/Vue/Angular - No documentado aquí)           │
└────────────────────────┬────────────────────────────────────┘
                         │
        HTTP REST / WebSocket (Socket.IO)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   CAPA API (Node.js)                        │
├─────────────────────────────────────────────────────────────┤
│ Express.js + TypeScript                                     │
│ - 28 archivos de rutas                                      │
│ - 25+ endpoints HTTP                                        │
│ - WebSocket events (Socket.IO)                              │
│ - Middleware stack (rate-limit, auth, validation)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                    MongoDB Driver
                         │
┌────────────────────────▼────────────────────────────────────┐
│              CAPA DATABASE (MongoDB)                        │
├─────────────────────────────────────────────────────────────┤
│ MongoDB Atlas (Cloud)                                       │
│ - 25+ collections                                           │
│ - Índices optimizados                                       │
│ - Backups automáticos                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 BACKEND STACK

### **Runtime & Framework**
```
Node.js v18+
  └─ Express.js (HTTP server)
     └─ TypeScript (type safety)
```

### **Autenticación & Seguridad**
```
JWT (JSON Web Tokens)
  ├─ Token en headers: Authorization: Bearer <token>
  ├─ HttpOnly Cookies (7-day session)
  ├─ CORS configurado
  └─ Helmet.js (security headers)

Password Hashing
  └─ bcryptjs (10 rounds)
```

### **Validación**
```
Zod Schemas (15+)
  ├─ Input validation
  ├─ Type-safe responses
  └─ Automatic error messages
```

### **Rate Limiting**
```
express-rate-limit (5 tiers)
  ├─ General: 100 req/15min
  ├─ Auth: 5 req/15min
  ├─ Gameplay: 30 req/15min
  ├─ Marketplace: 20 req/15min
  └─ Custom por endpoint
```

### **Real-time Communication**
```
Socket.IO (WebSocket)
  ├─ Live chat messages
  ├─ Marketplace updates
  ├─ Leaderboard changes
  ├─ Notification push
  └─ Game events
```

### **Email Service**
```
Nodemailer (SMTP)
  ├─ Gmail SMTP configuration
  ├─ Account verification
  ├─ Password recovery
  └─ Notifications (opcional)
```

### **Background Jobs**
```
node-cron (Scheduled tasks)
  ├─ Marketplace expiration (5 min)
  ├─ Energy regeneration
  ├─ Daily tasks
  └─ Cleanup jobs
```

---

## 📦 DEPENDENCIAS PRINCIPALES

### **Core**
```json
{
  "express": "^4.18.0",
  "typescript": "^5.0.0",
  "mongodb": "^6.0.0",
  "zod": "^3.22.0"
}
```

### **Middleware**
```json
{
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "cookie-parser": "^1.4.6",
  "express-rate-limit": "^7.0.0",
  "morgan": "^1.10.0"
}
```

### **Autenticación**
```json
{
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3"
}
```

### **Validación & Seguridad**
```json
{
  "zod": "^3.22.0",
  "dotenv": "^16.0.0",
  "validator": "^13.9.0"
}
```

### **Real-time**
```json
{
  "socket.io": "^4.6.0",
  "socket.io-client": "^4.6.0"
}
```

### **Email**
```json
{
  "nodemailer": "^6.9.0"
}
```

### **Background Jobs**
```json
{
  "node-cron": "^3.0.0"
}
```

### **Desarrollo**
```json
{
  "ts-node": "^10.9.0",
  "ts-node-dev": "^2.0.0",
  "eslint": "^8.40.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "jest": "^29.0.0",
  "ts-jest": "^29.0.0"
}
```

---

## 💾 DATABASE STACK

### **MongoDB**
```
Platform: MongoDB Atlas (Cloud)
Connection: Cluster valnor.kspbuki.mongodb.net
Database: valgame
Collections: 25+

Schemas:
├─ User
├─ BaseCharacter
├─ Item (discriminators: Equipment, Consumable)
├─ Listing (Marketplace)
├─ SurvivalSession
├─ SurvivalRun
├─ SurvivalLeaderboard
├─ Dungeon
├─ Combat
├─ PlayerStats
├─ Notification
├─ ChatMessage
├─ Team
├─ Achievement
├─ Ranking
├─ GameSetting
├─ Package
├─ UserPackage
├─ LevelHistory
├─ MarketplaceTransaction
├─ TokenBlacklist
├─ Category
├─ Event
├─ Offer
└─ Y más...
```

### **Conexión**
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
```

### **Índices**
```
Automáticos en:
├─ User._id
├─ Character.userId
├─ Listing.sellerId
├─ Listing.itemId
├─ SurvivalRun.playerId
├─ ChatMessage.createdAt
└─ Y más según queries
```

---

## 🌐 API ENDPOINTS

### **Estructura**
```
Total: 25+ endpoints
Base URL: https://api.valgame.com (production)
         http://localhost:8080 (development)

Auth: 9 endpoints
Users: 12 endpoints
Characters: 10 endpoints
Combat: 4 endpoints
Survival: 12 endpoints ⭐
Marketplace: 8 endpoints
Shop: 4 endpoints
Rankings: 5 endpoints ⭐
Energy: 2 endpoints ⭐
Chat: 3 endpoints ⭐
Notifications: 4 endpoints ⭐
Teams: 3 endpoints ⭐
Otros: 39+ endpoints
```

### **Formato de Respuesta**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2025-12-01T10:30:00Z"
}
```

### **Errores**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Descripción del error",
  "statusCode": 400
}
```

---

## 🔐 SEGURIDAD

### **Capas**
```
1. HTTPS/TLS (Transport)
2. CORS (Origen verificado)
3. Rate Limiting (DDoS protection)
4. JWT Authentication (Verificación)
5. Zod Validation (Input sanitization)
6. Helmet (Security headers)
7. Cookie HttpOnly (CSRF protection)
8. Password Hashing (bcryptjs)
9. MongoDB Injection Protection (mongoose)
10. CORS + CSRF Tokens
```

### **Headers de Seguridad**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: ...
```

### **Rate Limits**
```
General: 100 requests / 15 minutes
Auth: 5 requests / 15 minutes
Gameplay: 30 requests / 15 minutes
Marketplace: 20 requests / 15 minutes
Custom: Por endpoint específico
```

---

## 📊 PERFORMANCE

### **Optimizaciones**
```
✅ Índices MongoDB optimizados
✅ Conexión pooling
✅ Caching en memoria (opcional Redis)
✅ Paginación en endpoints grandes
✅ Select queries (no traer todos los campos)
✅ Lazy loading de relaciones
✅ Async operations no bloqueantes
```

### **Monitoreo**
```
Morgan (HTTP request logging)
Winston (Structured logging)
Sentry (Error tracking) - Opcional
DataDog (APM) - Opcional
```

---

## 🚀 DEPLOYMENT

### **Opciones**
```
AWS:
├─ EC2 (VMs)
├─ ECS (Containers)
├─ Lambda (Serverless)
└─ Elastic Beanstalk (PaaS)

Docker:
├─ Dockerfile
├─ docker-compose.yml
└─ Docker Hub registry

Vercel/Netlify:
└─ For serverless Node.js (experimental)
```

### **CI/CD**
```
GitHub Actions / GitLab CI
├─ Linting (ESLint)
├─ Type checking (TypeScript)
├─ Tests (Jest)
├─ Build
└─ Deploy
```

---

## 🔄 ENVIRONMENTS

### **Development**
```
NODE_ENV=development
API_URL=http://localhost:8080
MONGODB_URI=mongodb+srv://...
DEBUG=true
```

### **Production**
```
NODE_ENV=production
API_URL=https://api.valgame.com
MONGODB_URI=mongodb+srv://... (cluster production)
DEBUG=false
```

---

## 📁 ESTRUCTURA DE CARPETAS

```
src/
├── app.ts                 ← Express configuration
├── config/
│   ├── database.ts
│   ├── environment.ts
│   └── cache.ts
├── models/                ← 25+ Mongoose schemas
│   ├── User.ts
│   ├── Character.ts
│   ├── Item.ts
│   └── ...
├── services/              ← 20+ Business logic
│   ├── AuthService.ts
│   ├── CharacterService.ts
│   ├── MarketplaceService.ts
│   └── ...
├── controllers/           ← Request handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   └── ...
├── routes/                ← 28 Route files
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   └── ...
├── middleware/            ← 8+ Middlewares
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── ...
├── validations/           ← 15+ Zod schemas
│   ├── auth.schemas.ts
│   ├── user.schemas.ts
│   └── ...
├── utils/                 ← Helper functions
├── types/                 ← TypeScript interfaces
└── tests/                 ← Test suites
```

---

## 🧪 TESTING

### **Frameworks**
```
Jest (Unit & Integration)
ts-jest (TypeScript support)
MongoDB Memory Server (Mocking DB)
```

### **Tipos de Tests**
```
Unit Tests: Servicios individuales
Integration Tests: Flujos completos
E2E Tests: Master flow (register → combat → marketplace)
```

---

## 📈 ESCALABILIDAD

### **Actual**
```
✅ Soporta ~1000 usuarios concurrentes
✅ MongoDB Atlas auto-escalable
✅ Load balancing en producción
```

### **Futuro**
```
🔄 Redis para caching
🔄 Message queue (RabbitMQ/AWS SQS)
🔄 Microservicios (separar por dominio)
🔄 GraphQL (complemento a REST)
🔄 gRPC (comunicación inter-servicios)
```

---

## 📊 COMPARATIVA: TECH STACK vs ALTERNATIVAS

| Aspecto | Actual (Valgame) | Alternativa |
|--------|------------------|-------------|
| **Backend** | Express + TypeScript | Fastify, NestJS, Python/Django |
| **Database** | MongoDB | PostgreSQL, DynamoDB |
| **Auth** | JWT + Cookies | OAuth2, Auth0 |
| **Real-time** | Socket.IO | GraphQL Subscriptions, gRPC |
| **Validación** | Zod | Joi, Yup, Valibot |
| **Testing** | Jest | Mocha, Vitest |

---

## ✅ CHECKLIST: AMBIENTE LOCAL

```
□ Node.js v18+
□ npm o yarn
□ MongoDB Community (local) o MongoDB Atlas (cloud)
□ Git
□ VS Code con extensiones TS
□ Postman o Thunder Client (API testing)
□ Terminal bash/zsh/powershell

Comandos iniciales:
npm install
npm run dev
```

---

## 🆘 TROUBLESHOOTING STACK

### **MongoDB no conecta**
→ Verificar `MONGODB_URI` en `.env`

### **JWT inválido**
→ Verificar `JWT_SECRET` y expiración

### **Rate limit alcanzado (429)**
→ Esperar 15 minutos o cambiar header `X-API-Key`

### **WebSocket no conecta**
→ Verificar CORS en `src/app.ts`

---

**Última actualización:** 24 de noviembre, 2025  
**Versión:** 2.1.0  
**Auditoría de código fuente**
