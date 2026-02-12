# 📋 PLAN DETALLADO DE IMPLEMENTACIÓN - ANÁLISIS PROFUNDO

**Fecha:** 30 de noviembre de 2025  
**Estado:** ANÁLISIS COMPLETADO - LISTO PARA IMPLEMENTAR  
**Riesgo:** BAJO (estructura clara, modelos existentes)

---

## 🔍 ANÁLISIS DEL CÓDIGO EXISTENTE

### ✅ Estructura Backend Actual

```
src/
├── controllers/
│   ├── dungeons.controller.ts      ✅ EXISTE (472 líneas)
│   ├── rankings.controller.ts      ✅ EXISTE (con 4 funciones)
│   └── [usuarios en routes directamente]
│
├── routes/
│   ├── dungeons.routes.ts          ✅ EXISTE (106 líneas)
│   │   └─ GET / (lista dungeons)
│   │   └─ POST /:dungeonId/start (combate)
│   │   └─ GET /:dungeonId/progress (progreso)
│   │
│   ├── users.routes.ts             ✅ EXISTE (16KB)
│   │   └─ GET /me (usuario autenticado)
│   │   └─ GET /resources (recursos)
│   │   └─ GET /dashboard (dashboard)
│   │   └─ + 8 rutas más
│   │
│   └── rankings.routes.ts          ✅ EXISTE (pequeño archivo)
│       └─ Rutas de rankings
│
├── models/
│   ├── User.ts                     ✅ EXISTE
│   ├── Dungeon.ts                  ✅ EXISTE (estructura: IDungeon, nombre, nivel_requerido_minimo, stats, etc)
│   ├── Ranking.ts                  ✅ EXISTE
│   ├── Achievement.ts              ❌ NO EXISTE (CREAR)
│   └── UserAchievement.ts          ❌ NO EXISTE (CREAR como subdocument o separate)
│
└── app.ts                          ✅ EXISTE
    └─ Rutas registradas: /api/dungeons, /api/users, /api/rankings
```

---

## 🎯 LOS 5 ENDPOINTS A IMPLEMENTAR

### 1️⃣ GET /api/dungeons/:id ✅ IMPLEMENTAR

**Estado:** NO EXISTE (necesita agregar a routes existentes)

**Ubicación actual:**
- Route: `src/routes/dungeons.routes.ts` línea ~20-28
- Controller: Función `startDungeon` existe (pero es para POST, no GET)

**Qué hacer:**
- [ ] Crear nueva función en `src/controllers/dungeons.controller.ts`
  - Nombre: `getDungeonDetails()`
  - Obtiene 1 dungeon por ID
  - Retorna objeto completo (nombre, descripcion, nivel_requerido_minimo, stats, recompensas, etc)
  
- [ ] Agregar ruta en `src/routes/dungeons.routes.ts`
  - `router.get('/:id', getDungeonDetails)`
  - SIN autenticación (es pública)
  - ANTES de la ruta `/:dungeonId/start` para evitar conflictos

**Riesgo:** ⚠️ BAJO
- Modelo Dungeon existe y está bien estructurado
- No interfiere con rutas existentes si lo pongo en orden correcto
- Métodos simples de findById

**Verificación:**
```bash
curl http://localhost:8080/api/dungeons/[DUNGEON_ID]
# Debe retornar 200 con objeto dungeon
```

---

### 2️⃣ GET /api/user/profile/:userId ✅ IMPLEMENTAR

**Estado:** NO EXISTE (necesita crear en users.routes)

**Ubicación actual:**
- Route: `src/routes/users.routes.ts` línea ~1-50
- Controller: NO EXISTE (rutas inline)

**Qué hacer:**
- [ ] Crear controlador `src/controllers/users.controller.ts` (NEW FILE)
  - Función: `getUserProfile(userId)`
  - Obtiene User por ID
  - Calcula stats (nivel, victorias, exp, etc)
  - Retorna: { userId, nombre, nivel, stats, personajes, logros, etc }

- [ ] Agregar ruta en `src/routes/users.routes.ts`
  - `router.get('/profile/:userId', getUserProfile)`
  - SIN autenticación (perfil público)

**Riesgo:** ⚠️ BAJO
- User model existe
- Datos están en User document
- users.routes.ts ya existe y se puede extender

**Verificación:**
```bash
curl http://localhost:8080/api/user/profile/[USER_ID]
# Debe retornar 200 con datos del usuario
```

---

### 3️⃣ GET /api/achievements ✅ IMPLEMENTAR

**Estado:** NO EXISTE (necesita crear todo)

**Ubicación actual:**
- NO EXISTE - Necesita: modelo, controller, routes

**Qué hacer:**
- [ ] Crear modelo `src/models/Achievement.ts` (NEW FILE)
  - Campos: id, nombre, descripcion, categoria, requisitos, recompensa, iconUrl
  - Schema simple, colección de logros disponibles
  
- [ ] Crear controlador `src/controllers/achievements.controller.ts` (NEW FILE)
  - Función: `listAchievements(page, limit, category)`
  - Retorna array de achievements con paginación
  
- [ ] Crear rutas `src/routes/achievements.routes.ts` (NEW FILE)
  - `router.get('/', listAchievements)`
  - SIN autenticación (lista pública)
  - Soporta query params: ?page=0&limit=20&category=combat

**Riesgo:** 🟡 MEDIO
- Necesita crear 3 archivos nuevos
- Pero estructura es simple
- No interfiere con código existente (es completamente nuevo)

**Verificación:**
```bash
curl http://localhost:8080/api/achievements?page=0&limit=20
# Debe retornar 200 con array de achievements
```

---

### 4️⃣ GET /api/achievements/:userId ✅ IMPLEMENTAR

**Estado:** PARCIAL (User tiene logros, pero ruta no existe)

**Ubicación actual:**
- Datos en: `User.model` - campo `logros` o similar
- Rutas: NO EXISTE

**Qué hacer:**
- [ ] Crear función en `src/controllers/achievements.controller.ts`
  - Función: `getUserAchievements(userId)`
  - Obtiene User por ID
  - Retorna logros desbloqueados + progreso
  
- [ ] Agregar ruta en `src/routes/achievements.routes.ts`
  - `router.get('/:userId', getUserAchievements)`
  - SIN autenticación (perfil público)

**Riesgo:** 🟡 MEDIO
- Depende de cómo User almacena logros
- Necesito revisar User.ts para ver estructura de logros
- Pero es básicamente query a User + filtro

**Verificación:**
```bash
curl http://localhost:8080/api/achievements/[USER_ID]
# Debe retornar 200 con logros del usuario
```

---

### 5️⃣ GET /api/rankings/leaderboard/:category ✅ IMPLEMENTAR

**Estado:** PARCIAL (rankings controller existe, necesita extensión)

**Ubicación actual:**
- Controller: `src/controllers/rankings.controller.ts` (funciones globales existen)
- Routes: `src/routes/rankings.routes.ts`

**Qué hacer:**
- [ ] Agregar función en `src/controllers/rankings.controller.ts`
  - Función: `getLeaderboardByCategory(category, page, limit)`
  - Categories: 'level', 'wins', 'winrate', 'wealth'
  - Retorna users ordenados por criterio
  
- [ ] Agregar ruta en `src/routes/rankings.routes.ts`
  - `router.get('/leaderboard/:category', getLeaderboardByCategory)`
  - SIN autenticación (es público)
  - Query params: ?page=0&limit=20

**Riesgo:** ✅ BAJO
- Rankings controller ya existe
- Solo extensión de funcionalidad
- Modelo User tiene todos los datos necesarios

**Verificación:**
```bash
curl http://localhost:8080/api/rankings/leaderboard/level
curl http://localhost:8080/api/rankings/leaderboard/wins
curl http://localhost:8080/api/rankings/leaderboard/winrate
curl http://localhost:8080/api/rankings/leaderboard/wealth
# Cada uno debe retornar 200 con array de users
```

---

## 🚨 ANÁLISIS DE RIESGOS Y PRECAUCIONES

### Riesgos Identificados

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Conflicto de rutas (GET /:id vs POST /:id/start) | MEDIUM | Ordenar rutas: GET primero, POST después |
| User model - estructura de logros unknown | MEDIUM | Leer User.ts antes de implementar |
| Achievement model new - puede romper validaciones | LOW | Crear modelo limpio, no interfiere |
| Paginación mal implementada | LOW | Copiar patrón de otros endpoints |
| Auth middleware aplicado accidentalmente | MEDIUM | Verificar auth flag en cada ruta |

### Precauciones a Tomar

✅ **Antes de implementar:**
1. Compilar proyecto actual: `npm run build` (debe pasar)
2. Leer completo User.ts para ver estructura
3. Hacer backup: `git stash`
4. Cada cambio: compilar + testear

✅ **Durante implementación:**
1. Implementar 1 endpoint a la vez
2. Compilar después de CADA archivo
3. Testear con CURL inmediatamente
4. NO hacer todo de golpe

✅ **Orden de implementación (importante):**
1. GET /api/dungeons/:id (más simple, no new models)
2. GET /api/user/profile/:userId (simple, extender users.routes)
3. GET /api/achievements (nuevo model simple)
4. GET /api/achievements/:userId (uses existing User)
5. GET /api/rankings/leaderboard/:category (extend existing controller)

---

## 📊 RESUMEN DE CAMBIOS

### Archivos a CREAR
```
✅ src/controllers/users.controller.ts (NEW) - ~50 líneas
✅ src/models/Achievement.ts (NEW) - ~80 líneas
✅ src/controllers/achievements.controller.ts (NEW) - ~100 líneas
✅ src/routes/achievements.routes.ts (NEW) - ~30 líneas
```

### Archivos a MODIFICAR
```
✅ src/controllers/dungeons.controller.ts (+1 función ~30 líneas)
✅ src/routes/dungeons.routes.ts (+1 ruta ~5 líneas)
✅ src/routes/users.routes.ts (+1 ruta ~5 líneas)
✅ src/controllers/rankings.controller.ts (+1 función ~40 líneas)
✅ src/routes/rankings.routes.ts (+1 ruta ~5 líneas)
```

### NO Modificar
```
❌ src/app.ts (rutas ya registradas, no tocar)
❌ src/models/User.ts (solo leer)
❌ src/models/Dungeon.ts (solo leer)
❌ src/models/Ranking.ts (solo leer)
```

---

## 🎬 PLAN DE EJECUCIÓN

### Fase 1: Lectura de Código Existente (10 min)
- [ ] Leer User.ts completo - estructura de logros
- [ ] Leer Dungeon.ts completo - verificar IDungeon export
- [ ] Leer Ranking.ts - verificar estructura

### Fase 2: Crear Modelos (20 min)
- [ ] Crear `src/models/Achievement.ts`
- [ ] Compilar: `npm run build` (sin errores)
- [ ] Verificar imports

### Fase 3: Implementar Endpoints Simples (60 min)
- [ ] GET /api/dungeons/:id (15 min)
- [ ] GET /api/user/profile/:userId (15 min)
- [ ] GET /api/rankings/leaderboard/:category (15 min)
- [ ] Compilar + testear después de CADA uno

### Fase 4: Implementar Achievements (40 min)
- [ ] Crear achievements.controller.ts
- [ ] Crear achievements.routes.ts
- [ ] GET /api/achievements (20 min)
- [ ] GET /api/achievements/:userId (20 min)
- [ ] Compilar + testear

### Fase 5: Testing Completo (30 min)
- [ ] CURL test todos 5 endpoints
- [ ] Verificar códigos HTTP
- [ ] Verificar estructura de respuestas

---

## ✅ CHECKLIST ANTES DE EMPEZAR

- [ ] `npm run build` compila sin errores (actual)
- [ ] `.env` está configurado
- [ ] MongoDB está corriendo
- [ ] Tengo token JWT válido para testing
- [ ] Tengo IDs válidos de dungeons/users para testing
- [ ] He leído User.ts completo
- [ ] He leído Dungeon.ts completo
- [ ] Estoy en rama main
- [ ] He hecho backup (git stash)

---

## 🔧 COMANDO DE COMPILACIÓN

```bash
# Después de CADA cambio:
npm run build

# Si hay errores TypeScript:
npm run build 2>&1 | head -50

# Iniciar servidor:
npm start

# Testing CURL:
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/dungeons/ID
```

---

**Estado:** ANÁLISIS COMPLETADO ✅  
**Riesgo General:** LOW (estructura clara, cambios aislados)  
**Complejidad:** MEDIA (5 endpoints, algunos modelos nuevos)  
**Tiempo Estimado:** 2-3 horas  

🚀 **LISTO PARA IMPLEMENTAR**

