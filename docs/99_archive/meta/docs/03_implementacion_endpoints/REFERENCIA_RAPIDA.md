# 🎯 REFERENCIA RÁPIDA - IMPLEMENTACIÓN

Imprime esto o guárdalo en tu segundo monitor.

---

## ENDPOINTS POR IMPLEMENTAR

```
┌─────────────────────────────────────────────────────────┐
│ ENDPOINT 1: GET /api/dungeons/:id                       │
├─────────────────────────────────────────────────────────┤
│ ⏱️  Tiempo: 15 min                                       │
│ 🔴 Prioridad: Crítica                                   │
│ 📁 Backend: src/controllers/dungeons.controller.ts      │
│             src/routes/dungeons.routes.ts               │
│ 📁 Frontend: See 01_GET_dungeons_id.md                  │
│ 🧪 CURL: curl -H "Authorization: Bearer TOKEN" \        │
│         http://localhost:8080/api/dungeons/DUNGEONID    │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│ ENDPOINT 2: GET /api/user/profile/:userId               │
├─────────────────────────────────────────────────────────┤
│ ⏱️  Tiempo: 15 min                                       │
│ 🔴 Prioridad: Crítica                                   │
│ 📁 Backend: src/controllers/users.controller.ts         │
│             src/routes/users.routes.ts                  │
│ 📁 Frontend: See 02_GET_user_profile.md                 │
│ 🧪 CURL: curl -H "Authorization: Bearer TOKEN" \        │
│         http://localhost:8080/api/user/profile/USERID   │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│ ENDPOINT 3: GET /api/achievements                       │
├─────────────────────────────────────────────────────────┤
│ ⏱️  Tiempo: 20 min                                       │
│ 🟡 Prioridad: Importante                                │
│ 📁 Backend: src/controllers/achievements.controller.ts  │
│             src/routes/achievements.routes.ts           │
│ 📁 Models: src/models/Achievement.ts (crear)            │
│ 📁 Frontend: See 03_GET_achievements.md                 │
│ 🧪 CURL: curl -H "Authorization: Bearer TOKEN" \        │
│         http://localhost:8080/api/achievements          │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│ ENDPOINT 4: GET /api/achievements/:userId               │
├─────────────────────────────────────────────────────────┤
│ ⏱️  Tiempo: 20 min                                       │
│ 🟡 Prioridad: Importante                                │
│ 📁 Backend: src/controllers/achievements.controller.ts  │
│             src/routes/achievements.routes.ts           │
│ 📁 Models: src/models/UserAchievement.ts (crear)        │
│ 📁 Frontend: See 04_GET_achievements_userId.md          │
│ 🧪 CURL: curl -H "Authorization: Bearer TOKEN" \        │
│         http://localhost:8080/api/achievements/USERID   │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│ ENDPOINT 5: GET /api/rankings/leaderboard/:category     │
├─────────────────────────────────────────────────────────┤
│ ⏱️  Tiempo: 20 min                                       │
│ 🟡 Prioridad: Importante                                │
│ 📁 Backend: src/controllers/rankings.controller.ts      │
│             src/routes/rankings.routes.ts               │
│ 📁 Frontend: See 05_GET_rankings_leaderboard.md         │
│ 🧪 CURL: curl -H "Authorization: Bearer TOKEN" \        │
│  http://localhost:8080/api/rankings/leaderboard/level   │
│  http://localhost:8080/api/rankings/leaderboard/wins    │
│  http://localhost:8080/api/rankings/leaderboard/winrate │
│  http://localhost:8080/api/rankings/leaderboard/wealth  │
└─────────────────────────────────────────────────────────┘
```

---

## COMANDOS QUICK START

```bash
# 1. Compilar backend
npm run build

# 2. Iniciar backend (terminal 1)
npm start

# 3. Testing endpoint GET /api/dungeons/:id
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/dungeons/DUNGEON_ID

# 4. Ver errores en compilación
npm run build 2>&1 | grep -i error

# 5. Testing rápido todos endpoints
bash tests/quick-test-endpoints.sh
```

---

## ESTRUCTURA DE ARCHIVOS

```
Frontend (Angular)
├── services/
│   ├── dungeon.service.ts         ← GET /api/dungeons/:id
│   ├── user.service.ts             ← GET /api/user/profile/:userId
│   ├── achievement.service.ts      ← GET /api/achievements + /:userId
│   └── ranking.service.ts          ← GET /api/rankings/leaderboard/:cat
│
├── components/
│   ├── dungeon-details/
│   │   ├── dungeon-details.component.ts
│   │   ├── dungeon-details.component.html
│   │   └── dungeon-details.component.css
│   ├── user-profile/               (similar structure)
│   ├── leaderboard/                (similar structure)
│   └── achievements/               (similar structure)
│
└── app-routing.module.ts           ← Register routes

Backend (Express/TS)
├── controllers/
│   ├── dungeons.controller.ts      ← getDungeonDetails()
│   ├── users.controller.ts         ← getUserProfile()
│   ├── achievements.controller.ts  ← listAchievements(), getUserAchievements()
│   └── rankings.controller.ts      ← getLeaderboard()
│
├── routes/
│   ├── dungeons.routes.ts          ← GET /:id
│   ├── users.routes.ts             ← GET /profile/:userId
│   ├── achievements.routes.ts      ← GET /, GET /:userId
│   └── rankings.routes.ts          ← GET /leaderboard/:category
│
├── models/
│   ├── Achievement.ts              ← NEW
│   ├── UserAchievement.ts          ← NEW (or extend User schema)
│   ├── Dungeon.ts
│   ├── User.ts
│   └── Ranking.ts
│
└── validations/
    ├── achievements.schemas.ts     ← NEW (optional)
    └── rankings.schemas.ts         ← NEW (optional)
```

---

## CHECKLIST DE IMPLEMENTACIÓN

### Fase Backend (2 horas)

#### Tarea 1: GET /api/dungeons/:id (15 min)
- [ ] Abrir `01_GET_dungeons_id.md`
- [ ] Copiar función `getDungeonDetails()` → src/controllers/dungeons.controller.ts
- [ ] Copiar ruta `router.get('/:id', getDungeonDetails)` → src/routes/dungeons.routes.ts
- [ ] Compilar: `npm run build`
- [ ] Testear: `curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/dungeons/DUNGEON_ID`

#### Tarea 2: GET /api/user/profile/:userId (15 min)
- [ ] Abrir `02_GET_user_profile.md`
- [ ] Copiar función `getUserProfile()` → src/controllers/users.controller.ts
- [ ] Copiar ruta → src/routes/users.routes.ts
- [ ] Compilar: `npm run build`
- [ ] Testear: `curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/user/profile/USER_ID`

#### Tarea 3: GET /api/achievements (20 min)
- [ ] Abrir `03_GET_achievements.md`
- [ ] ¿Existe src/controllers/achievements.controller.ts? → Si no, crear
- [ ] ¿Existe src/routes/achievements.routes.ts? → Si no, crear
- [ ] ¿Existe src/models/Achievement.ts? → Si no, copiar esquema desde doc
- [ ] Copiar función `listAchievements()` → controller
- [ ] Copiar ruta → routes
- [ ] Compilar: `npm run build`
- [ ] Testear: `curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/achievements`

#### Tarea 4: GET /api/achievements/:userId (20 min)
- [ ] Abrir `04_GET_achievements_userId.md`
- [ ] ¿Existe src/models/UserAchievement.ts? → Si no, copiar esquema desde doc
- [ ] Copiar función `getUserAchievements()` → controller
- [ ] Copiar ruta → routes
- [ ] Compilar: `npm run build`
- [ ] Testear: `curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/achievements/USER_ID`

#### Tarea 5: GET /api/rankings/leaderboard/:category (20 min)
- [ ] Abrir `05_GET_rankings_leaderboard.md`
- [ ] Actualizar src/controllers/rankings.controller.ts con `getLeaderboard()`
- [ ] Actualizar src/routes/rankings.routes.ts con ruta
- [ ] Compilar: `npm run build`
- [ ] Testear todas categorías:
  - `curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/rankings/leaderboard/level`
  - `curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/rankings/leaderboard/wins`
  - `curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/rankings/leaderboard/winrate`
  - `curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/rankings/leaderboard/wealth`

#### Tarea 6: Compilación Final
- [ ] `npm run build` (sin errores)
- [ ] `npm start` (puerto 8080 activo)
- [ ] Todos los endpoints responden (testear con CURL)

### Fase Frontend (2 horas)

#### Tarea 7: Servicios Angular
- [ ] Crear src/app/services/dungeon.service.ts (referencia: 01_GET_dungeons_id.md)
- [ ] Crear src/app/services/user.service.ts (referencia: 02_GET_user_profile.md)
- [ ] Crear src/app/services/achievement.service.ts (referencia: 03 & 04)
- [ ] Crear src/app/services/ranking.service.ts (referencia: 05)
- [ ] Verificar que todos los servicios usen HttpClient

#### Tarea 8: Componentes Angular
- [ ] Generar: `ng generate component components/dungeon-details`
- [ ] Generar: `ng generate component components/user-profile`
- [ ] Generar: `ng generate component components/leaderboard`
- [ ] Generar: `ng generate component components/achievements`
- [ ] Copiar lógica TypeScript desde documentación
- [ ] Copiar templates HTML desde documentación

#### Tarea 9: Rutas
- [ ] Registrar rutas en app-routing.module.ts:
  - `/dungeons/:id` → DungeonDetailsComponent
  - `/user/profile/:userId` → UserProfileComponent
  - `/leaderboard/:category` → LeaderboardComponent
  - `/achievements` → AchievementsComponent

#### Tarea 10: Testing en navegador
- [ ] `npm start` (ng serve)
- [ ] Abrir http://localhost:4200
- [ ] Navegar a `/dungeons/[ID]` → debe mostrar datos
- [ ] Navegar a `/user/profile/[ID]` → debe mostrar datos
- [ ] Navegar a `/achievements` → debe mostrar lista
- [ ] Navegar a `/leaderboard/level` → debe mostrar ranking

### Fase Validación (30 min)

#### Tarea 11: Testing Completo
- [ ] Backend compilado sin errores: ✓
- [ ] Todos 5 endpoints responden: ✓
- [ ] Frontend compilado sin errores: ✓
- [ ] Componentes cargan datos correctamente: ✓
- [ ] No hay errores en consola: ✓
- [ ] Rate limiting funciona (429 después de muchas requests): ✓
- [ ] Autenticación funciona (401 sin token): ✓

#### Tarea 12: Git Commit
- [ ] `git add -A`
- [ ] `git commit -m "feat: Agregar 5 endpoints nuevos (dungeons, profile, achievements, rankings)"`
- [ ] `git push origin main`

---

## ERRORES COMUNES Y SOLUCIONES

```
❌ Error: "Cannot find module 'express'"
✅ Solución: npm install

❌ Error: "MongoNetworkError"
✅ Solución: Verificar MONGODB_URI en .env, mongo corriendo

❌ Error: "Cannot find name 'Dungeon'"
✅ Solución: Verificar import { Dungeon } from '../models'

❌ Error: "404 not found" en testing
✅ Solución: Verificar que la ruta está registrada en routes

❌ Error: "401 Unauthorized"
✅ Solución: Agregar Authorization header: -H "Authorization: Bearer TOKEN"

❌ Error: "Module not found" en Angular
✅ Solución: Verificar path en import, esperar ng serve recompile
```

---

## VARIABLES DE ENTORNO NECESARIAS

```bash
# .env (verificar que exista)
MONGODB_URI=mongodb://localhost:27017/valgame
JWT_SECRET=your_secret_key
NODE_ENV=development
API_PORT=8080
FRONTEND_ORIGIN=http://localhost:4200
```

---

## TIEMPO TOTAL ESTIMADO

```
Backend:        2 horas (endpoints + testing)
Frontend:       2 horas (servicios + componentes)
Validación:     30 min (testing completo)
Git:            10 min (commit + push)
─────────────────────────────
TOTAL:          ~4.5 horas
```

---

## DOCUMENTOS DE REFERENCIA

Mantén estos abiertos en pestañas:

1. **GUIA_RAPIDA_IMPLEMENTACION.md** ← Paso a paso
2. **01_GET_dungeons_id.md** ← Código backend + Angular
3. **02_GET_user_profile.md** ← Perfil usuario
4. **03_GET_achievements.md** ← Logros (lista)
5. **04_GET_achievements_userId.md** ← Logros (usuario)
6. **05_GET_rankings_leaderboard.md** ← Rankings

---

## QUICK DEBUG

```bash
# ¿Qué error tengo exactamente?
npm run build 2>&1 | grep error

# ¿El backend está corriendo?
curl http://localhost:8080/api/health

# ¿Tengo el token correcto?
# Ver token en headers de cualquier request exitoso

# ¿La ruta está registrada?
curl -X OPTIONS http://localhost:8080/api/dungeons/123 -v

# ¿MongoDB está conectado?
# Revisar logs en npm start output
```

---

## SIGUIENTES PASOS DESPUÉS

✅ Documentación completa  
✅ Endpoints implementados  
✅ Frontend funcionando  
→ **Testing e2e automático**  
→ **Deployment a staging**  
→ **QA testing**  
→ **Deploy a producción**  

---

**Imprime o guarda esta página en escritorio**

🚀 **¡A trabajar!**

