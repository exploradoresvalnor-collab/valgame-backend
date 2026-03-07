# ⚡ QUICK START - 5 MINUTOS

**Objetivo**: Entender el backend en 5 minutos.

---

## 1️⃣ El Proyecto (30 seg)

**Valgame** es un RPG multiplayer con:
- Personajes progresivos
- Combate en dungeons
- Sistema de Survival (oleadas)
- Marketplace P2P
- Leaderboards
- Chat & Notificaciones

---

## 2️⃣ Stack (1 min)

```
Frontend (React/Vue)
    ↓ HTTP/WebSocket
Backend (Node.js + Express + TypeScript)
    ↓ Queries
MongoDB (Atlas)
```

**Clave**: 
- API REST + WebSocket
- Autenticación: JWT + httpOnly Cookies
- Validación: Zod schemas
- Real-time: Socket.IO

---

## 3️⃣ Endpoints (2 min)

**~120+ endpoints totales** organizados en categorías:

| Sistema | Endpoints | Archivo |
|---------|-----------|---------|
| Auth | 9 | `01_BACKEND/SUBSYSTEMS/auth.md` |
| Users | 12 | `01_BACKEND/02_ENDPOINTS.md` |
| Characters | 10 | `01_BACKEND/02_ENDPOINTS.md` |
| Combat | 4 | `01_BACKEND/SUBSYSTEMS/combat.md` |
| **Survival** ⭐ | **12** | **`01_BACKEND/SUBSYSTEMS/survival.md`** |
| Marketplace | 8 | `01_BACKEND/SUBSYSTEMS/marketplace.md` |
| Shop | 4 | `01_BACKEND/02_ENDPOINTS.md` |
| **Rankings** ⭐ | **5** | **`01_BACKEND/SUBSYSTEMS/rankings.md`** |
| **Energy** ⭐ | **2** | **`01_BACKEND/SUBSYSTEMS/energy.md`** |
| **Chat** ⭐ | **3** | **`01_BACKEND/SUBSYSTEMS/chat.md`** |
| **Notifications** ⭐ | **4** | **`01_BACKEND/SUBSYSTEMS/notifications.md`** |
| **Teams** ⭐ | **3** | **`01_BACKEND/SUBSYSTEMS/teams.md`** |
| Otros | 35+ | `01_BACKEND/02_ENDPOINTS.md` |

⭐ = Nuevo en esta documentación

---

## 4️⃣ Estructura Backend (1 min)

```
src/
├── app.ts                 ← Configuración Express
├── models/                ← 25+ esquemas MongoDB
├── services/              ← 20+ lógica de negocio
├── controllers/           ← Handlers HTTP
├── routes/                ← 28 archivos de rutas
├── middleware/            ← Auth, validación, rate-limiting
├── validations/           ← 15+ Zod schemas
└── types/                 ← TypeScript interfaces
```

---

## 5️⃣ Flujo Típico (1 min)

**Ejemplo: Jugador hace login**

```
1. Frontend: POST /api/auth/login
   {
     "email": "player@game.com",
     "password": "password123"
   }

2. Backend recibe:
   - Rate limiter: ¿Spam? No ✓
   - Validación: Email válido? Sí ✓
   - Controlador: Buscar usuario
   - Servicio: Verificar contraseña
   - MongoDB: Query Usuario

3. Respuesta:
   {
     "token": "eyJhb...",
     "user": {...},
     "httpOnly Cookie": "session=..."
   }

4. Frontend: Guarda token en localStorage, cookie en navegador
5. Frontend: Todas las próximas requests incluyen JWT
```

---

## 🎯 TU ROL

### Soy **Backend Developer**
→ Lee: `01_BACKEND/01_ARCHITECTURE.md`

### Soy **Frontend Developer**
→ Lee: `02_FRONTEND/IMPLEMENTATION_PLAN.md`

### Soy **DevOps/Infra**
→ Lee: `04_DEPLOYMENT/AWS.md`

### Soy **QA/Tester**
→ Lee: `99_REFERENCE/ENDPOINTS_QUICK.md`

### Tengo un **problema/error**
→ Lee: `99_REFERENCE/TROUBLESHOOTING.md`

---

## 📊 NÚMEROS CLAVE

- **25+ endpoints** (antes: 42)
- **25+ modelos** MongoDB
- **20+ servicios** de lógica
- **8+ middlewares** de seguridad
- **15+ validaciones** Zod
- **5 tiers** de rate-limiting
- **40,000+ líneas** de código

---

## ⚠️ IMPORTANTE

### NUEVA INFORMACIÓN en esta auditoría:

Estos sistemas **EXISTEN** pero NO estaban documentados:

1. **Survival Mode** (12 endpoints) - Sistema de oleadas
2. **Rankings** (5 endpoints) - Leaderboards
3. **Energy** (2 endpoints) - Consumo de energía
4. **Chat** (3 endpoints) - Mensajes globales
5. **Notifications** (4 endpoints) - Alertas
6. **Teams** (3 endpoints) - Equipos cooperativos

**Total NEW**: +34 endpoints que faltaban en la documentación anterior.

---

## 🚀 PRÓXIMO PASO

Según tu rol:

- 🧠 **Entender todo**: Lee `01_BACKEND/01_ARCHITECTURE.md`
- 💻 **Desarrollar frontend**: Lee `02_FRONTEND/IMPLEMENTATION_PLAN.md`
- 🔧 **Desarrollar backend**: Lee `01_BACKEND/04_SERVICES.md`
- 🚀 **Deploy**: Lee `04_DEPLOYMENT/AWS.md`
- 🐛 **Debugar**: Lee `99_REFERENCE/TROUBLESHOOTING.md`

---

**Tiempo invertido**: ⏱️ 5 minutos  
**Entendimiento**: ✅ 80% del proyecto

---

*Valgame Backend v2.2.0 | Actualizado: 7 mar 2026*
