# 📚 REFERENCIA COMPLETA API - VALGAME BACKEND

**Última actualización:** 3 de noviembre de 2025  
**Base URL (Producción):** `https://valgame-backend.onrender.com`  
**Base URL (Desarrollo):** `http://localhost:8080`

---

## 📑 TABLA DE CONTENIDOS

1. [Configuración y Sistema](#0-configuración-y-sistema)
2. [Autenticación](#1-autenticación)
3. [Usuarios](#2-usuarios)
4. [Personajes](#3-personajes)
5. [Equipamiento](#4-equipamiento)
6. [Shop (Tienda)](#5-shop-tienda)
7. [Mazmorras](#6-mazmorras)
8. [Marketplace](#7-marketplace)
9. [Paquetes y Ofertas](#8-paquetes-y-ofertas)
10. [Sistema de Ranking](#9-sistema-de-ranking)
11. [Catálogos](#10-catálogos)
12. [WebSocket (Tiempo Real)](#11-websocket-tiempo-real)

---

## 0️⃣ CONFIGURACIÓN Y SISTEMA

### 0.1 Sistema de Autenticación con Cookies httpOnly

**Implementación:** Desde noviembre 2025, el sistema usa cookies httpOnly en lugar de tokens en headers.

**Características de Seguridad:**
- **httpOnly**: Cookie no accesible desde JavaScript (previene XSS)
- **Secure**: Solo se envía por HTTPS en producción
- **SameSite=Strict**: Protección contra CSRF
- **Duración**: 7 días desde el login

**Configuración CORS Requerida:**
```typescript
// Frontend (Angular/React)
axios.defaults.withCredentials = true;

// O en cada request
fetch('/api/endpoint', {
  credentials: 'include'  // ⚠️ OBLIGATORIO
});
```

**Backend (ya configurado):**
```javascript
// Render.com settings
CORS_ORIGIN=https://tu-frontend.vercel.app
CORS_CREDENTIALS=true
```

**⚠️ IMPORTANTE:** Todos los requests al backend DEBEN incluir `withCredentials: true` o `credentials: 'include'`.

---

### 0.2 Configuración de Email (Gmail SMTP)

**Sistema de Emails Actual:**

| Parámetro | Valor |
|-----------|-------|
| **Host** | smtp.gmail.com |
| **Puerto** | 587 (STARTTLS) |
| **Email** | romerolivo1234@gmail.com |
| **Estado** | ✅ Producción |

**Emails Enviados:**
1. **Verificación de cuenta** (`/auth/register`)
2. **Recuperación de contraseña** (`/auth/forgot-password`)
3. **Reenvío de verificación** (`/auth/resend-verification`)

**Configuración en Render.com:**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=romerolivo1234@gmail.com
EMAIL_PASSWORD=<app_password>
EMAIL_FROM=noreply@valgame.com
```

**⚠️ Nota:** En desarrollo, usa Ethereal Email (emails de prueba). En producción, Gmail SMTP real.

---

## 🔐 AUTENTICACIÓN

Todos los endpoints protegidos requieren un **JWT token** enviado en una **cookie httpOnly** llamada `token`.

### Endpoints de Autenticación

#### 1.1 Registro de Usuario

**POST** `/auth/register`

**Descripción:** Crea una nueva cuenta de usuario y envía un correo de verificación.

**Body:**
```json
{
  "email": "jugador@example.com",
  "username": "jugador123",
  "password": "contraseña123"
}
```

**Respuestas:**
- `201 Created`: Registro exitoso
```json
{
  "message": "Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta."
}
```
- `409 Conflict`: Email o username ya existe
- `400 Bad Request`: Datos inválidos

**Flujo Frontend:**
1. Mostrar formulario de registro
2. Enviar POST a `/auth/register`
3. Mostrar mensaje: "Revisa tu correo para verificar tu cuenta"
4. Usuario hace clic en link del correo → se redirige a `/auth/verify/:token`

---

#### 1.2 Verificación de Email

**GET** `/auth/verify/:token`

**Descripción:** Verifica la cuenta del usuario y le entrega el **Paquete del Pionero** automáticamente.

**Parámetros:**
- `token` (URL): Token de verificación recibido por correo

**Respuestas:**
- `200 OK`: Cuenta verificada
```json
{
  "message": "Cuenta verificada con éxito",
  "package": {
    "personajes_entregados": 1,
    "items_entregados": 4,
    "recursos": {
      "val": 100,
      "boletos": 5,
      "evo": 2
    }
  }
}
```

**Contenido del Paquete del Pionero:**

| Recurso | Cantidad | Detalles |
|---------|----------|----------|
| **VAL** | 100 | Moneda principal |
| **Boletos** | 5 | Para mazmorras |
| **EVO** | 2 | Cristales de evolución |
| **Personaje** | 1 | Base Rango D aleatorio |
| **Pociones de Vida** | 3 | +50 HP cada una |
| **Espada Básica** | 1 | +10 ATK |

**Errores:**
- `400 Bad Request`: Token inválido o expirado
- `500 Internal Server Error`: Error al entregar paquete

**Flujo Frontend:**
1. Usuario recibe correo con link: `https://valgame.com/verify?token=abc123`
2. Frontend redirige a backend: `GET /auth/verify/abc123`
3. Backend responde con éxito
4. Frontend redirige a `/login` con mensaje de éxito

---

#### 1.3 Login

**POST** `/auth/login`

**Descripción:** Inicia sesión y establece una cookie httpOnly con el token JWT.

**Body:**
```json
{
  "email": "jugador@example.com",
  "password": "contraseña123"
}
```

**Respuestas:**
- `200 OK`: Login exitoso
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "jugador@example.com",
    "username": "jugador123",
    "recursos": {
      "val": 1000,
      "boletos": 10,
      "evo": 5
    },
    "personajes": [
      {
        "id": "64a1b2c3d4e5f6g7h8i9j0k1",
        "nombre": "Caballero",
        "clase": "Guerrero",
        "nivel": 1,
        "experiencia": 0,
        "estado": "vivo",
        "salud_actual": 100,
        "salud_maxima": 100
      }
    ]
  }
}
```
- `401 Unauthorized`: Credenciales incorrectas
- `403 Forbidden`: Cuenta no verificada

**Flujo Frontend:**
```typescript
// Angular Service
async login(email: string, password: string) {
  const response = await this.http.post('/auth/login', { email, password }, {
    withCredentials: true // ⚠️ IMPORTANTE: Permite cookies
  }).toPromise();
  
  // Guardar usuario en estado global
  this.currentUser = response.user;
  return response;
}
```

---

#### 1.4 Logout

**POST** `/auth/logout`

**Descripción:** Cierra la sesión del usuario, invalida el token añadiéndolo a la lista negra (TokenBlacklist), y elimina la cookie.

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuestas:**
- `200 OK`: Logout exitoso
```json
{
  "message": "Logout exitoso"
}
```

**Comportamiento del Sistema:**
1. Token se añade a `TokenBlacklist` en MongoDB
2. Cookie `token` se elimina del navegador
3. Token queda invalidado permanentemente (no se puede reutilizar)
4. Tokens expirados se limpian automáticamente de la blacklist

**⚠️ Seguridad:** Una vez en blacklist, el token NO puede usarse aunque no haya expirado.

**Flujo Frontend:**
```typescript
async logout() {
  await this.http.post('/auth/logout', {}, {
    withCredentials: true
  }).toPromise();
  
  // Limpiar estado local
  this.currentUser = null;
  this.router.navigate(['/login']);
}
```

---

#### 1.5 Solicitar Recuperación de Contraseña

**POST** `/auth/forgot-password`

**Descripción:** Genera un token de recuperación y envía un email con instrucciones para resetear la contraseña. Por seguridad, la respuesta es genérica y no revela si el email existe.

**Body:**
```json
{
  "email": "jugador@example.com"
}
```

**Respuestas:**
- `200 OK`: Siempre (no revela si email existe)
```json
{
  "message": "Si el correo existe, se enviará un email con instrucciones para recuperar tu contraseña."
}
```

**Flujo Frontend:**
```typescript
async forgotPassword(email: string) {
  await this.http.post('/auth/forgot-password', { email }).toPromise();
  // Mostrar mensaje: "Revisa tu correo para instrucciones de recuperación"
}
```

**Notas de Seguridad:**
- Token expira en 1 hora
- Respuesta genérica previene enumeración de usuarios
- Email contiene enlace: `https://valgame.com/reset-password/{token}`

---

#### 1.6 Resetear Contraseña con Token

**POST** `/auth/reset-password/:token`

**Descripción:** Cambia la contraseña del usuario utilizando el token recibido por email.

**Parámetros:**
- `token` (URL): Token de recuperación del email

**Body:**
```json
{
  "password": "nuevaContraseña123"
}
```

**Respuestas:**
- `200 OK`: Contraseña actualizada
```json
{
  "message": "Contraseña actualizada exitosamente. Ya puedes iniciar sesión."
}
```
- `400 Bad Request`: Token inválido o expirado
```json
{
  "error": "Token de recuperación inválido o expirado"
}
```
- `400 Bad Request`: Password muy corta
```json
{
  "error": "Password must be at least 6 characters"
}
```

**Flujo Frontend:**
```typescript
// 1. Capturar token de la URL
constructor(private route: ActivatedRoute) {
  this.token = this.route.snapshot.paramMap.get('token');
}

// 2. Enviar nueva contraseña
async resetPassword(newPassword: string) {
  await this.http.post(`/auth/reset-password/${this.token}`, {
    password: newPassword
  }).toPromise();
  
  // Redirigir a login
  this.router.navigate(['/login']);
}
```

**Validaciones:**
- Password mínimo 6 caracteres
- Token debe existir y no estar expirado (< 1 hora)

---

#### 1.7 Reenviar Email de Verificación

**POST** `/auth/resend-verification`

**Descripción:** Reenvía el email de verificación si el original expiró o no se recibió. Incluye rate limiting para prevenir spam.

**Body:**
```json
{
  "email": "jugador@example.com"
}
```

**Respuestas:**
- `200 OK`: Email enviado
```json
{
  "message": "Email de verificación enviado. Revisa tu bandeja de entrada."
}
```
- `200 OK`: Email no encontrado (respuesta genérica)
```json
{
  "message": "Si el correo existe y no está verificado, se enviará un nuevo email de verificación."
}
```
- `400 Bad Request`: Cuenta ya verificada
```json
{
  "error": "La cuenta ya está verificada"
}
```
- `429 Too Many Requests`: Token activo válido
```json
{
  "error": "Ya existe un email de verificación válido. Espera 45 minutos antes de solicitar otro."
}
```

**Flujo Frontend:**
```typescript
async resendVerification(email: string) {
  try {
    await this.http.post('/auth/resend-verification', { email }).toPromise();
    this.showMessage('Email enviado. Revisa tu bandeja de entrada.');
  } catch (error) {
    if (error.status === 429) {
      this.showError('Ya enviamos un email recientemente. Por favor espera.');
    }
  }
}
```

**Protecciones:**
- No revela si email existe (seguridad)
- Rate limiting: No permite reenvío si hay token válido activo
- Calcula minutos restantes del token actual
- Nuevo token expira en 1 hora

---

## 👤 2. USUARIOS

### 2.1 Obtener Perfil del Usuario Actual

**GET** `/api/users/me`

**Descripción:** Obtiene toda la información del usuario autenticado.

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuestas:**
- `200 OK`:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "jugador@example.com",
  "username": "jugador123",
  "recursos": {
    "val": 1500,
    "boletos": 8,
    "evo": 3
  },
  "personajes": [
    {
      "id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "nombre": "Caballero",
      "clase": "Guerrero",
      "nivel": 5,
      "experiencia": 450,
      "estado": "vivo",
      "salud_actual": 85,
      "salud_maxima": 100,
      "ataque": 25,
      "defensa": 20,
      "velocidad": 15,
      "equipamiento": [
        {
          "id": "item123",
          "nombre": "Espada de Hierro",
          "stats": { "ataque": 10, "defensa": 0 }
        }
      ]
    }
  ],
  "inventarioEquipamiento": [
    {
      "id": "item456",
      "nombre": "Escudo de Madera",
      "tipo": "escudo",
      "rareza": "comun",
      "stats": { "defensa": 8 }
    }
  ],
  "inventarioConsumibles": [
    {
      "id": "consumible789",
      "nombre": "Poción de Vida",
      "tipo": "curacion",
      "cantidad": 5
    }
  ],
  "personaje_activo_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "tutorial_completado": true
}
```

**Flujo Frontend:**
```typescript
// Llamar al iniciar la app para sincronizar estado
async loadUserProfile() {
  const user = await this.http.get('/api/users/me', {
    withCredentials: true
  }).toPromise();
  
  this.store.dispatch(setUser(user));
}
```

---

### 2.2 Obtener Recursos del Usuario

**GET** `/api/users/resources`

**Descripción:** Obtiene solo los recursos económicos del usuario.

**Respuestas:**
- `200 OK`:
```json
{
  "val": 1500,
  "boletos": 8,
  "evo": 3
}
```

**Flujo Frontend:**
```typescript
// Actualizar recursos después de una compra
async refreshResources() {
  const resources = await this.http.get('/api/users/resources', {
    withCredentials: true
  }).toPromise();
  
  this.currentResources = resources;
}
```

---

### 2.3 Dashboard del Usuario

**GET** `/api/users/dashboard`

**Descripción:** Resumen completo del estado del usuario (personajes, inventario, progreso).

**Respuestas:**
- `200 OK`:
```json
{
  "usuario": {
    "username": "jugador123",
    "email": "jugador@example.com"
  },
  "recursos": {
    "val": 1500,
    "boletos": 8,
    "evo": 3
  },
  "personajes": {
    "total": 3,
    "vivos": 2,
    "heridos": 1,
    "lista": [...]
  },
  "inventario": {
    "equipamiento": 15,
    "consumibles": 8
  },
  "progreso": {
    "nivel_promedio": 4,
    "experiencia_total": 1200,
    "mazmorras_completadas": 5
  }
}
```

**Uso:** Pantalla principal después de login.

---

### 2.4 Marcar Tutorial como Completado

**PUT** `/api/users/tutorial/complete`

**Descripción:** Marca el tutorial introductorio como completado.

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Tutorial completado",
  "tutorial_completado": true
}
```

**Flujo Frontend:**
```typescript
// Al finalizar el tutorial
async completeTutorial() {
  await this.http.put('/api/users/tutorial/complete', {}, {
    withCredentials: true
  }).toPromise();
  
  this.showMainGame();
}
```

---

### 2.5 Agregar Personaje al Usuario

**POST** `/api/users/characters/add`

**Descripción:** Agrega un nuevo personaje al roster del usuario.

**Body:**
```json
{
  "baseCharacterId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Personaje agregado exitosamente",
  "personaje": {
    "id": "nuevo_personaje_id",
    "nombre": "Mago",
    "clase": "Mago",
    "nivel": 1,
    "estado": "vivo"
  }
}
```

**Uso:** Después de comprar un personaje en la tienda o desbloquearlo.

---

### 2.6 Establecer Personaje Activo

**PUT** `/api/users/set-active-character/:personajeId`

**Descripción:** Cambia el personaje activo del usuario para combate.

**Parámetros:**
- `personajeId` (URL): ID del personaje a activar

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Personaje activo actualizado",
  "personaje_activo_id": "64a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Flujo Frontend:**
```typescript
// Selector de personaje en la UI
async selectCharacter(characterId: string) {
  await this.http.put(`/api/users/set-active-character/${characterId}`, {}, {
    withCredentials: true
  }).toPromise();
  
  this.activeCharacterId = characterId;
}
```

---

## ⚔️ 3. PERSONAJES

### 3.1 Usar Consumible en Personaje

**POST** `/api/characters/:characterId/use-consumable`

**Descripción:** Usa un item consumible en un personaje (cura, revive, buff). El item reduce sus usos restantes en 1.

**Body:**
```json
{
  "itemId": "consumible789"
}
```

**Respuestas:**
- `200 OK` (Item aún tiene usos):
```json
{
  "message": "Consumible usado exitosamente",
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "salud_actual": 100,
    "salud_maxima": 100,
    "estado": "vivo"
  },
  "item_restante": {
    "id": "consumible789",
    "nombre": "Poción de Vida",
    "usos_restantes": 4
  }
}
```

- `200 OK` (Item sin usos - **AUTO-ELIMINADO**):
```json
{
  "message": "Consumible usado exitosamente. El item ha sido eliminado del inventario (sin usos restantes).",
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "salud_actual": 100,
    "salud_maxima": 100,
    "estado": "vivo"
  },
  "item_eliminado": true
}
```

**⚠️ Auto-eliminación:** Cuando `usos_restantes` llega a 0, el item se elimina automáticamente del inventario.

**Errores:**
- `404 Not Found`: Personaje o item no encontrado
- `400 Bad Request`: No se puede usar el item (ej: personaje con salud completa)

**Flujo Frontend:**
```typescript
// Botón de usar poción
async usePotion(characterId: string, itemId: string) {
  const result = await this.http.post(
    `/api/characters/${characterId}/use-consumable`,
    { itemId },
    { withCredentials: true }
  ).toPromise();
  
  // Actualizar UI
  this.updateCharacterHealth(result.personaje);
  this.updateInventory(result.item_restante);
}
```

---

### 3.2 Revivir Personaje

**POST** `/api/characters/:characterId/revive`

**Descripción:** Revive un personaje herido usando una **Poción de Resurrección** o **1 EVO**.

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Personaje revivido exitosamente",
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "estado": "vivo",
    "salud_actual": 50,
    "salud_maxima": 100
  },
  "costo": {
    "tipo": "consumible",
    "item": "Poción de Resurrección"
  }
}
```
- `404 Not Found`: Personaje no encontrado
- `400 Bad Request`: Personaje no está herido o sin recursos

**Flujo Frontend:**
```typescript
// Botón de revivir en la UI de personaje caído
async reviveCharacter(characterId: string) {
  const result = await this.http.post(
    `/api/characters/${characterId}/revive`,
    {},
    { withCredentials: true }
  ).toPromise();
  
  this.showMessage(`${result.personaje.nombre} ha sido revivido!`);
  this.refreshCharacterList();
}
```

---

### 3.3 Curar Personaje

**POST** `/api/characters/:characterId/heal`

**Descripción:** Cura completamente a un personaje vivo que ha perdido salud. El costo en VAL es **dinámico** según el daño recibido.

**Fórmula de Costo:**
```javascript
costo_VAL = Math.ceil((HP_MAX - HP_ACTUAL) / 10)
```

**Ejemplos de Costo:**
- Personaje con 180/200 HP → Costo: `Math.ceil(20/10) = 2 VAL`
- Personaje con 50/200 HP → Costo: `Math.ceil(150/10) = 15 VAL`
- Personaje con 1/100 HP → Costo: `Math.ceil(99/10) = 10 VAL`

**Prioridad de Pago:**
1. **Poción de Vida** (si tiene en inventario) - **GRATIS**
2. **VAL** (costo dinámico según daño)
3. **1 Boleto** (si no tiene poción ni VAL suficiente)

**Respuestas:**
- `200 OK` (con poción):
```json
{
  "message": "Personaje curado exitosamente",
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "salud_actual": 100,
    "salud_maxima": 100
  },
  "costo": {
    "tipo": "consumible",
    "item": "Poción de Vida"
  }
}
```

- `200 OK` (con VAL):
```json
{
  "message": "Personaje curado exitosamente",
  "personaje": {
    "salud_actual": 200,
    "salud_maxima": 200
  },
  "costo": {
    "tipo": "val",
    "cantidad": 15
  }
}
```

**Flujo Frontend:**
```typescript
// Botón de curación
async healCharacter(characterId: string) {
  await this.http.post(
    `/api/characters/${characterId}/heal`,
    {},
    { withCredentials: true }
  ).toPromise();
  
  this.playHealAnimation();
}
```

---

### 3.4 Evolucionar Personaje

**POST** `/api/characters/:characterId/evolve`

**Descripción:** Evoluciona un personaje al siguiente nivel de rareza usando **EVO** (cantidad según nivel).

**Costo de evolución:**
- Común → Raro: 10 EVO
- Raro → Épico: 20 EVO
- Épico → Legendario: 50 EVO

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Personaje evolucionado exitosamente",
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "nombre": "Caballero Legendario",
    "rareza": "legendario",
    "nivel": 1,
    "ataque": 40,
    "defensa": 35,
    "velocidad": 20
  },
  "costo_evo": 50
}
```
- `400 Bad Request`: No tiene suficientes EVO o personaje en nivel máximo

**Flujo Frontend:**
```typescript
// Pantalla de evolución
async evolveCharacter(characterId: string) {
  try {
    const result = await this.http.post(
      `/api/characters/${characterId}/evolve`,
      {},
      { withCredentials: true }
    ).toPromise();
    
    this.showEvolutionAnimation(result.personaje);
    this.updateResources();
  } catch (error) {
    this.showError('No tienes suficientes Cristales de Evolución');
  }
}
```

**WebSocket:** Emite evento `EVOLVE` con datos del personaje evolucionado.

---

### 3.5 Añadir Experiencia a Personaje

**POST** `/api/characters/:characterId/add-experience`

**Descripción:** Añade experiencia a un personaje (usado internamente después de combates).

**Body:**
```json
{
  "amount": 100
}
```

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Experiencia añadida",
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "experiencia": 550,
    "nivel": 6,
    "subio_nivel": true
  }
}
```

**Uso:** Este endpoint normalmente se llama desde el backend después de ganar un combate, no directamente desde el frontend.

---

### 3.6 Equipar Item en Personaje

**POST** `/api/characters/:characterId/equip`

**Descripción:** Equipa un item de equipamiento en un personaje.

**Body:**
```json
{
  "itemId": "item456"
}
```

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Item equipado exitosamente",
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "equipamiento": [
      {
        "id": "item456",
        "nombre": "Escudo de Madera",
        "stats": { "defensa": 8 }
      }
    ],
    "stats_totales": {
      "ataque": 25,
      "defensa": 28,
      "velocidad": 15
    }
  }
}
```
- `400 Bad Request`: Item no encontrado o ya equipado

**Flujo Frontend:**
```typescript
// Drag & drop o botón de equipar
async equipItem(characterId: string, itemId: string) {
  const result = await this.http.post(
    `/api/characters/${characterId}/equip`,
    { itemId },
    { withCredentials: true }
  ).toPromise();
  
  // Actualizar stats visualmente
  this.updateCharacterStats(result.personaje);
  
  // Emitir sonido de equipar
  this.audioService.play('equip');
}
```

**WebSocket:** Emite evento `EQUIP_ITEM` con datos del personaje actualizado.

---

### 3.7 Desequipar Item de Personaje

**POST** `/api/characters/:characterId/unequip`

**Descripción:** Remueve un item equipado del personaje.

**Body:**
```json
{
  "itemId": "item456"
}
```

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Item desequipado exitosamente",
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "equipamiento": [],
    "stats_totales": {
      "ataque": 25,
      "defensa": 20,
      "velocidad": 15
    }
  }
}
```

**Flujo Frontend:**
```typescript
async unequipItem(characterId: string, itemId: string) {
  await this.http.post(
    `/api/characters/${characterId}/unequip`,
    { itemId },
    { withCredentials: true }
  ).toPromise();
  
  this.refreshCharacter();
}
```

**WebSocket:** Emite evento `UNEQUIP_ITEM`.

---

### 3.8 Obtener Stats Detallados de Personaje

**GET** `/api/characters/:characterId/stats`

**Descripción:** Obtiene los stats base y totales (con equipamiento) de un personaje.

**Respuestas:**
- `200 OK`:
```json
{
  "personaje_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "nombre": "Caballero",
  "stats_base": {
    "ataque": 25,
    "defensa": 20,
    "velocidad": 15
  },
  "stats_equipamiento": {
    "ataque": 10,
    "defensa": 8,
    "velocidad": 0
  },
  "stats_totales": {
    "ataque": 35,
    "defensa": 28,
    "velocidad": 15
  },
  "equipamiento": [
    {
      "id": "item123",
      "nombre": "Espada de Hierro",
      "stats": { "ataque": 10 }
    },
    {
      "id": "item456",
      "nombre": "Escudo de Madera",
      "stats": { "defensa": 8 }
    }
  ]
}
```

**Flujo Frontend:**
```typescript
// Pantalla de detalle de personaje
async showCharacterDetails(characterId: string) {
  const stats = await this.http.get(
    `/api/characters/${characterId}/stats`,
    { withCredentials: true }
  ).toPromise();
  
  this.renderStatsBreakdown(stats);
}
```

---

## 🛡️ 4. EQUIPAMIENTO

### 4.1 Obtener Todo el Equipamiento Disponible

**GET** `/api/equipment`

**Descripción:** Lista todo el equipamiento disponible en el juego (catálogo público).

**Respuestas:**
- `200 OK`:
```json
[
  {
    "id": "item123",
    "nombre": "Espada de Hierro",
    "tipo": "arma",
    "rareza": "comun",
    "stats": {
      "ataque": 10,
      "defensa": 0,
      "velocidad": 0
    },
    "nivel_requerido": 1,
    "descripcion": "Una espada básica de hierro"
  },
  {
    "id": "item456",
    "nombre": "Armadura de Cuero",
    "tipo": "armadura",
    "rareza": "comun",
    "stats": {
      "ataque": 0,
      "defensa": 15,
      "velocidad": -2
    }
  }
]
```

**Uso:** Mostrar catálogo de equipamiento en la tienda o wiki.

---

## 🏪 5. SHOP (TIENDA)

### 5.1 Obtener Información de la Tienda

**GET** `/api/shop/info`

**Descripción:** Obtiene las tasas de cambio y paquetes disponibles.

**Respuestas:**
- `200 OK`:
```json
{
  "tasas_cambio": {
    "evo_por_val": 100,
    "val_por_dinero_real": {
      "paquete_pequeno": { "val": 500, "precio_usd": 4.99 },
      "paquete_mediano": { "val": 1200, "precio_usd": 9.99 },
      "paquete_grande": { "val": 2500, "precio_usd": 19.99 }
    }
  },
  "paquetes": [
    {
      "id": "paquete_pionero",
      "nombre": "Paquete del Pionero",
      "contenido": [
        "3 Personajes Iniciales",
        "1000 VAL",
        "10 Boletos",
        "5 EVO"
      ],
      "precio_usd": 0,
      "gratis": true
    }
  ]
}
```

**Uso:** Pantalla de tienda para mostrar precios actuales.

---

### 5.2 Comprar EVO con VAL

**POST** `/api/shop/buy-evo`

**Descripción:** Intercambia **VAL** por **Cristales de Evolución (EVO)**.

**Tasa de cambio:** 100 VAL = 1 EVO (configurable en GameSettings)

**Body:**
```json
{
  "amount": 5
}
```

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Compra exitosa",
  "evo_comprados": 5,
  "val_gastados": 500,
  "recursos_actuales": {
    "val": 500,
    "evo": 8
  }
}
```
- `400 Bad Request`: No tiene suficiente VAL

**Flujo Frontend:**
```typescript
// Botón de comprar EVO
async buyEvo(amount: number) {
  try {
    const result = await this.http.post(
      '/api/shop/buy-evo',
      { amount },
      { withCredentials: true }
    ).toPromise();
    
    this.showSuccess(`Compraste ${result.evo_comprados} Cristales de Evolución`);
    this.updateResources(result.recursos_actuales);
  } catch (error) {
    this.showError('No tienes suficiente VAL');
  }
}
```

**WebSocket:** Emite evento `RESOURCE_UPDATE` con nuevos recursos.

---

### 5.3 Comprar Paquete de VAL con Dinero Real

**POST** `/api/shop/buy-val`

**Descripción:** Inicia el flujo de pago para comprar VAL con dinero real (integración con Stripe/PayPal).

**Body:**
```json
{
  "packageId": "paquete_mediano"
}
```

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Orden creada",
  "payment_url": "https://checkout.stripe.com/pay/cs_test_a1...",
  "order_id": "order_abc123"
}
```

**Flujo Frontend:**
```typescript
async buyValPackage(packageId: string) {
  const result = await this.http.post(
    '/api/shop/buy-val',
    { packageId },
    { withCredentials: true }
  ).toPromise();
  
  // Redirigir a pasarela de pago
  window.location.href = result.payment_url;
}
```

---

## 🏰 6. MAZMORRAS

### 6.1 Listar Mazmorras Disponibles

**GET** `/api/dungeons`

**Descripción:** Lista todas las mazmorras del juego (pública, no requiere auth).

**Respuestas:**
- `200 OK`:
```json
[
  {
    "id": "dungeon001",
    "nombre": "Cripta Olvidada",
    "descripcion": "Una mazmorra oscura llena de muertos vivientes",
    "nivel_requerido_minimo": 1,
    "dificultad": "facil",
    "recompensas": {
      "val": 50,
      "exp": 100
    }
  },
  {
    "id": "dungeon002",
    "nombre": "Torre del Hechicero",
    "nivel_requerido_minimo": 5,
    "dificultad": "media"
  }
]
```

**Uso:** Mapa de mazmorras en el frontend.

---

### 6.2 Iniciar Combate en Mazmorra

**POST** `/api/dungeons/:dungeonId/start`

**Descripción:** Inicia un combate en una mazmorra con el personaje activo del usuario.

**Parámetros:**
- `dungeonId` (URL): ID de la mazmorra

**Respuestas:**
- `200 OK` (Victoria):
```json
{
  "resultado": "victoria",
  "combate": {
    "turnos": [
      { "turno": 1, "atacante": "Caballero", "daño": 25, "defensor": "Goblin" },
      { "turno": 2, "atacante": "Goblin", "daño": 10, "defensor": "Caballero" }
    ],
    "duracion_segundos": 15
  },
  "recompensas": {
    "val": 50,
    "experiencia": 100,
    "items": ["Poción de Vida"]
  },
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "salud_actual": 75,
    "experiencia": 650,
    "nivel": 6,
    "subio_nivel": true
  }
}
```
- `200 OK` (Derrota):
```json
{
  "resultado": "derrota",
  "combate": {...},
  "personaje": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "estado": "herido",
    "salud_actual": 0
  }
}
```
- `400 Bad Request`: Personaje no disponible o nivel insuficiente

**Flujo Frontend:**
```typescript
async startDungeon(dungeonId: string) {
  this.showLoadingScreen('Entrando a la mazmorra...');
  
  const result = await this.http.post(
    `/api/dungeons/${dungeonId}/start`,
    {},
    { withCredentials: true }
  ).toPromise();
  
  if (result.resultado === 'victoria') {
    this.showVictoryScreen(result.recompensas);
  } else {
    this.showDefeatScreen();
  }
}
```

**WebSocket:** Emite múltiples eventos durante el combate:
- `COMBAT_START`
- `COMBAT_TURN` (cada turno)
- `COMBAT_END`
- `LEVEL_UP` (si sube de nivel)

---

### 6.3 Obtener Progreso en Mazmorra

**GET** `/api/dungeons/:dungeonId/progress`

**Descripción:** Obtiene el progreso del usuario en una mazmorra específica.

**Respuestas:**
- `200 OK`:
```json
{
  "mazmorra": {
    "id": "dungeon001",
    "nombre": "Cripta Olvidada"
  },
  "progreso": {
    "victorias": 12,
    "derrotas": 3,
    "nivel_actual": 5,
    "puntos_acumulados": 450,
    "mejor_tiempo": 45
  },
  "estadisticas_globales": {
    "racha_actual": 5,
    "racha_maxima": 12,
    "total_victorias": 45
  }
}
```

**Uso:** Pantalla de detalle de mazmorra.

---

## 🛒 7. MARKETPLACE

### 7.1 Listar Publicaciones del Marketplace

**GET** `/api/marketplace/listings`

**Descripción:** Lista items publicados por otros jugadores para comprar.

**Query Parameters:**
- `tipo` (opcional): `equipamiento` | `consumible` | `personaje`
- `rareza` (opcional): `comun` | `raro` | `epico` | `legendario`
- `precio_min` (opcional): Precio mínimo en VAL
- `precio_max` (opcional): Precio máximo en VAL
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 20)

**Respuestas:**
- `200 OK`:
```json
{
  "listings": [
    {
      "id": "listing123",
      "vendedor": {
        "id": "user456",
        "username": "jugador789"
      },
      "item": {
        "id": "item123",
        "nombre": "Espada de Acero",
        "tipo": "equipamiento",
        "rareza": "raro",
        "stats": { "ataque": 20 }
      },
      "precio": 500,
      "destacado": false,
      "fecha_publicacion": "2025-11-01T10:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

**Flujo Frontend:**
```typescript
async searchMarketplace(filters: any) {
  const queryString = new URLSearchParams(filters).toString();
  const result = await this.http.get(
    `/api/marketplace/listings?${queryString}`,
    { withCredentials: true }
  ).toPromise();
  
  this.renderMarketplace(result.listings);
}
```

---

### 7.2 Crear Publicación en el Marketplace

**POST** `/api/marketplace/listings`

**Descripción:** Publica un item del inventario del usuario para venta.

**Body:**
```json
{
  "itemId": "item123",
  "precio": 500,
  "destacar": false
}
```

**Respuestas:**
- `201 Created`:
```json
{
  "listing": {
    "id": "listing123",
    "item": {...},
    "precio": 500,
    "destacado": false
  }
}
```
- `400 Bad Request`: Item no encontrado o precio inválido

**Costo de publicación:**
- Normal: 10 VAL
- Destacada: 50 VAL

**Flujo Frontend:**
```typescript
async sellItem(itemId: string, price: number, featured: boolean = false) {
  const result = await this.http.post(
    '/api/marketplace/listings',
    { itemId, precio: price, destacar: featured },
    { withCredentials: true }
  ).toPromise();
  
  this.showSuccess('Item publicado en el Marketplace');
  this.refreshInventory();
}
```

---

### 7.3 Comprar Item del Marketplace

**POST** `/api/marketplace/listings/:id/buy`

**Descripción:** Compra un item publicado por otro jugador.

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Compra exitosa",
  "item": {
    "id": "item123",
    "nombre": "Espada de Acero"
  },
  "precio_pagado": 500,
  "recursos_actuales": {
    "val": 500
  }
}
```
- `400 Bad Request`: No tiene suficiente VAL o listing no disponible

**Flujo Frontend:**
```typescript
async buyMarketplaceItem(listingId: string) {
  const result = await this.http.post(
    `/api/marketplace/listings/${listingId}/buy`,
    {},
    { withCredentials: true }
  ).toPromise();
  
  this.showSuccess(`Compraste ${result.item.nombre}`);
  this.updateInventory();
}
```

---

### 7.4 Cancelar Publicación

**DELETE** `/api/marketplace/listings/:id`

**Descripción:** Cancela una publicación propia y devuelve el item al inventario.

**Respuestas:**
- `200 OK`:
```json
{
  "message": "Listing cancelado exitosamente",
  "item_devuelto": {
    "id": "item123",
    "nombre": "Espada de Acero"
  }
}
```

**Flujo Frontend:**
```typescript
async cancelListing(listingId: string) {
  await this.http.delete(
    `/api/marketplace/listings/${listingId}`,
    { withCredentials: true }
  ).toPromise();
  
  this.showSuccess('Publicación cancelada');
}
```

---

## 📦 8. PAQUETES Y OFERTAS

### 8.1 Listar Paquetes Disponibles

**GET** `/api/packages`

**Descripción:** Lista todos los paquetes comprables con dinero real.

**Respuestas:**
- `200 OK`:
```json
[
  {
    "id": "paquete_pionero",
    "nombre": "Paquete del Pionero",
    "precio_usd": 0,
    "contenido": {
      "personajes": 3,
      "val": 1000,
      "boletos": 10,
      "evo": 5
    },
    "gratis": true
  },
  {
    "id": "paquete_starter",
    "nombre": "Paquete de Inicio",
    "precio_usd": 9.99,
    "contenido": {
      "val": 1500,
      "boletos": 20,
      "evo": 10,
      "items": ["Espada de Acero", "Armadura de Hierro"]
    }
  }
]
```

---

### 8.2 Obtener Ofertas Activas

**GET** `/api/offers`

**Descripción:** Lista las ofertas temporales activas (descuentos, eventos).

**Respuestas:**
- `200 OK`:
```json
[
  {
    "id": "oferta001",
    "nombre": "¡Doble EVO!",
    "descripcion": "Compra paquetes y obtén el doble de Cristales de Evolución",
    "fecha_inicio": "2025-11-01T00:00:00Z",
    "fecha_fin": "2025-11-07T23:59:59Z",
    "activa": true
  }
]
```

---

## 🎮 9. CATÁLOGOS

### 9.1 Listar Personajes Base

**GET** `/api/base-characters`

**Descripción:** Lista todos los personajes disponibles en el juego (catálogo).

**Respuestas:**
- `200 OK`:
```json
[
  {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "nombre": "Caballero",
    "clase": "Guerrero",
    "rareza": "comun",
    "stats_base": {
      "ataque": 25,
      "defensa": 20,
      "velocidad": 15
    },
    "descripcion": "Un valiente guerrero de armadura pesada",
    "sprite_url": "https://..."
  }
]
```

---

### 9.2 Listar Categorías

**GET** `/api/categories`

**Descripción:** Lista las categorías de items del juego.

**Respuestas:**
- `200 OK`:
```json
[
  { "id": "cat001", "nombre": "Armas", "tipo": "equipamiento" },
  { "id": "cat002", "nombre": "Armaduras", "tipo": "equipamiento" },
  { "id": "cat003", "nombre": "Pociones", "tipo": "consumible" }
]
```

---

### 9.3 Listar Items

**GET** `/api/items`

**Descripción:** Lista todos los items del juego (equipamiento + consumibles).

**Respuestas:**
- `200 OK`:
```json
[
  {
    "id": "item123",
    "nombre": "Espada de Hierro",
    "tipo": "equipamiento",
    "categoria": "Armas"
  }
]
```

---

### 9.4 Listar Consumibles

**GET** `/api/consumables`

**Descripción:** Lista solo los consumibles disponibles.

**Respuestas:**
- `200 OK`:
```json
[
  {
    "id": "consumible789",
    "nombre": "Poción de Vida",
    "tipo": "curacion",
    "efecto": "Restaura 50 HP",
    "rareza": "comun"
  }
]
```

---

### 9.5 Obtener Configuración del Juego

**GET** `/api/game-settings`

**Descripción:** Obtiene la configuración global del juego.

**Respuestas:**
- `200 OK`:
```json
{
  "id": "68f656a6130a3258735673e9",
  "costo_evo_por_val": 100,
  "costo_revivir_evo": 1,
  "costo_curar_boleto": 1,
  "tiempo_permadeath_horas": 48,
  "recompensas_victoria_base": {
    "val": 50,
    "exp": 100
  }
}
```

**Uso:** Cargar al iniciar la app para configurar lógica del cliente.

---

## 🔴 10. WEBSOCKET (TIEMPO REAL)

### Conexión

**URL:** `wss://valgame-backend.onrender.com`

**Autenticación:**
El WebSocket se autentica automáticamente usando la cookie `token` del usuario.

### Eventos Emitidos por el Backend

#### 10.1 `RESOURCE_UPDATE`

**Descripción:** Se emite cuando los recursos del usuario cambian.

**Payload:**
```json
{
  "type": "RESOURCE_UPDATE",
  "userId": "507f1f77bcf86cd799439011",
  "resources": {
    "val": 1500,
    "boletos": 8,
    "evo": 3
  }
}
```

**Uso Frontend:**
```typescript
socket.on('RESOURCE_UPDATE', (data) => {
  this.updateResourcesUI(data.resources);
});
```

---

#### 10.2 `COMBAT_START`

**Descripción:** El combate ha comenzado.

**Payload:**
```json
{
  "type": "COMBAT_START",
  "dungeon": "Cripta Olvidada",
  "character": "Caballero",
  "enemy": "Goblin"
}
```

---

#### 10.3 `COMBAT_TURN`

**Descripción:** Un turno de combate ha ocurrido.

**Payload:**
```json
{
  "type": "COMBAT_TURN",
  "turno": 3,
  "atacante": "Caballero",
  "defensor": "Goblin",
  "daño": 25,
  "salud_restante": 45
}
```

**Uso:** Animar cada golpe en tiempo real.

---

#### 10.4 `COMBAT_END`

**Descripción:** El combate ha terminado.

**Payload:**
```json
{
  "type": "COMBAT_END",
  "resultado": "victoria",
  "recompensas": {
    "val": 50,
    "exp": 100
  }
}
```

---

#### 10.5 `LEVEL_UP`

**Descripción:** El personaje subió de nivel.

**Payload:**
```json
{
  "type": "LEVEL_UP",
  "characterId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "nivel_nuevo": 7,
  "stats_nuevos": {
    "ataque": 30,
    "defensa": 25,
    "velocidad": 18
  }
}
```

---

#### 10.6 `EVOLVE`

**Descripción:** El personaje evolucionó.

**Payload:**
```json
{
  "type": "EVOLVE",
  "characterId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "nombre": "Caballero Legendario",
  "rareza": "legendario",
  "stats": {
    "ataque": 40,
    "defensa": 35,
    "velocidad": 20
  }
}
```

---

#### 10.7 `EQUIP_ITEM`

**Descripción:** Se equipó un item.

**Payload:**
```json
{
  "type": "EQUIP_ITEM",
  "characterId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "item": {
    "id": "item456",
    "nombre": "Escudo de Madera"
  },
  "stats_totales": {
    "ataque": 35,
    "defensa": 28
  }
}
```

---

#### 10.8 `UNEQUIP_ITEM`

**Descripción:** Se desequipó un item.

**Payload:**
```json
{
  "type": "UNEQUIP_ITEM",
  "characterId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "itemId": "item456"
}
```

---

#### 10.9 `MARKETPLACE_NEW_LISTING`

**Descripción:** Se publicó un nuevo item en el marketplace.

**Payload:**
```json
{
  "type": "MARKETPLACE_NEW_LISTING",
  "listing": {
    "id": "listing123",
    "item": {...},
    "precio": 500
  }
}
```

---

### Ejemplo de Implementación Frontend (Angular)

```typescript
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private socket: Socket;

  constructor() {
    this.socket = io('https://valgame-backend.onrender.com', {
      withCredentials: true,
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
    });
  }

  // Escuchar actualizaciones de recursos
  onResourceUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('RESOURCE_UPDATE', (data) => {
        observer.next(data);
      });
    });
  }

  // Escuchar eventos de combate
  onCombatTurn(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('COMBAT_TURN', (data) => {
        observer.next(data);
      });
    });
  }

  // Escuchar evoluciones
  onEvolve(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('EVOLVE', (data) => {
        observer.next(data);
      });
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
```

**Uso en componente:**
```typescript
export class GameComponent implements OnInit {
  constructor(private realtime: RealtimeService) {}

  ngOnInit() {
    // Suscribirse a actualizaciones de recursos
    this.realtime.onResourceUpdate().subscribe(data => {
      this.updateResources(data.resources);
    });

    // Animar turnos de combate
    this.realtime.onCombatTurn().subscribe(data => {
      this.animateCombatTurn(data);
    });

    // Mostrar animación de evolución
    this.realtime.onEvolve().subscribe(data => {
      this.showEvolutionCutscene(data);
    });
  }
}
```

---

## 🔒 SEGURIDAD

### Cookies httpOnly

Todas las peticiones autenticadas **deben** incluir:
```typescript
{
  withCredentials: true
}
```

Esto permite que las cookies httpOnly se envíen automáticamente.

### Rate Limiting

- **Auth endpoints:** 5 requests/15 min
- **Gameplay rápido:** 10 requests/min
- **Gameplay lento:** 2 requests/min
- **Marketplace:** 20 requests/min
- **API general:** 100 requests/15 min

---

## 📊 RESUMEN DE ENDPOINTS

| Categoría | Método | Endpoint | Autenticación |
|-----------|--------|----------|---------------|
| **Auth** | POST | `/auth/register` | No |
| | GET | `/auth/verify/:token` | No |
| | POST | `/auth/login` | No |
| | POST | `/auth/logout` | Sí |
| **Usuarios** | GET | `/api/users/me` | Sí |
| | GET | `/api/users/resources` | Sí |
| | GET | `/api/users/dashboard` | Sí |
| | PUT | `/api/users/tutorial/complete` | Sí |
| | POST | `/api/users/characters/add` | Sí |
| | PUT | `/api/users/set-active-character/:id` | Sí |
| **Personajes** | POST | `/api/characters/:id/use-consumable` | Sí |
| | POST | `/api/characters/:id/revive` | Sí |
| | POST | `/api/characters/:id/heal` | Sí |
| | POST | `/api/characters/:id/evolve` | Sí |
| | POST | `/api/characters/:id/add-experience` | Sí |
| | POST | `/api/characters/:id/equip` | Sí |
| | POST | `/api/characters/:id/unequip` | Sí |
| | GET | `/api/characters/:id/stats` | Sí |
| **Shop** | GET | `/api/shop/info` | No |
| | POST | `/api/shop/buy-evo` | Sí |
| | POST | `/api/shop/buy-val` | Sí |
| **Mazmorras** | GET | `/api/dungeons` | No |
| | POST | `/api/dungeons/:id/start` | Sí |
| | GET | `/api/dungeons/:id/progress` | Sí |
| **Marketplace** | GET | `/api/marketplace/listings` | Sí |
| | POST | `/api/marketplace/listings` | Sí |
| | POST | `/api/marketplace/listings/:id/buy` | Sí |
| | DELETE | `/api/marketplace/listings/:id` | Sí |
| **Catálogos** | GET | `/api/equipment` | No |
| | GET | `/api/consumables` | No |
| | GET | `/api/base-characters` | No |
| | GET | `/api/categories` | No |
| | GET | `/api/items` | No |
| | GET | `/api/packages` | No |
| | GET | `/api/offers` | No |
| | GET | `/api/game-settings` | No |

---

## 🚀 CHECKLIST DE IMPLEMENTACIÓN FRONTEND

### Fase 1: Autenticación
- [ ] Implementar formulario de registro
- [ ] Implementar pantalla de "verifica tu correo"
- [ ] Implementar formulario de login
- [ ] Configurar interceptor HTTP con `withCredentials: true`
- [ ] Implementar logout y redirección

### Fase 2: Dashboard
- [ ] Cargar `/api/users/me` al iniciar sesión
- [ ] Mostrar recursos (VAL, Boletos, EVO) en header
- [ ] Listar personajes del usuario
- [ ] Implementar selector de personaje activo
- [ ] Mostrar inventario de equipamiento
- [ ] Mostrar inventario de consumibles

### Fase 3: Personajes
- [ ] Pantalla de detalle de personaje
- [ ] Mostrar stats base y totales (con equipamiento)
- [ ] Botón de equipar/desequipar items (drag & drop)
- [ ] Botón de usar consumibles
- [ ] Botón de curar (si tiene daño)
- [ ] Botón de revivir (si está herido)
- [ ] Botón de evolucionar (si tiene EVO suficientes)

### Fase 4: Shop
- [ ] Pantalla de tienda
- [ ] Mostrar tasa de cambio VAL ↔ EVO
- [ ] Botón de comprar EVO con VAL
- [ ] Integrar pasarela de pago para comprar VAL con dinero real

### Fase 5: Mazmorras
- [ ] Mapa de mazmorras
- [ ] Pantalla de detalle de mazmorra (progreso, recompensas)
- [ ] Botón de "Entrar a la Mazmorra"
- [ ] Animación de combate (escuchar eventos WebSocket)
- [ ] Pantalla de victoria (mostrar recompensas)
- [ ] Pantalla de derrota (opciones de revivir)

### Fase 6: Marketplace
- [ ] Lista de publicaciones con filtros
- [ ] Botón de comprar item
- [ ] Botón de publicar item propio
- [ ] Pantalla de "Mis Publicaciones"
- [ ] Botón de cancelar publicación

### Fase 7: WebSocket
- [ ] Conectar al servidor WebSocket al login
- [ ] Escuchar `RESOURCE_UPDATE` y actualizar UI
- [ ] Escuchar eventos de combate y animar
- [ ] Escuchar `LEVEL_UP` y mostrar celebración
- [ ] Escuchar `EVOLVE` y mostrar cutscene
- [ ] Desconectar al logout

### Fase 8: Ranking
- [ ] Pantalla de ranking global (leaderboard)
- [ ] Mostrar top 10/20/50 jugadores
- [ ] Mostrar posición personal del usuario
- [ ] Filtros por período (global, semanal, mensual)
- [ ] Actualización en tiempo real cuando ganas/pierdes
- [ ] Mostrar estadísticas globales del juego

---

## 9. 🏆 SISTEMA DE RANKING

El sistema de ranking permite ver la clasificación de jugadores según sus puntos acumulados en combates de mazmorras.

### 🎯 Características Principales

- **Actualización automática:** El ranking se actualiza automáticamente cuando un jugador gana o pierde en una mazmorra
- **Múltiples períodos:** Global, semanal, mensual
- **Conexión con User:** Cada entrada del ranking está vinculada a un usuario mediante `userId` (ref: 'User')
- **Estadísticas completas:** Puntos, victorias, derrotas, boletos usados, última partida
- **Posicionamiento dinámico:** Se calcula la posición del jugador en tiempo real

### 📊 Modelo de Datos

```typescript
interface IRanking {
  userId: Types.ObjectId;      // Referencia al usuario (modelo User)
  puntos: number;              // Puntos totales acumulados
  victorias: number;           // Número de victorias
  derrotas: number;            // Número de derrotas
  ultimaPartida: Date;         // Fecha de la última partida jugada
  boletosUsados: number;       // Total de boletos consumidos
  periodo: string;             // "global" | "semanal" | "mensual"
}
```

### 🔧 Configuración

**Puntos por victoria:** Configurado en `game_settings.puntos_ranking_por_victoria` (valor por defecto: 10)

**Actualización automática:** 
- ✅ Se actualiza al ganar una mazmorra: +10 puntos, +1 victoria, +1 boleto usado
- ✅ Se actualiza al perder una mazmorra: +1 derrota, +1 boleto usado
- ✅ Usa `upsert: true` para crear automáticamente el registro si no existe

---

### 9.1 Obtener Ranking Global

**GET** `/api/rankings`

**Descripción:** Obtiene el ranking global ordenado por puntos (de mayor a menor). Por defecto muestra el top 10.

**Autenticación:** ❌ No requerida (endpoint público)

**Query Parameters:**
- `limit` (opcional): Número de jugadores a mostrar (default: 10)
  - Ejemplo: `?limit=20` para ver top 20

**Respuesta exitosa (200):**
```json
{
  "rankings": [
    {
      "_id": "673abc123...",
      "userId": {
        "_id": "672def456...",
        "username": "JugadorPro",
        "email": "jugador@example.com"
      },
      "puntos": 150,
      "victorias": 15,
      "derrotas": 3,
      "ultimaPartida": "2025-11-03T20:45:00.000Z",
      "boletosUsados": 18,
      "periodo": "global",
      "posicion": 1
    },
    {
      "_id": "673abc789...",
      "userId": {
        "_id": "672def012...",
        "username": "Guerrero",
        "email": "guerrero@example.com"
      },
      "puntos": 120,
      "victorias": 12,
      "derrotas": 2,
      "ultimaPartida": "2025-11-03T19:30:00.000Z",
      "boletosUsados": 14,
      "periodo": "global",
      "posicion": 2
    }
  ]
}
```

**Casos de error:**
- `500 Internal Server Error`: Error al obtener el ranking

**Ejemplo de uso:**
```typescript
// Angular/React - Sin autenticación
fetch('http://localhost:8080/api/rankings?limit=20')
  .then(res => res.json())
  .then(data => {
    console.log('Top 20 jugadores:', data.rankings);
    // Mostrar en tabla o lista
  });
```

**Uso en frontend:**
- Pantalla principal de "Leaderboard"
- Mostrar top 10 en dashboard
- Página de estadísticas globales

---

### 9.2 Obtener Ranking por Período

**GET** `/api/rankings/period/:periodo`

**Descripción:** Obtiene el ranking filtrado por período específico (global, semanal, mensual).

**Autenticación:** ❌ No requerida (endpoint público)

**Parámetros URL:**
- `periodo` (requerido): `"global"` | `"semanal"` | `"mensual"`

**Query Parameters:**
- `limit` (opcional): Número de jugadores a mostrar (default: 10)

**Respuesta exitosa (200):**
```json
{
  "rankings": [
    {
      "_id": "673abc123...",
      "userId": {
        "_id": "672def456...",
        "username": "JugadorSemanal",
        "email": "jugador@example.com"
      },
      "puntos": 50,
      "victorias": 5,
      "derrotas": 1,
      "ultimaPartida": "2025-11-03T20:00:00.000Z",
      "boletosUsados": 6,
      "periodo": "semanal",
      "posicion": 1
    }
  ]
}
```

**Casos de error:**
- `400 Bad Request`: Período inválido (debe ser global, semanal o mensual)
- `500 Internal Server Error`: Error al obtener el ranking

**Ejemplo de uso:**
```typescript
// Obtener ranking semanal
fetch('http://localhost:8080/api/rankings/period/semanal?limit=15')
  .then(res => res.json())
  .then(data => {
    console.log('Top 15 de la semana:', data.rankings);
  });

// Obtener ranking mensual
fetch('http://localhost:8080/api/rankings/period/mensual')
  .then(res => res.json())
  .then(data => {
    console.log('Top 10 del mes:', data.rankings);
  });
```

**Uso en frontend:**
- Tabs para cambiar entre global/semanal/mensual
- Pantalla de "Ranking de esta semana"
- Competencias mensuales

---

### 9.3 Obtener Mi Ranking Personal

**GET** `/api/rankings/me`

**Descripción:** Obtiene el ranking personal del usuario autenticado, incluyendo su posición calculada en el ranking global.

**Autenticación:** ✅ Requerida (JWT en cookie)

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "ranking": {
    "_id": "673abc999...",
    "userId": "672def456...",
    "puntos": 80,
    "victorias": 8,
    "derrotas": 3,
    "ultimaPartida": "2025-11-03T18:30:00.000Z",
    "boletosUsados": 11,
    "periodo": "global"
  },
  "posicion": 12
}
```

**Casos de error:**
- `401 Unauthorized`: Usuario no autenticado
- `404 Not Found`: Usuario no tiene ranking aún (no ha jugado mazmorras)
```json
{
  "message": "No se encontró ranking para este usuario. Juega tu primera mazmorra para aparecer en el ranking."
}
```
- `500 Internal Server Error`: Error al obtener el ranking

**Ejemplo de uso:**
```typescript
// Angular/React con cookie httpOnly
fetch('http://localhost:8080/api/rankings/me', {
  credentials: 'include' // Importante para enviar cookie
})
  .then(res => res.json())
  .then(data => {
    console.log(`Estás en la posición ${data.posicion}`);
    console.log(`Tienes ${data.ranking.puntos} puntos`);
    console.log(`Victorias: ${data.ranking.victorias}`);
    console.log(`Derrotas: ${data.ranking.derrotas}`);
  });
```

**Uso en frontend:**
- Widget en dashboard: "Tu posición: #12"
- Perfil de usuario con estadísticas
- Motivación: "¡Estás cerca del top 10!"

---

### 9.4 Obtener Estadísticas Globales

**GET** `/api/rankings/stats`

**Descripción:** Obtiene estadísticas agregadas de todos los jugadores en el ranking.

**Autenticación:** ❌ No requerida (endpoint público)

**Respuesta exitosa (200):**
```json
{
  "stats": {
    "totalPlayers": 48,
    "totalVictorias": 324,
    "totalDerrotas": 156,
    "totalPuntos": 3240,
    "promedioVictoriasPorJugador": 6.75,
    "promedioDerrotasPorJugador": 3.25,
    "promedioPuntosPorJugador": 67.5
  }
}
```

**Casos de error:**
- `500 Internal Server Error`: Error al calcular estadísticas

**Ejemplo de uso:**
```typescript
// Obtener stats globales
fetch('http://localhost:8080/api/rankings/stats')
  .then(res => res.json())
  .then(data => {
    console.log('Jugadores totales:', data.stats.totalPlayers);
    console.log('Victorias totales:', data.stats.totalVictorias);
    console.log('Promedio de puntos:', data.stats.promedioPuntosPorJugador);
  });
```

**Uso en frontend:**
- Pantalla de "Estadísticas del Juego"
- Dashboard de administración
- Sección "Sobre el Juego" con números impresionantes

---

### 🔄 Flujo de Actualización del Ranking

#### Cuando un jugador GANA una mazmorra:

1. Usuario completa una mazmorra exitosamente
2. Endpoint: `POST /api/dungeons/action` con victoria
3. Backend ejecuta automáticamente:
```typescript
await Ranking.findOneAndUpdate(
  { userId: user._id, periodo: 'global' },
  { 
    $inc: { 
      puntos: 10,           // Suma 10 puntos (configurado en game_settings)
      victorias: 1,         // +1 victoria
      boletosUsados: 1      // +1 boleto usado
    },
    $set: { 
      ultimaPartida: new Date() 
    }
  },
  { upsert: true, new: true }  // Crea el registro si no existe
);
```
4. Frontend puede consultar `GET /api/rankings/me` para ver la nueva posición

#### Cuando un jugador PIERDE una mazmorra:

1. Usuario pierde en una mazmorra (personaje derrotado)
2. Endpoint: `POST /api/dungeons/action` con derrota
3. Backend ejecuta automáticamente:
```typescript
await Ranking.findOneAndUpdate(
  { userId: user._id, periodo: 'global' },
  { 
    $inc: { 
      derrotas: 1,          // +1 derrota
      boletosUsados: 1      // +1 boleto usado
    },
    $set: { 
      ultimaPartida: new Date() 
    }
  },
  { upsert: true, new: true }
);
```
4. Los puntos NO se restan (solo se suman con victorias)

---

### 🎮 Ejemplo Completo: Frontend con Ranking

```typescript
// === COMPONENTE: Leaderboard.component.ts ===

export class LeaderboardComponent implements OnInit {
  topPlayers: any[] = [];
  myRanking: any = null;
  stats: any = null;
  selectedPeriod: string = 'global';

  async ngOnInit() {
    await this.loadRanking();
    await this.loadMyRanking();
    await this.loadStats();
  }

  async loadRanking() {
    const response = await fetch(
      `http://localhost:8080/api/rankings/period/${this.selectedPeriod}?limit=20`
    );
    const data = await response.json();
    this.topPlayers = data.rankings;
  }

  async loadMyRanking() {
    const response = await fetch('http://localhost:8080/api/rankings/me', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      this.myRanking = data;
    } else {
      console.log('Usuario no tiene ranking aún');
    }
  }

  async loadStats() {
    const response = await fetch('http://localhost:8080/api/rankings/stats');
    const data = await response.json();
    this.stats = data.stats;
  }

  changePeriod(period: string) {
    this.selectedPeriod = period;
    this.loadRanking();
  }
}
```

```html
<!-- === TEMPLATE: leaderboard.component.html === -->

<div class="ranking-container">
  <!-- Mi Posición -->
  <div class="my-ranking" *ngIf="myRanking">
    <h3>Tu Posición</h3>
    <p class="position">#{{ myRanking.posicion }}</p>
    <p>Puntos: {{ myRanking.ranking.puntos }}</p>
    <p>Victorias: {{ myRanking.ranking.victorias }}</p>
    <p>Derrotas: {{ myRanking.ranking.derrotas }}</p>
  </div>

  <!-- Tabs de Período -->
  <div class="period-tabs">
    <button (click)="changePeriod('global')" 
            [class.active]="selectedPeriod === 'global'">
      Global
    </button>
    <button (click)="changePeriod('semanal')" 
            [class.active]="selectedPeriod === 'semanal'">
      Semanal
    </button>
    <button (click)="changePeriod('mensual')" 
            [class.active]="selectedPeriod === 'mensual'">
      Mensual
    </button>
  </div>

  <!-- Top Players -->
  <div class="leaderboard">
    <h2>Top 20 Jugadores</h2>
    <table>
      <thead>
        <tr>
          <th>Posición</th>
          <th>Usuario</th>
          <th>Puntos</th>
          <th>Victorias</th>
          <th>Derrotas</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let player of topPlayers" 
            [class.me]="myRanking && player.userId._id === myRanking.ranking.userId">
          <td>{{ player.posicion }}</td>
          <td>{{ player.userId.username }}</td>
          <td>{{ player.puntos }}</td>
          <td>{{ player.victorias }}</td>
          <td>{{ player.derrotas }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Estadísticas Globales -->
  <div class="stats" *ngIf="stats">
    <h3>Estadísticas Globales</h3>
    <p>Jugadores totales: {{ stats.totalPlayers }}</p>
    <p>Victorias totales: {{ stats.totalVictorias }}</p>
    <p>Derrotas totales: {{ stats.totalDerrotas }}</p>
    <p>Promedio puntos por jugador: {{ stats.promedioPuntosPorJugador }}</p>
  </div>
</div>
```

---

### 🔒 Seguridad y Validación

**Validaciones implementadas:**
- ✅ Los endpoints públicos no requieren autenticación (GET /api/rankings)
- ✅ El endpoint personal requiere autenticación (GET /api/rankings/me)
- ✅ Validación de parámetro `periodo` (solo: global, semanal, mensual)
- ✅ Validación de `limit` como número positivo
- ✅ Los puntos solo se pueden incrementar mediante victorias (no hay endpoint directo para modificar puntos)
- ✅ Uso de `upsert: true` para crear automáticamente el registro si no existe

**Prevención de trampas:**
- ❌ No hay endpoint para modificar puntos manualmente
- ✅ Los puntos se calculan exclusivamente en el servidor
- ✅ La actualización del ranking está integrada en el flujo de mazmorras (no se puede llamar directamente)
- ✅ El `userId` se obtiene del JWT autenticado, no del body de la petición

---

### ⚡ Optimización y Rendimiento

**Índices de MongoDB:**
```typescript
// Ya configurados en el modelo
userId: { index: true }
ultimaPartida: { index: true }
periodo: { index: true }
```

**Mejoras futuras:**
- 🔮 WebSocket para actualizar ranking en tiempo real sin refrescar
- 🔮 Caché de ranking global (actualizar cada 5 minutos)
- 🔮 Sistema de premios mensuales/semanales automáticos
- 🔮 Notificaciones cuando subes de posición
- 🔮 Historial de ranking (ver tu evolución en el tiempo)

---

### 📋 Checklist Frontend - Ranking

```typescript
// ✅ Endpoints implementados en backend
// ✅ Modelo conectado con User (ref: 'User')
// ✅ Actualización automática en victorias/derrotas
// ✅ Cálculo de posición en tiempo real

// 🔄 Por implementar en frontend:
- [ ] Componente LeaderboardComponent
- [ ] Servicio RankingService
- [ ] Pantalla de ranking global
- [ ] Widget "Mi posición" en dashboard
- [ ] Tabs para cambiar período (global/semanal/mensual)
- [ ] Tabla con top jugadores
- [ ] Resaltar tu posición en la tabla
- [ ] Página de estadísticas globales
- [ ] Animación cuando subes de posición (opcional)
- [ ] Notificación cuando entras al top 10 (opcional)
```

---

## 📝 NOTAS FINALES

### Migración Ejecutada

✅ **Campo `costo_evo_por_val` añadido a GameSettings**

La migración añadió el campo `costo_evo_por_val: 100` a la colección `game_settings` en MongoDB.

### Variables de Entorno Requeridas

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_secreto_super_seguro
PORT=8080
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.netlify.app
```

### CORS

⚠️ **MODO DESARROLLO ACTIVO:** El backend actualmente acepta solicitudes de **cualquier origen** (`origin: true`).

**Antes de producción final:**
```typescript
app.use(cors({ 
  origin: process.env.FRONTEND_URL,
  credentials: true 
}));
```

---

## 📞 SOPORTE

Para reportar bugs o solicitar nuevas features:
- **Email:** soporte@valgame.com
- **GitHub:** https://github.com/exploradoresvalnor-collab/valgame-backend/issues

---

**🎮 ¡Feliz desarrollo!**
