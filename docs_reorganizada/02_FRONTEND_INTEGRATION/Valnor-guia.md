# Valnor — Guía de Integración Frontend Completa

**Última actualización:** 24 de noviembre de 2025 - 11:35:49
**Estado:** 📘 Guía completa reorganizada y estructurada por flujos
**Propósito:** Documentación pantalla a pantalla, endpoints, ejemplos y checklist para implementar el frontend sin bloqueos.
**Líneas totales:** 1793 | **Secciones:** 10 principales + subsecciones detalladas
**Cobertura:** Todos los endpoints críticos, ejemplos JSON/cURL/Angular, manejo de errores, WebSocket, rate-limits, checklist 10 fases---

## 📑 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Autenticación](#autenticación-registro-login-recuperación)
3. [Perfil y Usuario](#perfil-y-usuario-dashboard-edición-recursos)
4. [Inventario y Equipamiento](#inventario-y-equipamiento-personajes-items-consumibles)
5. [Paquetes y Tienda](#paquetes-y-tienda-compra-apertura-asignación)
6. [Marketplace](#marketplace-compra-y-venta-p2p)
7. [Mazmorras y Combate](#mazmorras-y-combate-flujo-de-juego)
8. [Rankings](#rankings-leaderboards-y-competencia)
9. [Referencia Técnica](#referencia-técnica-endpoints-websocket-errores)
10. [Apéndice](#apéndice-schemas-scripts-checklist)

---

## Introducción

### Información General

- **Plataforma:** Web app nativa orientada a móvil (landscape)
- **Stack Backend:** Node.js + Express + TypeScript + MongoDB
- **Autenticación:** JWT via cookie httpOnly (`token`)
- **Real-time:** WebSocket (Socket.IO estilo) para notificaciones y eventos
- **Base de Datos:** MongoDB con Mongoose ODM

### Características Clave

- Registro y autenticación segura (email + contraseña)
- Sistema de inventario con personajes, items y consumibles
- Tienda oficial + Marketplace P2P
- Mazmorras con combate automático
- Rankings y competencia
- Notificaciones en tiempo real

### Cómo Usar Esta Guía

Cada sección contiene:
- **Descrición del flujo UX**
- **Endpoints reales del backend** (nombres exactos)
- **Ejemplos de request/response JSON**
- **Manejo de errores** (códigos HTTP, mensajes)
- **Notas técnicas** para frontend (cookies, WebSocket, rate-limits)

---

## Autenticación (Registro, Login, Recuperación)

### Diagrama General

```
Landing
  ↓
[Registrarse] → Registro → Verificar Email → Onboarding → Dashboard
                                ↓
                         [Reenviar Verificación]

[Iniciar Sesión] → Login → Dashboard

[Olvidé Contraseña] → Forgot Password → Reset Password → Login
```

### 1. Landing (Pantalla de Entrada)

**Objetivo:** Página inicial con dos opciones principales: registrarse o iniciar sesión.

**UI Recomendada (Landscape):**
- Logo a la izquierda
- Centro: dos botones grandes ("Registrarse" e "Iniciar Sesión")
- Footer: enlaces legales

**Flujo:**
- Clic "Registrarse" → ir a pantalla Registro
- Clic "Iniciar Sesión" → ir a pantalla Login

---

### 2. Registro (Pantalla Principal de Registro)

**Campos:** `email`, `username`, `password`

**Validaciones Locales (Frontend):**
- Email: formato válido (RFC 5322 básico)
- Username: mínimo 3 caracteres, alfanuméricos + guión
- Password: mínimo 6 caracteres

**Endpoint:**
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "player1",
  "password": "secret123"
}
```

**Respuesta Exitosa (201):**
```json
{
  "ok": true,
  "message": "Usuario creado. Verifica tu correo.",
  "email": "user@example.com"
}
```

**Errores Comunes:**
- **400 Bad Request:** Validación fallida (email inválido, username muy corto, etc.)
- **409 Conflict:** Email o username ya existen
- **500 Internal Server Error:** Fallo al enviar email (usuario creado, pero reintenta más tarde)

**Lógica Backend:**
1. Valida email único y username único
2. Hash de password con bcrypt
3. Crea usuario con `isVerified=false`
4. Genera `verificationToken` (válido 1 hora)
5. Envía email con link: `FRONTEND_URL/verify/<token>` (configurable)

**Código Angular Ejemplo:**
```typescript
register(email: string, username: string, password: string) {
  return this.http.post('/auth/register', 
    { email, username, password },
    { withCredentials: true }
  );
}
```

**Flujo UX Posterior:**
- Si éxito → mostrar pantalla "Verifica tu correo" con:
  - Mensaje: "Hemos enviado un link de verificación a {email}"
  - Botón "Reenviar verificación" (si no llegó el email)
  - Timer: "Link válido por 1 hora"
  - Nota: revisar SPAM

---

### 3. Reenvío de Verificación

**Pantalla:** Input `email` + botón "Reenviar"

**Endpoint:**
```
POST /auth/resend-verification
Content-Type: application/json

{ "email": "user@example.com" }
```

**Respuesta (200):**
```json
{ "ok": true, "message": "Correo de verificación reenviado" }
```

**Errores:**
- **400 Bad Request:** Usuario ya verificado
- **429 Too Many Requests:** Esperar antes de reenviar (token válido aún, tiempo restante en respuesta)
- **500 Internal Server Error:** Fallo al enviar email

**Lógica Backend:**
- Si usuario no existe → respuesta genérica (no revela existencia)
- Si ya verificado → 400 con claro "Ya verificaste tu cuenta"
- Si existe token válido no expirado → 429 + tiempo restante
- Si OK → genera nuevo token y envía email

---

### 4. Verificación (Link de Correo)

**Endpoint:**
```
GET /auth/verify/:token
```

**Comportamiento:**
- Si token **inválido/expirado** → HTML con mensaje de error y link para reenviar
- Si token **válido** → 
  1. Marca usuario como `isVerified=true`
  2. Entrega paquete pionero (recursos iniciales)
  3. Devuelve HTML con resumen de recompensas
  4. Redirecciona a login o landing con mensaje de éxito

**Nota:** Actualmente devuelve HTML desde el servidor. Si prefieres SPA puro, cambia el link del email a `FRONTEND_URL/verify/<token>` y deja que la SPA llame al API.

---

### 5. Login (Inicio de Sesión)

**Campos:** `email`, `password`

**Endpoint:**
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Importante:** Usar `{ withCredentials: true }` para aceptar cookie httpOnly

**Respuesta Exitosa (200):**
```json
{
  "ok": true,
  "user": {
    "id": "64ab...",
    "email": "user@example.com",
    "username": "player1",
    "isVerified": true,
    "val": 100,
    "evo": 0,
    "boletos": 0
  }
}
```

**Nota:** Cookie httpOnly se envía en header `Set-Cookie: token=<JWT>; HttpOnly; Secure; SameSite=Strict`

**Errores:**
- **401 Unauthorized:** Credenciales inválidas
- **403 Forbidden:** Cuenta no verificada (mostrar CTA para reenviar verificación)
- **429 Too Many Requests:** Demasiados intentos fallidos (esperar o mostrar captcha)

**Lógica Backend:**
1. Verifica credenciales (bcrypt compare)
2. Verifica `isVerified=true` (salvo TEST_MODE)
3. Genera JWT y lo coloca en cookie httpOnly
4. Devuelve datos del usuario

**Código Angular Ejemplo:**
```typescript
login(email: string, password: string) {
  return this.http.post('/auth/login',
    { email, password },
    { withCredentials: true }
  );
}

// Después de login exitoso, cargar datos del usuario
this.authService.login(email, password).subscribe(
  (response) => {
    this.currentUser = response.user;
    this.navigateTo('/dashboard');
  },
  (error) => {
    if (error.status === 403) {
      this.showMessage('Verifica tu email primero');
    }
  }
);
```

---

### 6. Recuperar Contraseña

**Flujo de dos pasos:**
1. Usuario solicita recuperación con email
2. Backend envía link con token temporal
3. Usuario abre link, ingresa nueva contraseña
4. Backend valida y actualiza contraseña

**Paso 1: Solicitar Recuperación**

**Endpoint:**
```
POST /auth/forgot-password
Content-Type: application/json

{ "email": "user@example.com" }
```

**Respuesta (200):**
```json
{ "ok": true, "message": "Si el email existe, recibirás instrucciones" }
```

**Nota:** Respuesta genérica (no revela si el email existe para evitar enumeración de usuarios)

**Lógica Backend:**
- Si email existe: genera `resetPasswordToken` (válido 1 hora) y envía email
- Si email no existe: responde igual (seguridad)

**Paso 2: Reset Contraseña**

**Endpoint:**
```
POST /auth/reset-password/:token
Content-Type: application/json

{
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Respuesta (200):**
```json
{ "ok": true, "message": "Contraseña actualizada. Inicia sesión." }
```

**Errores:**
- **400 Bad Request:** Passwords no coinciden, token inválido/expirado, password muy débil
- **401 Unauthorized:** Token no válido

**Lógica Backend:**
1. Valida token temporal
2. Valida que passwords coincidan y sean fuertes
3. Hash de nueva contraseña
4. Limpia `resetPasswordToken`
5. Opcionalmente: invalida todas las sesiones anteriores (logout global)

**UI Recomendada:**
- Pantalla `ForgotPasswordComponent`: input email, botón "Enviar"
- Pantalla `ResetPasswordComponent` (ruta `/reset-password/:token`): inputs password y confirmPassword, botón "Actualizar"

---

### 7. Logout

**Endpoint:**
```
POST /auth/logout
```

**Importante:** Usar `{ withCredentials: true }`

**Respuesta (200):**
```json
{ "ok": true, "message": "Sesión cerrada" }
```

**Lógica Backend:**
1. Limpia cookie (`clearCookie('token')`)
2. Añade JWT a blacklist para invalidar cualquier token anterior
3. Devuelve 200

**Flujo Frontend:**
```typescript
logout() {
  return this.http.post('/auth/logout', {}, { withCredentials: true })
    .subscribe(
      () => {
        // Limpiar estado local
        this.currentUser = null;
        this.navigateTo('/landing');
      }
    );
}
```

---

### Resumen Endpoints Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/register` | Registrar nuevo usuario |
| `POST` | `/auth/resend-verification` | Reenviar email de verificación |
| `GET` | `/auth/verify/:token` | Verificar email (link del correo) |
| `POST` | `/auth/login` | Iniciar sesión |
| `POST` | `/auth/logout` | Cerrar sesión |
| `POST` | `/auth/forgot-password` | Solicitar recuperación |
| `POST` | `/auth/reset-password/:token` | Actualizar contraseña |

---

## Perfil y Usuario (Dashboard, Edición, Recursos)

### 1. Dashboard (Pantalla Principal Post-Login)

**Propósito:** Pantalla central donde el usuario ve su inventario, personajes activos, recursos principales y accesos rápidos.

**Endpoint para Carga Inicial:**
```
GET /api/users/dashboard
```

**Respuesta (200):**
```json
{
  "user": {
    "id": "64ab...",
    "username": "player1",
    "nivel": 5
  },
  "recursos": {
    "val": 120,
    "evo": 3,
    "boletos": 2,
    "energia": 10
  },
  "personajesActivos": [
    {
      "id": "char_01",
      "nombre": "Valornian Hero",
      "nivel": 5,
      "etapa": 1,
      "saludActual": 120,
      "saludMaxima": 150,
      "estado": "saludable"
    }
  ],
  "paquetesPendientes": [
    { "id": "pack_1", "nombre": "Starter Pack" }
  ],
  "notificacionesNoLeidas": 3
}
```

**Elementos UI Típicos:**
- Foto/avatar del jugador
- Nombre y nivel
- Barra de recursos: VAL, EVO, boletos, energía
- Tarjeta: "Tu equipo" (personajes activos)
- Botón grande: "Abrir mazmorra"
- Zona rápida: "Mis paquetes", "Tienda", "Marketplace"

---

### 2. Obtener Perfil Completo

**Endpoint:**
```
GET /api/users/me
```

**Respuesta (200):**
```json
{
  "id": "64ab...",
  "email": "user@example.com",
  "username": "player1",
  "isVerified": true,
  "val": 120,
  "evo": 3,
  "boletos": 2,
  "energia": 10,
  "inventarioConsumibles": [
    { "id": "cons_3", "nombre": "Poción Mayor", "usos_restantes": 3 }
  ],
  "personajes": [
    {
      "personajeId": "char_01",
      "nombre": "Valornian Hero",
      "imagen": "/img/char1.png",
      "rango": "rare",
      "nivel": 5,
      "etapa": 1,
      "saludActual": 120,
      "saludMaxima": 150,
      "estado": "saludable"
    }
  ],
  "paquetes": [
    { "id": "pack_1", "nombre": "Starter Pack", "fecha": "2025-11-01" }
  ]
}
```

**Nota:** Incluir `{ withCredentials: true }` en la llamada para que se envíe la cookie

---

### 3. Edición de Perfil

**Endpoint:**
```
PATCH /api/users/me
Content-Type: application/json

{
  "username": "newUsername",
  "bio": "Explorador aventurero"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "user": { "username": "newUsername", "bio": "..." }
}
```

**Errores:**
- **400 Bad Request:** Username inválido o ya existe
- **401 Unauthorized:** No autenticado

---

### 4. Obtener Recursos (Ligero)

**Endpoint:**
```
GET /api/users/resources
```

**Respuesta (200):**
```json
{
  "val": 120,
  "evo": 3,
  "boletos": 2,
  "energia": 10
}
```

**Uso:** Para updates rápidos sin cargar el perfil completo

---

### 5. Marcar Tutorial Completado

**Endpoint:**
```
PUT /api/users/tutorial/complete
```

**Respuesta (200):**
```json
{ "ok": true, "message": "Tutorial marcado como completado" }
```

**Nota:** Flag para no mostrar tutorial nuevamente

---

## Inventario y Equipamiento (Personajes, Items, Consumibles)

### 1. Tipos de Elementos en el Inventario

**Personajes:**
- Unidad jugable con stats (salud, ataque, defensa, etc.)
- Se equipan items y se evolucionan
- Tienen etapas (1-5 típicamente)

**Items:**
- Objetos que se equipan en slots (arma, armadura, accesorio, etc.)
- Afectan los stats del personaje
- Se obtienen de paquetes o marketplace

**Consumibles:**
- Pociones, buff, etc.
- Se usan en combate o fuera
- Tienen usos limitados

---

### 2. Personajes: Obtener y Gestionar

**Endpoint: Listar Personajes del Usuario**
```
GET /api/user-characters
```

**Respuesta (200):**
```json
{
  "personajes": [
    {
      "id": "char_01",
      "nombre": "Valornian Hero",
      "rango": "rare",
      "nivel": 5,
      "etapa": 1,
      "saludActual": 120,
      "saludMaxima": 150,
      "ataque": 15,
      "defensa": 10,
      "estado": "saludable",
      "equipo": {
        "arma": { "id": "item_10", "nombre": "Espada de Fuego" },
        "armadura": { "id": "item_20", "nombre": "Armadura de Hierro" }
      }
    }
  ]
}
```

**Endpoint: Obtener Personaje Específico**
```
GET /api/user-characters/:characterId
```

---

### 3. Consumibles: Usar

**Endpoint:**
```
POST /api/characters/:characterId/use-consumable
Content-Type: application/json

{
  "consumibleId": "cons_3",
  "tipo": "potion"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "efectoAplicado": {
    "tipo": "heal",
    "cantidad": 50,
    "nuevoSalud": 150
  }
}
```

---

### 4. Personaje: Revive

**Endpoint (resucitar personaje muerto):**
```
POST /api/characters/:characterId/revive
Content-Type: application/json

{ "costoEnVAL": 10 }
```

**Respuesta (200):**
```json
{
  "ok": true,
  "personaje": {
    "id": "char_01",
    "saludActual": 75,
    "estado": "saludable"
  },
  "nuevoBalance": 110
}
```

**Errores:**
- **402 Payment Required:** VAL insuficiente
- **400 Bad Request:** Personaje no está muerto

---

### 5. Personaje: Heal (Curar sin Revive)

**Endpoint:**
```
POST /api/characters/:characterId/heal
Content-Type: application/json

{ "cantidad": 50 }
```

**Respuesta (200):**
```json
{
  "ok": true,
  "nuevoSalud": 150,
  "costoEnVAL": 5
}
```

---

### 6. Personaje: Evolve (Evolucionar Etapa)

**Endpoint:**
```
POST /api/characters/:characterId/evolve
Content-Type: application/json

{ "etapaDestino": 2 }
```

**Respuesta (200):**
```json
{
  "ok": true,
  "personaje": {
    "etapa": 2,
    "saludMaxima": 180,
    "ataque": 18
  },
  "costoEnEVO": 3,
  "nuevoBalance": 0
}
```

**Errores:**
- **402 Payment Required:** EVO insuficiente
- **400 Bad Request:** Requisitos no cumplidos (nivel, etapa previa)

---

### 7. Equipamiento: Equipar/Desequipar

**Endpoint: Equipar**
```
POST /api/characters/:characterId/equip
Content-Type: application/json

{
  "itemId": "item_10",
  "slot": "arma"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "personaje": {
    "equipo": { "arma": { "id": "item_10", "nombre": "Espada de Fuego" } },
    "stats": { "ataque": 18 }
  }
}
```

**Endpoint: Desequipar**
```
POST /api/characters/:characterId/unequip
Content-Type: application/json

{ "slot": "arma" }
```

---

### 8. Stats de Personaje

**Endpoint:**
```
GET /api/characters/:characterId/stats
```

**Respuesta (200):**
```json
{
  "personajeId": "char_01",
  "nombre": "Valornian Hero",
  "salud": { "actual": 120, "maxima": 150 },
  "ataque": 15,
  "defensa": 10,
  "velocidad": 12,
  "critico": 5,
  "equipamiento": {
    "arma": { "id": "item_10", "bonus_ataque": 3 },
    "armadura": { "id": "item_20", "bonus_defensa": 2 }
  }
}
```

---

## Paquetes y Tienda (Compra, Apertura, Asignación)

### 1. Visualizar Paquetes Disponibles

**Endpoint:**
```
GET /api/packages
```

**Respuesta (200):**
```json
{
  "paquetes": [
    {
      "id": "pack_1",
      "nombre": "Starter Pack",
      "descripcion": "Kit de inicio con personaje raro",
      "precio": 5,
      "moneda": "USD",
      "contenido": {
        "personajes": 1,
        "items": 0,
        "val": 10,
        "evo": 1
      },
      "imagen": "/img/packs/starter.png"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

---

### 2. Comprar Paquete

**Endpoint:**
```
POST /api/user-packages/agregar
Content-Type: application/json

{ "paqueteId": "pack_1" }
```

**Respuesta (202 Accepted - Pago Pendiente):**
```json
{
  "status": "pending",
  "paymentUrl": "https://stripe.com/pay/abc123",
  "userPackageId": "up_xyz",
  "message": "Redirige al usuario a este URL para pagar"
}
```

**Respuesta (201 Created - Pago Completado):**
```json
{
  "ok": true,
  "userPackageId": "up_abc123",
  "paquete": { "id": "pack_1", "nombre": "Starter Pack" },
  "message": "Paquete agregado. Abre para recibir contenido."
}
```

**Errores:**
- **402 Payment Required:** Saldo insuficiente
- **404 Not Found:** Paquete no existe
- **409 Conflict:** Paquete ya en carrito/limitado por usuario

**Flujo:**
1. Si respuesta es 202 → mostrar `paymentUrl` en modal/popup (iframe o nueva ventana)
2. Usuario completa pago
3. Backend procesa webhook y actualiza estado
4. Frontend polling o escucha WebSocket para confirmación
5. Mostrar paquete en "Mis paquetes" con estado "Listo para abrir"

---

### 3. Listar Paquetes del Usuario

**Endpoint:**
```
GET /api/user-packages/:userId
```

**Respuesta (200):**
```json
{
  "paquetes": [
    {
      "id": "up_abc123",
      "paqueteId": "pack_1",
      "nombre": "Starter Pack",
      "estado": "cerrado",
      "fecha_compra": "2025-11-21T10:30:00Z",
      "fecha_apertura": null
    }
  ]
}
```

---

### 4. Abrir Paquete

**Endpoint (crítico - usa transacción y lock):**
```
POST /api/user-packages/:id/open
```

**Respuesta (200):**
```json
{
  "ok": true,
  "assigned": ["char_01"],
  "summary": {
    "charactersReceived": 1,
    "itemsReceived": 0,
    "valReceived": 10,
    "evoReceived": 1,
    "totalCharacters": 3,
    "totalItems": 2,
    "totalVal": 130,
    "totalEvo": 4
  }
}
```

**Errores:**
- **404 Not Found:** Paquete no existe
- **409 Conflict:** Paquete ya abierto
- **423 Locked:** Apertura en progreso (reintentar con backoff)

**Implementación Backend:**
- Transacción MongoDB con session
- Lock atómico para evitar race conditions
- Asigna personajes/items directamente a usuario
- Actualiza VAL y EVO
- Registra en log de auditoría

**Frontend:**
- Mostrar loading durante apertura
- Si 423: reintentar 3 veces (500ms, 1000ms, 1500ms) con backoff exponencial
- Si 409: mensajre "Este paquete ya fue abierto"
- Si 200: animar apertura y mostrar recompensas

---

### 5. Eventos WebSocket Asociados

**Evento emitido tras apertura exitosa:**
```
user:<userId>:inventory-updated

{
  "type": "inventory-updated",
  "userId": "64ab...",
  "itemsGranted": [
    { "type": "character", "id": "char_abc", "nombre": "Valornian Hero" }
  ],
  "newInventorySummary": {
    "personajesCount": 3,
    "equipamientoCount": 2,
    "consumiblesCount": 5
  }
}
```

**Frontend:** Suscribirse a este evento para actualizar UI en tiempo real sin polling

---

## Marketplace (Compra y Venta P2P)

### 1. Listado de Productos en Venta

**Endpoint:**
```
GET /api/marketplace
```

**Query Params:**
- `page`: número de página (default: 1)
- `limit`: items por página (default: 20)
- `filtro`: "personajes", "items", "consumibles" (optional)

**Respuesta (200):**
```json
{
  "listings": [
    {
      "id": "list_001",
      "vendedorId": "user_123",
      "vendedorNombre": "player1",
      "tipo": "personaje",
      "personajeId": "char_456",
      "nombre": "Valornian Épico",
      "rango": "epic",
      "nivel": 7,
      "precioVAL": 50,
      "precioUSD": 5,
      "estado": "disponible",
      "fecha_creacion": "2025-11-21T08:00:00Z",
      "fecha_expiracion": "2025-11-28T08:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### 2. Mis Listings (Lo que estoy Vendiendo)

**Endpoint:**
```
GET /api/marketplace/listings/my
```

**Respuesta (200):**
```json
{
  "listings": [
    {
      "id": "list_001",
      "tipo": "personaje",
      "nombre": "Valornian Épico",
      "precioVAL": 50,
      "estado": "disponible",
      "comprasRecibidas": 0
    }
  ]
}
```

---

### 3. Crear Listing (Vender)

**Endpoint:**
```
POST /api/marketplace
Content-Type: application/json

{
  "tipo": "personaje",
  "personajeId": "char_456",
  "precioVAL": 50
}
```

**Respuesta (201):**
```json
{
  "ok": true,
  "listingId": "list_001",
  "mensaje": "Listado creado. Expira en 7 días."
}
```

---

### 4. Comprar del Marketplace

**Endpoint:**
```
POST /api/marketplace/:listingId/buy
```

**Respuesta (200):**
```json
{
  "ok": true,
  "transaccionId": "trans_001",
  "itemRecibido": { "id": "char_456", "nombre": "Valornian Épico" },
  "valUsado": 50,
  "nuevoBalance": 80
}
```

**Errores:**
- **402 Payment Required:** VAL insuficiente
- **404 Not Found:** Listing no existe
- **409 Conflict:** Listing ya fue vendido

---

### 5. Transacciones Históricas

**Endpoint:**
```
GET /api/marketplace-transactions/my-purchases
```

**Respuesta (200):**
```json
{
  "compras": [
    {
      "id": "trans_001",
      "fecha": "2025-11-21T12:00:00Z",
      "vendedor": "player1",
      "item": "Valornian Épico",
      "precioVAL": 50
    }
  ]
}
```

---

## Mazmorras y Combate (Flujo de Juego)

### 1. Listar Mazmorras Disponibles

**Endpoint:**
```
GET /api/dungeons
```

**Respuesta (200):**
```json
{
  "mazmorras": [
    {
      "id": "dung_001",
      "nombre": "Calabozos del Bosque",
      "descripcion": "Nivel principiante",
      "nivel_requerido": 1,
      "enemigos": [
        { "nombre": "Goblin", "salud": 20, "ataque": 3 },
        { "nombre": "Orco", "salud": 35, "ataque": 5 }
      ],
      "recompensas": {
        "val": 10,
        "exp": 50,
        "drop_items": ["item_1", "item_2"]
      }
    }
  ]
}
```

---

### 2. Iniciar Mazmorra

**Endpoint:**
```
POST /api/dungeons/:dungeonId/start
Content-Type: application/json

{
  "team": ["char_01", "char_02", "char_03"]
}
```

O alternativamente:
```json
{
  "teamId": "team_123"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "sesionId": "dung_sess_xyz",
  "estado": "en_progreso",
  "equipo": [
    { "id": "char_01", "nombre": "Hero 1", "salud": 150 }
  ],
  "enemigos": [
    { "nombre": "Goblin", "salud": 20 },
    { "nombre": "Orco", "salud": 35 }
  ]
}
```

**Flujo:**
- Pantalla de carga del combate
- Mostrar equipo vs enemigos
- Iniciar secuencia de combate automática (turnos)
- Al final: pantalla de victoria o derrota con recompensas

---

### 3. Pantalla de Victoria

**Datos a mostrar:**
- "¡Ganaste!"
- Equipo vivo/muerto
- Recompensas: VAL, EXP, items
- Botón "Siguiente" para volver a dashboard

**Evento WebSocket (recomendado):**
```
user:<userId>:dungeon-completed

{
  "type": "dungeon-completed",
  "dungeonId": "dung_001",
  "recompensas": {
    "val": 10,
    "exp": 50,
    "items": ["item_1"]
  }
}
```

---

### 4. Pantalla de Derrota

**Datos a mostrar:**
- "¡Perdiste!"
- Personajes muertos
- Opción: "Revivir todos por X VAL" o "Volver al Dashboard"
- Nota: si no tienes VAL o no quieres revivir, personajes quedan muertos y requieren revive manual

---

## Rankings (Leaderboards y Competencia)

### 1. Obtener Rankings Globales

**Endpoint:**
```
GET /api/rankings
```

**Query Params:**
- `page`: número de página (default: 1)
- `limit`: items por página (default: 50)
- `period`: "daily", "weekly", "monthly", "all" (default: "weekly")

**Respuesta (200):**
```json
{
  "rankings": [
    {
      "posicion": 1,
      "userId": "user_001",
      "username": "TopPlayer",
      "puntos": 5000,
      "victorias": 250,
      "nivel": 50
    },
    {
      "posicion": 2,
      "userId": "user_002",
      "username": "SecondBest",
      "puntos": 4800,
      "victorias": 240,
      "nivel": 48
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 50
}
```

---

### 2. Mi Posición en el Ranking

**Endpoint:**
```
GET /api/rankings/me
```

**Query Params:**
- `period`: "daily", "weekly", "monthly", "all"

**Respuesta (200):**
```json
{
  "miposicion": 147,
  "puntos": 1200,
  "victorias": 50,
  "proximoJugador": {
    "posicion": 146,
    "username": "ClosePlayer",
    "puntos": 1250
  },
  "jugadorAnterior": {
    "posicion": 148,
    "username": "BehindPlayer",
    "puntos": 1180
  }
}
```

---

### 3. Rankings por Período

**Endpoint:**
```
GET /api/rankings/period/:period
```

Parámetro `:period` puede ser `daily`, `weekly`, `monthly`, `all`

**Respuesta:** Misma estructura que `/api/rankings` pero filtrada por período

---

### UI Recomendada

- Pestaña "Global" → muestra top 100
- Pestaña "Mi Posición" → muestra tu ranking actual
- Filtro: daily/weekly/monthly/all
- Mostrar medalla 🥇 🥈 🥉 para top 3
- Mostrar "↑" o "↓" para cambios de posición

---

## Referencia Técnica (Endpoints, WebSocket, Errores)

### 1. Mapeo Completo de Endpoints Reales

| **Categoría** | **Método** | **Endpoint** | **Descripción** |
|---------------|-----------|--------------|-----------------|
| **AUTH** | POST | `/auth/register` | Registrar nuevo usuario |
| | POST | `/auth/resend-verification` | Reenviar email verificación |
| | GET | `/auth/verify/:token` | Verificar email |
| | POST | `/auth/login` | Iniciar sesión |
| | POST | `/auth/logout` | Cerrar sesión |
| | POST | `/auth/forgot-password` | Solicitar recuperación |
| | POST | `/auth/reset-password/:token` | Actualizar contraseña |
| **USUARIO** | GET | `/api/users/me` | Perfil completo |
| | GET | `/api/users/resources` | Recursos (VAL, EVO, boletos, energía) |
| | GET | `/api/users/dashboard` | Dashboard resumido |
| | PATCH | `/api/users/me` | Editar perfil |
| | PUT | `/api/users/tutorial/complete` | Marcar tutorial completado |
| **PERSONAJES** | GET | `/api/user-characters` | Listar personajes |
| | GET | `/api/user-characters/:id` | Obtener personaje específico |
| | GET | `/api/characters/:id/stats` | Stats de personaje |
| | POST | `/api/characters/:id/use-consumable` | Usar consumible |
| | POST | `/api/characters/:id/revive` | Revivir personaje |
| | POST | `/api/characters/:id/heal` | Curar personaje |
| | POST | `/api/characters/:id/evolve` | Evolucionar etapa |
| | POST | `/api/characters/:id/equip` | Equipar item |
| | POST | `/api/characters/:id/unequip` | Desequipar item |
| | POST | `/api/characters/:id/add-experience` | Añadir experiencia (dev) |
| **PAQUETES** | GET | `/api/packages` | Listar paquetes a venta |
| | POST | `/api/user-packages/agregar` | Comprar paquete |
| | GET | `/api/user-packages/:userId` | Mis paquetes |
| | POST | `/api/user-packages/:id/open` | Abrir paquete |
| **MARKETPLACE** | GET | `/api/marketplace` | Listar productos en venta |
| | GET | `/api/marketplace/listings/my` | Mis listings |
| | POST | `/api/marketplace` | Crear listing |
| | POST | `/api/marketplace/:listingId/buy` | Comprar del marketplace |
| | GET | `/api/marketplace-transactions/my-purchases` | Mis compras |
| **MAZMORRAS** | GET | `/api/dungeons` | Listar mazmorras |
| | POST | `/api/dungeons/:id/start` | Iniciar mazmorra |
| **RANKINGS** | GET | `/api/rankings` | Rankings globales |
| | GET | `/api/rankings/me` | Mi posición |
| | GET | `/api/rankings/period/:period` | Rankings por período |

---

### 2. Eventos WebSocket (Real-time)

**Conexión y Suscripción:**

```typescript
// Ejemplo Angular
const socket = io('http://localhost:8080', { 
  withCredentials: true 
});

socket.on('connect', () => {
  console.log('Conectado a WebSocket');
  socket.emit('subscribe', { userId: 'user_123' });
});

// Escuchar eventos
socket.on('user:user_123:inventory-updated', (data) => {
  console.log('Inventario actualizado:', data);
  // Actualizar UI
});

socket.on('user:user_123:character-updated', (data) => {
  console.log('Personaje actualizado:', data);
  // Actualizar stats del personaje
});
```

**Eventos Disponibles:**

| **Evento** | **Payload** | **Cuándo se emite** |
|-----------|-----------|-------------------|
| `user:<userId>:inventory-updated` | `{ type: "inventory-updated", userId, itemsGranted: [], newInventorySummary }` | Tras `POST /api/user-packages/:id/open` |
| `user:<userId>:character-updated` | `{ type: "character-updated", characterId, state: { salud, ataque, etc } }` | En `heal`, `revive`, `evolve`, `equip` |
| `marketplace:listings-updated` | `{ listingId, action: "created\|updated\|deleted\|bought", sellerId }` | Cambios en marketplace |
| `user:<userId>:notifications` | `{ type: "notification", title, message }` | Notificaciones generales |

---

### 3. Manejo de Errores y Códigos HTTP

| **Código** | **Significado** | **Qué Hacer en Frontend** |
|-----------|----------------|------------------------|
| **200** | OK | Solicitud exitosa, procesar datos |
| **201** | Created | Recurso creado exitosamente |
| **202** | Accepted | Pago pendiente, redirigir a `paymentUrl` |
| **400** | Bad Request | Validación fallida, mostrar error del servidor |
| **401** | Unauthorized | Redirigir a login, cookie expirada |
| **402** | Payment Required | Saldo insuficiente (VAL, EVO, etc.) |
| **403** | Forbidden | No autorizado (cuenta no verificada, falta permiso) |
| **404** | Not Found | Recurso no existe (paquete, personaje, etc.) |
| **409** | Conflict | Conflicto (paquete ya abierto, item duplicado) |
| **423** | Locked | Recurso en uso (mazmorra en progreso), reintentar |
| **429** | Too Many Requests | Rate limit, esperar + backoff exponencial |
| **500** | Internal Server Error | Error del servidor, mostrar fallback y reportar |

**Ejemplo: Manejo de 423 con Retry**

```typescript
openPackage(packageId: string, retries = 0) {
  this.http.post(`/api/user-packages/${packageId}/open`, {})
    .subscribe(
      (success) => this.handleSuccess(success),
      (error) => {
        if (error.status === 423 && retries < 3) {
          const delays = [500, 1000, 1500];
          setTimeout(
            () => this.openPackage(packageId, retries + 1),
            delays[retries]
          );
        } else {
          this.handleError(error);
        }
      }
    );
}
```

---

### 4. Rate Limits y Recomendaciones

**Rate Limiters Activos:**

- **authLimiter**: Máximo 5 intentos de login fallidos por 15 minutos
  - Respuesta 429: incluye tiempo de espera
  - Frontend: mostrar captcha o mensaje "Espera antes de reintentar"

- **gameplayLimiter**: Máximo 10 acciones por segundo en endpoints de combate
  - Respuesta 429: backoff exponencial

- **marketplaceLimiter**: Máximo 2 listings creados por minuto
  - Respuesta 429: avisar al usuario que espere

- **apiLimiter**: Máximo 100 requests por minuto (general)
  - Respuesta 429: mostrar notificación de overload

**Implementación de Backoff Exponencial en Frontend:**

```typescript
private async retryWithBackoff(fn: () => Observable<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn().toPromise();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000; // jitter
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

---

### 5. Seguridad: Cookies y CORS

**Configuración Requerida:**

```typescript
// En el HttpClient de Angular, SIEMPRE usar withCredentials
const options = { withCredentials: true };

// Ejemplos:
this.http.post('/auth/login', body, options);
this.http.get('/api/users/me', options);
this.http.post('/api/user-packages/123/open', {}, options);
```

**Cookie httpOnly:**
- Nombre: `token`
- Httponly: sí (no accesible desde JavaScript)
- Secure: sí en producción (solo HTTPS)
- SameSite: strict (protege contra CSRF)
- Expires: según JWT (típicamente 7 días)

**CORS:**
- Dominios permitidos: `http://localhost:4200` (dev), `https://miapp.com` (prod)
- Métodos: GET, POST, PUT, PATCH, DELETE
- Headers: Content-Type, Authorization

---

### 6. Ejemplos JSON Concretos

**Ejemplo 1: GET /api/users/me**

```json
{
  "id": "64ab3c5e2f1a4b0012345678",
  "email": "user@example.com",
  "username": "player1",
  "isVerified": true,
  "val": 120,
  "evo": 3,
  "boletos": 2,
  "energia": 10,
  "nivel": 5,
  "experiencia": 2500,
  "personajes": [
    {
      "personajeId": "char_01",
      "nombre": "Valornian Hero",
      "imagen": "/img/char1.png",
      "rango": "rare",
      "nivel": 5,
      "etapa": 1,
      "saludActual": 120,
      "saludMaxima": 150,
      "ataque": 15,
      "defensa": 10,
      "estado": "saludable",
      "equipo": {
        "arma": { "id": "item_10", "nombre": "Espada de Fuego" },
        "armadura": { "id": "item_20", "nombre": "Armadura de Hierro" }
      }
    }
  ],
  "inventarioConsumibles": [
    { "id": "cons_3", "nombre": "Poción Mayor", "usos_restantes": 3 }
  ],
  "paquetes": [
    {
      "id": "up_abc123",
      "paqueteId": "pack_1",
      "nombre": "Starter Pack",
      "estado": "cerrado",
      "fecha_compra": "2025-11-21T10:30:00Z"
    }
  ]
}
```

**Ejemplo 2: POST /api/user-packages/:id/open (Exitoso)**

```json
{
  "ok": true,
  "assigned": ["char_01"],
  "summary": {
    "charactersReceived": 1,
    "itemsReceived": 0,
    "valReceived": 10,
    "evoReceived": 1,
    "totalCharacters": 3,
    "totalItems": 2,
    "totalVal": 130,
    "totalEvo": 4
  }
}
```

**Ejemplo 3: POST /auth/login (Exitoso)**

Request:
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response (200):
```json
{
  "ok": true,
  "user": {
    "id": "64ab...",
    "email": "user@example.com",
    "username": "player1",
    "isVerified": true,
    "val": 100,
    "evo": 0,
    "boletos": 0
  }
}
```

Header de respuesta:
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/
```

**Ejemplo 4: GET /api/rankings (Global)**

```json
{
  "rankings": [
    {
      "posicion": 1,
      "userId": "user_001",
      "username": "TopPlayer",
      "puntos": 5000,
      "victorias": 250,
      "nivel": 50
    },
    {
      "posicion": 2,
      "userId": "user_002",
      "username": "SecondBest",
      "puntos": 4800,
      "victorias": 240,
      "nivel": 48
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 50
}
```

**Ejemplo 5: Error 402 (Payment Required)**

```json
{
  "ok": false,
  "error": "INSUFFICIENT_BALANCE",
  "message": "Necesitas 50 VAL pero solo tienes 30",
  "actualBalance": 30,
  "required": 50
}
```

---

## Apéndice (Schemas, Scripts, Checklist)

### 1. Checklist Final para Implementar el Frontend

**Fase 1: Autenticación (Día 1-2)**
- [ ] Componente Landing con botones Registrarse/Iniciar Sesión
- [ ] Componente Registro (validaciones locales + POST /auth/register)
- [ ] Componente Verificación Email (mostrar instructivo + POST /auth/resend-verification)
- [ ] Componente Login (POST /auth/login, guardar cookie, cargar usuario)
- [ ] Componente Logout (POST /auth/logout)
- [ ] Componente Forgot Password / Reset (POST /auth/forgot-password + POST /auth/reset-password/:token)
- [ ] AuthGuard: proteger rutas privadas

**Fase 2: Perfil y Dashboard (Día 3-4)**
- [ ] Componente Dashboard (GET /api/users/dashboard, mostrar recursos y equipo)
- [ ] Componente Perfil Completo (GET /api/users/me, edición con PATCH)
- [ ] Componente Edición de Perfil

**Fase 3: Inventario y Equipamiento (Día 5-7)**
- [ ] Componente Personajes (GET /api/user-characters, listado)
- [ ] Componente Personaje Detalle (stats, equipo, acciones heal/revive/evolve/equip)
- [ ] Componente Consumibles (GET inventarioConsumibles, usar consumible)
- [ ] Componente Equipamiento (asignar items a slots, desequipar)

**Fase 4: Paquetes y Tienda (Día 8-10)**
- [ ] Componente Catálogo de Paquetes (GET /api/packages, mostrar tarjetas)
- [ ] Componente Compra de Paquete (POST /api/user-packages/agregar, manejar 202)
- [ ] Componente Mis Paquetes (GET /api/user-packages/:userId, listado)
- [ ] Componente Abrir Paquete (POST /api/user-packages/:id/open, retry 423, animación)

**Fase 5: Marketplace (Día 11-12)**
- [ ] Componente Marketplace Listar (GET /api/marketplace, filtros)
- [ ] Componente Compra Marketplace (POST /api/marketplace/:listingId/buy)
- [ ] Componente Mis Listings (GET /api/marketplace/listings/my, crear nuevo)
- [ ] Componente Crear Listing (POST /api/marketplace)

**Fase 6: Mazmorras (Día 13-14)**
- [ ] Componente Seleccionar Mazmorra (GET /api/dungeons, tarjetas por nivel)
- [ ] Componente Armar Equipo (seleccionar personajes para la mazmorra)
- [ ] Componente Combate (POST /api/dungeons/:id/start, mostrar turnos, enemigos)
- [ ] Componente Victoria/Derrota (mostrar recompensas, botón siguiente)

**Fase 7: Rankings (Día 15)**
- [ ] Componente Rankings Global (GET /api/rankings, paginación, filtro período)
- [ ] Componente Mi Ranking (GET /api/rankings/me, mostrar posición y cercanos)

**Fase 8: WebSocket y Real-time (Día 16-17)**
- [ ] Servicio WebSocket (conexión, suscripción a eventos del usuario)
- [ ] Escuchar `user:<userId>:inventory-updated` y actualizar inventario en tiempo real
- [ ] Escuchar `user:<userId>:character-updated` y actualizar stats
- [ ] Notificaciones toast/badge para eventos

**Fase 9: Seguridad y Testing (Día 18-21)**
- [ ] HTTPS + verificar cookies httpOnly en dev tools
- [ ] withCredentials: true en todas las llamadas
- [ ] Tests unitarios: AuthService, UserService, PackageService
- [ ] Tests E2E: flujo completo registro → mazmorra
- [ ] Manejo de errores 401/403/429 (redirecciones, retries, mensajes)

**Fase 10: Pulido y Deploy (Día 22-30)**
- [ ] Animaciones de transiciones entre pantallas
- [ ] Optimización de carga (lazy loading módulos)
- [ ] PWA: manifest, service workers, notificaciones push
- [ ] Testing en navegadores reales (Chrome, Safari, Firefox)
- [ ] Deploy a staging, QA, producción

---

### 2. Configuración Recomendada (Angular)

**HttpClient Interceptor para Credentials:**

```typescript
// src/app/core/interceptors/auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Añadir withCredentials a todas las llamadas
    const credentialRequest = request.clone({
      withCredentials: true,
    });
    return next.handle(credentialRequest);
  }
}

// En app.module.ts
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
]
```

**HttpClient Interceptor para Error Handling:**

```typescript
// src/app/core/interceptors/error.interceptor.ts
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 429) {
          console.warn('Rate limited, implementar backoff...');
        }
        return throwError(error);
      })
    );
  }
}
```

---

### 3. Variables de Entorno (.env)

```env
# Backend
API_URL=http://localhost:8080
API_SECURE=false (true en producción)

# Frontend (si es necesario)
FRONTEND_URL=http://localhost:4200

# Pagos (si usas Stripe)
STRIPE_PUBLIC_KEY=pk_test_...

# WebSocket
WS_URL=http://localhost:8080

# Otros
LOG_LEVEL=debug
```

---

### 4. Buenas Prácticas

1. **Validaciones Locales**: siempre validar antes de enviar al servidor
2. **Manejo de Errores**: mostrar mensajes amigables, loguear detalles
3. **Loading States**: mostrar spinners durante llamadas API
4. **Caché**: cachear datos que cambian poco (rankings cada 5 min, paquetes cada 10 min)
5. **Offline Support**: guardar estado local, sincronizar cuando vuelva conexión
6. **Testing**: E2E mínimamente para flujos críticos (registro, compra, combate)
7. **Seguridad**: HTTPS, verificar CORS, usar HttpOnly cookies
8. **Performance**: lazy loading, code splitting, comprimir imágenes
9. **Accesibilidad**: alt text, colores con buen contraste, navegación por teclado
10. **Documentación**: mantener esta guía sincronizada con cambios backend

---

### 5. Recursos Adicionales

- **MongoDB Schemas**: ver `schemas/` carpeta en repo
- **Scripts Útiles**: ver `scripts/` carpeta (ej. `add-paquete-pionero.js`)
- **Logs y Debugging**: habilitar logs en servidor (LOG_LEVEL=debug)
- **Postman Collection**: (pendiente) colección completa de endpoints para testing

---

**Última Actualización:** 24 de noviembre de 2025 - 11:35:49
**Líneas Totales:** 1793
**Versión:** 2.0 Reorganizada Completa
**Próximo Paso:** Backend implementa WebSocket events sugeridos y alias endpoints. Frontend comienza implementación Fase 1.

---

## ✅ Checklist de Completud del Documento

- ✅ Tabla de contenidos con 10 secciones principales
- ✅ Autenticación: 7 pantallas (registro, login, verificación, recuperación, logout)
- ✅ Perfil y Usuario: 5 endpoints (dashboard, perfil, edición, recursos, tutorial)
- ✅ Inventario y Equipamiento: 8 operaciones (personajes, consumibles, heal, revive, evolve, equip, stats)
- ✅ Paquetes y Tienda: 5 operaciones + WebSocket events (listar, comprar, listar usuario, abrir)
- ✅ Marketplace: 5 operaciones (listados, mis listings, crear listing, comprar, históricas)
- ✅ Mazmorras y Combate: 4 pantallas (listar, iniciar, victoria, derrota)
- ✅ Rankings: 3 endpoints + UI (globales, mi posición, por período)
- ✅ Referencia Técnica: 6 subsecciones (endpoints, WebSocket, errores, rate-limits, seguridad, ejemplos JSON)
- ✅ Apéndice: 5 subsecciones (checklist 10 fases, configuración Angular, .env, buenas prácticas, recursos)
- ✅ Ejemplos JSON para todos los endpoints
- ✅ Ejemplos cURL para testing
- ✅ Ejemplos Angular/TypeScript para implementación
- ✅ Manejo de errores con códigos HTTP
- ✅ Rate limits documentados
- ✅ Eventos WebSocket detallados