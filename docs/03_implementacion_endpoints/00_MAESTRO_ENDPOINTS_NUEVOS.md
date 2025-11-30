# 🎯 ENDPOINTS NUEVOS - GUÍA COMPLETA DE IMPLEMENTACIÓN

**Fecha de creación:** 30 de noviembre de 2025  
**Estado:** En desarrollo  
**Versión:** 1.0  

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Endpoints a Implementar](#endpoints-a-implementar)
3. [Flujo Completo del Usuario](#flujo-completo-del-usuario)
4. [Detalles de Cada Endpoint](#detalles-de-cada-endpoint)
5. [Integración en Frontend](#integración-en-frontend)
6. [Testing y Validación](#testing-y-validación)

---

## 🎯 VISIÓN GENERAL

Este documento guía la implementación de **5 endpoints críticos** faltantes en el backend que el frontend necesita para funcionar correctamente.

### Endpoints a Crear:
| # | Endpoint | Método | Prioridad | Estado |
|---|----------|--------|-----------|--------|
| 1 | `GET /api/dungeons/:id` | GET | 🔴 CRÍTICA | ⏳ Por hacer |
| 2 | `GET /api/user/profile/:userId` | GET | 🔴 CRÍTICA | ⏳ Por hacer |
| 3 | `GET /api/achievements` | GET | 🟡 IMPORTANTE | ⏳ Por hacer |
| 4 | `GET /api/achievements/:userId` | GET | 🟡 IMPORTANTE | ⏳ Por hacer |
| 5 | `GET /api/rankings/leaderboard/:category` | GET | 🟡 IMPORTANTE | ⏳ Por hacer |

---

## 🔄 FLUJO COMPLETO DEL USUARIO

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUJO DUNGEON COMPLETO                  │
└─────────────────────────────────────────────────────────────┘

1. AUTENTICACIÓN
   └─→ Usuario hace login: POST /api/auth/login
       ✓ Recibe JWT token

2. VER LISTADO DE MAZMORRAS
   └─→ Obtiene todas las mazmorras: GET /api/dungeons
       ✓ Recibe lista simple de mazmorras

3. VER DETALLES DE UNA MAZMORRA [NUEVO]
   └─→ Click en una mazmorra: GET /api/dungeons/:id
       ✓ Enemigos, recompensas, dificultad, requisitos
       ✓ Información detallada para decisión

4. SELECCIONAR EQUIPO DE PERSONAJES
   └─→ Usuario selecciona personajes para combate
       ✓ Datos vienen de: GET /api/users/me

5. INICIAR COMBATE
   └─→ Envía equipo: POST /api/dungeons/:dungeonId/start
       ✓ Backend simula batalla automáticamente
       ✓ Recibe log, recompensas, progreso

6. VER RESULTADOS
   └─→ Muestra pantalla de victoria/derrota
       ✓ Items obtenidos, EXP ganada, VAL ganado
       ✓ Level up info si aplica

7. VER PERFIL DE USUARIO [NUEVO]
   └─→ Click en perfil: GET /api/user/profile/:userId
       ✓ Stats completas, logros desbloqueados, equipamiento

8. VER LEADERBOARDS [NUEVO]
   └─→ Click en Rankings: GET /api/rankings/leaderboard/:category
       ✓ Por categoría (nivel, victorias, riqueza)

9. VER LOGROS [NUEVO]
   └─→ Click en Achievements: GET /api/achievements
       ✓ Lista de logros disponibles en el juego
       └─→ Ver logros de usuario: GET /api/achievements/:userId
```

---

## 🔧 DETALLES DE CADA ENDPOINT

### ENDPOINT 1: GET /api/dungeons/:id

**Descripción:**  
Obtiene información detallada de una mazmorra específica.

**Método:** `GET`  
**URL:** `/api/dungeons/:id`  
**Autenticación:** No requerida (puede ser pública)  
**Path Params:**
- `id` (string): ID de la mazmorra en MongoDB

**Response (200 - Éxito):**
```json
{
  "ok": true,
  "dungeon": {
    "id": "507f1f77bcf86cd799439040",
    "nombre": "Cueva de Goblins",
    "descripcion": "Una cueva llena de goblins pequeños",
    "imagen": "url-a-imagen",
    "dificultad": "fácil",
    "nivelRecomendado": 10,
    "nivel_requerido_minimo": 1,
    "enemigos": [
      {
        "nombre": "Goblin",
        "nivel": 10,
        "vida": 45,
        "ataque": 15,
        "defensa": 5,
        "velocidad": 8
      }
    ],
    "recompensas": {
      "expBase": 500,
      "valBase": 100,
      "probabilidad_boletos": 0.05,
      "probabilidad_evo": 0.02,
      "itemDropRate": 0.10,
      "itemsDropibles": ["item_id_1", "item_id_2"]
    },
    "estadisticas_promedio_usuario": {
      "victorias_totales": 150,
      "derrotas_totales": 23,
      "tasa_victoria": 86.7,
      "tiempo_promedio_combate": 45
    }
  }
}
```

**Response (404 - No encontrado):**
```json
{
  "ok": false,
  "error": "Mazmorra no encontrada"
}
```

---

### ENDPOINT 2: GET /api/user/profile/:userId

**Descripción:**  
Obtiene el perfil público de un usuario (no datos sensibles como contraseña).

**Método:** `GET`  
**URL:** `/api/user/profile/:userId`  
**Autenticación:** Requiere Bearer token (pero no solo del propietario)  
**Path Params:**
- `userId` (string): ID del usuario

**Response (200 - Éxito):**
```json
{
  "ok": true,
  "profile": {
    "userId": "507f1f77bcf86cd799439012",
    "username": "JuanElCampeón",
    "email": "juan@example.com",
    "joinDate": "2024-01-15T00:00:00Z",
    "lastActive": "2025-11-30T12:00:00Z",
    "stats": {
      "nivel_promedio_personajes": 35,
      "victorias_totales": 250,
      "derrotas_totales": 45,
      "tasa_victoria": 84.7,
      "val_total": 150000,
      "evo_total": 25,
      "tiempo_jugado_horas": 240,
      "mazmorras_completadas": 180,
      "items_unicos_coleccionados": 245
    },
    "personajes": [
      {
        "personajeId": "char_001",
        "nombre": "Guerrero Valiente",
        "nivel": 50,
        "rango": "Épico",
        "etapa": 3,
        "imagen": "url-imagen"
      }
    ],
    "logros_desbloqueados": [
      {
        "id": "achievement_001",
        "nombre": "Primera Victoria",
        "descripcion": "Completa tu primer dungeon",
        "icono": "url-icono",
        "unlockedAt": "2024-02-01T00:00:00Z"
      }
    ],
    "equipamiento_activo": [
      {
        "slot": "arma",
        "nombre": "Espada Legendaria",
        "rareza": "legendario",
        "stats": { "atk": 50, "defensa": 10 }
      }
    ]
  }
}
```

**Response (404 - No encontrado):**
```json
{
  "ok": false,
  "error": "Usuario no encontrado"
}
```

---

### ENDPOINT 3: GET /api/achievements

**Descripción:**  
Lista todos los logros disponibles en el juego (no solo los desbloqueados del usuario).

**Método:** `GET`  
**URL:** `/api/achievements`  
**Autenticación:** No requerida  
**Query Params (Opcionales):**
- `category` (string): 'combat', 'collection', 'social', 'progression', 'special'
- `page` (number): Número de página (default 1)
- `limit` (number): Items por página (default 20)

**Response (200 - Éxito):**
```json
{
  "ok": true,
  "achievements": [
    {
      "id": "achievement_001",
      "nombre": "Primera Victoria",
      "descripcion": "Completa tu primer dungeon",
      "icono": "url-icono",
      "rareza": "común",
      "categoria": "combat",
      "requisitos": {
        "tipo": "victorias_mazmorra",
        "valor": 1
      },
      "recompensas": {
        "puntos": 10,
        "badge": "Primera Victoria"
      }
    },
    {
      "id": "achievement_002",
      "nombre": "Coleccionista",
      "descripcion": "Colecciona 100 items únicos",
      "icono": "url-icono",
      "rareza": "raro",
      "categoria": "collection",
      "requisitos": {
        "tipo": "items_coleccionados",
        "valor": 100
      },
      "recompensas": {
        "puntos": 50,
        "badge": "Coleccionista Maestro"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

---

### ENDPOINT 4: GET /api/achievements/:userId

**Descripción:**  
Obtiene los logros desbloqueados por un usuario específico.

**Método:** `GET`  
**URL:** `/api/achievements/:userId`  
**Autenticación:** Requiere Bearer token  
**Path Params:**
- `userId` (string): ID del usuario

**Query Params (Opcionales):**
- `unlocked` (boolean): true = solo desbloqueados, false = solo bloqueados
- `category` (string): Filtrar por categoría

**Response (200 - Éxito):**
```json
{
  "ok": true,
  "userId": "507f1f77bcf86cd799439012",
  "achievements_unlocked": [
    {
      "id": "achievement_001",
      "nombre": "Primera Victoria",
      "descripcion": "Completa tu primer dungeon",
      "icono": "url-icono",
      "rareza": "común",
      "categoria": "combat",
      "unlocked": true,
      "unlockedAt": "2024-02-01T00:00:00Z",
      "progress": 100,
      "maxProgress": 1
    }
  ],
  "achievements_locked": [
    {
      "id": "achievement_002",
      "nombre": "Coleccionista",
      "descripcion": "Colecciona 100 items únicos",
      "icono": "url-icono",
      "rareza": "raro",
      "categoria": "collection",
      "unlocked": false,
      "progress": 45,
      "maxProgress": 100
    }
  ],
  "stats": {
    "total_achievements": 150,
    "unlocked_count": 42,
    "progress_percentage": 28
  }
}
```

---

### ENDPOINT 5: GET /api/rankings/leaderboard/:category

**Descripción:**  
Obtiene un leaderboard filtrado por categoría específica.

**Método:** `GET`  
**URL:** `/api/rankings/leaderboard/:category`  
**Autenticación:** No requerida  
**Path Params:**
- `category` (string): 'nivel', 'victorias', 'winrate', 'riqueza', 'actividad', 'tiempo_jugado'

**Query Params (Opcionales):**
- `page` (number): Número de página (default 1)
- `limit` (number): Items por página (default 50)
- `timeframe` (string): 'global', 'weekly', 'monthly' (default 'global')

**Response (200 - Éxito):**
```json
{
  "ok": true,
  "category": "nivel",
  "timeframe": "global",
  "leaderboard": [
    {
      "posicion": 1,
      "userId": "user_001",
      "username": "JuanElCampeón",
      "valor": 50,
      "cambio_posicion": 2,
      "insignia": "👑 Rey",
      "puntos_ranking": 5000,
      "secundario": {
        "victorias": 250,
        "tasa_victoria": 84.7
      }
    },
    {
      "posicion": 2,
      "userId": "user_002",
      "username": "MaestroOscuro",
      "valor": 48,
      "cambio_posicion": -1,
      "insignia": "⭐ Leyenda",
      "puntos_ranking": 4800,
      "secundario": {
        "victorias": 230,
        "tasa_victoria": 82.1
      }
    }
  ],
  "user_position": {
    "posicion": 42,
    "username": "TuNombre",
    "valor": 35,
    "puntos_ranking": 2500
  },
  "total_players": 1523,
  "page": 1,
  "pages": 31,
  "last_updated": "2025-11-30T12:00:00Z"
}
```

**Response (400 - Categoría inválida):**
```json
{
  "ok": false,
  "error": "Categoría no válida. Opciones: nivel, victorias, winrate, riqueza, actividad, tiempo_jugado"
}
```

---

## 📱 INTEGRACIÓN EN FRONTEND

Ver archivos en: `integracion-frontend/`

Cada endpoint tendrá una guía separada con:
- Servicio Angular (método TypeScript)
- Componente ejemplo (HTML + TS)
- Manejo de errores
- Casos de uso reales

---

## ✅ TESTING Y VALIDACIÓN

Ver archivo: `testing/curl-commands.md`

Comandos para probar cada endpoint:
- Con `curl`
- Con Postman
- Con validación de respuestas

---

## 📚 ARCHIVOS RELACIONADOS EN ESTA CARPETA

```
docs/03_implementacion_endpoints/
├── 00_MAESTRO_ENDPOINTS_NUEVOS.md      ← Tú estás aquí
├── endpoints/
│   ├── 01_GET_dungeons_id.md
│   ├── 02_GET_user_profile.md
│   ├── 03_GET_achievements.md
│   ├── 04_GET_achievements_userId.md
│   └── 05_GET_rankings_leaderboard.md
├── flujos/
│   ├── FLUJO_COMPLETO_USUARIO.md
│   ├── FLUJO_SELECCION_EQUIPO.md
│   └── FLUJO_VER_RESULTADOS.md
├── integracion-frontend/
│   ├── 01_ANGULAR_GET_dungeons_id.md
│   ├── 02_ANGULAR_GET_user_profile.md
│   ├── 03_ANGULAR_GET_achievements.md
│   ├── 04_ANGULAR_GET_achievements_userId.md
│   └── 05_ANGULAR_GET_rankings_leaderboard.md
├── ejemplos/
│   ├── response-examples.json
│   └── curl-commands.md
└── RESUMEN_IMPLEMENTACION.md
```

---

**Próximos pasos:**
1. ✅ Crear estructura (EN PROGRESO)
2. ⏳ Implementar cada endpoint en backend
3. ⏳ Documentar integración en frontend
4. ⏳ Crear flujos visuales
5. ⏳ Testing completo
6. ⏳ Revisión y limpieza

