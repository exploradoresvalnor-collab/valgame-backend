# 🔌 API REFERENCE COMPLETA - Valgame Backend

**Última actualización:** 20 de noviembre de 2025  
**Tiempo de lectura:** 25 minutos

---

## 🎯 VISIÓN GENERAL

Referencia completa de la **API REST** del backend Valgame, incluyendo todos los endpoints, parámetros, respuestas y ejemplos de uso.

---

## 🌐 BASE URL

```
Producción: https://valgame-backend.onrender.com
Desarrollo: http://localhost:8080
```

---

## 🔐 AUTENTICACIÓN

Todos los endpoints requieren autenticación JWT excepto login y registro.

### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Obtener Token
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 📋 ENDPOINTS POR MÓDULO

### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/login` | Login usuario | ❌ |
| POST | `/register` | Registro usuario | ❌ |
| POST | `/logout` | Logout usuario | ✅ |
| POST | `/refresh` | Refresh token | ✅ |
| POST | `/forgot-password` | Solicitar reset password | ❌ |
| POST | `/reset-password` | Reset password con token | ❌ |

### 👤 Usuarios (`/api/users`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Obtener perfil usuario | ✅ |
| PUT | `/profile` | Actualizar perfil | ✅ |
| GET | `/stats` | Estadísticas usuario | ✅ |
| GET | `/:id` | Obtener usuario público | ✅ |

### ⚔️ Personajes (`/api/characters`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar personajes usuario | ✅ |
| POST | `/` | Crear personaje | ✅ |
| GET | `/:id` | Obtener personaje | ✅ |
| PUT | `/:id` | Actualizar personaje | ✅ |
| DELETE | `/:id` | Eliminar personaje | ✅ |
| POST | `/:id/evolve` | Evolucionar personaje | ✅ |
| PUT | `/:id/equip/:equipmentId` | Equipar item | ✅ |
| PUT | `/:id/unequip/:slot` | Desequipar item | ✅ |

### 🏰 Mazmorras (`/api/dungeons`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar mazmorras disponibles | ✅ |
| GET | `/:id` | Detalles mazmorra | ✅ |
| POST | `/:id/enter` | Entrar a mazmorra | ✅ |

### 🏆 Rankings (`/api/rankings`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/global` | Ranking global | ✅ |
| GET | `/weekly` | Ranking semanal | ✅ |
| GET | `/monthly` | Ranking mensual | ✅ |
| GET | `/user/:userId` | Ranking de usuario | ✅ |
| POST | `/match` | Registrar partida | ✅ |

### 🏪 Marketplace (`/api/marketplace`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar anuncios | ✅ |
| POST | `/` | Crear anuncio | ✅ |
| GET | `/:id` | Detalles anuncio | ✅ |
| PUT | `/:id` | Actualizar anuncio | ✅ |
| DELETE | `/:id` | Cancelar anuncio | ✅ |
| POST | `/:id/buy` | Comprar item | ✅ |
| GET | `/my-listings` | Mis anuncios | ✅ |

### ⚙️ Sistema (`/api/system`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | ❌ |
| GET | `/version` | Versión API | ❌ |
| GET | `/config` | Configuración pública | ❌ |

---

## 📝 DETALLES DE ENDPOINTS

### 🔐 AUTENTICACIÓN

#### POST `/api/auth/login`
**Login de usuario**

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "user@example.com",
      "val": 1500,
      "evo": 25,
      "energia": 85,
      "energiaMaxima": 100
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: Credenciales incorrectas
- `429`: Demasiados intentos

#### POST `/api/auth/register`
**Registro de nuevo usuario**

**Request:**
```json
{
  "username": "player123",
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "user@example.com",
      "val": 1000,
      "evo": 0,
      "energia": 100,
      "energiaMaxima": 100
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores:**
- `400`: Datos inválidos o usuario/email ya existe
- `429`: Demasiados intentos

#### POST `/api/auth/logout`
**Logout de usuario**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

### 👤 USUARIOS

#### GET `/api/users/profile`
**Obtener perfil del usuario autenticado**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "user@example.com",
      "val": 1500,
      "evo": 25,
      "energia": 85,
      "energiaMaxima": 100,
      "ultimoReinicioEnergia": "2025-11-20T10:30:00.000Z",
      "createdAt": "2025-11-01T00:00:00.000Z",
      "updatedAt": "2025-11-20T15:45:00.000Z"
    },
    "stats": {
      "totalPersonajes": 5,
      "nivelPromedio": 12.4,
      "personajesHeridos": 1,
      "rankingGlobal": 1250
    }
  }
}
```

#### PUT `/api/users/profile`
**Actualizar perfil de usuario**

**Request:**
```json
{
  "username": "nuevo_username"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "nuevo_username",
      "email": "user@example.com"
    }
  }
}
```

### ⚔️ PERSONAJES

#### GET `/api/characters`
**Listar personajes del usuario**

**Query Params:**
- `page`: número de página (default: 1)
- `limit`: items por página (default: 10, max: 50)
- `sort`: campo para ordenar (nivel, experiencia, etc.)
- `estado`: filtrar por estado (saludable, herido)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "characters": [
      {
        "id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "baseCharacterId": "507f1f77bcf86cd799439013",
        "nivel": 15,
        "experiencia": 2450,
        "hp_actual": 120,
        "hp_maximo": 140,
        "ataque_base": 28,
        "defensa_base": 22,
        "estado": "saludable",
        "etapa_evolucion": 2,
        "puede_evolucionar": false,
        "equipamiento": {
          "arma": "507f1f77bcf86cd799439014",
          "armadura": "507f1f77bcf86cd799439015",
          "accesorio": null
        },
        "createdAt": "2025-11-15T08:00:00.000Z",
        "updatedAt": "2025-11-20T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### POST `/api/characters`
**Crear nuevo personaje**

**Request:**
```json
{
  "baseCharacterId": "507f1f77bcf86cd799439011"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Personaje creado exitosamente",
  "data": {
    "character": {
      "id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "baseCharacterId": "507f1f77bcf86cd799439011",
      "nivel": 1,
      "experiencia": 0,
      "hp_actual": 100,
      "hp_maximo": 100,
      "ataque_base": 10,
      "defensa_base": 8,
      "estado": "saludable",
      "etapa_evolucion": 1,
      "puede_evolucionar": false,
      "equipamiento": {}
    }
  }
}
```

**Errores:**
- `400`: BaseCharacter no existe o usuario sin VAL suficiente
- `409`: Límite de personajes alcanzado

#### POST `/api/characters/:id/evolve`
**Evolucionar personaje**

**Response (200):**
```json
{
  "success": true,
  "message": "Personaje evolucionado exitosamente",
  "data": {
    "character": {
      "id": "507f1f77bcf86cd799439011",
      "etapa_evolucion": 3,
      "puede_evolucionar": false,
      "hp_maximo": 180,
      "ataque_base": 35,
      "defensa_base": 28
    },
    "cost": {
      "evo": 10
    }
  }
}
```

**Errores:**
- `400`: Personaje no puede evolucionar o EVO insuficiente
- `404`: Personaje no encontrado

### 🏰 MAZMORRAS

#### GET `/api/dungeons`
**Listar mazmorras disponibles**

**Query Params:**
- `nivel_min`: nivel mínimo requerido
- `dificultad`: facil, medio, dificil, epico

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dungeons": [
      {
        "id": "507f1f77bcf86cd799439011",
        "nombre": "Bosque Encantado",
        "descripcion": "Un bosque lleno de criaturas mágicas",
        "nivel_requerido": 1,
        "costo_energia": 10,
        "dificultad": "facil",
        "activo": true,
        "recompensas": {
          "experiencia_min": 50,
          "experiencia_max": 100,
          "val_min": 10,
          "val_max": 25
        }
      }
    ]
  }
}
```

#### POST `/api/dungeons/:id/enter`
**Entrar a mazmorra con personaje**

**Request:**
```json
{
  "characterId": "507f1f77bcf86cd799439011"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Combate completado",
  "data": {
    "result": "victoria",
    "rewards": {
      "experiencia": 75,
      "val": 18,
      "items": []
    },
    "character": {
      "id": "507f1f77bcf86cd799439011",
      "nivel": 2,
      "experiencia": 75,
      "hp_actual": 85,
      "estado": "herido"
    }
  }
}
```

**Errores:**
- `400`: Energía insuficiente o personaje no cumple requisitos
- `404`: Mazmorra o personaje no encontrado

### 🏆 RANKINGS

#### GET `/api/rankings/global`
**Obtener ranking global**

**Query Params:**
- `page`: página (default: 1)
- `limit`: items por página (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "position": 1,
        "user": {
          "id": "507f1f77bcf86cd799439011",
          "username": "top_player",
          "nivel_promedio": 25
        },
        "puntos": 2500,
        "victorias": 45,
        "derrotas": 5,
        "boletosUsados": 50
      }
    ],
    "userRank": {
      "position": 125,
      "puntos": 1200,
      "victorias": 15,
      "derrotas": 8
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "pages": 20
    }
  }
}
```

### 🏪 MARKETPLACE

#### GET `/api/marketplace`
**Listar anuncios activos**

**Query Params:**
- `page`: página
- `limit`: items por página
- `tipo`: arma, armadura, accesorio
- `rareza`: comun, raro, epico, legendario
- `precio_min`: precio mínimo
- `precio_max`: precio máximo
- `sort`: precio_asc, precio_desc, fecha_desc

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "507f1f77bcf86cd799439011",
        "vendedorId": "507f1f77bcf86cd799439012",
        "vendedor": {
          "username": "seller123"
        },
        "item": {
          "id": "507f1f77bcf86cd799439013",
          "nombre": "Espada Legendaria",
          "tipo": "arma",
          "rareza": "legendario",
          "estadisticas_bonus": {
            "ataque_base": 15
          }
        },
        "precio": 500,
        "estado": "activo",
        "fecha_creacion": "2025-11-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### POST `/api/marketplace`
**Crear anuncio de venta**

**Request:**
```json
{
  "itemId": "507f1f77bcf86cd799439011",
  "precio": 250
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Anuncio creado exitosamente",
  "data": {
    "listing": {
      "id": "507f1f77bcf86cd799439012",
      "vendedorId": "507f1f77bcf86cd799439013",
      "itemId": "507f1f77bcf86cd799439011",
      "precio": 250,
      "estado": "activo",
      "fecha_creacion": "2025-11-20T15:30:00.000Z"
    }
  }
}
```

#### POST `/api/marketplace/:id/buy`
**Comprar item del marketplace**

**Response (200):**
```json
{
  "success": true,
  "message": "Compra realizada exitosamente",
  "data": {
    "transaction": {
      "listingId": "507f1f77bcf86cd799439011",
      "compradorId": "507f1f77bcf86cd799439012",
      "vendedorId": "507f1f77bcf86cd799439013",
      "precio": 250,
      "fecha": "2025-11-20T16:00:00.000Z"
    }
  }
}
```

**Errores:**
- `400`: Fondos insuficientes o anuncio no activo
- `404`: Anuncio no encontrado

---

## 📊 CÓDIGOS DE ERROR

### Errores Comunes
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      }
    ]
  }
}
```

### Códigos de Error
| Código | HTTP | Descripción |
|--------|------|-------------|
| `VALIDATION_ERROR` | 400 | Datos de entrada inválidos |
| `UNAUTHORIZED` | 401 | Token inválido o expirado |
| `FORBIDDEN` | 403 | Permisos insuficientes |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `CONFLICT` | 409 | Conflicto (ej: usuario ya existe) |
| `RATE_LIMITED` | 429 | Demasiadas peticiones |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

---

## 🔄 RATE LIMITING

### Límites por Endpoint
- **Autenticación:** 5 requests/minuto por IP
- **API General:** 100 requests/minuto por usuario
- **Creación de personajes:** 10 requests/minuto por usuario
- **Entradas a mazmorra:** 30 requests/minuto por usuario
- **Marketplace:** 50 requests/minuto por usuario

### Headers de Rate Limit
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637424000
```

---

## 📝 PAGINACIÓN

### Formato Estándar
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Parámetros
- `page`: Página actual (default: 1)
- `limit`: Items por página (default: 10, max: 100)

---

## 🔍 FILTROS Y BÚSQUEDA

### Marketplace Filters
```bash
GET /api/marketplace?tipo=arma&rareza=epico&precio_min=100&precio_max=500&sort=precio_asc
```

### Characters Filters
```bash
GET /api/characters?estado=saludable&nivel_min=10&sort=nivel_desc
```

### Rankings Filters
```bash
GET /api/rankings/global?page=2&limit=25
```

---

## 📋 VALIDACIONES

### Email
- Formato válido
- Único en el sistema
- Máximo 100 caracteres

### Username
- 3-20 caracteres
- Solo letras, números, _ y -
- Único en el sistema

### Password
- Mínimo 8 caracteres
- Al menos 1 mayúscula, 1 minúscula, 1 número

### VAL/EVO
- Números positivos
- Máximo 9,999,999

### Nombres
- 2-50 caracteres
- Sin caracteres especiales

---

## 🧪 EJEMPLOS DE USO

### Flujo Completo de Juego
```bash
# 1. Registro
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!"}'

# 2. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# 3. Crear personaje
curl -X POST http://localhost:8080/api/characters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"baseCharacterId":"507f1f77bcf86cd799439011"}'

# 4. Entrar a mazmorra
curl -X POST http://localhost:8080/api/dungeons/507f1f77bcf86cd799439011/enter \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"characterId":"507f1f77bcf86cd799439012"}'

# 5. Ver ranking
curl -X GET http://localhost:8080/api/rankings/global \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔗 REFERENCIAS

### Documentación Relacionada
- **[Modelos de Datos](../01_BACKEND_CORE/MODELOS_DATOS.md)** - Schemas completos
- **[Arquitectura General](../00_INICIO/ARQUITECTURA_GENERAL.md)** - Visión sistema
- **[Base de Datos](../01_BACKEND_CORE/BASE_DATOS.md)** - Configuración MongoDB

### Herramientas
- **[Thunder Client](https://www.thunderclient.com/)** - Testing API
- **[Postman](https://www.postman.com/)** - API Testing
- **[Swagger UI](https://swagger.io/tools/swagger-ui/)** - Documentación interactiva

---

**🔌 API:** RESTful completa  
**🔐 Seguridad:** JWT + Rate limiting  
**📊 Datos:** JSON estructurado  
**⚡ Performance:** Paginación + filtros  
**🧪 Testing:** Ejemplos incluidos  

---

**📅 Última actualización:** 20 de noviembre de 2025  
**👥 API Designer:** Equipo Valgame  
**📖 Estado:** ✅ Documentada y probada</content>
<parameter name="filePath">c:\Users\Haustman\Desktop\valgame-backend\docs_reorganizada\01_BACKEND_CORE\API_REFERENCE_COMPLETA.md