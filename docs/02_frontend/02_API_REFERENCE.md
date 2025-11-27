# 📖 API REFERENCE - VALGAME BACKEND (VERSIÓN RÁPIDA)

> **📚 Documentación completa:** Ver `00_BACKEND_API_REFERENCE.md`

## 🌐 Base URL
```
Development: http://localhost:3000
Production:  https://valgame-backend.onrender.com
```

**✅ Estado:** 🟢 LIVE (Actualizado: 3 de noviembre de 2025)

**Características:**
- ✅ MongoDB Atlas conectado al cluster "Valnor"
- ✅ **Cookies httpOnly** para autenticación (7 días)
- ✅ Gmail SMTP para emails reales
- ✅ Sistema de equipamiento completo
- ✅ Auto-eliminación de consumibles
- ✅ CORS con credentials habilitado
- ✅ WebSocket con Socket.IO
- ⚙️ Node.js 22.16.0

---

## ⚠️ CONFIGURACIÓN CRÍTICA

**TODAS las peticiones deben incluir:**
```typescript
fetch(url, {
  credentials: 'include'  // ⚠️ OBLIGATORIO para cookies
});

// O con axios
axios.defaults.withCredentials = true;
```

**Sin esto, la autenticación NO funcionará.**

---

## 🔐 AUTENTICACIÓN

### 1. Registro
```http
POST /auth/register
Content-Type: application/json

{ "email": "user@example.com", "username": "user123", "password": "pass123" }
```
✅ **Response:** Email enviado (Gmail real) para verificación

### 2. Verificación
```http
GET /auth/verify/:token
```
✅ **Response:** Cuenta activada + **Paquete del Pionero** entregado  
🎁 Incluye: 100 VAL, 5 boletos, 2 EVO, 1 personaje, 3 pociones, 1 espada

### 3. Login (con cookies)
```http
POST /auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "pass123" }
```

**⚠️ NO devuelve token en response.** Cookie se establece automáticamente:
```http
Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Frontend:**
```typescript
fetch('/auth/login', {
  method: 'POST',
  credentials: 'include',  // ⚠️ OBLIGATORIO
  body: JSON.stringify({ email, password })
});
```

### 4. Logout
```http
POST /auth/logout
```
✅ Borra cookie + invalida token (blacklist)

---

## 👤 USUARIO

### Obtener Usuario Actual
```http
GET /api/users/me
Cookie: token=<JWT>  (automático)
```

**Response:** Perfil completo con personajes, inventario, recursos

```typescript
// Frontend
const response = await fetch('/api/users/me', {
  credentials: 'include'  // Cookie se envía automáticamente
});
```

---

## 🎮 PERSONAJES

### Equipar Item
```http
POST /api/characters/:id/equip
Body: { "equipmentId": "..." }
```
✅ Equipa arma/armadura/accesorio  
✅ Reemplaza automáticamente si slot ocupado

### Desequipar Item
```http
POST /api/characters/:id/unequip
Body: { "slot": "arma" | "armadura" | "accesorio" }
```

### Obtener Stats con Equipamiento
```http
GET /api/characters/:id/stats
```
✅ Devuelve: `stats_base`, `equipamiento`, `stats_totales`, `bonos_equipamiento`

### Usar Consumible
```http
POST /api/characters/:id/use-consumable
Body: { "consumableId": "..." }
```
⚠️ **Auto-eliminación:** Si `usos_restantes <= 0`, item se borra automáticamente

**Response cuando se elimina:**
```json
{
  "message": "Consumible usado (último uso - eliminado)",
  "consumable": null
}
```

### Curar Personaje
```http
POST /api/characters/:id/heal
```
💰 **Costo:** `Math.ceil((HP_MAX - HP_ACTUAL) / 10)` VAL

### Revivir Personaje
```http
POST /api/characters/:id/revive
Body: { "costVAL": 20 }
```
✅ Solo si estado = "herido"

### Agregar XP
```http
POST /api/characters/:id/add-experience
Body: { "amount": 100 }
```
✅ Sube nivel automáticamente  
✅ HP curado gratis al subir nivel

### Evolucionar
```http
POST /api/characters/:id/evolve
```
✅ Requiere: nivel mínimo + cristales EVO  
✅ Stats boost masivo

---

## 🏪 MARKETPLACE

### Buscar Listings
```http
GET /api/marketplace/listings?tipo=arma&precioMax=100
```
**Filtros:** tipo, precio, rango, nivel, destacados

### Crear Venta
```http
POST /api/marketplace/listings
Body: { "itemId": "...", "precio": 50 }
```

### Comprar
```http
POST /api/marketplace/listings/:id/buy
```

### Cancelar
```http
DELETE /api/marketplace/listings/:id
```

---

## 📦 PAQUETES

### Listar Disponibles
```http
GET /api/packages
```

### Abrir Paquete
```http
POST /api/user-packages/open
Body: { "packageId": "...", "quantity": 1 }
```
✅ Sistema gacha  
✅ Recompensas: personajes, items, VAL

---

## 🏰 MAZMORRAS

### Listar Mazmorras
```http
GET /api/dungeons
```

### Iniciar Mazmorra
```http
POST /api/dungeons/:id/start
Body: { "characterId": "..." }
```
✅ Validaciones automáticas: nivel, HP, estado  
✅ Recompensas: VAL, XP, items

---

## ⚙️ CONFIGURACIÓN Y DATOS

### Endpoints Públicos
```http
GET /api/base-characters    # Personajes base disponibles
GET /api/equipment          # Equipamiento disponible
GET /api/consumables        # Consumibles disponibles
GET /api/game-settings      # Configuración del juego
GET /api/level-requirements # XP requerida por nivel
GET /health                 # Health check
```

---

---

## � DOCUMENTACIÓN COMPLETA

**Para más detalles, ver:**

### 📖 Referencias Completas
- **`00_BACKEND_API_REFERENCE.md`** - Referencia completa con todos los detalles
- **`15_GUIA_COMPLETA_AUTENTICACION_SESIONES.md`** - Sistema de cookies explicado
- **`16_GUIA_EQUIPAMIENTO_PERSONAJES.md`** - Equipamiento, consumibles, XP, evolución
- **`18_GUIA_ULTRA_RAPIDA_EJEMPLOS_BASICOS.md`** - Ejemplos copy-paste

### 💻 Código Listo para Usar
- **`03_MODELOS_TYPESCRIPT.md`** - Interfaces TypeScript
- **`04_SERVICIOS_BASE.md`** - Servicios Angular listos
- **`05_COMPONENTES_EJEMPLO.md`** - Componentes de ejemplo

### 📋 Resumen de Cambios
- **`17_RESUMEN_CAMBIOS_NOVIEMBRE_2025.md`** - Últimas actualizaciones

---

## ⚠️ ERRORES COMUNES

| Código | Acción |
|--------|--------|
| 401 | Redirect a login (sesión expirada) |
| 400 | Mostrar `error` al usuario |
| 403 | "No tienes permiso" |
| 404 | "No encontrado" |

**Todos los errores devuelven:**
```json
{ "error": "Mensaje descriptivo" }
```

---

## 🔄 WEBSOCKET

```typescript
import io from 'socket.io-client';

const socket = io('https://valgame-backend.onrender.com');
socket.on('user:update', (data) => console.log(data));
socket.on('marketplace:new-listing', (listing) => console.log(listing));
```

**Ver:** `04_SERVICIOS_BASE.md` → SocketService completo

---

**Última actualización:** 3 de noviembre de 2025  
**Versión:** 2.0 (Cookies httpOnly + Equipamiento completo)
