# 📖 Referencia Completa API Backend - Valgame

> **URL Base de Producción:** `https://valgame-backend.onrender.com`  
> **Status:** ✅ LIVE y funcional  
> **Última actualización:** 3 de noviembre de 2025

---

## 📋 Tabla de Contenidos

1. [Información General](#información-general)
2. [Autenticación y Seguridad](#autenticación-y-seguridad)
3. [Endpoints Públicos](#endpoints-públicos)
4. [Endpoints Protegidos](#endpoints-protegidos)
5. [WebSocket (Tiempo Real)](#websocket-tiempo-real)
6. [Modelos de Datos](#modelos-de-datos)
7. [Códigos de Error](#códigos-de-error)
8. [Rate Limiting](#rate-limiting)

---

## 🌐 Información General

### URLs Importantes
- **Producción:** `https://valgame-backend.onrender.com`
- **Health Check:** `https://valgame-backend.onrender.com/health`
- **WebSocket:** `wss://valgame-backend.onrender.com` (usar Socket.IO)

### Base de Datos
- **MongoDB Atlas:** Conectado y funcionando
- **Cluster:** valnor.kspbuki.mongodb.net
- **Base de datos:** Valnor

### Tecnologías Backend
- **Runtime:** Node.js 22.16.0
- **Framework:** Express.js
- **Validación:** Zod schemas
- **Autenticación:** JWT (jsonwebtoken)
- **WebSocket:** Socket.IO
- **ODM:** Mongoose 8.8.4

---

## 🔐 Autenticación y Seguridad

### 📧 Configuración de Email (Gmail SMTP)

**Sistema de envío de emails reales configurado:**
- **Host:** smtp.gmail.com
- **Puerto:** 587
- **Email:** romerolivo1234@gmail.com
- **Estado:** ✅ Funcional y probado
- ⚠️ Los emails pueden llegar a SPAM inicialmente

### Flujo de Registro y Login

#### 1. Registro de Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "password": "contraseña_segura"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta."
}
```

**Notas importantes:**
- La contraseña debe tener mínimo 6 caracteres
- El username debe tener mínimo 3 caracteres
- Se envía un correo de verificación automáticamente (Gmail real)
- El usuario NO puede hacer login hasta verificar su cuenta
- Email con diseño HTML moderno incluido

#### 2. Verificación de Email
```http
GET /auth/verify/:token
```

**Respuesta exitosa (200):**
```json
{
  "message": "Cuenta verificada con éxito",
  "package": {
    "packageName": "Paquete del Pionero",
    "personajes": [...],
    "val": 100,
    "boletos": 5,
    "evo": 2
  }
}
```

**🎁 Paquete del Pionero (ACTUALIZADO - Noviembre 2025):**
- ✅ **100 VAL** (moneda del juego)
- ✅ **5 Boletos** de invocación
- ✅ **2 Cristales EVO** para evolucionar
- ✅ **1 Personaje base** (nivel 1, aleatorio)
- ✅ **3 Pociones de Vida Menor** (consumibles)
- ✅ **1 Espada de Madera** (equipamiento básico)
- ✅ Usuario puede jugar inmediatamente después de verificar

#### 3. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6784...",
    "email": "usuario@ejemplo.com",
    "username": "usuario123",
    "val": 1500,
    "boletos": 10,
    "personajes": [...],
    "isVerified": true
  }
}
```

**Errores comunes:**
- `401`: Credenciales inválidas
- `403`: Cuenta no verificada (revisar correo)

#### 4. Logout
```http
POST /auth/logout
Cookie: token=<JWT>  (automático, enviado por navegador)
```

**No requiere body.** La cookie se envía automáticamente.

**Respuesta exitosa (200):**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

**¿Qué hace el logout?**
1. ✅ Agrega el token a la **blacklist** (invalida el token permanentemente)
2. ✅ Borra la cookie del navegador
3. ✅ Previene reuso del token incluso si fue copiado
4. ✅ Token blacklisteado se guarda con fecha de expiración automática

**Frontend:**
```typescript
await fetch('http://localhost:3000/auth/logout', {
  method: 'POST',
  credentials: 'include'  // Envía cookie para identificar sesión
});

// Cookie borrada automáticamente
// Redirigir a /login
```

### 🍪 Sistema de Cookies httpOnly (ACTUALIZADO)

**⚠️ IMPORTANTE: El backend usa cookies httpOnly, NO tokens en headers**

#### En el Login:
El backend automáticamente establece una cookie:
```http
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
            HttpOnly; 
            Secure; 
            SameSite=Strict; 
            Max-Age=604800
```

**Características:**
- **HttpOnly:** JavaScript NO puede acceder (protección XSS)
- **Secure:** Solo HTTPS en producción
- **SameSite=Strict:** Previene CSRF
- **Max-Age=604800:** 7 días (604,800 segundos)

#### En el Frontend:
```typescript
// ⚠️ TODAS las peticiones deben incluir credentials
fetch('http://localhost:3000/api/users/me', {
  credentials: 'include'  // Envía cookies automáticamente
});

// O con axios
axios.get('http://localhost:3000/api/users/me', {
  withCredentials: true  // Envía cookies automáticamente
});
```

**Sin `credentials: 'include'` o `withCredentials: true`, la autenticación NO funcionará.**

**Duración de sesión:** 7 días (cookie persiste al cerrar navegador)

---

## 🌍 Endpoints Públicos

> No requieren autenticación

### 1. Health Check
```http
GET /health
```
**Respuesta:**
```json
{
  "ok": true
}
```

### 2. Obtener Paquetes Disponibles
```http
GET /api/packages
```
**Respuesta:**
```json
[
  {
    "_id": "67847...",
    "nombre": "Paquete Inicial",
    "descripcion": "3 personajes aleatorios",
    "precio": { "val": 0, "boletos": 1 },
    "garantia_rango": "D",
    "cantidad_personajes": 3,
    "probabilidades": {
      "D": 70,
      "C": 20,
      "B": 8,
      "A": 2
    }
  }
]
```

### 3. Obtener Personajes Base
```http
GET /api/base-characters
```
**Respuesta:** Lista de todos los personajes base disponibles

### 4. Obtener Ofertas Activas
```http
GET /api/offers
```

### 5. Obtener Configuración del Juego
```http
GET /api/game-settings
```

### 6. Obtener Equipamiento Disponible
```http
GET /api/equipment
```

### 7. Obtener Consumibles Disponibles
```http
GET /api/consumables
```

### 8. Obtener Mazmorras
```http
GET /api/dungeons
```
**Respuesta:**
```json
[
  {
    "_id": "67847...",
    "nombre": "Guarida del Sapo",
    "descripcion": "Primera mazmorra tutorial",
    "nivel_requerido_minimo": 1,
    "oleadas": 3,
    "enemigos": [...]
  }
]
```

### 9. Webhook de Pagos
```http
POST /api/payments/webhook
```
> Solo para uso de proveedores de pago

---

## 🔒 Endpoints Protegidos

> Requieren token JWT en header `Authorization: Bearer {token}`

### 👤 Usuarios

#### Obtener todos los usuarios (solo admin)
```http
GET /api/users
Authorization: Bearer {token}
```

#### Obtener perfil del usuario actual
```http
GET /api/users/me
Authorization: Bearer {token}
```
**Respuesta:**
```json
{
  "_id": "6784...",
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "val": 1500,
  "boletos": 10,
  "evo": 0,
  "personajes": [...],
  "inventarioEquipamiento": [...],
  "inventarioConsumibles": [...],
  "personajeActivoId": "char_123",
  "limiteInventarioPersonajes": 100,
  "limiteInventarioEquipamiento": 200,
  "limiteInventarioConsumibles": 200
}
```

#### Agregar personaje al usuario
```http
POST /api/users/characters/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "baseCharacterId": "6784..."
}
```

#### Establecer personaje activo
```http
PUT /api/users/set-active-character/:personajeId
Authorization: Bearer {token}
```

#### Debug: Ver datos completos del usuario
```http
GET /api/users/debug/my-data
Authorization: Bearer {token}
```

---

### 🎮 Personajes (Characters)

#### Usar consumible en personaje
```http
POST /api/characters/:characterId/use-consumable
Cookie: token=<JWT>
Content-Type: application/json

{
  "consumableId": "6784..."
}
```

**Efectos de consumibles:**
- Curación (restaura HP)
- Buff de ATK temporal
- Buff de Defensa temporal
- Revivir personaje herido

**⚠️ IMPORTANTE - Auto-eliminación:**
Los consumibles se **eliminan automáticamente** cuando `usos_restantes <= 0`.

**Response cuando aún tiene usos (200):**
```json
{
  "message": "Consumible usado exitosamente",
  "character": {
    "hp_actual": 100
  },
  "consumable": {
    "nombre": "Poción de Vida Menor",
    "usos_restantes": 2
  }
}
```

**Response cuando es el último uso (200):**
```json
{
  "message": "Consumible usado exitosamente (último uso - item eliminado)",
  "character": {
    "hp_actual": 140
  },
  "consumable": null
}
```

**Frontend debe:**
1. Si `consumable === null` → Remover item de UI
2. Si `consumable !== null` → Actualizar `usos_restantes` en UI

#### Revivir personaje herido
```http
POST /api/characters/:characterId/revive
Cookie: token=<JWT>
Content-Type: application/json

{
  "costVAL": 20
}
```

**Costo:** Fijo (~20 VAL, puede variar según nivel/rareza)

**¿Cuándo usar?**
Personaje entra en estado `herido` cuando:
- HP llega a 0 en combate
- Pierde en una mazmorra

**Response (200):**
```json
{
  "message": "Personaje revivido exitosamente",
  "character": {
    "estado": "saludable",
    "hp_actual": 140,
    "hp_maximo": 140
  },
  "cost": 20,
  "newBalance": 80
}
```

**Diferencia Heal vs Revive:**
- **Heal:** Estado = saludable, HP < HP_MAX → Restaura HP
- **Revive:** Estado = herido → Cambia a saludable + Restaura HP completo

#### Curar personaje
```http
POST /api/characters/:characterId/heal
Cookie: token=<JWT>
```

**Restaura:** Salud al máximo (hp_actual = hp_maximo)

**💰 Costo dinámico:**
```typescript
const hpFaltante = hp_maximo - hp_actual;
const costoVAL = Math.ceil(hpFaltante / 10);
```

**Ejemplos:**
- Faltan 10 HP → Cuesta 1 VAL
- Faltan 50 HP → Cuesta 5 VAL
- Faltan 100 HP → Cuesta 10 VAL

**Response (200):**
```json
{
  "message": "Personaje curado exitosamente",
  "character": {
    "hp_actual": 140,
    "hp_maximo": 140
  },
  "cost": 10,
  "newBalance": 90
}
```

**Validaciones:**
- Estado debe ser `saludable` (no herido)
- HP debe estar por debajo del máximo
- Usuario debe tener suficiente VAL

#### Evolucionar personaje
```http
POST /api/characters/:characterId/evolve
Authorization: Bearer {token}
```

**Requisitos:**
- VAL suficiente (según rango y etapa)
- EVO suficiente
- Nivel mínimo alcanzado

#### Añadir experiencia a personaje
```http
POST /api/characters/:characterId/add-experience
Cookie: token=<JWT>
Content-Type: application/json

{
  "amount": 100
}
```

#### Equipar item a personaje
```http
POST /api/characters/:characterId/equip
Cookie: token=<JWT>
Content-Type: application/json

{
  "equipmentId": "673789012345678901234567"
}
```

**Validaciones automáticas:**
- Item existe en inventario del usuario
- Item no equipado en otro personaje
- Tipo de item corresponde al slot correcto
- Si slot ocupado, desequipa anterior automáticamente

**Response (200):**
```json
{
  "message": "Equipamiento equipado exitosamente",
  "character": {
    "equipamiento": {
      "arma": "673789012345678901234567",
      "armadura": null,
      "accesorio": null
    }
  }
}
```

#### Desequipar item de personaje
```http
POST /api/characters/:characterId/unequip
Cookie: token=<JWT>
Content-Type: application/json

{
  "slot": "arma"
}
```

**Slots válidos:** `"arma"`, `"armadura"`, `"accesorio"`

#### Obtener stats totales con equipamiento
```http
GET /api/characters/:characterId/stats
Cookie: token=<JWT>
```

**Response (200):**
```json
{
  "characterId": "673456def789012345678901",
  "nivel": 5,
  "stats_base": {
    "hp": 140,
    "ataque": 25,
    "defensa": 15,
    "velocidad": 20
  },
  "equipamiento": {
    "arma": {
      "nombre": "Espada de Hierro",
      "ataque": 15
    },
    "armadura": {
      "nombre": "Armadura de Cuero",
      "defensa": 10,
      "hp_bonus": 20
    }
  },
  "stats_totales": {
    "hp": 160,
    "ataque": 40,
    "defensa": 25,
    "velocidad": 20
  },
  "bonos_equipamiento": {
    "hp": 20,
    "ataque": 15,
    "defensa": 10,
    "velocidad": 0
  }
}
```

**Fórmula:** `stats_totales = stats_base + bonos_equipamiento`

---

### 🛒 Marketplace

#### Crear listing (vender item)
```http
POST /api/marketplace/listings
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemId": "6784...",
  "precio": 500,
  "destacar": false
}
```

**Validaciones:**
- Precio mínimo según tipo de item (personaje, equipamiento, consumible)
- El item debe existir en el inventario del usuario
- El usuario no puede tener más de X listings activos

**Respuesta (201):**
```json
{
  "listing": {
    "id": "6784...",
    "vendedorId": "6784...",
    "precio": 500,
    "destacado": false,
    "estado": "activo",
    "fechaCreacion": "2025-01-15T10:00:00Z",
    "fechaExpiracion": "2025-01-22T10:00:00Z",
    "metadata": {
      "tipo": "personaje",
      "nombre": "Explorador Valnor",
      "rango": "C",
      "nivel": 5
    }
  }
}
```

#### Buscar listings
```http
GET /api/marketplace/listings?tipo=personaje&rangoMin=C&precioMax=1000
Authorization: Bearer {token}
```

**Query params disponibles:**
- `tipo`: `personaje` | `equipamiento` | `consumible`
- `rangoMin`: `D` | `C` | `B` | `A` | `S` | `SS` | `SSS`
- `rangoMax`: igual que rangoMin
- `precioMin`: número
- `precioMax`: número
- `destacado`: `true` | `false`
- `page`: número (default: 1)
- `limit`: número (default: 20, max: 100)

**Respuesta:**
```json
{
  "listings": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Comprar item
```http
POST /api/marketplace/listings/:id/buy
Authorization: Bearer {token}
```

**Validaciones:**
- El comprador debe tener VAL suficiente
- El comprador no puede comprar sus propios listings
- El listing debe estar activo y no expirado
- El comprador debe tener espacio en inventario

**Respuesta (200):**
```json
{
  "success": true,
  "transaction": {
    "_id": "6784...",
    "listingId": "6784...",
    "compradorId": "6784...",
    "vendedorId": "6784...",
    "precio": 500,
    "fecha": "2025-01-15T10:30:00Z"
  },
  "message": "Item comprado exitosamente"
}
```

#### Cancelar listing
```http
DELETE /api/marketplace/listings/:id
Authorization: Bearer {token}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Listing cancelado exitosamente"
}
```

---

### 💼 Transacciones del Marketplace

#### Ver historial de transacciones
```http
GET /api/marketplace-transactions/my-history
Authorization: Bearer {token}
```

#### Ver mis ventas
```http
GET /api/marketplace-transactions/my-sales
Authorization: Bearer {token}
```

#### Ver mis compras
```http
GET /api/marketplace-transactions/my-purchases
Authorization: Bearer {token}
```

#### Ver estadísticas del marketplace
```http
GET /api/marketplace-transactions/stats
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "total_ventas": 25,
  "total_compras": 15,
  "val_ganado": 12500,
  "val_gastado": 7500,
  "items_vendidos": 25,
  "items_comprados": 15
}
```

#### Ver transacciones de un listing específico
```http
GET /api/marketplace-transactions/:listingId
Authorization: Bearer {token}
```

---

### 📦 Paquetes de Usuario

#### Agregar paquete al usuario (admin)
```http
POST /api/user-packages/agregar
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "6784...",
  "paqueteId": "6784..."
}
```

#### Quitar paquete del usuario (admin)
```http
POST /api/user-packages/quitar
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "6784...",
  "paqueteId": "6784..."
}
```

#### Consultar paquetes por userId
```http
GET /api/user-packages/:userId
Authorization: Bearer {token}
```

#### Consultar paquetes por correo
```http
POST /api/user-packages/por-correo
Authorization: Bearer {token}
Content-Type: application/json

{
  "correo": "usuario@ejemplo.com"
}
```

#### Abrir paquete (gacha)
```http
POST /api/user-packages/open
Authorization: Bearer {token}
Content-Type: application/json

{
  "packageId": "6784...",
  "quantity": 1
}
```

**Respuesta (200):**
```json
{
  "personajes": [
    {
      "personajeId": "char_123",
      "baseCharacterId": "6784...",
      "nombre": "Explorador Valnor",
      "rango": "C",
      "nivel": 1,
      "etapa": 1,
      "stats": {
        "atk": 50,
        "vida": 100,
        "defensa": 30
      }
    }
  ],
  "duplicados": [],
  "valGanado": 0,
  "message": "Paquete abierto exitosamente"
}
```

---

### 🏰 Mazmorras (Dungeons)

#### Iniciar combate en mazmorra
```http
POST /api/dungeons/:dungeonId/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "characterId": "char_123"
}
```

**Respuesta de victoria:**
```json
{
  "victoria": true,
  "recompensas": {
    "val": 250,
    "experiencia": 150,
    "items": [...]
  },
  "estadisticas": {
    "daño_total": 450,
    "daño_recibido": 120,
    "turnos": 8,
    "tiempo": 45
  },
  "progreso": {
    "victorias": 5,
    "nivel_actual": 2,
    "puntos_acumulados": 350
  }
}
```

#### Ver progreso en mazmorra
```http
GET /api/dungeons/:dungeonId/progress
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "mazmorra": {
    "id": "6784...",
    "nombre": "Guarida del Sapo",
    "nivel_requerido_minimo": 1
  },
  "progreso": {
    "victorias": 5,
    "derrotas": 2,
    "nivel_actual": 2,
    "puntos_acumulados": 350,
    "puntos_requeridos_siguiente_nivel": 500,
    "mejor_tiempo": 38,
    "ultima_victoria": "2025-01-15T09:00:00Z"
  },
  "estadisticas_globales": {
    "racha_actual": 3,
    "racha_maxima": 5,
    "total_victorias": 15,
    "total_derrotas": 3,
    "mejor_racha": 5
  }
}
```

---

### 📊 Estadísticas de Jugador

#### Crear estadística
```http
POST /api/player-stats
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "6784...",
  "personajeId": "char_123",
  "accion": "combate",
  "resultado": "victoria",
  "detalles": {}
}
```

#### Ver estadísticas por usuario
```http
GET /api/player-stats/usuario/:userId
Authorization: Bearer {token}
```

#### Ver estadísticas por personaje
```http
GET /api/player-stats/personaje/:personajeId
Authorization: Bearer {token}
```

---

### 🏷️ Categorías e Items

#### Obtener categorías
```http
GET /api/categories
Authorization: Bearer {token}
```

#### Obtener items
```http
GET /api/items
Authorization: Bearer {token}
```

#### Obtener requisitos de nivel
```http
GET /api/level-requirements
Authorization: Bearer {token}
```

#### Obtener eventos
```http
GET /api/events
Authorization: Bearer {token}
```

---

## 🔌 WebSocket (Tiempo Real)

### Conexión

```typescript
import io from 'socket.io-client';

const socket = io('https://valgame-backend.onrender.com', {
  transports: ['websocket'],
  reconnection: true
});

// Autenticar con token JWT
socket.emit('auth', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

socket.on('auth:success', () => {
  console.log('Autenticación exitosa');
});

socket.on('auth:error', (error) => {
  console.error('Error de autenticación:', error);
});
```

### Eventos Disponibles

#### Actualizaciones de Usuario
```typescript
socket.on('user:update', (data) => {
  console.log('Actualización de usuario:', data);
  // { val: 1500, boletos: 10, ... }
});
```

#### Actualizaciones de Personaje
```typescript
socket.on('character:update', (data) => {
  console.log('Personaje actualizado:', data);
  // { characterId: 'char_123', nivel: 5, ... }
});
```

#### Nuevos Listings en Marketplace
```typescript
socket.on('marketplace:new-listing', (listing) => {
  console.log('Nuevo item en venta:', listing);
});
```

#### Listing Vendido
```typescript
socket.on('marketplace:listing-sold', (data) => {
  console.log('Item vendido:', data);
});
```

#### Listing Cancelado
```typescript
socket.on('marketplace:listing-cancelled', (data) => {
  console.log('Venta cancelada:', data);
});
```

---

## 📦 Modelos de Datos

### Usuario (User)

```typescript
interface User {
  _id: string;
  email: string;
  username: string;
  passwordHash: string; // No se devuelve en responses
  isVerified: boolean;
  val: number;
  boletos: number;
  evo: number;
  invocaciones: number;
  evoluciones: number;
  boletosDiarios: number;
  ultimoReinicio?: Date;
  personajes: Personaje[];
  inventarioEquipamiento: string[]; // ObjectIds
  inventarioConsumibles: ConsumableItem[];
  limiteInventarioEquipamiento: number;
  limiteInventarioConsumibles: number;
  limiteInventarioPersonajes: number;
  personajeActivoId?: string;
  fechaRegistro: Date;
  ultimaActualizacion: Date;
  receivedPioneerPackage?: boolean;
  dungeon_progress?: Map<string, DungeonProgress>;
  dungeon_streak: number;
  max_dungeon_streak: number;
}
```

### Personaje

```typescript
interface Personaje {
  personajeId: string;
  rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  nivel: number;
  etapa: 1 | 2 | 3;
  progreso: number;
  experiencia: number;
  stats: {
    atk: number;
    vida: number;
    defensa: number;
  };
  saludActual: number;
  saludMaxima: number;
  estado: 'saludable' | 'herido';
  fechaHerido: Date | null;
  equipamiento: string[]; // ObjectIds de items
  activeBuffs: ActiveBuff[];
}
```

### Personaje Base (BaseCharacter)

```typescript
interface BaseCharacter {
  _id: string;
  id: string;
  nombre: string;
  imagen: string;
  descripcion_rango: string;
  multiplicador_base: number;
  nivel: number;
  etapa: number;
  val_por_nivel_por_etapa: number[];
  stats: {
    atk: number;
    vida: number;
    defensa: number;
  };
  progreso: number;
  ultimoMinado: Date | null;
  evoluciones: Evolucion[];
}
```

### Listing (Marketplace)

```typescript
interface Listing {
  _id: string;
  vendedorId: string;
  itemId: string;
  precio: number;
  destacado: boolean;
  estado: 'activo' | 'vendido' | 'cancelado' | 'expirado';
  fechaCreacion: Date;
  fechaExpiracion: Date;
  metadata: {
    tipo: 'personaje' | 'equipamiento' | 'consumible';
    nombre: string;
    rango?: string;
    nivel?: number;
    etapa?: number;
    rareza?: string;
  };
}
```

### Paquete (Package)

```typescript
interface Package {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: {
    val: number;
    boletos: number;
  };
  garantia_rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  cantidad_personajes: number;
  probabilidades: {
    D?: number;
    C?: number;
    B?: number;
    A?: number;
    S?: number;
    SS?: number;
    SSS?: number;
  };
  imagen?: string;
  activo: boolean;
}
```

### Mazmorra (Dungeon)

```typescript
interface Dungeon {
  _id: string;
  nombre: string;
  descripcion: string;
  nivel_requerido_minimo: number;
  oleadas: number;
  enemigos: Enemy[];
  recompensas: {
    val_base: number;
    experiencia_base: number;
    items_posibles: string[]; // ObjectIds
  };
}
```

---

## ⚠️ Códigos de Error

### HTTP Status Codes

- `200` - OK: Petición exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos inválidos o faltantes
- `401` - Unauthorized: Token inválido o faltante
- `403` - Forbidden: No tienes permiso para esta acción
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con estado actual (ej: usuario ya existe)
- `429` - Too Many Requests: Límite de rate alcanzado
- `500` - Internal Server Error: Error del servidor

### Estructura de Error

```json
{
  "error": "Mensaje descriptivo del error"
}
```

### Errores Comunes

#### Autenticación
```json
{ "error": "Token inválido o expirado" }
{ "error": "Debes verificar tu cuenta antes de iniciar sesión." }
{ "error": "Credenciales inválidas" }
```

#### Marketplace
```json
{ "error": "No tienes suficiente VAL para esta compra" }
{ "error": "Este item ya no está disponible" }
{ "error": "No puedes comprar tus propios items" }
{ "error": "No tienes espacio en el inventario" }
{ "error": "Precio por debajo del mínimo permitido" }
```

#### Personajes
```json
{ "error": "Personaje no encontrado" }
{ "error": "No tienes los recursos necesarios para evolucionar" }
{ "error": "El personaje no ha alcanzado el nivel requerido" }
{ "error": "El personaje ya está en su máxima etapa" }
```

---

## 🚦 Rate Limiting

### Límites por Categoría

#### Auth Endpoints
- **Límite:** 5 peticiones por 15 minutos
- **Aplicado a:** `/auth/register`, `/auth/login`
- **Header de respuesta:** `X-RateLimit-Remaining`

#### Gameplay Endpoints
- **Límite:** 100 peticiones por 15 minutos
- **Aplicado a:** `/api/characters/*`, `/api/dungeons/*`

#### Marketplace Endpoints
- **Límite:** 50 peticiones por 15 minutos
- **Aplicado a:** `/api/marketplace/*`

#### General API
- **Límite:** 200 peticiones por 15 minutos
- **Aplicado a:** Todos los demás endpoints

### Respuesta cuando se excede el límite

```json
{
  "error": "Demasiadas peticiones, por favor intenta más tarde"
}
```

**HTTP Status:** `429 Too Many Requests`

---

## 🔧 Configuración Frontend

### Variables de Entorno (.env)

```bash
# Producción
VITE_API_URL=https://valgame-backend.onrender.com
VITE_WS_URL=wss://valgame-backend.onrender.com

# Desarrollo local (si backend corre en local)
# VITE_API_URL=http://localhost:8080
# VITE_WS_URL=ws://localhost:8080
```

### Ejemplo de Servicio HTTP (Angular)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ⚠️ CRÍTICO: TODAS las peticiones deben incluir withCredentials: true
  // Sin esto, las cookies NO se envían y la autenticación falla

  // Ejemplo: Login (recibe cookie automáticamente)
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, 
      { email, password },
      { withCredentials: true }  // ← OBLIGATORIO
    );
  }

  // Ejemplo: Logout (borra cookie)
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, 
      {},
      { withCredentials: true }
    );
  }

  // Ejemplo: Obtener perfil (cookie se envía automáticamente)
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/users/me`, {
      withCredentials: true  // ← Envía cookie automáticamente
    });
  }

  // Ejemplo: Equipar item
  equipItem(characterId: string, equipmentId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/characters/${characterId}/equip`,
      { equipmentId },
      { withCredentials: true }
    );
  }

  // Ejemplo: Obtener stats con equipamiento
  getCharacterStats(characterId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/characters/${characterId}/stats`,
      { withCredentials: true }
    );
  }
}
```

**📚 Servicios completos listos para copiar:** Ver `04_SERVICIOS_BASE.md`

### Ejemplo de Servicio WebSocket (Angular)

```typescript
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.wsUrl, {
      transports: ['websocket'],
      reconnection: true
    });
  }

  authenticate(token: string): void {
    this.socket.emit('auth', token);
  }

  onAuthSuccess(): Observable<void> {
    return new Observable(observer => {
      this.socket.on('auth:success', () => {
        observer.next();
      });
    });
  }

  onUserUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('user:update', (data) => {
        observer.next(data);
      });
    });
  }

  onMarketplaceUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('marketplace:new-listing', (data) => {
        observer.next(data);
      });
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
```

---

## 📝 Notas Importantes

### Cold Start en Render (Free Tier)
- El backend puede tardar **30-60 segundos** en responder la primera petición
- Esto sucede si no hay tráfico por más de 15 minutos
- **Recomendación:** Mostrar un loader/spinner en el frontend
- Hacer una petición a `/health` al cargar la app para "despertar" el servidor

### CORS y Cookies
```typescript
// Backend configurado para aceptar cookies cross-origin
app.use(cors({
  origin: true,  // Acepta todos los orígenes
  credentials: true  // ⚠️ OBLIGATORIO para cookies
}));
```

**Frontend DEBE configurar:**
```typescript
// Con fetch
fetch(url, {
  credentials: 'include'  // ⚠️ OBLIGATORIO
});

// Con axios
axios.defaults.withCredentials = true;  // Global
// O por petición
axios.get(url, { withCredentials: true });
```

**Sin `credentials: true`, las cookies NO se envían y la autenticación falla.**

### Validación con Zod
- Todos los endpoints validan datos con schemas Zod
- Los errores de validación devuelven detalles específicos:
```json
{
  "error": "Invalid input: expected string, received number"
}
```

### Seguridad
- Mongoose 8.8.4 tiene un CVE conocido pero **NO ES EXPLOTABLE**
- Toda entrada está validada con Zod antes de llegar a Mongoose
- Ver `SECURITY_NOTE.md` para detalles técnicos

---

## 🚀 Quick Start para Frontend

1. **Instalar dependencias:**
```bash
npm install socket.io-client
npm install @angular/common/http # Si usas Angular
```

2. **Configurar environment:**
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://valgame-backend.onrender.com',
  wsUrl: 'wss://valgame-backend.onrender.com'
};
```

3. **Crear servicio de autenticación:**
```typescript
// auth.service.ts
login(email: string, password: string) {
  return this.http.post(`${API_URL}/auth/login`, 
    { email, password },
    { withCredentials: true }  // ← CRUCIAL: Permite recibir cookies
  ).pipe(
    tap((response: any) => {
      // ⚠️ IMPORTANTE: El token YA NO viene en response.token
      // Viene en una httpOnly cookie automáticamente
      // Solo guarda datos del usuario si los necesitas
      this.currentUser = response.user;
    })
  );
}

logout() {
  return this.http.post(`${API_URL}/auth/logout`, 
    {},
    { withCredentials: true }
  ).pipe(
    tap(() => {
      this.currentUser = null;
    })
  );
}
```

4. **Proteger rutas con Guard:**
```typescript
// auth.guard.ts
canActivate(): Observable<boolean> {
  // Verifica autenticación con el backend (la cookie se envía automáticamente)
  return this.http.get(`${API_URL}/api/users/me`, { withCredentials: true })
    .pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
}
```

5. **Conectar WebSocket:**
```typescript
// En componente principal o servicio
ngOnInit() {
  // WebSocket se conecta automáticamente
  this.wsService.connect();
  
  this.wsService.onUserUpdate().subscribe(data => {
    // Actualizar estado global cuando hay cambios
    console.log('Usuario actualizado:', data);
  });
  
  this.wsService.onMarketplaceUpdate().subscribe(listing => {
    // Nuevo item en marketplace
    console.log('Nuevo listing:', listing);
  });
}
```

**📚 Servicio WebSocket completo:** Ver `04_SERVICIOS_BASE.md`

---

## 📞 Soporte

- **Repositorio:** valgame-backend
- **Status:** LIVE y funcional ✅
- **Última actualización:** 2025-01-15
- **MongoDB:** Conectado a Atlas cluster "Valnor"

---

**¡Listo para desarrollar tu frontend!** 🎉

Todos los endpoints están documentados, probados y funcionando en producción.

---

# ��� SURVIVAL - NUEVOS ENDPOINTS (v2.0)

## 1. POST /api/survival/start - Iniciar Sesión

**Descripción:** Inicia una nueva sesión de Survival con un personaje seleccionado.

**Request:**
```json
{
  "characterId": "507f1f77bcf86cd799439011",
  "equipmentIds": ["507f1f77bcf86cd799439012"],
  "consumableIds": ["507f1f77bcf86cd799439013"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "session": {
    "sessionId": "survival_507f191e810c19729de860ea",
    "userId": "507f1f77bcf86cd799439011",
    "characterId": "507f1f77bcf86cd799439012",
    "currentWave": 0,
    "totalPoints": 0,
    "equipment": {
      "head": { "itemId": "507f1f77bcf86cd799439012", "stats": { "ataque": 5 } },
      "body": { "itemId": "507f1f77bcf86cd799439013", "stats": { "defensa": 3 } },
      "hands": { "itemId": "507f1f77bcf86cd799439014", "stats": {} },
      "feet": { "itemId": "507f1f77bcf86cd799439015", "stats": {} }
    },
    "consumables": [],
    "createdAt": "2025-11-27T10:00:00Z"
  }
}
```

**Errores:** 400 Character must have 4 equipped items | 404 Character not found

---

## 2. POST /api/survival/:sessionId/complete-wave

**Descripción:** Completa una oleada.

**Request:**
```json
{
  "enemiesDefeated": 5,
  "damageDealt": 250,
  "damageTaken": 45
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "run": {
    "runId": "run_507f191e810c19729de860ea",
    "sessionId": "survival_507f191e810c19729de860ea",
    "currentWave": 1,
    "totalPoints": 250,
    "waveHistory": [
      { "wave": 1, "enemiesDefeated": 5, "pointsEarned": 250 }
    ]
  }
}
```

---

## 3. POST /api/survival/:sessionId/use-consumable

**Descripción:** Usa un consumible durante la sesión.

**Request:**
```json
{
  "consumableId": "507f1f77bcf86cd799439013"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "consumable": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Poción de Vida",
    "effect": "heal",
    "effectValue": 50,
    "usesRemaining": 2
  },
  "characterStatus": {
    "health": 100,
    "maxHealth": 100
  }
}
```

---

## 4. POST /api/survival/:sessionId/pickup-drop

**Descripción:** Recoge items que caen de enemigos.

**Request:**
```json
{
  "dropItemId": "507f1f77bcf86cd799439020"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "itemPickedUp": {
    "itemId": "507f1f77bcf86cd799439020",
    "name": "Cofre de Oro",
    "reward": { "val": 100, "points": 50 }
  }
}
```

---

## 5. POST /api/survival/:sessionId/end

**Descripción:** Finaliza exitosamente una sesión.

**Request:**
```json
{
  "finalWave": 5,
  "totalEnemiesDefeated": 25,
  "totalPoints": 1250,
  "duration": 600
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "rewards": {
    "survivalPoints": 1250,
    "exp": 500,
    "val": 200,
    "items": []
  },
  "leaderboardPosition": 15
}
```

---

## 6. POST /api/survival/:sessionId/report-death

**Descripción:** Reporta muerte/fin de sesión.

**Request:**
```json
{
  "waveDefeatedAt": 3,
  "totalEnemiesDefeated": 15,
  "totalPoints": 750,
  "duration": 300
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "rewards": {
    "survivalPoints": 375,
    "exp": 0,
    "val": 0
  }
}
```

---

## 7. POST /api/survival/exchange-points/exp

**Descripción:** Canjea puntos por EXP.

**Request:**
```json
{
  "characterId": "507f1f77bcf86cd799439011",
  "pointsToExchange": 500
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "exchange": {
    "pointsExchanged": 500,
    "expGained": 500,
    "newCharacterExp": 2500,
    "leveledUp": true,
    "newLevel": 36
  },
  "remainingSurvivalPoints": 750
}
```

---

## 8. POST /api/survival/exchange-points/val

**Descripción:** Canjea puntos por moneda (VAL).

**Request:**
```json
{
  "pointsToExchange": 300
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "exchange": {
    "pointsExchanged": 300,
    "valGained": 150,
    "newUserVal": 5000,
    "exchangeRate": 2
  },
  "remainingSurvivalPoints": 450
}
```

---

## 9. POST /api/survival/exchange-points/items

**Descripción:** Canjea puntos por items.

**Request:**
```json
{
  "itemId": "507f1f77bcf86cd799439025",
  "pointsToSpend": 200
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "exchange": {
    "itemPurchased": {
      "itemId": "507f1f77bcf86cd799439025",
      "name": "Escudo Legendario",
      "rarity": "legendary"
    },
    "pointsSpent": 200
  },
  "remainingSurvivalPoints": 250
}
```

---

## 10. GET /api/survival/leaderboard

**Descripción:** Obtiene ranking global. Query: `?limit=50&offset=0&timeRange=all_time`

**Response (200 OK):**
```json
{
  "success": true,
  "leaderboard": [
    {
      "position": 1,
      "userId": "507f1f77bcf86cd799439011",
      "userName": "HeroMaster",
      "characterName": "Héroe",
      "totalPoints": 50000,
      "totalSessions": 125,
      "averageWave": 4.8
    }
  ],
  "totalLeaderboardSize": 1500
}
```

---

## 11. GET /api/survival/my-stats

**Descripción:** Obtiene mis estadísticas personales.

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "userId": "507f1f77bcf86cd799439011",
    "totalSessions": 45,
    "totalPoints": 8500,
    "averageWave": 3.2,
    "leaderboardRank": 127,
    "personalRecords": {
      "highestWave": 5,
      "mostPointsInSession": 1250
    }
  }
}
```

---

## 12. POST /api/survival/:sessionId/abandon

**Descripción:** Abandona la sesión actual.

**Request:**
```json
{
  "reason": "manual"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "rewardsForwarded": {
    "survivalPoints": 250,
    "reason": "Abandonment penalty (50%)"
  }
}
```

---

## 🏥 HEALTH CHECK ENDPOINTS

### GET /api/health

**Descripción:** Health check básico - verifica que el servidor está disponible  
**Autenticación:** ❌ No requiere  
**Rate Limit:** ✅ Permitido sin límite

**Response (200 OK):**
```json
{
  "ok": true,
  "timestamp": "2025-11-27T10:30:00.000Z",
  "uptime": 123456789,
  "database": "connected",
  "version": "2.0.0",
  "environment": "production"
}
```

**Ejemplo en Frontend:**
```typescript
// Angular HttpClient
this.http.get('/api/health').subscribe(
  (status) => console.log('Server alive:', status),
  (error) => console.log('Server down:', error)
);

// Fetch API
fetch('/api/health')
  .then(res => res.json())
  .then(data => console.log('Status:', data))
  .catch(() => console.log('Offline'));
```

---

### GET /api/health/ready

**Descripción:** Readiness probe - verifica que todo está listo  
**Autenticación:** ❌ No requiere  
**Para:** Kubernetes, Docker health checks

**Response (200 OK):**
```json
{
  "ok": true,
  "ready": true,
  "timestamp": "2025-11-27T10:30:00.000Z"
}
```

**Response (503 Service Unavailable):**
```json
{
  "ok": false,
  "error": "Database not ready",
  "ready": false
}
```

---

### GET /api/health/live

**Descripción:** Liveness probe - verifica que el proceso está vivo  
**Autenticación:** ❌ No requiere  
**Para:** Kubernetes, Docker containers

**Response (200 OK):**
```json
{
  "ok": true,
  "live": true,
  "timestamp": "2025-11-27T10:30:00.000Z"
}
```

---

## ⚠️ ERROR HANDLING & OFFLINE SUPPORT

### Respuesta de Error Enriquecida (503, 504)

Cuando hay problemas de conexión, las respuestas incluyen metadata para reintentos:

**Response (503 Service Unavailable):**
```json
{
  "ok": false,
  "error": "No se pudo conectar con el servidor",
  "code": "ConnectionError",
  "status": 503,
  "isConnectionError": true,
  "retryable": true,
  "attemptCount": 1,
  "maxAttempts": 3,
  "suggestedAction": "retry",
  "timestamp": "2025-11-27T10:30:00.000Z",
  "path": "/api/characters/1/level-up"
}
```

**Headers HTTP especiales:**
```
X-Connection-Error: true
X-Retry-After: 5
X-Offline-Indicator: show
X-Connection-Status: degraded
```

### Frontend: Detectar Desconexión

```typescript
// En tu servicio HTTP
this.http.get('/api/...').subscribe(
  (data) => { /* éxito */ },
  (error) => {
    if (error.status === 503 || error.status === 504) {
      // Error de conexión
      console.log('Offline:', error.error.isConnectionError);
      console.log('Reintentar:', error.error.retryable);
    }
  }
);
```

### Frontend: Usar Componente OfflineIndicator

```html
<!-- En app.component.html -->
<app-offline-indicator></app-offline-indicator>
<router-outlet></router-outlet>
```

Ver: **28_COMPONENTE_OFFLINE_INDICATOR.md** para implementación completa

---

**Última actualización:** 27 de Noviembre, 2025 ✨
**Versión API:** 2.1.0 (Con Error Handling)
**Status:** ✅ PRODUCCIÓN
