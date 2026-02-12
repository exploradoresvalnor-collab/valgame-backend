# 🎮 FLUJO COMPLETO DEL USUARIO - Desde Login hasta Ver Resultados

**Documento:** Flujo de usuario paso a paso  
**Versión:** 1.0  
**Última actualización:** 30 de noviembre de 2025

---

## 📊 DIAGRAMA VISUAL DEL FLUJO

```
┌──────────────┐
│   1. LOGIN   │
└──────┬───────┘
       │ POST /api/auth/login
       │ ✓ Recibe JWT token
       ▼
┌──────────────────────────┐
│ 2. VER LISTADO MAZMORRAS │
└──────┬───────────────────┘
       │ GET /api/dungeons
       │ ✓ Lista simple: [nombre, imagen, dificultad, nivel_recomendado]
       ▼
┌──────────────────────────────────┐
│ 3. VER DETALLES DE MAZMORRA [NEW]│
└──────┬─────────────────────────────┘
       │ GET /api/dungeons/:id
       │ ✓ Enemigos completos, recompensas, requisitos
       ▼
┌──────────────────────────┐
│ 4. SELECCIONAR EQUIPO    │
└──────┬───────────────────┘
       │ GET /api/users/me (datos ya obtenidos)
       │ ✓ Ver personajes disponibles
       │ ✓ Ver equipamiento de cada uno
       ▼
┌──────────────────────────┐
│ 5. INICIAR COMBATE       │
└──────┬───────────────────┘
       │ POST /api/dungeons/:dungeonId/start
       │ Body: { team: ["char_1", "char_2"] }
       │ ✓ Backend simula batalla
       │ ✓ Retorna: log, recompensas, progreso
       ▼
┌──────────────────────────┐
│ 6. VER RESULTADOS        │
└──────┬───────────────────┘
       │ Datos en respuesta del paso 5
       │ ✓ Mostrar: EXP, VAL, items, level-up
       ▼
┌──────────────────────────┐
│ 7. VER PERFIL USUARIO[NEW]│
└──────┬───────────────────┘
       │ GET /api/user/profile/:userId
       │ ✓ Stats completas, logros, equipamiento
       ▼
┌──────────────────────────┐
│ 8. VER RANKINGS [NEW]    │
└──────┬───────────────────┘
       │ GET /api/rankings/leaderboard/:category
       │ ✓ Leaderboards por categoría
       ▼
┌──────────────────────────┐
│ 9. VER LOGROS [NEW]      │
└──────┬───────────────────┘
       │ GET /api/achievements
       │ + GET /api/achievements/:userId
       │ ✓ Logros disponibles y desbloqueados
       ▼
┌──────────────────────────┐
│ ✅ FIN DEL FLUJO         │
└──────────────────────────┘
```

---

## 🔀 FLUJO DETALLADO - PASO A PASO

### PASO 1: AUTENTICACIÓN

**Acción del usuario:** Ingresa email y contraseña en login  
**Endpoint:** `POST /api/auth/login`

**Petición:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "suContraseña123"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "usuario@example.com",
    "username": "MiNombre"
  }
}
```

**Frontend guarda:** `localStorage.setItem('token', response.token)`

---

### PASO 2: OBTENER DATOS DEL USUARIO

**Acción del usuario:** La app carga automáticamente al entrar  
**Endpoint:** `GET /api/users/me`

**Petición:**
```bash
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta (200):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "username": "MiNombre",
  "val": 500,
  "boletos": 3,
  "energia": 80,
  "personajes": [
    {
      "personajeId": "char_001",
      "nombre": "Guerrero Valiente",
      "nivel": 25,
      "equipamiento": ["item_1", "item_2"],
      "saludActual": 150,
      "saludMaxima": 150
    }
  ]
}
```

**Frontend almacena:** Datos del usuario en estado global (ngxs, redux, context)

---

### PASO 3: NAVEGAR A MAZMORRAS - VER LISTADO

**Acción del usuario:** Haz click en menú "Mazmorras"  
**Endpoint:** `GET /api/dungeons`

**Petición:**
```bash
GET /api/dungeons
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta (200):**
```json
{
  "ok": true,
  "dungeons": [
    {
      "id": "507f1f77bcf86cd799439040",
      "nombre": "Cueva de Goblins",
      "descripcion": "Una cueva llena de goblins",
      "dificultad": "fácil",
      "nivelRecomendado": 10,
      "imagen": "url-imagen"
    },
    {
      "id": "507f1f77bcf86cd799439041",
      "nombre": "Templo Oscuro",
      "descripcion": "Un templo antiguo y peligroso",
      "dificultad": "difícil",
      "nivelRecomendado": 35,
      "imagen": "url-imagen"
    }
  ]
}
```

**Frontend muestra:** Grid/lista de mazmorras con nombre, imagen, dificultad

---

### PASO 4: SELECCIONAR MAZMORRA - VER DETALLES [NUEVO]

**Acción del usuario:** Haz click en una mazmorra para ver detalles  
**Endpoint:** `GET /api/dungeons/:id` ← **NUEVO ENDPOINT**

**Petición:**
```bash
GET /api/dungeons/507f1f77bcf86cd799439040
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta (200):**
```json
{
  "ok": true,
  "dungeon": {
    "id": "507f1f77bcf86cd799439040",
    "nombre": "Cueva de Goblins",
    "descripcion": "Una cueva llena de goblins pequeños",
    "dificultad": "fácil",
    "nivelRecomendado": 10,
    "nivel_requerido_minimo": 1,
    "enemigos": [
      {
        "nombre": "Goblin Pequeño",
        "nivel": 10,
        "vida": 45,
        "ataque": 15,
        "defensa": 5
      },
      {
        "nombre": "Goblin Chamán",
        "nivel": 12,
        "vida": 60,
        "ataque": 20,
        "defensa": 10
      }
    ],
    "recompensas": {
      "expBase": 500,
      "valBase": 100,
      "probabilidad_boletos": 0.05,
      "itemDropRate": 0.10
    },
    "estadisticas_promedio_usuario": {
      "victorias_totales": 150,
      "tasa_victoria": 86.7
    }
  }
}
```

**Frontend muestra:**
- Card detallada con:
  - Nombre, descripción
  - Lista de enemigos con stats
  - Recompensas
  - Tasa de victoria global
  - Botón "Entrar con equipo"

---

### PASO 5: SELECCIONAR EQUIPO DE PERSONAJES

**Acción del usuario:** Hace click en "Entrar con equipo"  
**Componente:** Modal/página de selección de equipo

**Frontend muestra:**
- Lista de personajes disponibles
- Stats de cada personaje
- Equipamiento actual
- Casillas para seleccionar (max 3-4 según GameSettings)

**Datos utilizados:** Del response de `GET /api/users/me` del Paso 2

**Frontend valida:**
- ✓ Personaje no está herido
- ✓ Nivel >= nivel_requerido_minimo
- ✓ Tiene boletos disponibles
- ✓ Seleccionó al menos 1 personaje

---

### PASO 6: INICIAR COMBATE

**Acción del usuario:** Hace click en "Iniciar Combate"  
**Endpoint:** `POST /api/dungeons/:dungeonId/start` (EXISTENTE)

**Petición:**
```bash
POST /api/dungeons/507f1f77bcf86cd799439040/start
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "team": ["char_001", "char_002"]
}
```

**Respuesta (200):**
```json
{
  "resultado": "victoria",
  "log": [
    "🏰 Mazmorra Nivel 1",
    "💪 Stats: 300 HP | 45 ATK | 20 DEF",
    "--- Turno del Equipo ---",
    "El equipo ataca y causa 25 de daño. Vida de la mazmorra: 275",
    "--- Turno de la Mazmorra ---",
    "¡La mazmorra ha fallado su ataque!",
    "... (muchos más turnos)",
    "¡VICTORIA! Has superado la mazmorra."
  ],
  "recompensas": {
    "expGanada": 500,
    "valGanado": 100,
    "botinObtenido": [
      { "itemId": "item_1", "nombre": "Espada de Goblin" }
    ]
  },
  "progresionMazmorra": {
    "puntosGanados": 150,
    "nivelActual": 2,
    "puntosActuales": 340,
    "puntosRequeridos": 500,
    "subiDeNivel": true,
    "nivelesSubidos": 1
  },
  "estadoEquipo": [
    {
      "personajeId": "char_001",
      "saludFinal": 120,
      "nivelFinal": 25,
      "estado": "saludable"
    }
  ]
}
```

**Frontend muestra:** Pantalla de carga/animación de batalla

---

### PASO 7: VER PANTALLA DE RESULTADOS

**Acción del usuario:** Automático después del combate  
**Datos:** Del response del Paso 6

**Frontend muestra - PANTALLA DE VICTORIA:**
```
╔════════════════════════════════╗
║         ¡VICTORIA! 🎉          ║
╠════════════════════════════════╣
║ EXP GANADA:        +500         ║
║ VAL GANADO:        +100         ║
║                                ║
║ ITEMS OBTENIDOS:               ║
║  • Espada de Goblin (Raro)     ║
║                                ║
║ PROGRESIÓN MAZMORRA:           ║
║ 📊 Nivel 1 → Nivel 2 ⬆️         ║
║ 📈 Puntos: 340/500            ║
║                                ║
║ EQUIPO:                        ║
║  • Guerrero: 120/150 HP ✓      ║
║  • Arquera:  95/120 HP ✓       ║
║                                ║
╠════════════════════════════════╣
║ [Volver] [Otra Mazmorra]       ║
╚════════════════════════════════╝
```

---

### PASO 8: NAVEGAR A PERFIL DE USUARIO [NUEVO]

**Acción del usuario:** Haz click en "Ver Perfil" o en el avatar  
**Endpoint:** `GET /api/user/profile/:userId` ← **NUEVO ENDPOINT**

**Petición:**
```bash
GET /api/user/profile/507f1f77bcf86cd799439012
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta (200):**
```json
{
  "ok": true,
  "profile": {
    "userId": "507f1f77bcf86cd799439012",
    "username": "MiNombre",
    "joinDate": "2024-01-15T00:00:00Z",
    "stats": {
      "nivel_promedio_personajes": 25,
      "victorias_totales": 50,
      "derrotas_totales": 5,
      "tasa_victoria": 90.9,
      "val_total": 5000,
      "tiempo_jugado_horas": 24
    },
    "personajes": [
      {
        "personajeId": "char_001",
        "nombre": "Guerrero Valiente",
        "nivel": 25,
        "rango": "Raro",
        "etapa": 2
      }
    ],
    "logros_desbloqueados": [
      {
        "id": "achievement_001",
        "nombre": "Primera Victoria",
        "unlockedAt": "2024-02-01T00:00:00Z"
      }
    ]
  }
}
```

**Frontend muestra:**
- Avatar, nombre de usuario
- Fecha de unión
- Estadísticas personales
- Lista de personajes
- Logros obtenidos

---

### PASO 9: VER LEADERBOARDS [NUEVO]

**Acción del usuario:** Haz click en "Rankings"  
**Endpoint:** `GET /api/rankings/leaderboard/:category` ← **NUEVO ENDPOINT**

**Petición:**
```bash
GET /api/rankings/leaderboard/nivel?page=1&limit=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta (200):**
```json
{
  "ok": true,
  "category": "nivel",
  "leaderboard": [
    {
      "posicion": 1,
      "username": "JuanElCampeón",
      "valor": 50,
      "insignia": "👑 Rey",
      "secundario": { "victorias": 250 }
    },
    {
      "posicion": 2,
      "username": "MaestroOscuro",
      "valor": 48,
      "insignia": "⭐ Leyenda",
      "secundario": { "victorias": 230 }
    }
  ],
  "user_position": {
    "posicion": 42,
    "username": "MiNombre",
    "valor": 25
  }
}
```

**Frontend muestra:**
- Tabs para categorías (Nivel, Victorias, Winrate, Riqueza)
- Tabla ranking con top 50
- Posición actual del usuario destacada
- Cambio de posición (▲/▼)

---

### PASO 10: VER LOGROS [NUEVO]

**Acción del usuario:** Haz click en "Logros"  
**Endpoints:** 
- `GET /api/achievements` ← **NUEVO ENDPOINT**
- `GET /api/achievements/:userId` ← **NUEVO ENDPOINT**

**Petición 1 - Ver todos los logros disponibles:**
```bash
GET /api/achievements?category=combat&page=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta:**
```json
{
  "ok": true,
  "achievements": [
    {
      "id": "achievement_001",
      "nombre": "Primera Victoria",
      "descripcion": "Completa tu primer dungeon",
      "rareza": "común",
      "categoria": "combat",
      "requisitos": { "tipo": "victorias_mazmorra", "valor": 1 }
    },
    {
      "id": "achievement_002",
      "nombre": "100 Victorias",
      "descripcion": "Completa 100 combates",
      "rareza": "épico",
      "categoria": "combat",
      "requisitos": { "tipo": "victorias_mazmorra", "valor": 100 }
    }
  ],
  "total": 50
}
```

**Petición 2 - Ver logros desbloqueados del usuario:**
```bash
GET /api/achievements/507f1f77bcf86cd799439012
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta:**
```json
{
  "ok": true,
  "achievements_unlocked": [
    {
      "id": "achievement_001",
      "nombre": "Primera Victoria",
      "unlocked": true,
      "unlockedAt": "2024-02-01T00:00:00Z",
      "progress": 100
    }
  ],
  "achievements_locked": [
    {
      "id": "achievement_002",
      "nombre": "100 Victorias",
      "unlocked": false,
      "progress": 23,
      "maxProgress": 100
    }
  ]
}
```

**Frontend muestra:**
- Grid de logros
- Logros desbloqueados: con tilde ✓ y fecha
- Logros bloqueados: con barra de progreso
- Filtro por categoría

---

## 🔄 CICLOS COMUNES

### CICLO: Jugar varias mazmorras seguidas

```
1. Usuario está en resultados de una mazmorra
2. Hace click en "Otra Mazmorra"
3. Vuelve al listado (Paso 3)
4. Selecciona otra mazmorra (Paso 4)
5. Vuelve al Paso 5 (seleccionar equipo)
6. Inicia combate (Paso 6)
7. Ve resultados (Paso 7)
8. Repite desde Step 2
```

### CICLO: Ver progreso de amigos

```
1. Usuario abre Rankings (Paso 9)
2. Ve posición de un amigo
3. Hace click en nombre del amigo
4. Ve perfil del amigo (Paso 8)
5. Puede ver sus personajes y logros
6. Vuelve a Rankings
```

---

## 📈 DATOS QUE FLUYEN EN EL SISTEMA

```
LOGIN
  ↓ (Obtiene token)
GET /api/users/me
  ↓ (Obtiene datos del usuario, personajes, inventario)
Estado Global Frontend (Almacena datos)
  ↓
[Usuario navega a diferentes secciones]
  ├─ GET /api/dungeons (listado)
  ├─ GET /api/dungeons/:id (detalles) [NUEVO]
  ├─ POST /api/dungeons/:id/start (juega)
  │   ↓ (Recibe recompensas)
  │   (Frontend actualiza estado global)
  │
  ├─ GET /api/user/profile/:userId (perfil) [NUEVO]
  ├─ GET /api/rankings/leaderboard/:cat (rankings) [NUEVO]
  ├─ GET /api/achievements (logros) [NUEVO]
  └─ GET /api/achievements/:userId (logros usuario) [NUEVO]
```

---

## ⚠️ VALIDACIONES EN FRONTEND

**Antes de iniciar combate:**
- ✓ Usuario tiene boletos
- ✓ Personajes seleccionados cumplen nivel mínimo
- ✓ Personajes no están heridos
- ✓ Seleccionó al menos 1 personaje

**Antes de navegar a rankings:**
- ✓ Usuario autenticado (tiene token)

**Antes de ver perfil de usuario:**
- ✓ Usuario existe
- ✓ Usuario autenticado

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Entender este flujo
2. ⏳ Implementar endpoints backend
3. ⏳ Crear servicios Angular para cada endpoint
4. ⏳ Crear componentes para cada pantalla
5. ⏳ Conectar todo el flujo

