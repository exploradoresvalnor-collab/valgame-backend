# Valgame Backend v2.0

**✅ Documentation 100% Complete** | **135 Endpoints Documented** | **6 New Systems Documented**

---

## 📖 DOCUMENTATION - START HERE

**→ [COMPLETE DOCUMENTATION: `/docs/INDEX.md`](./docs/INDEX.md)**

### Quick Links by Role:
| Role | Link |
|------|------|
| **Backend Developer** | [`Quick Start`](./docs/00_INICIO/QUICK_START.md) + [`Architecture`](./docs/01_BACKEND/01_ARCHITECTURE.md) |
| **Frontend Developer** | [`All 135 Endpoints`](./docs/01_BACKEND/02_ENDPOINTS.md) |
| **DevOps** | [`Deployment Guide`](./docs/04_DEPLOYMENT/DEPLOYMENT.md) |
| **Security** | [`Security Guide`](./docs/03_SECURITY/SECURITY.md) |
| **Database** | [`MongoDB Guide`](./docs/05_DATABASE/DATABASE.md) |

---

## 🎯 What's New (December 1, 2025)

### Documentation Audit Complete ✅
- **135 endpoints** identified and documented (+221% from previous 42)
- **6 new systems** discovered and fully documented (Survival, Rankings, Energy, Chat, Notifications, Teams)
- **100% coverage** achieved (up from 31%)
- **~12,000 lines** of comprehensive documentation

### 6 New Systems Now Documented:
1. **Survival Mode** - 12 endpoints - Wave-based progression
2. **Rankings** - 5 endpoints - Global leaderboards
3. **Energy System** - 2 endpoints - Energy pool mechanics
4. **Chat** - 3 endpoints - Global/Party/Private messaging
5. **Notifications** - 4 endpoints - Real-time notifications
6. **Teams** - 3 endpoints - Party/cooperative gameplay

---

## 📊 System Overview

| Component | Count |
|-----------|-------|
| **Total Endpoints** | 135 |
| **MongoDB Models** | 25+ |
| **Services** | 20+ |
| **Middlewares** | 8+ |
| **Zod Validators** | 15+ |
| **Route Files** | 28 |
| **Backend LOC** | 40,000+ |

---

## 🏗️ Architecture

```
API Routes (28 files) → Controllers → Services → MongoDB Models
         ↓
Validation (Zod) & Middleware (Auth, Rate-Limit, CORS)
         ↓
WebSocket (Socket.IO) for Real-time Events
```

### Core Technologies:
- **Node.js** + **Express** + **TypeScript**
- **MongoDB Atlas** + **Mongoose**
- **JWT** + **httpOnly Cookies** (7-day expiry)
- **Socket.IO** WebSockets
- **Zod** validation schemas
- **Helmet** + **CORS** security
- **Nodemailer** (Gmail SMTP)
- **node-cron** background jobs

---

## 🎮 12 Main Systems

1. **Authentication** (9 endpoints) - JWT, email verification, password recovery
2. **Characters** (12 endpoints) - Progression, stats, evolution, inventory
3. **Combat** (4 endpoints) - PvE battles, XP rewards
4. **Marketplace** (8 endpoints) - P2P trading, 5% tax, atomic transactions
5. **Survival Mode** ⭐ (12 endpoints) - Wave progression, rewards
6. **Rankings** ⭐ (5 endpoints) - Global leaderboards, seasonal tracking
7. **Shop** (4 endpoints) - In-game store, packages
8. **Monetization** (4+ endpoints) - Stripe (Web2) + Blockchain (Web3)
9. **Chat** ⭐ (3 endpoints) - Global/Party/Private messages
10. **Teams** ⭐ (3 endpoints) - Party system, cooperation
11. **Energy System** ⭐ (2 endpoints) - Energy pool mechanics
12. **Notifications** ⭐ (4 endpoints) - Real-time notifications

---

## ⚡ Quick Start (5 minutes)

```bash
# 1. Environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.

# 2. Install dependencies
npm install

# 3. Seed database with initial data
npm run seed

# 4. Start development server
npm run dev

# ✅ Server running at http://localhost:8080
```

**Full setup guide:** [`docs/00_INICIO/QUICK_START.md`](./docs/00_INICIO/QUICK_START.md)

---

## 🧪 Testing

```bash
npm run test:unit        # Unit tests only
npm run test:e2e         # Full flow end-to-end
npm run test:master      # Main e2e flow (register → character → combat → marketplace)
npm run test:coverage    # Coverage report
npm run validate         # lint + build + test (all checks)
```

---

## 📦 Key NPM Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start with hot-reload (ts-node-dev) |
| `npm run build` | TypeScript compilation |
| `npm run seed` | Populate test data |
| `npm run lint` | ESLint check |
| `npm run check-env` | Validate environment variables |
| `npm run create-indexes` | Create MongoDB indexes |
| `npm run diagnose:onboarding` | Check onboarding issues |
| `npm run verify:game-settings` | Validate GameSetting config |

See `package.json` for complete list.

---

## 🔐 Security Features

- **JWT Authentication** with secure httpOnly cookies (7-day expiry)
- **Helmet** security headers
- **CORS** with configurable origins
- **Rate Limiting** (5-tier system: public, auth, gameplay, trading, admin)
- **Zod** schema validation on all inputs
- **bcryptjs** password hashing
- **Nonce system** for blockchain verification
- **Email verification** flow
- **Password recovery** with tokens

**Full security guide:** [`docs/03_SECURITY/SECURITY.md`](./docs/03_SECURITY/SECURITY.md)

---

## 📁 Documentation Structure

```
docs/
├── INDEX.md .......................... Master Navigation
├── 00_INICIO/ ........................ Welcome & Setup
│   ├── README.md ..................... Overview
│   ├── QUICK_START.md ................ 5-min setup
│   └── STACK_TECHNOLOGY.md ........... Tech stack
├── 01_BACKEND/ ....................... Backend Documentation
│   ├── 01_ARCHITECTURE.md ............ System architecture
│   ├── 02_ENDPOINTS.md ............... All 135 endpoints
│   ├── 03_MODELS.md .................. MongoDB schemas (25+)
│   ├── 04_SERVICES.md ................ Business logic (20+)
│   ├── 05_MIDDLEWARE.md .............. Middleware layers
│   ├── 06_VALIDATION.md .............. Zod validators (15+)
│   └── SUBSYSTEMS/ ................... Detailed systems
│       ├── auth.md ................... Authentication
│       ├── survival.md ⭐ ............ Survival Mode NEW
│       ├── rankings.md ⭐ ............ Rankings NEW
│       ├── energy.md ⭐ .............. Energy System NEW
│       ├── chat.md ⭐ ................ Chat NEW
│       ├── notifications.md ⭐ ....... Notifications NEW
│       ├── teams.md ⭐ ............... Teams NEW
│       ├── marketplace.md ............ Marketplace
│       ├── combat.md ................. Combat
│       └── shop.md ................... Shop
├── 02_FRONTEND/ ....................... Frontend Implementation
│   ├── SCREENS.md .................... Game screens
│   ├── MODULES.md .................... Modules & endpoints
│   ├── IMPLEMENTATION_PLAN.md ........ Phase 1/2/3 roadmap
│   └── COMPONENTS/ ................... UI components
├── 03_SECURITY/ ....................... Security Documentation
│   └── SECURITY.md ................... Complete security guide
├── 04_DEPLOYMENT/ ..................... Deployment Documentation
│   └── DEPLOYMENT.md ................. AWS, Docker, CI/CD
├── 05_DATABASE/ ....................... Database Documentation
│   └── DATABASE.md ................... MongoDB optimization
└── 99_REFERENCE/ ...................... Quick References
    ├── ENDPOINTS_QUICK.md ............ Quick endpoint table
    ├── ERRORS.md ..................... HTTP error codes
    ├── GLOSSARY.md ................... Terminology
    └── TROUBLESHOOTING.md ............ Problem solving
```

**→ [Navigate Complete Documentation](./docs/INDEX.md)**

---

## 🌍 Deployment

### Development
```bash
npm run dev
# Local at http://localhost:8080
```

### Production
- **Platform**: AWS (EC2 + RDS for MongoDB Atlas)
- **Container**: Docker (Dockerfile included)
- **CI/CD**: GitHub Actions (build & deploy)
- **Database**: MongoDB Atlas (replicated)

**Deployment guide:** [`docs/04_DEPLOYMENT/DEPLOYMENT.md`](./docs/04_DEPLOYMENT/DEPLOYMENT.md)

---

## 📈 Statistics

**Documentation Coverage:**
- Before: 42 endpoints documented (31% complete)
- After: 135 endpoints documented (100% complete)
- **Improvement: +221% endpoints, +69% coverage**

**Code Size:**
- 40,000+ lines of backend code
- 20+ service files
- 28 route files
- 25+ MongoDB models

---

## 🤝 Contributing

1. Read [`docs/00_INICIO/QUICK_START.md`](./docs/00_INICIO/QUICK_START.md)
2. Follow the architecture in [`docs/01_BACKEND/01_ARCHITECTURE.md`](./docs/01_BACKEND/01_ARCHITECTURE.md)
3. Run tests: `npm run validate`
4. Create a PR with your changes

---

## 📞 Support

- **Documentation**: [`/docs/INDEX.md`](./docs/INDEX.md)
- **Troubleshooting**: [`docs/99_REFERENCE/TROUBLESHOOTING.md`](./docs/99_REFERENCE/TROUBLESHOOTING.md)
- **Errors**: [`docs/99_REFERENCE/ERRORS.md`](./docs/99_REFERENCE/ERRORS.md)

---

**Last Updated:** December 1, 2025  
**Documentation Status:** ✅ 100% Complete (135/135 endpoints)  
**Valgame Backend v2.0**
