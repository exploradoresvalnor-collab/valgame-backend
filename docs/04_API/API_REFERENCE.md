# 📖 API REFERENCE - VALGAME BACKEND

## 🌐 Base URL
```
Development: http://localhost:8080
Production: https://api.valnor.com
```

---

## 🔐 AUTENTICACIÓN

### Registro de Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response 201:**
```json
{
  "message": "Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta."
}
```

**Errors:**
- `409`: Email o username ya existe
- `400`: Datos inválidos

---

### Verificar Email
```http
GET /auth/verify/:token
```

**Response 200:**
```json
{
  "message": "Cuenta verificada con éxito",
  "package": {
    "personajes": [...],
    "items": [...],
    "recursos": {...}
  }
}
```

**Errors:**
- `400`: Token inválido o expirado

---

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "val": 100,
    "boletos": 5,
    "evo": 0,
    "personajes": [...],
    "inventarioEquipamiento": [...],
    "inventarioConsumibles": [...]
  }
}
```

**Errors:**
- `401`: Credenciales inválidas
- `403`: Cuenta no verificada

---

## 👤 USUARIO

### Obtener Usuario Actual
```http
GET /api/users/me
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "username",
  "isVerified": true,
  "val": 100,
  "boletos": 5,
  "evo": 0,
  "invocaciones": 1,
  "evoluciones": 0,
  "boletosDiarios": 3,
  "personajes": [
    {
      "_id": "char_id",
      "personajeId": "base_d_001",
      "rango": "D",
      "nivel": 1,
      "etapa": 1,
      "experiencia": 0,
      "stats": {
        "atk": 10,
        "defensa": 10,
        "vida": 100
      },
      "saludActual": 100,
      "saludMaxima": 100,
      "estado": "saludable",
      "equipamiento": [],
      "activeBuffs": []
    }
  ],
  "inventarioEquipamiento": [],
  "inventarioConsumibles": [
    {
      "consumableId": "item_id",
      "usos_restantes": 1
    }
  ]
}
```

---

## 🎮 PERSONAJES

### Usar Consumible
```http
POST /api/characters/:characterId/use-consumable
Authorization: Bearer {token}
Content-Type: application/json

{
  "consumableId": "consumable_id"
}
```

**Response 200:**
```json
{
  "message": "Consumible aplicado correctamente",
  "character": {...},
  "buff": {
    "consumableId": "consumable_id",
    "effects": {
      "mejora_atk": 5,
      "mejora_defensa": 3
    },
    "expiresAt": "2024-01-20T15:30:00.000Z"
  }
}
```

---

### Revivir Personaje
```http
POST /api/characters/:characterId/revive
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Personaje revivido exitosamente",
  "character": {...},
  "costoVal": 50
}
```

**Errors:**
- `400`: Personaje no está herido
- `400`: VAL insuficiente

---

### Curar Personaje
```http
POST /api/characters/:characterId/heal
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Personaje curado exitosamente",
  "character": {...}
}
```

---

### Evolucionar Personaje
```http
POST /api/characters/:characterId/evolve
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Personaje evolucionado exitosamente",
  "character": {
    "etapa": 2,
    "stats": {
      "atk": 25,
      "defensa": 20,
      "vida": 200
    }
  }
}
```

**Errors:**
- `400`: Nivel insuficiente
- `400`: EVO insuficiente
- `400`: Ya está en etapa máxima

---

### Añadir Experiencia
```http
POST /api/characters/:characterId/add-experience
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 200
}
```

**Response 200:**
```json
{
  "message": "Experiencia añadida",
  "character": {
    "nivel": 2,
    "experiencia": 50,
    "stats": {
      "atk": 12,
      "defensa": 12,
      "vida": 110
    }
  },
  "leveledUp": true,
  "newLevel": 2
}
```

---

## 🏪 MARKETPLACE

### Listar Items
```http
GET /api/marketplace/listings?type=equipment&precioMin=10&precioMax=100&limit=20
```

**Query Parameters:**
- `type`: 'character' | 'equipment' | 'consumable'
- `precioMin`: number
- `precioMax`: number
- `destacados`: boolean
- `rango`: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS'
- `nivelMin`: number
- `nivelMax`: number
- `limit`: number (default: 20)
- `offset`: number (default: 0)

**Response 200:**
```json
[
  {
    "_id": "listing_id",
    "vendedor": "user_id",
    "tipo": "equipment",
    "itemId": "item_id",
    "precio": 50,
    "estado": "activo",
    "destacado": false,
    "fechaCreacion": "2024-01-15T10:00:00.000Z",
    "fechaExpiracion": "2024-01-22T10:00:00.000Z",
    "metadata": {
      "nivel": 5,
      "stats": {
        "atk": 10,
        "defensa": 5
      }
    },
    "vendedorData": {
      "username": "seller_username"
    }
  }
]
```

---

### Crear Listing
```http
POST /api/marketplace/listings
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemId": "item_id",
  "precio": 50,
  "destacar": false,
  "metadata": {
    "nivel": 5,
    "stats": {
      "atk": 10,
      "defensa": 5
    }
  }
}
```

**Response 201:**
```json
{
  "_id": "listing_id",
  "vendedor": "user_id",
  "itemId": "item_id",
  "precio": 50,
  "estado": "activo",
  "fechaCreacion": "2024-01-15T10:00:00.000Z",
  "fechaExpiracion": "2024-01-22T10:00:00.000Z"
}
```

**Errors:**
- `400`: Item no encontrado
- `400`: Item ya está listado
- `400`: VAL insuficiente (si destacar=true)

---

### Comprar Item
```http
POST /api/marketplace/listings/:id/buy
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Compra exitosa",
  "listing": {...},
  "transaction": {
    "tipo": "compra_marketplace",
    "monto": 50,
    "fecha": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `400`: Listing no disponible
- `400`: VAL insuficiente
- `400`: No puedes comprar tu propio item

---

### Cancelar Listing
```http
POST /api/marketplace/listings/:id/cancel
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Listing cancelado exitosamente",
  "listing": {...}
}
```

**Errors:**
- `403`: No eres el dueño del listing
- `400`: Listing ya no está activo

---

## 📦 PAQUETES

### Listar Paquetes Disponibles
```http
GET /api/packages
```

**Response 200:**
```json
[
  {
    "_id": "package_id",
    "nombre": "Paquete Básico",
    "precio_usdt": 10,
    "personajes": 3,
    "categorias_garantizadas": ["D", "C"],
    "distribucion_aleatoria": "D:60,C:30,B:10",
    "val_reward": 100,
    "items_reward": ["item_id_1", "item_id_2"]
  }
]
```

---

### Obtener Paquetes del Usuario
```http
GET /api/user-packages
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "_id": "user_package_id",
    "userId": "user_id",
    "packageId": "package_id",
    "abierto": false,
    "fechaCompra": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### Comprar Paquete
```http
POST /api/user-packages/purchase
Authorization: Bearer {token}
Content-Type: application/json

{
  "packageId": "package_id",
  "paymentMethod": "val"
}
```

**Response 200:**
```json
{
  "message": "Paquete comprado exitosamente",
  "userPackage": {
    "_id": "user_package_id",
    "packageId": "package_id",
    "abierto": false
  }
}
```

---

### Abrir Paquete
```http
POST /api/user-packages/open
Authorization: Bearer {token}
Content-Type: application/json

{
  "userPackageId": "user_package_id"
}
```

**Response 200:**
```json
{
  "message": "Paquete abierto exitosamente",
  "rewards": {
    "personajes": [
      {
        "personajeId": "base_c_001",
        "rango": "C",
        "nivel": 1
      }
    ],
    "items": [
      {
        "itemId": "item_id",
        "cantidad": 1
      }
    ],
    "val": 100
  }
}
```

---

## 🏰 MAZMORRAS

### Listar Mazmorras
```http
GET /api/dungeons
```

**Response 200:**
```json
[
  {
    "_id": "67890abc123",
    "nombre": "Cueva de los Goblins",
    "descripcion": "Una cueva oscura infestada de goblins débiles. Ideal para novatos.",
    "nivel_requerido_minimo": 1,
    "stats": {
      "vida": 150,
      "ataque": 15,
      "defensa": 10
    },
    "probabilidades": {
      "fallo_ataque_jugador": 0.10,
      "fallo_ataque_propio": 0.30
    },
    "recompensas": {
      "expBase": 50,
      "valBase": 10,
      "dropTable": [
        {
          "itemId": "item_id_1",
          "tipoItem": "Equipment",
          "probabilidad": 0.15
        }
      ]
    },
    "nivel_sistema": {
      "multiplicador_stats_por_nivel": 0.15,
      "multiplicador_val_por_nivel": 0.10,
      "multiplicador_xp_por_nivel": 0.10,
      "multiplicador_drop_por_nivel": 0.05,
      "nivel_maximo_recomendado": 50
    },
    "nivel_minimo_para_exclusivos": 20,
    "items_exclusivos": [],
    "personajes_exclusivos": []
  }
]
```

---

### Obtener Progreso en Mazmorra
```http
GET /api/dungeons/:id/progress
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "mazmorra": {
    "id": "67890abc123",
    "nombre": "Cueva de los Goblins",
    "descripcion": "Una cueva oscura...",
    "nivel_requerido_minimo": 1
  },
  "progreso": {
    "victorias": 15,
    "derrotas": 3,
    "nivel_actual": 4,
    "puntos_acumulados": 89,
    "puntos_requeridos_siguiente_nivel": 337,
    "mejor_tiempo": 145,
    "ultima_victoria": "2025-10-22T15:30:00Z"
  },
  "estadisticas_globales": {
    "racha_actual": 5,
    "racha_maxima": 12,
    "total_victorias": 87,
    "total_derrotas": 15,
    "mejor_racha": 12
  }
}
```

**Errors:**
- `401`: No autenticado
- `404`: Mazmorra no encontrada

---

### Iniciar Combate
```http
POST /api/dungeons/:id/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "team": ["personaje-id-1", "personaje-id-2"]
}
```

**Response 200 (Victoria):**
```json
{
  "resultado": "victoria",
  "log": [
    "🏰 Mazmorra Nivel 4",
    "💪 Stats: 240 HP | 24 ATK | 16 DEF",
    "",
    "--- Turno del Equipo ---",
    "El equipo ataca y causa 45 de daño. Vida de la mazmorra: 195",
    "--- Turno de la Mazmorra ---",
    "La mazmorra ataca y causa 12 de daño total.",
    " -> personaje-1 recibe 12 de daño. Salud restante: 108",
    "...",
    "¡VICTORIA! Has superado la mazmorra.",
    "Experiencia base por victoria: 70.",
    "VAL ganado: 14.",
    " -> personaje-1 gana 70 de experiencia.",
    "¡Has obtenido un equipo: Espada de Acero!",
    "",
    "🎯 Puntos de mazmorra ganados: 47",
    "📊 Progreso: 136/337 pts (Nivel 4)",
    "🔥 Racha actual: 3 victoria(s) consecutiva(s)"
  ],
  "recompensas": {
    "expGanada": 140,
    "valGanado": 14,
    "botinObtenido": [
      {
        "itemId": "item_id_1",
        "nombre": "Espada de Acero"
      }
    ]
  },
  "progresionMazmorra": {
    "puntosGanados": 47,
    "nivelActual": 4,
    "puntosActuales": 136,
    "puntosRequeridos": 337,
    "subiDeNivel": false,
    "nivelesSubidos": 0
  },
  "rachaActual": 3,
  "tiempoCombate": 145,
  "estadoEquipo": [
    {
      "personajeId": "personaje-1",
      "saludFinal": 108,
      "nivelFinal": 6,
      "estado": "saludable"
    },
    {
      "personajeId": "personaje-2",
      "saludFinal": 85,
      "nivelFinal": 5,
      "estado": "saludable"
    }
  ]
}
```

**Response 200 (Derrota):**
```json
{
  "resultado": "derrota",
  "log": [
    "🏰 Mazmorra Nivel 4",
    "💪 Stats: 240 HP | 24 ATK | 16 DEF",
    "",
    "...",
    "DERROTA... Tu equipo ha sido vencido."
  ],
  "recompensas": {
    "expGanada": 0,
    "valGanado": 0,
    "botinObtenido": []
  },
  "progresionMazmorra": null,
  "rachaActual": 0,
  "tiempoCombate": 89,
  "estadoEquipo": [
    {
      "personajeId": "personaje-1",
      "saludFinal": 0,
      "nivelFinal": 6,
      "estado": "herido"
    },
    {
      "personajeId": "personaje-2",
      "saludFinal": 0,
      "nivelFinal": 5,
      "estado": "herido"
    }
  ]
}
```

**Errors:**
- `401`: No autenticado
- `404`: Mazmorra o personaje no encontrado
- `400`: Equipo vacío, personajes heridos, o nivel insuficiente

**Notas:**
- ✨ Las stats del boss escalan según tu nivel de mazmorra (+15% por nivel)
- ✨ Las recompensas escalan según tu nivel (+10% XP/VAL por nivel)
- ✨ Los drops mejoran hasta 2x en nivel 20+ (+5% por nivel)
- ✨ Items exclusivos se desbloquean al alcanzar nivel 20 en la mazmorra
- ✨ Los puntos ganados dependen de: tiempo, salud restante, racha
- ✨ Progresión exponencial: 100 → 150 → 225 → 337... puntos por nivel

---

## ⚙️ CONFIGURACIÓN

### Obtener Configuración del Juego
```http
GET /api/game-settings
```

**Response 200:**
```json
{
  "nivel_maximo_personaje": 100,
  "costo_revivir_personaje": 50,
  "MAX_PERSONAJES_POR_EQUIPO": 3,
  "EXP_GLOBAL_MULTIPLIER": 1,
  "PERMADEATH_TIMER_HOURS": 24,
  "nivel_evolucion_etapa_2": 40,
  "nivel_evolucion_etapa_3": 100,
  "aumento_stats_por_nivel": {
    "D": { "atk": 2, "defensa": 2, "vida": 10 },
    "C": { "atk": 3, "defensa": 3, "vida": 15 },
    "B": { "atk": 4, "defensa": 4, "vida": 20 },
    "A": { "atk": 5, "defensa": 5, "vida": 25 },
    "S": { "atk": 6, "defensa": 6, "vida": 30 }
  }
}
```

---

### Obtener Requisitos de Nivel
```http
GET /api/level-requirements
```

**Response 200:**
```json
[
  {
    "nivel": 2,
    "experiencia_requerida": 200,
    "experiencia_acumulada": 200
  },
  {
    "nivel": 3,
    "experiencia_requerida": 300,
    "experiencia_acumulada": 500
  }
]
```

---

### Obtener Personajes Base
```http
GET /api/base-characters
```

**Response 200:**
```json
[
  {
    "id": "base_d_001",
    "nombre": "Aventurero Novato",
    "descripcion": "Un aventurero principiante",
    "descripcion_rango": "D",
    "stats": {
      "atk": 10,
      "defensa": 10,
      "vida": 100
    },
    "imagen": "aventurero_novato.png"
  }
]
```

---

## 🛡️ ITEMS

### Obtener Equipamiento
```http
GET /api/equipment
```

**Response 200:**
```json
[
  {
    "_id": "equipment_id",
    "nombre": "Espada de Hierro",
    "descripcion": "Una espada básica",
    "rareza": "comun",
    "tipoItem": "Equipment",
    "tipoEquipamiento": "arma",
    "stats": {
      "mejora_atk": 5
    },
    "precio_val": 50
  }
]
```

---

### Obtener Consumibles
```http
GET /api/consumables
```

**Response 200:**
```json
[
  {
    "_id": "consumable_id",
    "nombre": "Poción de Vida",
    "descripcion": "Restaura HP",
    "rareza": "comun",
    "tipoItem": "Consumable",
    "efectos": {
      "mejora_vida": 50
    },
    "duracion_minutos": 0,
    "usos_maximos": 1,
    "precio_val": 10
  }
]
```

---

## 🔒 AUTENTICACIÓN EN REQUESTS

Todas las rutas protegidas requieren el header de autorización:

```http
Authorization: Bearer {token}
```

El token se obtiene al hacer login y debe incluirse en todas las peticiones a rutas protegidas.

---

## ⚠️ CÓDIGOS DE ERROR COMUNES

| Código | Significado |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: email duplicado) |
| 500 | Internal Server Error - Error del servidor |

---

## 📝 FORMATO DE ERRORES

```json
{
  "error": "Mensaje de error descriptivo"
}
```

O para errores de validación:

```json
{
  "error": {
    "message": "Validation error",
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      }
    ]
  }
}
```

---

## 🔄 WEBSOCKET EVENTS

### Conectar
```javascript
const socket = io('http://localhost:8080');

// Autenticar
socket.emit('auth', token);

socket.on('auth:success', () => {
  console.log('Autenticado');
});
```

### Eventos Disponibles

**Del servidor al cliente:**
- `inventory:update` - Actualización de inventario
- `reward:received` - Recompensa recibida
- `character:update` - Actualización de personaje
- `marketplace:update` - Actualización del marketplace
- `game:event` - Evento global del juego
- `rankings:update` - Actualización de rankings
- `battle:update` - Actualización de batalla

---

## 🧪 TESTING CON CURL

### Registro
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Obtener Usuario (con token)
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📚 RECURSOS ADICIONALES

- **Postman Collection**: Importa la colección de Postman para probar todos los endpoints
- **Swagger/OpenAPI**: (Próximamente) Documentación interactiva
- **Tests E2E**: Revisa `/tests/e2e` para ejemplos de uso

---

**Última actualización:** Enero 2024  
**Versión del API:** 1.0.0
