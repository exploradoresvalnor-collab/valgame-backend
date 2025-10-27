# 📖 Referencia Completa API Backend - Valgame

> **URL Base de Producción:** `https://valgame-backend.onrender.com`  
> **Status:** ✅ LIVE y funcional  
> **Última actualización:** 2025-01-15

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
- Se envía un correo de verificación automáticamente
- El usuario NO puede hacer login hasta verificar su cuenta

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
    "val": 1500,
    "boletos": 10
  }
}
```

**Recompensa al verificar:**
- ✅ **Paquete del Pionero** (automático, solo una vez)
- 3 personajes base aleatorios
- 1500 VAL
- 10 boletos

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

### Uso del Token JWT

Una vez obtenido el token, debe enviarse en todas las peticiones protegidas:

```http
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Duración del token:** 7 días

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
Authorization: Bearer {token}
Content-Type: application/json

{
  "consumableId": "6784..."
}
```

**Efectos de consumibles:**
- Buff de ATK temporal
- Buff de Defensa temporal
- Buff de Vida temporal
- Mejora de XP porcentual

#### Revivir personaje herido
```http
POST /api/characters/:characterId/revive
Authorization: Bearer {token}
```

**Costo:** Determinado por stats del personaje

#### Curar personaje
```http
POST /api/characters/:characterId/heal
Authorization: Bearer {token}
```

**Restaura:** Salud al máximo

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
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100
}
```

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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ⚠️ IMPORTANTE: El backend usa httpOnly cookies para JWT
  // NO necesitas enviar token manualmente en headers
  // Solo asegúrate de enviar withCredentials: true

  // Ejemplo: Login (devuelve cookie automáticamente)
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, 
      { email, password },
      { withCredentials: true }  // ← Crucial para cookies
    );
  }

  // Ejemplo: Obtener perfil (cookie se envía automáticamente)
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/users/me`, {
      withCredentials: true  // ← Envía cookie automáticamente
    });
  }

  // Ejemplo: Abrir paquete
  openPackage(packageId: string, quantity: number = 1): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/user-packages/open`,
      { packageId, quantity },
      { headers: this.getHeaders() }
    );
  }
}
```

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

### CORS
- El backend acepta peticiones desde cualquier origen (`*`)
- En producción considera restringir a tu dominio frontend

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
  // ⚠️ IMPORTANTE: Para WebSocket sí necesitas el token manualmente
  // Obtenerlo desde el backend primero
  this.http.get<{token: string}>(`${API_URL}/api/auth/socket-token`, 
    { withCredentials: true }
  ).subscribe(response => {
    this.wsService.authenticate(token);
    this.wsService.onUserUpdate().subscribe(data => {
      // Actualizar estado global
    });
  }
}
```

---

## 📞 Soporte

- **Repositorio:** valgame-backend
- **Status:** LIVE y funcional ✅
- **Última actualización:** 2025-01-15
- **MongoDB:** Conectado a Atlas cluster "Valnor"

---

**¡Listo para desarrollar tu frontend!** 🎉

Todos los endpoints están documentados, probados y funcionando en producción.
