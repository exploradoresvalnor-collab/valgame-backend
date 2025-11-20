# Valnor — Guía pantalla a pantalla: Registro y Autenticación

Última actualización: 13 de noviembre de 2025

Propósito: este documento describe paso a paso las pantallas y el comportamiento del flujo de registro y autenticación para la aplicación móvil web nativa (orientación horizontal). Incluye las llamadas necesarias al backend y ejemplos de implementación en el frontend (Angular) y notas de seguridad.

Resumen rápido
- La app es una web-app nativa orientada a móvil en horizontal (landscape). Diseño con controles grandes y suficiente separación táctil.
- Endpoints principales backend (archivo `src/routes/auth.routes.ts`):
	- `POST /auth/register`
	- `GET  /auth/verify/:token` (página HTML del servidor)
	- `POST /auth/resend-verification`
	- `POST /auth/login`
	- `POST /auth/logout`
	- `POST /auth/forgot-password`
	- `POST /auth/reset-password/:token`

---

## 1) Landing (entrada)

- Objetivo: pantalla mínima con logo y dos botones grandes: `Registrarse` y `Iniciar sesión`.
- UI (recomendación horizontal): logo a la izquierda, tarjeta central con botones grandes, footer con enlaces.

UX: pulsar `Registrarse` -> ir a pantalla Registro. Pulsar `Iniciar sesión` -> ir a Login.

---

## 2) Registro (pantalla principal de registro)

Campos: `email`, `username`, `password`.

Comportamiento front:
- Validaciones locales: email válido, username min 3 caracteres, password min 6 (o la política que definas).
- Al enviar, POST a `/auth/register` con body: { email, username, password }.
- Usar `withCredentials: true` al hacer llamadas si esperas cookies (aunque register normalmente no requiere cookie).

Ejemplo (servicio Angular):
```ts
// src/app/core/services/auth.service.ts (fragmento)
register(email: string, username: string, password: string) {
	return this.http.post('/auth/register', { email, username, password }, { withCredentials: true });
}
```

Componente `RegisterComponent` (flujo):
- Si éxito (201): mostrar pantalla "Verifica tu correo" con botón `Reenviar correo` que llama `POST /auth/resend-verification`.
- Si 409: indicar "Email o username ya existe".

Backend (qué hace):
- Crea usuario, genera `verificationToken` y `verificationTokenExpires` (1 hora) y guarda en DB.
- Llama `sendVerificationEmail(email, token)` (en `src/config/mailer.ts`) que envía link `http://<API_HOST>/auth/verify/<token>` (o `FRONTEND_URL` si configuras así).
- Respuestas:
	- 201: registro ok y correo enviado.
	- 201 + warning: usuario creado pero fallo enviando correo.
	- 409: email/username ya existe.

Notas UX:
- Después de registro mostrar instrucciones claras: revisar SPAM, tiempo de caducidad del link (1h), botón para reenviar verificación.
- No iniciar sesión automáticamente hasta que el usuario verifique su correo (o manejarlo con un flag y experiencia guiada si se desea).

---

## 3) Reenvío de verificación

Pantalla simple con input `email` y botón "Reenviar verificación".

Front:
```ts
resendVerification(email: string) {
	return this.http.post('/auth/resend-verification', { email });
}
```

Backend:
- `POST /auth/resend-verification` valida:
	- Si usuario no existe: responde genérico (para no filtrar existencia).
	- Si usuario ya verificado: 400 con error.
	- Si existe token válido no expirado: 429 con tiempo restante.
	- Si OK: genera nuevo token y envía email.

Límites: evitar reenvíos abusivos (ya validado por expiración del token y return 429 si aún hay token válido).

---

## 4) Verificación (enlace clicado desde correo)

Endpoint backend: `GET /auth/verify/:token`.

Comportamiento:
- Busca usuario por token y validez temporal.
- Si token inválido/expirado -> devuelve página HTML con mensaje y CTA para reenviar.
- Si válido -> marca `isVerified=true`, limpia token y llama `deliverPioneerPackage(user)` (servicio idempotente que entrega recursos iniciales), luego devuelve página HTML de éxito con resumen de recompensas.

Notas:
- Actualmente la ruta devuelve HTML desde el servidor; si prefieres que se maneje en Angular, cambia el link enviado en el mail para apuntar a `FRONTEND_URL/verify/<token>` y deja que la SPA llame al API y muestre pantalla dentro de la app.

---

## 5) Login (Inicio de sesión)

Campos: `email`, `password`.

Front:
- Llamar a `POST /auth/login` con body { email, password } y `{ withCredentials: true }` para aceptar la cookie httpOnly que el backend pondrá.
- Tras respuesta exitosa, llamar `GET /api/users/me` (o usar la data devuelta) para poblar `AuthService.currentUser$`.

Ejemplo:
```ts
login(email: string, password: string) {
	return this.http.post('/auth/login', { email, password }, { withCredentials: true });
}

// Después de login
this.authService.login(e,p).subscribe(() => this.authService.loadUser());
```

Backend:
- Verifica credenciales (bcrypt compare) y `isVerified` (a menos que TEST_MODE esté activo).
- Genera JWT y lo coloca en cookie httpOnly: `res.cookie('token', token, { httpOnly: true, secure: ..., sameSite: 'strict' })`.
- Devuelve `user` (sin passwordHash) y recursos resumidos.

Errores a considerar:
- 401: credenciales inválidas.
- 403: cuenta no verificada (mostrar CTA para reenviar).

---

## 6) Recuperar cuenta (Forgot Password)

Flujo:
1. Usuario solicita recuperación -> `POST /auth/forgot-password` con { email }.
2. Backend crea `resetPasswordToken` y `resetPasswordTokenExpires` (1h) y envía email con link `FRONTEND_URL/reset-password/<token>` (o `API_HOST` si usas página servidor).
3. Usuario abre link, ingresa nueva contraseña -> `POST /auth/reset-password/:token` con { password }.

Front:
- Pantalla `Forgot Password`: input email -> `POST /auth/forgot-password`.
- Pantalla `Reset Password` (ruta con token): formulario `password` + `confirmPassword` -> `POST /auth/reset-password/:token`.

Backend:
- `POST /auth/forgot-password`: guarda token y envía email (no revela si el email existe en la respuesta).
- `POST /auth/reset-password/:token`: valida token y actualiza `passwordHash` (bcrypt), limpia tokens.

Seguridad:
- Mensajes genéricos al solicitar reset para evitar enumeración de usuarios.

---

## 7) Logout

Front: `POST /auth/logout` con `{ withCredentials: true }`. Limpiar estado local al recibir 200.

Backend: borra cookie (clearCookie) y añade token a `TokenBlacklist` para invalidar sesiones previas.

---

## Resumen de endpoints y ejemplos rápidos (curl)

- Registro:
```
curl -X POST 'http://localhost:8080/auth/register' \
	-H 'Content-Type: application/json' \
	-d '{"email":"user@example.com","username":"player1","password":"secret123"}'
```

- Reenvío verificación:
```
curl -X POST 'http://localhost:8080/auth/resend-verification' -H 'Content-Type: application/json' -d '{"email":"user@example.com"}'
```

- Login (y guardar cookie):
```
curl -i -X POST 'http://localhost:8080/auth/login' -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"secret123"}' -c cookies.txt
```

- Forgot password:
```
curl -X POST 'http://localhost:8080/auth/forgot-password' -H 'Content-Type: application/json' -d '{"email":"user@example.com"}'
```

---

## Buenas prácticas y recomendaciones

- Ajustar enlaces del mail para apuntar al `FRONTEND_URL` si prefieres experiencia inside-app.
- Asegurar `SMTP_*` y `FRONTEND_URL` en variables de entorno en producción.
- Usar HTTPS y cookies `secure` en producción.
- Hacer backups antes de migraciones (como `scripts/add-paquete-pionero.js`).
- Añadir tests e2e para los flujos: registro->verificación->onboarding, login/logout, forgot/reset, equipar/use consumible.

---

## Próximo paso

Si quieres, ahora continúo y añado la siguiente sección completa (Dashboard, Inventario, Consumibles y Armar Equipo) directamente en este archivo. ¿Prosigo con esa sección ahora mismo?
Si quieres, ahora continúo y añado la siguiente sección completa (Dashboard, Inventario, Consumibles y Armar Equipo) directamente en este archivo. ¿Prosigo con esa sección ahora mismo?

---

## Portada (cover) — especificaciones

- Objetivo: portada visual que actúa como bienvenida y punto de entrada al juego.
- Diseño (landscape/mobile):
	- `background-image` que cubre pantalla con overlay oscuro ligero para legibilidad.
	- Centro: logo + CTA grande (botón `Jugar` o `Entrar`).
	- Esquina superior derecha: `Configuración` (icono ⚙️). NO debe existir botón que cierre sesión desde la portada.
	- Esquina superior izquierda: (opcional) avatar o acceso rápido a perfil si está logueado.

Reglas de sesión:
- Mantener sesión activa por al menos 9 días (cookie JWT con `maxAge = 777600000 ms`).
- Logout sólo desde `Configuración` con confirmación explícita.
- Token guardado en cookie `httpOnly`; usar blacklist para invalidación.

Interacciones:
- `Jugar`:
	- Si autenticado → ir a `Dashboard` o selector de mazmorra.
	- Si no autenticado → abrir `Login/Registro`.
- `Configuración` → abre modal con pestañas (Cuenta, Seguridad, Preferencias, Notificaciones, Sesiones).

## Configuración — opciones y dónde guardar

- Cuenta: ver email, username, botón `Editar perfil`.
- Seguridad: cambiar contraseña (requiere `currentPassword`), activar 2FA si se implementa.
- Preferencias UI: tema, sonido; se pueden guardar en `localStorage` y opcionalmente sincronizar en backend.
- Notificaciones: controlar push/web push — backend debe exponer `POST /api/notifications/subscribe` y `DELETE /api/notifications/subscribe`.
- Sesiones: ver sesiones activas y `Cerrar sesión` (backend: `POST /auth/logout`, blacklisting).

Recomendación: guardar datos sensibles y preferencias globales en backend para sincronización entre dispositivos (`PATCH /api/users/me`).

## Dashboard — estructura y elementos

- Top bar:
	- Indicadores: `VAL` (moneda), `tickets`, otros recursos.
	- Icono notificaciones (contador) -> `GET /api/notifications`.
	- Botón perfil -> abre `Configuración`.
- Cuerpo: tarjetas con accesos a:
	- Marketplace (catálogo para comprar)
	- Tienda (ofertas y compras rápidas)
	- Inventario (gestión items/personajes)
	- Equipamiento (armado de equipo)
	- Eventos / Misiones
- Footer: navegación básica (Home, Inventario, Marketplace/Tienda, Perfil)

Las tarjetas deben enlazar a pantallas separadas (no overlays) para claridad en mobile.

## Edición de perfil — endpoints y flujo propuesto

Endpoints propuestos:
- `GET /api/users/me` — obtener datos actuales.
- `PATCH /api/users/me` — editar campos parciales: `{ username, displayName, preferences }`.
- `POST /api/users/me/change-password` — `{ currentPassword, newPassword }`.

Validaciones:
- Username único.
- Cambiar email -> marcar `isVerified=false` y reenviar verificación.
- Cambiar password -> verificar `currentPassword`.

Front: formulario en `Configuración > Cuenta` que hace `PATCH /api/users/me` con `{ withCredentials: true }`.

## Marketplace vs Tienda — comportamiento y endpoints

Marketplace:
- `GET /api/packages/for-sale` — lista pública de paquetes/paquetes para comprar.
- `POST /api/purchase` — comprar producto: `{ productId, currency, paymentMethod }`.

Tienda:
- `GET /api/market/items` — artículos de la tienda (promos, bundles).

Diferencia clave:
- Marketplace muestra items/paquetes disponibles para adquisición.
- Tienda muestra ofertas y productos con modelo comercial (promos, packs de monedas).

## Flujo de compra y apertura de paquete

1) Compra:
- `POST /api/purchase` -> backend valida fondos; si pago real, integra pasarela y espera webhook.
- Respuesta: `{ orderId, status, userPackageId }`.

2) Abrir paquete:
- `POST /api/user-packages/:id/open` -> valida propiedad y lock, entrega items.
- Respuesta: `{ opened:true, itemsGranted:[{ type:'item', id:'it1' }, ...] }`.

3) Asignación:
- Items/personajes entregados se crean en inventario del usuario y aparecen en `GET /api/users/me`.

## Inventario y Equipamiento

Inventario:
- `GET /api/users/me` debe retornar inventario expandido (`personajes`, `inventarioEquipamiento`, `inventarioConsumibles`).

Equipamiento / armar equipo:
- `POST /api/users/me/equipment` with body `{ slotAssignments: [...] }` para asignar items a slots.
- `PUT /api/users/me/teams/:teamId` para guardar configuraciones de equipos (opcional).

Consumibles:
- `POST /api/users/me/consumables/:id/use` -> consume un uso y aplica efecto; si usos=0, eliminar.

## Recuperación de vida / muerte permanente

- `POST /api/players/:playerId/revive` -> revive con coste/consumible.
- `POST /api/players/:playerId/recover` -> recuperar vida con consumible.

Si se usa muerte permanente: implementar endpoints admin/restore y clarificar reglas en UI.

## Iniciar partida / mazmorra

- `POST /api/dungeons/:id/start` o `POST /api/matchmaking/start` con `{ teamId }`.
- Respuesta: `{ sessionId, status, startTime }`.

## Ejemplos rápidos (Angular + curl)

- Abrir paquete comprado:
```ts
openUserPackage(userPackageId:string){
	return this.http.post(`/api/user-packages/${userPackageId}/open`, {}, { withCredentials: true });
}
```

- Consumir ítem:
```ts
useConsumable(consumableId:string, targetId?:string){
	return this.http.post(`/api/users/me/consumables/${consumableId}/use`, { targetId }, { withCredentials: true });
}
```

- Curl abrir paquete:
```bash
curl -X POST http://localhost:8080/api/user-packages/up123/open -b cookies.txt -H 'Content-Type: application/json'
```

---

Si quieres, ahora actualizo `Valnor-guia.md` con ejemplos detallados de las pantallas del Dashboard (tarjetas exactas y wireframes), o puedo crear una carpeta `docs/ui-wires/` con imágenes y JSON de ejemplo. ¿Qué prefieres que haga ahora?

---

## Paquetes (Pack) — flujo completo: compra, apertura y asignación

Objetivo: describir exactamente cómo responde el backend y qué espera el frontend para comprar paquetes, abrirlos y cómo actualizar el inventario del usuario sin perder datos.

### 1) Conceptos clave
- `Package`: plantilla de producto en catálogo (titulo, precio, tipo, preview, contenido posible).
- `UserPackage` / `user_packages`: registro de compra/propiedad por usuario (estado: `owned`, `opened`, `expired`).
- `packageSnapshot`: copia del paquete en el momento de la compra (para preservar contenido histórico aunque el `Package` cambie).

### 2) Endpoints / contrato API
- `GET /api/packages/for-sale`
	- Query: `?type=&currency=&search=` (opcionales)
	- Respuesta 200: `[{ _id, nombre, precio, moneda, tipo, preview, sku }]`

- `POST /api/purchase`
	- Body: `{ productId: string, currency: 'VAL'|'USD', paymentMethod: 'wallet'|'stripe'|'paypal' }`
	- Headers: `Content-Type: application/json`, enviar cookie con `{ withCredentials: true }` si aplica.
	- Respuestas:
		- 200: `{ orderId, status: 'completed', userPackageId }` (compra exitosa y asignada)
		- 402: `{ message: 'insufficient_funds' }` (saldo insuficiente)
		- 400/422: validación
		- 202: `{ orderId, status: 'pending', paymentUrl }` (pagos externos — esperar webhook)

- `GET /api/users/me/packages`
	- Devuelve `UserPackage[]` (resumido) con `status` y `snapshot` mínimo.

- `POST /api/user-packages/:id/open`
	- Path param: `id` = `userPackageId`.

	Ejemplo (Autenticado con cookie httpOnly o Bearer token):

	Curl (Bearer token):

	```bash
	curl -X POST "http://localhost:8080/api/user-packages/up_abc123/open" \
	  -H "Authorization: Bearer <TOKEN_DE_PUERTO>" \
	  -H 'Content-Type: application/json'
	```

	Respuesta exitosa (200):

	```json
	{
	  "ok": true,
	  "assigned": ["char_01"],
	  "summary": {
	    "charactersReceived": 1,
	    "itemsReceived": 0,
	    "valReceived": 5,
	    "totalCharacters": 3,
	    "totalItems": 2,
	    "valBalance": 120
	  }
	}
	```
	- Body: `{ confirm?: boolean }` (opcional)
	- Respuestas:
		- 200: `{ opened: true, itemsGranted: [ { type:'item'|'character'|'consumable', id, instanceId?, meta? } ], newInventorySummary }`
		- 404: no encontrado / no pertenece al usuario
		- 409: paquete ya abierto
		- 423: locked (otro proceso está abriendo) — reintentar con backoff

### 3) Flujo en backend (resumen técnico)
- Compra (`POST /api/purchase`):
	- Validar fondos / iniciar proceso de pago.
	- Crear `UserPackage` con `status: 'owned'` y `packageSnapshot` (guardar fields relevantes del `Package`).
	- Si pago con wallet: debitar y marcar `status: 'completed'` inmediatamente.
	- Si pago externo: marcar `status: 'pending'`, reservar `UserPackage` y esperar webhook.
- Apertura (`POST /api/user-packages/:id/open`):
	- Aplicar lock (mutex a nivel `userPackageId`) para evitar race conditions.
	- Verificar que `status==='owned'` y que pertenece al user.
	- Calcular rewards según `packageSnapshot` (randomizar drops si aplica).
	- Insertar elementos en inventario (crear documentos `user_items`, `user_characters`, o actualizar `user.inventory`).
	- Actualizar `UserPackage.status='opened'`, guardar `openedAt` y `rewardsSnapshot`.
	- Emitir evento websocket `user:<id>:inventory-updated` con `itemsGranted` y `newInventorySummary`.

### 4) Respuesta detallada al front (ejemplo)
```json
{
	"opened": true,
	"userPackageId": "up_abc123",
	"itemsGranted": [
		{ "type": "character", "id": "char_01", "instanceId": "uc_987", "nombre": "Valornian Hero", "imagen": "/img/char1.png" },
		{ "type": "item", "id": "it_55", "instanceId": "ui_321", "nombre": "Espada Rota", "rare": "rare", "imagen": "/img/sword.png" },
		{ "type": "consumable", "id": "cons_3", "instanceId": "uc_555", "nombre": "Poción Vita", "usos_restantes": 3 }
	],
	"newInventorySummary": {
		"personajesCount": 4,
		"equipamientoCount": 12,
		"consumiblesCount": 8
	}
}
```

### 5) Cómo debe implementar el frontend (Angular) — pasos y ejemplos
- Compra:
	- Llamar `POST /api/purchase` y mostrar estado (`pending`, `completed`).
	- Si `pending` y `paymentUrl` en respuesta, abrir `paymentUrl` en ventana o redirigir; luego esperar webhook + polling o escuchar websocket para confirmar.

- Abrir paquete (UI):
	- Mostrar pantalla modal con animación "abrir paquete".
	- Llamar `POST /api/user-packages/:id/open` con `{ withCredentials: true }`.
	- Mientras se espera: mostrar loader y deshabilitar botón (proteger contra doble click).
	- Si respuesta 200: mostrar resultados (`itemsGranted`) en modal con animación de reward.
	- Actualizar estado local: llamar `GET /api/users/me` o usar la `newInventorySummary` de la respuesta y aplicar patch optimista en el store (NgRx / BehaviorSubject).
	- Escuchar evento websocket para confirmar cambios del servidor y reconciliar si hay diferencia.

Ejemplo de servicio Angular:
```ts
openUserPackage(userPackageId:string){
	return this.http.post(`/api/user-packages/${userPackageId}/open`, {}, { withCredentials: true });
}

purchase(productId:string,currency='VAL'){
	return this.http.post('/api/purchase',{ productId, currency },{ withCredentials:true });
}
```

Ejemplo de componente (resumen):
```ts
onOpenPackage(upId:string){
	this.loading = true;
	this.shopService.openUserPackage(upId).pipe(
		finalize(()=> this.loading=false),
		catchError(err=>{ this.handleError(err); return throwError(err); })
	).subscribe((res:any)=>{
		// mostrar rewards en modal
		this.showRewards(res.itemsGranted);
		// actualizar inventario local: preferir usar websocket o GET /api/users/me
		this.userService.loadUser().subscribe();
	});
}
```

### 6) Manejo de errores y estados especiales
- 404: paquete no existe o no es del usuario → mostrar mensaje "Paquete no encontrado" y refrescar lista de `userPackages`.
- 409: ya abierto → informar "Paquete ya abierto" y refrescar inventario.
- 423 / locked: recomendar reintentar con backoff exponencial (retry 3 veces con 500ms/1000ms/1500ms) y mostrar mensaje "Abriendo paquete, reintentando...".
- 402: pago incompleto → redirigir al flujo de pago o mostrar mensaje.
- 500: error servidor → mostrar fallback y pedir al usuario reintentar más tarde.

### 7) Actualización de inventario y consistencia
- Recomendación frontend:
	- En la respuesta `open` devolver `itemsGranted` + `newInventorySummary` para actualización inmediata (optimista).
	- Confirmar cambios con `GET /api/users/me` o escuchar websocket `user:<id>:inventory-updated`.
	- Evitar reemplazar completamente el store con la respuesta optimista si existen operaciones concurrentes: aplicar merge (añadir nuevos `instanceId`s) y mantener mapping por `instanceId`.

### 8) Websockets / eventos en tiempo real
- Emitir `user:<id>:inventory-updated` con payload `{ itemsGranted, newInventorySummary }` al completar apertura.
- El frontend suscrito actualiza el store automáticamente; útil si el usuario tiene clientes múltiples abiertos.

### 9) Auditoría / trazabilidad
- Guardar `rewardsSnapshot` y `openedBy` (IP/agent) en `UserPackage` para auditoría y resolución de disputas.

### 10) Tests recomendados
- Unit tests: lógica de creación de `UserPackage`, lock, rewards calculation.
- Integration tests: `POST /api/purchase` -> create `UserPackage` -> webhook -> `POST /open` -> inventory changes.
- E2E: flujo compra -> abrir -> verificar UI muestra items y `GET /api/users/me` refleja cambios.

---

Si quieres, además puedo:
- Implementar endpoint `POST /api/user-packages/:id/open` en el backend y crear PR con tests, o
- Generar componente Angular ejemplo en `front para arreglar/` para la UI de abrir paquete.

Indica cuál prefieres y lo implemento a continuación.

---

## Mecánicas de juego (detallado técnico): items, slots, vida, combate, y endpoints

Esta sección documenta con precisión cómo debe comportarse el backend, qué respuestas enviará a la UI y cómo debe implementar el frontend las llamadas para evitar errores y condiciones de carrera.

Resumen: todas las entidades que pueden pertenecer a un usuario tienen una instancia única (`instanceId`) cuando se asignan al usuario (ej: `user_item`, `user_character`). Los `Package` son plantillas; las instancias reales aparecen en `user_*`.

1) Modelos / representación (recomendado)
- Package (plantilla): `{ _id, nombre, tipo, precio, contenidoPosible: [{ type:'character'|'item'|'consumable', id, rarity, weight }] , preview }`.
- UserPackage: `{ _id, userId, packageId, packageSnapshot, status:'owned'|'opened'|'expired', createdAt, openedAt?, rewardsSnapshot? }`.
- Item instancia (`UserItem`): `{ instanceId, userId, itemId, nombre, tipoItem, slotAllowed: ['head','body','main','offhand','accessory'], atributos:{atk,def,crit,...}, permanent:boolean }`.
- Character instancia (`UserCharacter`): `{ instanceId, userId, characterId, nombre, nivel, hpMax, hpCurrent, status:'alive'|'dead'|'permadeath', equipmentSlots:{ main:instanceId?, offhand:..., head:..., body:... }, meta:{...} }`.
- Consumable instancia (`UserConsumable`): `{ instanceId, userId, consumableId, nombre, efectos:[{ type:'heal'|'buff', value:50, duration:60 }], usos_restantes:number }`.
- Equipo / Team: `{ teamId, userId, name, slots:[ { slot:'char1', characterInstanceId }, ... ], createdAt }`.

2) Reglas generales de inventario
- Todas las inserciones deben generar `instanceId` único (ej: `ui_123`, `uc_456`).
- El frontend debe mostrar `instanceId` cuando opaca una acción (usar, equipar, descartar). Nunca referenciar solo `itemId` (plantilla) para operaciones que mutan inventario.

3) Endpoints relacionados y contrato exacto
- `GET /api/users/me` → devuelve user con arrays: `personajes:[UserCharacter], inventarioEquipamiento:[UserItem], inventarioConsumibles:[UserConsumable], teams:[Team]`.

- `POST /api/users/me/equipment` → asignar equipamiento (atomic):
	- Body: `{ teamId?, assignments: [ { characterInstanceId, slot:'main'|'offhand'|'head'|'body'|'accessory', itemInstanceId } ] }`
	- Validaciones backend:
		- Cada `itemInstanceId` pertenece al user y no está ya equipado en otro slot (a menos que permitas duplicados).
		- El `item` permite ese `slot` (revisar `slotAllowed`).
		- Si alguna validación falla → 422 con body `{ code:'invalid_assignment', details:[{ slot, reason }] }`.
	- Respuesta 200: `{ success:true, equipmentState: { characterInstanceId: { main:ui_1, head:ui_2, ... }, ... } }`.

- `POST /api/users/me/consumables/:instanceId/use` → usar consumible (atomic):
	- Body (opcional): `{ targetCharacterInstanceId?: string }`.
	- Backend: debe ejecutar un `findOneAndUpdate` atómico sobre `UserConsumable` con condición `usos_restantes > 0` y `userId = requester` y decrement `usos_restantes` (Mongo: `{$inc:{usos_restantes:-1}}`, returnDocument:'after'). Si no encuentra -> 409 `{ code: 'consumable_unavailable' }`.
	- Calcular efecto: aplicar la lógica de efectos (heal, buff, revive) y persistir cambios en `UserCharacter` en la misma transacción/operación si el DB lo permite; si no, usar patrón compensatorio.
	- Respuesta 200: `{ success:true, effectApplied:{ type:'heal', amount:50 }, newState: { characterInstanceId: { hpCurrent: 80, status:'alive' } }, remaining: 2 }`.

- `POST /api/dungeons/:dungeonId/start` → iniciar mazmorra / partida:
	- Body: `{ teamId, difficulty?, seed? }`.
	- Validaciones:
		- `teamId` pertenece al user
		- Los personajes del team están `status==='alive'` y tienen `hpCurrent>0` (si requieres fullhp podes validar)
	- Backend acciones:
		- Reserve consumibles necesarios (opcional: mark as reserved) para evitar doble uso simultáneo.
		- Crear `DungeonSession`: `{ sessionId, dungeonId, teamSnapshot, playersState, startTime, status:'running' }`.
		- Respuesta 201: `{ sessionId, status:'running', startTime }`.

- `POST /api/dungeons/:sessionId/action` → acción en mazmorra (si usas servidor para procesar turno):
	- Body: `{ actionType:'attack'|'skill'|'use_consumable'|'move', actorInstanceId, targetInstanceId?, params? }`.
	- Backend aplica reglas de combate y responde con delta:
		- 200: `{ success:true, events:[ { type:'damage', target:instanceId, amount:30, hpBefore:80, hpAfter:50 }, { type:'death', target:instanceId } ], sessionState }`.
		- 400/422 si acción inválida.

- `POST /api/dungeons/:sessionId/finish` → finalizar sesión y distribuir recompensas:
	- Body: `{ result: 'win'|'lose', summary:{ xp,gold,items:[...] } }`.
	- Backend:
		- Si `win`, calcular rewards, crear `UserItem`/`UserCharacter`/`UserConsumable` instancias, volver a sumar monedas VAL al usuario.
		- Registrar `sessionResult` y emitir websocket `user:<id>:dungeon-finished`.
	- Respuesta 200: `{ success:true, rewards: { val:100, itemsGranted:[{instanceId,...}] }, newInventorySummary }`.

4) Cálculo de daño / vida (reglas concretas)
- Variables básicas en personajes/equipos: `hpMax`, `hpCurrent`, `atk`, `def`, `critChance`, `shield` (opcional).
- Fórmula básica recomendada (ejemplo):
	- incomingDamage = calcularSegunSkill(actor, skill)
	- effectiveDamage = max(0, incomingDamage - target.def)
	- hpAfter = max(0, target.hpCurrent - effectiveDamage)
	- Si `hpAfter === 0` ⇒ marcar `status='dead'` y crear `deathRecord`.
- Heal:
	- hpAfter = min(hpMax, target.hpCurrent + healAmount)
- Efectos temporales (buffs/debuffs): almacenar en `character.effects` con `expiresAt` y procesar en cada tick/acción.

5) Muerte permanente, revive y recuperación
- Permanent death mode (opcional):
	- Si `permadeath` activo, al morir: `UserCharacter.status='permadeath'`, eliminar equipo si aplica o bloquear uso.
	- Endpoint revive: `POST /api/players/:playerId/revive` o `POST /api/users/me/characters/:instanceId/revive` con body `{ method:'val'|'consumable'|'admin' }`.
	- Backend valida coste y realiza operación atómica: si revive con consumible -> decrementar consumible y set status='alive', hpCurrent = reviveHp.
	- Respuestas: 200 success, 402 insufficient funds, 409 invalid state.

6) Concurrencia y atomicidad (reglas para evitar errores)
- Siempre usar `instanceId` en operaciones mutables.
- Para consumibles/abrir paquetes/equipar usar operaciones atómicas del DB: `findOneAndUpdate` con condiciones (ej: `usos_restantes>0`, `status==='owned'`) y retornar el documento actualizado.
- Para operaciones multi-documento que deben ser atómicas (ej: abrir paquete que crea varios user_items y actualiza user_packages), usar transacciones (Mongo: `session.startTransaction()`) cuando el driver y deployment lo permiten.
- Locks lógicos: cuando no hay transacciones, usar campo `lockedUntil` con compare-and-set: set `lockedUntil = Date.now()+X` sólo si `lockedUntil` no existe o < now. Si no puedes adquirir lock → 423.

7) Websockets / eventos recomendados
- `user:<id>:inventory-updated` → payload `{ itemsGranted, newInventorySummary }`.
- `user:<id>:dungeon-state` → payload con estado parcial (events array) para actualizar UI en tiempo real.
- `user:<id>:notifications` → para logros/compras/alertas.

8) Contratos de respuesta y códigos estandarizados
- 200/201: éxito
- 202: acción aceptada (pagos externos)
- 400/422: validación
- 401: no autenticado
- 403: no autorizado
- 404: recurso no encontrado
- 409: conflicto (ej: recurso ya utilizado)
- 423: locked (operación en curso)
- 500: error servidor

9) Ejemplos concretos (payloads y responses)
- Usar consumible (curl):
```
curl -X POST http://localhost:8080/api/users/me/consumables/uc_555/use -b cookies.txt -H 'Content-Type: application/json' -d '{"targetCharacterInstanceId":"uc_987"}'
```
Respuesta (200):
```json
{ "success": true, "effectApplied": { "type":"heal","amount":50 }, "newState": { "uc_987": { "hpCurrent": 80 } }, "remaining": 2 }
```

- Iniciar mazmorra (curl):
```
curl -X POST http://localhost:8080/api/dungeons/dg_12/start -b cookies.txt -H 'Content-Type: application/json' -d '{"teamId":"team_1"}'
```
Respuesta (201):
```json
{ "sessionId":"s_789","status":"running","startTime":"2025-11-13T12:00:00Z" }
```

- Acción de ataque (curl):
```
curl -X POST http://localhost:8080/api/dungeons/s_789/action -b cookies.txt -H 'Content-Type: application/json' -d '{"actionType":"attack","actorInstanceId":"uc_111","targetInstanceId":"uc_222"}'
```
Respuesta (200):
```json
{ "success":true, "events":[{"type":"damage","target":"uc_222","amount":30,"hpBefore":50,"hpAfter":20}], "sessionState":{...} }
```

10) Recomendaciones para frontend (resumen operativo)
- Validar en UI que `instanceId` esté presente antes de enviar acciones mutables.
- Mostrar mensajes claros para 423/409 y realizar reintentos con backoff cuando aplique.
- No asumir que `GET /api/users/me` es la única fuente de verdad: usar websockets para sincronización en tiempo real y reconciliar tras operaciones.
- Siempre mostrar spinner/disable en botones que inician operaciones atómicas (usar unique request id para prevenir doble envío).

---

He añadido este bloque extenso con reglas, ejemplos y contratos para que el frontend implemente correctamente la lógica de juego y no haya ambigüedades sobre qué esperar del backend. Si quieres que profundice en alguna parte (por ejemplo: formato exacto de `UserCharacter`, JSON Schema, o un ejemplo de transacción Mongo completa para `open package`), dime cuál y lo añado a continuación.

---

## Visualización de Paquetes (Catálogo) y "Mis Paquetes" — Especificación completa

Objetivo: documentar en detalle cómo el frontend debe listar paquetes disponibles para compra (Marketplace), cómo mostrar la ficha de un paquete, y cómo listar/visualizar los paquetes que el usuario ya posee (Mis Paquetes). Incluye endpoints, ejemplos JSON completos, llamadas Angular y plantillas, paginación, filtros, caching, y recomendaciones para evitar errores e inconsistencias.

Resumen ejecutivo:
- `GET /api/packages/for-sale` — catálogo público (paginado, filtrable).
- `GET /api/packages/:id` — ficha detallada del paquete (plantilla).
- `POST /api/purchase` — iniciar compra / pagar.
- `GET /api/users/me/packages` — paquetes que el usuario posee (user_packages resumidos).
- `GET /api/user-packages/:id` — detalle de un UserPackage específico (incluye snapshot y estado: owned/opened).
- `POST /api/user-packages/:id/open` — abrir paquete (ver sección Paquetes).

1) Esquema de datos (ejemplos completos)

- Package (plantilla en catálogo):
```json
{
	"_id":"pkg_1001",
	"sku":"PKG-EPIC-001",
	"nombre":"Paquete Pionero",
	"descripcion":"Paquete inicial con personaje, espada y consumibles",
	"tipo":"regalo|evento|comercial|bie",
	"precio":100,
	"moneda":"VAL",
	"available": true,
	"imagen":"/images/packages/pioneer.png",
	"preview": [
		{ "type":"character", "id":"char_01", "nombre":"Valornian Hero", "probability":0.05 },
		{ "type":"item", "id":"it_55", "nombre":"Espada Rota", "probability":0.15 }
	],
	"contenidoPosible": [
		{ "type":"character","id":"char_01","rarity":"legendary","weight":1 },
		{ "type":"item","id":"it_55","rarity":"rare","weight":10 },
		{ "type":"consumable","id":"cons_3","rarity":"common","weight":30 }
	],
	"metadata": { "createdAt":"2025-11-01T12:00:00Z", "tags": ["inicio","pionero"] }
}
```

- UserPackage (registro del usuario tras compra):
```json
{
	"_id":"up_5001",
	"userId":"u_123",
	"packageId":"pkg_1001",
	"packageSnapshot": { /* copia del Package en el momento de compra (ver arriba) */ },
	"status":"owned", // owned|opened|expired
	"payment": { "method":"wallet","amount":100,"currency":"VAL","status":"completed" },
	"createdAt":"2025-11-13T10:00:00Z",
	"openedAt": null,
	"rewardsSnapshot": null
}
```

2) Endpoints detallados y ejemplos

- `GET /api/packages/for-sale`
	- Query params:
		- `page` (int, default 1)
		- `limit` (int, default 20)
		- `type` (filter por tipo)
		- `search` (texto)
		- `sort` (e.g., `price.asc`)
	- Response 200 (ejemplo):
	```json
	{
		"page":1,"limit":20,"total":123,
		"data":[ /* array de Package resumidos */
			{ "_id":"pkg_1001","nombre":"Paquete Pionero","precio":100,"moneda":"VAL","imagen":"/images/packages/pioneer.png","preview": [...] },
			...
		]
	}
	```
	- Recomendaciones backend:
		- Proyecciones para enviar solo campos necesarios en lista (no enviar `contenidoPosible` completo si es grande).
		- Indexar por `available`, `tipo`, `precio`, y campos de búsqueda.

- `GET /api/packages/:id` (detalles de la plantilla)
	- Response 200: la `Package` completa (como el JSON en la sección 1).
	- Usos: mostrar ficha de producto con descripción completa, preview de posibles drops, y botón `Comprar`.

- `POST /api/purchase`
	- Body: `{ productId: string, currency: 'VAL'|'USD', paymentMethod:'wallet'|'stripe'|'paypal' }`
	- Responses:
		- 200 (wallet immediate): `{ orderId, status:'completed', userPackageId: 'up_5001' }`.
		- 202 (external payment): `{ orderId, status:'pending', paymentUrl }`.
	- Recomendación: retornar `userPackageId` si la compra fue acreditada para que el front ya lo muestre en "Mis Paquetes".

- `GET /api/users/me/packages` (lista de UserPackage del usuario)
	- Query params: `page, limit, status` (opcional)
	- Response 200 (ejemplo):
	```json
	{
		"page":1,"limit":20,"total":2,
		"data":[
			{ "_id":"up_5001","packageId":"pkg_1001","packageSnapshot":{"nombre":"Paquete Pionero","imagen":"..."},"status":"owned","createdAt":"..." },
			{ "_id":"up_4002","packageId":"pkg_2000","packageSnapshot":{"nombre":"Paquete VIP","imagen":"..."},"status":"opened","createdAt":"...","openedAt":"..." }
		]
	}
	```
	- Uso UI: pantalla "Mis Paquetes" -> presentar tarjetas por `UserPackage` con `packageSnapshot.nombre`, `imagen`, `status` y botón `Abrir` si `status==='owned'`.

- `GET /api/user-packages/:id` (detalle concreto)
	- Response 200: `UserPackage` completo incluyendo `packageSnapshot` y, si `opened`, `rewardsSnapshot`.
	- Uso UI: al abrir la tarjeta o modal se llama a este endpoint para pegar la información detallada sin volver a la plantilla general.

- `POST /api/user-packages/:id/open` — ya documentado en Paquetes; se repite: retorno incluye `itemsGranted` y `newInventorySummary`.

3) Llamadas y componentes front (detalles completos)

Componente: `PackagesListComponent` (Marketplace)
- Lógica:
	- En `ngOnInit` llamar `getPackagesForSale({ page:1, limit:20 })`.
	- Mantener estado `packages`, `loading`, `error`, `page`, `total`.
	- Soportar `search`, `filter` y `sort` con debounce en inputs.
- Template (recomendación):
	- Grid responsivo de tarjetas con `imagen`, `nombre`, `precio`, y `preview thumbnails`.
	- Botón `Comprar` en cada tarjeta (abrir modal confirmación → llamar `POST /api/purchase`).

Ejemplo de servicio (Angular) — resumido (los códigos están en la sección ShopService):
```ts
this.shopService.getPackagesForSale({ page:1, limit:20 }).subscribe(res=>{ this.packages=res.data; this.total=res.total; });
```

Componente: `PackageDetailComponent` (ficha)
- Lógica:
	- `ngOnInit` leer `:id` de ruta y llamar `GET /api/packages/:id`.
	- Mostrar `preview`, `contenidoPosible` (resumido) y botón `Comprar`.
	- Si `Comprar` -> pedir confirmación -> `POST /api/purchase` -> si `completed`, navegar a `Mis Paquetes` o mostrar modal con `userPackageId`.

Componente: `MyPackagesComponent` (Mis Paquetes)
- Lógica:
	- Llamar `GET /api/users/me/packages` con `withCredentials:true`.
	- Renderizar lista ordenada por `createdAt` desc.
	- Para cada `UserPackage` mostrar:
		- Imagen: `up.packageSnapshot.imagen || /images/default-package.png`.
		- Título: `up.packageSnapshot.nombre`.
		- Estado: `up.status`.
		- CTA:
			- Si `status==='owned'` -> botón `Abrir` que llama `POST /api/user-packages/:id/open`.
			- Si `status==='opened'` -> botón `Ver recompensas` que llama `GET /api/user-packages/:id` para mostrar `rewardsSnapshot`.

4) Formatos de respuesta y UI rendering (reglas precisas)

- En el catálogo (`GET /api/packages/for-sale`) enviar siempre `imagen` (thumbnail) y `preview` reducido (max 3 items) para evitar payload grande.
- En `GET /api/packages/:id` incluir `previewExtended` y `contenidoPosible` completo.
- En `GET /api/users/me/packages` enviar `packageSnapshot` resumido y `status` para que el front no tenga que hacer join con `packages`.
- El front debe usar `packageSnapshot` para mostrar nombre/imagen/preview y no requerir una segunda llamada a `GET /api/packages/:id` al mostrar la lista (optimización).

5) Manejo de errores y UX

- Errores comunes:
	- 401: usuario no autenticado → redirigir a Login/Registro.
	- 402: insuficiente fondos → en modal mostrar opciones: "Obtener VAL" o pagar por tarjeta.
	- 423: locked (al abrir paquete) → mostrar mensaje y reintentar.
	- 409: paquete ya abierto → refrescar lista.
	- 500: error servidor → mostrar fallback y botón "Reintentar".

- UX flows:
	- Compra rápida: botón `Comprar` debe abrir modal confirmación y deshabilitar hasta recibir respuesta.
	- Si `POST /api/purchase` devuelve `pending` con `paymentUrl`, abrir `paymentUrl` en ventana y show "Esperando confirmación" con polling o websockets.
	- Al comprar y recibir `userPackageId`, añadir el nuevo `UserPackage` al principio de lista optimísticamente (estado `owned`) y refrescar `GET /api/users/me/packages` en background.

6) Paginación, caching y performance

- Paginación: usar `page`/`limit` y devolver `total` en respuesta.
- Caching CDN: las imágenes y `GET /api/packages/for-sale` pueden contener caché (cache-control) si los paquetes no cambian frecuentemente; usar versiones/etag para invalidar cuando cambien precios o disponibilidad.
- Evitar N+1 queries: backend debe popular o proyectar solo lo necesario para `GET /api/users/me/packages` (usar agregación en Mongo para traer `packageSnapshot.nombre` desde `packageSnapshot` guardado en `UserPackage`).

7) Seguridad

- Validar ownership de `UserPackage` en `POST /api/user-packages/:id/open`.
- No permitir que el cliente envíe `packageSnapshot` para reclamar rewards: snapshot solo lo guarda el backend al crear `UserPackage`.
- Usar rate-limits en endpoints de compra y open para evitar abusos (ej: 5 requests/min por usuario).

8) Ejemplos curl completos

- Listar catálogo (página 1):
```bash
curl -X GET "http://localhost:8080/api/packages/for-sale?page=1&limit=20" -H "Accept: application/json"
```

- Ver ficha de paquete:
```bash
curl -X GET "http://localhost:8080/api/packages/pkg_1001" -H "Accept: application/json"
```

- Comprar paquete (wallet):
```bash
curl -X POST "http://localhost:8080/api/purchase" -b cookies.txt -H "Content-Type: application/json" -d '{"productId":"pkg_1001","currency":"VAL","paymentMethod":"wallet"}'
```

- Listar "Mis Paquetes":
```bash
curl -X GET "http://localhost:8080/api/users/me/packages" -b cookies.txt -H "Accept: application/json"
```

- Abrir un paquete comprado:
```bash
curl -X POST "http://localhost:8080/api/user-packages/up_5001/open" -b cookies.txt -H "Content-Type: application/json"
```

---

Esta sección cubre a detalle el ciclo completo: ver catálogo, ver ficha, comprar, ver mis paquetes, abrir y mostrar recompensas. Si quieres que genere JSON Schema para `Package` y `UserPackage`, o que escriba ejemplos de código de backend (controlador + servicio en TypeScript) para estos endpoints, indícamelo y los añado a continuación.

---

## Apéndice: Ejemplos JSON, formato de errores, WebSocket y referencias a schemas/scripts

Objetivo: aquí tienes todo lo que el frontend necesita como referencia exacta (ejemplos machine-readable y formatos de error) para evitar ambigüedades.

### A) `GET /api/users/me` — Ejemplo completo (respuesta mínima expandida)
```json
{
	"_id": "u_123",
	"username": "player1",
	"email": "player1@example.com",
	"val": 1240,
	"tickets": 5,
	"personajes": [
		{
			"instanceId": "uc_987",
			"characterId": "char_01",
			"nombre": "Valornian Hero",
			"nivel": 3,
			"hpMax": 120,
			"hpCurrent": 95,
			"status": "alive",
			"equipmentSlots": { "main": "ui_321", "offhand": null, "head": null, "body": null }
		}
	],
	"inventarioEquipamiento": [
		{ "instanceId": "ui_321", "itemId": "it_55", "nombre": "Espada Rota", "slotAllowed": ["main"], "atributos": { "atk": 10 } }
	],
	"inventarioConsumibles": [
		{ "instanceId": "uc_555", "consumableId": "cons_3", "nombre": "Poción Vita", "usos_restantes": 3 }
	],
	"teams": [
		{ "teamId": "team_1", "name": "Equipo A", "slots": [{ "slot": "char1", "characterInstanceId": "uc_987" }] }
	],
	"createdAt": "2025-11-01T12:00:00Z"
}
```

> Nota: el frontend debe esperar `instanceId` en las entidades mutables y usarlo para operaciones de equipar/usar.

### B) `GET /api/user-packages/:id` — Ejemplo cuando `opened`
```json
{
	"_id": "up_5001",
	"userId": "u_123",
	"packageId": "pkg_1001",
	"packageSnapshot": { "_id": "pkg_1001", "nombre": "Paquete Pionero", "imagen": "/images/packages/pioneer.png" },
	"status": "opened",
	"createdAt": "2025-11-13T10:00:00Z",
	"openedAt": "2025-11-13T10:02:00Z",
	"rewardsSnapshot": [
		{ "type": "character", "id": "char_01", "instanceId": "uc_987", "nombre": "Valornian Hero" },
		{ "type": "item", "id": "it_55", "instanceId": "ui_321", "nombre": "Espada Rota" }
	]
}
```

### C) Formato estándar de errores (recomendado)
El backend seguirá este formato JSON para errores que el frontend debe parsear:
```json
{
	"error": {
		"code": "string_code",        
		"message": "Mensaje legible para mostrar",
		"details": { "field": "info opcional" }
	}
}
```

Ejemplos concretos:
- 409 paquete ya abierto:
```json
{ "error": { "code": "package_already_opened", "message": "El paquete ya fue abierto", "details": { "userPackageId": "up_5001" } } }
```
- 423 locked:
```json
{ "error": { "code": "resource_locked", "message": "Operación en curso. Reintentar más tarde.", "details": { "retryAfterMs": 1000 } } }
```
- 422 validación:
```json
{ "error": { "code": "validation_error", "message": "Campos inválidos", "details": { "password":"demasiado corta" } } }
```

### D) WebSocket — handshake y ejemplos de mensajes
- Autenticación: usar cookie `token` (httpOnly) durante la conexión o `Authorization: Bearer <token>` en header/query si necesitas token para clientes no-browser.
- Ejemplo de mensaje de servidor al completar apertura de paquete:
```json
{ "topic": "user: u_123:inventory-updated", "payload": { "itemsGranted": [ { "type":"item","instanceId":"ui_321","nombre":"Espada Rota" } ], "newInventorySummary": { "personajesCount":4,"equipamientoCount":12 } } }
```

Recomendaciones para front:
- En la conexión websocket, reenviar `GET /api/users/me` al reconectar si hay dudas de sincronización.
- Implementar reconexión con backoff y deduplicar eventos aplicando `instanceId`.

### E) Referencias a JSON Schema y scripts en repo
- JSON Schemas machine-readable:
	- `schemas/package.schema.json`
	- `schemas/userPackage.schema.json`

	Inserta estos archivos en tus herramientas (AJV, quicktype, json-schema-to-typescript) para generar tipos y validaciones.

- Scripts creados en el repo para diagnóstico y pruebas:
	- `scripts/diagnose-mongo-connection.js` — script para verificar SRV/DNS/TCP y hacer un intento corto de conexión con mongoose.
	- `tests/pack-flow.sh` — script de ejemplo (curl) para ejecutar flujo compra → abrir → verificar inventario (ver archivo en `tests/`).

### F) `tests/pack-flow.sh` — Descripción rápida
El script automatiza (con curl y cookies) los pasos: login -> listar paquetes -> comprar (wallet) -> esperar y abrir -> verificar `GET /api/users/me/packages` y `GET /api/users/me`.

---

Si quieres que también inserte aquí el contenido completo de los schemas (JSON Schema) dentro del MD, lo pego; por defecto los dejé como archivos en `schemas/` para uso por herramientas. A continuación pego los schemas completos para que todo quede en este documento también.

---

### G) JSON Schema completos (pegados aquí para referencia)

`schemas/package.schema.json`
```json
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"title": "Package",
	"type": "object",
	"required": ["_id", "nombre", "tipo", "precio", "available", "contenidoPosible"],
	"properties": {
		"_id": { "type": "string", "description": "MongoDB ObjectId as string" },
		"sku": { "type": "string" },
		"nombre": { "type": "string" },
		"descripcion": { "type": "string" },
		"tipo": { "type": "string", "description": "tipo de paquete (e.g. 'pioneer'|'starter'|'bundle'|'cosmetic'|'consumable'|'regalo')" },
		"precio": {
			"type": "object",
			"properties": {
				"amount": { "type": "integer", "minimum": 0 },
				"moneda": { "type": "string", "enum": ["VAL","USD","tickets","coins","gems"] }
			},
			"required": ["amount","moneda"],
			"additionalProperties": false
		},
		"available": { "type": "boolean", "description": "indica si está disponible para la venta" },
		"rarity": { "type": "string" },
		"imagen": { "type": "string", "format": "uri" },
		"meta": { "type": "object", "additionalProperties": true },
		"preview": {
			"type": "array",
			"items": {
				"type": "object",
				"properties": {
					"type": { "type": "string" },
					"id": { "type": "string" },
					"nombre": { "type": "string" },
					"probability": { "type": "number", "minimum": 0, "maximum": 1 }
				},
				"additionalProperties": true
			}
		},
		"contenidoPosible": {
			"type": "array",
			"items": {
				"type": "object",
				"required": ["type","id"],
				"properties": {
					"type": { "type": "string", "description": "character|item|consumable|equipment" },
					"id": { "type": "string" },
					"rarity": { "type": "string" },
					"weight": { "type": "number", "minimum": 0 }
				},
				"additionalProperties": false
			}
		},
		"createdAt": { "type": "string", "format": "date-time" },
		"updatedAt": { "type": "string", "format": "date-time" }
	},
	"additionalProperties": false
}
```

`schemas/userPackage.schema.json`
```json
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"title": "UserPackage",
	"type": "object",
	"required": ["_id", "userId", "packageId", "status", "createdAt", "packageSnapshot"],
	"properties": {
		"_id": { "type": "string", "description": "MongoDB ObjectId as string" },
		"userId": { "type": "string" },
		"packageId": { "type": "string" },
		"status": { "type": "string", "enum": ["owned","opened","expired","pending","completed","consumed"] },
		"createdAt": { "type": "string", "format": "date-time" },
		"openedAt": { "type": ["string","null"], "format": "date-time" },
		"packageSnapshot": {
			"type": "object",
			"description": "Copia del Package en el momento de la compra",
			"properties": {
				"_id": { "type": "string" },
				"sku": { "type": "string" },
				"nombre": { "type": "string" },
				"imagen": { "type": "string", "format": "uri" }
			},
			"required": ["_id","nombre"],
			"additionalProperties": true
		},
		"payment": {
			"type": "object",
			"properties": {
				"method": { "type": "string", "enum": ["wallet","stripe","paypal"] },
				"amount": { "type": "integer", "minimum": 0 },
				"currency": { "type": "string", "enum": ["VAL","USD","tickets","coins","gems"] },
				"status": { "type": "string", "enum": ["completed","pending","failed"] }
			},
			"required": ["method","amount","currency"],
			"additionalProperties": false
		},
		"rewardsSnapshot": {
			"type": "array",
			"items": {
				"type": "object",
				"properties": {
					"type": { "type": "string" },
					"id": { "type": "string" },
					"instanceId": { "type": "string" },
					"nombre": { "type": "string" }
				},
				"required": ["type","id"],
				"additionalProperties": true
			}
		},
		"source": { "type": "string", "description": "Origen del paquete (shop,promo,onboarding)" }
	},
	"additionalProperties": false
}
```

`schemas/userCharacter.schema.json`
```json
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"title": "UserCharacter",
	"type": "object",
	"required": ["instanceId", "userId", "characterId", "nivel", "hpMax", "hpCurrent", "status"],
	"properties": {
		"instanceId": { "type": "string" },
		"userId": { "type": "string" },
		"characterId": { "type": "string" },
		"nombre": { "type": "string" },
		"nivel": { "type": "integer", "minimum": 1 },
		"hpMax": { "type": "integer", "minimum": 0 },
		"hpCurrent": { "type": "integer", "minimum": 0 },
		"status": { "type": "string", "enum": ["alive","dead","permadeath"] },
		"equipmentSlots": {
			"type": "object",
			"properties": {
				"main": { "type": ["string","null"] },
				"offhand": { "type": ["string","null"] },
				"head": { "type": ["string","null"] },
				"body": { "type": ["string","null"] },
				"accessory": { "type": ["string","null"] }
			},
			"additionalProperties": false
		},
		"atributos": { "type": "object", "additionalProperties": true },
		"meta": { "type": "object", "additionalProperties": true },
		"createdAt": { "type": "string", "format": "date-time" },
		"updatedAt": { "type": "string", "format": "date-time" }
	},
	"additionalProperties": false
}
```

`schemas/userItem.schema.json`
```json
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"title": "UserItem",
	"type": "object",
	"required": ["instanceId", "userId", "itemId", "nombre"],
	"properties": {
		"instanceId": { "type": "string" },
		"userId": { "type": "string" },
		"itemId": { "type": "string" },
		"nombre": { "type": "string" },
		"slotAllowed": {
			"type": "array",
			"items": { "type": "string" }
		},
		"atributos": { "type": "object", "additionalProperties": true },
		"permanent": { "type": "boolean" },
		"meta": { "type": "object", "additionalProperties": true },
		"createdAt": { "type": "string", "format": "date-time" }
	},
	"additionalProperties": false
}
```

---

### H) Formas de ejecutar las pruebas locales

1) Asegúrate de tener `jq` instalado y que el servidor corra en `http://localhost:8080` o exporta `API_BASE`:

```bash
# instalar jq (ejemplo linux/mac):
# apt-get install jq   # Debian/Ubuntu
# brew install jq      # Mac

export API_BASE="http://localhost:8080"
export EMAIL="user@example.com"
export PASSWORD="secret123"
export PRODUCT_ID="pkg_1001"
bash tests/pack-flow.sh
```

2) El script hará login, comprará (wallet) y hará polling si la compra queda `pending`. Si todo va bien mostrará `itemsGranted` y actualizará inventario.

3) Si quieres que el script sea ejecutable directamente en Windows Git Bash/WSL, ejecuta `chmod +x tests/pack-flow.sh` en tu entorno Unix.

---

Si quieres, pego también el `error.schema.json` formal y lo añado a `schemas/` para que el backend pueda validar y forzar el formato de error consistente. ¿Lo incluyo? 

---

### I) `schemas/error.schema.json` (formato de error formal)

El esquema formaliza el formato de error que el backend debe devolver. Útil para pruebas automáticas y validación.

```json
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"title": "APIError",
	"type": "object",
	"required": ["error"],
	"properties": {
		"error": {
			"type": "object",
			"required": ["code","message"],
			"properties": {
				"code": { "type": "string", "description": "Short machine-readable error code" },
				"message": { "type": "string", "description": "Human readable message" },
				"details": { "type": ["object","null"], "additionalProperties": true }
			},
			"additionalProperties": false
		}
	},
	"additionalProperties": false
}
```

Archivo en repo: `schemas/error.schema.json`




## Checklist de integración para Frontend — Todo lo que necesitas

Objetivo: tener todo lo necesario en un solo lugar para que el equipo frontend implemente las pantallas y llamadas sin tener que preguntar nada más. Incluye endpoints, payloads, respuestas esperadas, validaciones, UX, ejemplos Angular, curl para pruebas, y criterios de aceptación por pantalla.

Formato: por cada pantalla / flujo incluyo: 1) endpoint(s) que usa, 2) request body y headers necesarios, 3) ejemplo de respuesta JSON mínima requerida, 4) campos que la UI debe renderizar, 5) errores a manejar y 6) criterios de aceptación.

NOTA GENERAL: todas las llamadas que dependen de autenticación deben incluir `{ withCredentials: true }` en Angular para enviar cookie `token` httpOnly. El backend espera cookie o header Authorization como alternativa.

1) Portada (Cover)
- Endpoints: ninguno obligatorio. Opcionalmente `GET /api/notifications/count` para mostrar badge.
- UI Fields: imagen de fondo, logo, CTA `Jugar` (redirige a Dashboard o Login), botón `Configuración` arriba derecha.
- Errores: none.
- Criterios de aceptación: portada muestra imagen, CTA visible y botón `Configuración` accesible.

2) Registro (Register)
- Endpoint: `POST /auth/register`
	- Body: `{ email, username, password }`
	- Headers: `Content-Type: application/json`
	- Response 201: `{ message:'Verification email sent' }` or 201+warning
	- Errors: 409 (duplicate), 422 (validation)
- UI fields to render: form with email/username/password, inline validation, spinner on submit.
- UX: after success navigate to `Verifica tu correo` screen with `Reenviar` button -> `POST /auth/resend-verification`.
- Acceptance: submitting valid data returns 201 and screen shows verification instructions.

3) Verificación (email)
- Endpoint (server HTML): `GET /auth/verify/:token` (server returns HTML). If SPA flow used: implement `POST /auth/verify` with `{ token }`.
- UI: show verification success/fail page. If using SPA route `/verify/:token`, call API and show result.
- Acceptance: token valid -> user sees success + message "Paquete Pionero entregado".

4) Login
- Endpoint: `POST /auth/login`
	- Body: `{ email, password }`
	- Response 200: `{ user: { _id, username, email, ... } }` + Set-Cookie token in header.
	- Errors: 401, 403
- After success: call `GET /api/users/me` to load expanded user state.
- Acceptance: cookie set in browser (curl: `-c cookies.txt`), user data populated in store.

5) Dashboard
- Endpoints:
	- `GET /api/users/me` (main)
	- `GET /api/notifications` (optional)
	- `GET /api/packages/for-sale` (to show promos)
- UI fields to render: topbar (VAL, tickets, notifications count), cards (Marketplace, Tienda, Inventario, Equipamiento), footer nav.
- Acceptance: topbar values match `GET /api/users/me` response; cards navigate correctly.

6) Marketplace (Lista de paquetes)
- Endpoint: `GET /api/packages/for-sale?page=&limit=&type=&search=` (public)
	- Response (min): `{ page, limit, total, data: [ { _id, nombre, precio, moneda, imagen, preview:[...] } ] }`
- UI: paginated grid; each card shows thumbnail, name, price, small preview of 1-3 items.
- Actions: `Comprar` -> `POST /api/purchase`.
	- Purchase response: 200 `{ orderId, status:'completed', userPackageId }` or 202 `{ paymentUrl }`.
- Errors: 402 insufficient funds, 500 server.
- Acceptance: listing loads, pagination works, buy flow returns `userPackageId` and adds item to "Mis Paquetes".

7) Ficha del paquete (Package Detail)
- Endpoint: `GET /api/packages/:id`
	- Response: full `Package` JSON (see examples listo arriba)
- UI: show full description, content probabilities, buy CTA.
- Acceptance: detail view matches server fields (nombre, descripcion, preview, contenidoPosible).

8) Mis Paquetes (User packages list)
- Endpoint: `GET /api/users/me/packages?page=&limit=&status=` (auth)
	- Response: `{ page, limit, total, data:[ { _id, packageId, packageSnapshot:{nombre,imagen,...}, status, createdAt, openedAt? } ] }`
- UI: list of `UserPackage` cards with `packageSnapshot.nombre`, `imagen`, `status`. CTA `Abrir` when `status==='owned'`.
- Action open: `POST /api/user-packages/:id/open` -> response includes `itemsGranted` and `newInventorySummary`.
- Acceptance: after open, show modal with rewards; `GET /api/users/me` reflects new inventory.

9) Abrir paquete (Open)
- Endpoint: `POST /api/user-packages/:id/open`
	- Response 200: `{ opened:true, itemsGranted:[{type,id,instanceId,nombre,imagen,...}], newInventorySummary }`
- UI: animation modal, disable open button until response. On 423 locked -> retry/backoff.
- Acceptance: modal shows rewards; inventory counts updated.

10) Inventario (Inventory)
- Endpoint: `GET /api/users/me` (includes `personajes`, `inventarioEquipamiento`, `inventarioConsumibles`). Optionally `GET /api/users/me/inventory?type=`.
- UI: tabs for Characters, Equipment, Consumables; render `instanceId`, `nombre`, `imagen`, `usos_restantes` (for consumables), equip slots for characters.
- Actions:
	- Equip: `POST /api/users/me/equipment` with assignments (atomic)
	- Use consumable: `POST /api/users/me/consumables/:instanceId/use` with optional `targetCharacterInstanceId`
- Acceptance: equip/consume updates UI and server state (verified with `GET /api/users/me`).

11) Equipamiento / Armado de equipo
- Endpoint: `POST /api/users/me/equipment` body: `{ teamId?, assignments:[{ characterInstanceId, slot, itemInstanceId }] }`
	- Response: `{ success:true, equipmentState }`
- UI: drag/drop or select UI to assign items to slots; validate slot allowed before submit.
- Acceptance: server validates and returns new equipment state.

12) Consumibles
- Endpoint: `POST /api/users/me/consumables/:instanceId/use`
	- Response 200: `{ success:true, effectApplied, newState, remaining }`
- UI: confirm modal (if consumable rare) and show effect animation; disable button while applying.
- Acceptance: `remaining` decremented and applied effect reflected in `GET /api/users/me`.

13) Iniciar partida / Mazmorra
- Endpoint: `POST /api/dungeons/:dungeonId/start` with `{ teamId }` -> 201 `{ sessionId, status }`
- UI: choose dungeon, confirm team, start; show loading until session ready; then enter live session UI which consumes `POST /api/dungeons/:sessionId/action` for actions and listens to websocket `user:<id>:dungeon-state`.
- Acceptance: session created and server returns sessionId.

14) Notificaciones y Real-time
- Websocket topics to subscribe:
	- `user:<id>:inventory-updated` (update inventory)
	- `user:<id>:notifications` (new notifications)
	- `user:<id>:dungeon-state` (dungeon events)
- On connect, authenticate websocket using cookie or token handshake.

15) Errores y manejo común (mapa rápido)
- 401 -> redirect to login
- 402 -> show purchase options
- 409 -> resource conflict (refresh list)
- 423 -> locked (retry/backoff)
- 500 -> show generic error + retry

16) Ejemplos de llamadas Angular (snippet resumen)
```ts
// AuthService (login)
login(email,password){ return this.http.post('/auth/login',{email,password},{ withCredentials:true }); }

// ShopService
getPackages(params){ return this.http.get('/api/packages/for-sale',{ params }); }
purchase(productId){ return this.http.post('/api/purchase',{ productId },{ withCredentials:true }); }
getUserPackages(){ return this.http.get('/api/users/me/packages',{ withCredentials:true }); }
openUserPackage(id){ return this.http.post(`/api/user-packages/${id}/open`,{}, { withCredentials:true }); }

// UserService
loadUser(){ return this.http.get('/api/users/me',{ withCredentials:true }); }
```

17) Pruebas locales (curl) — resumen rápido
```bash
curl -X GET "http://localhost:8080/api/packages/for-sale?page=1&limit=20"
curl -X GET "http://localhost:8080/api/packages/pkg_1001"
curl -i -X POST http://localhost:8080/auth/login -H 'Content-Type: application/json' -d '{"email":"u@x.com","password":"s"}' -c cookies.txt
curl -X GET http://localhost:8080/api/users/me/packages -b cookies.txt
curl -X POST http://localhost:8080/api/purchase -b cookies.txt -H 'Content-Type: application/json' -d '{"productId":"pkg_1001","currency":"VAL"}'
curl -X POST http://localhost:8080/api/user-packages/up_5001/open -b cookies.txt
```

18) Criterios de aceptación por pantalla (resumen)
- Cada pantalla debe tener tests e2e o pasos manuales que verifiquen:
	- Llamadas correctas a endpoints (URL, method, body)
	- Respuesta manejada (success & error)
	- UI refleja cambios de estado (inventario, monedas, paquetes)

19) Variables de entorno necesarias en Frontend
- `API_BASE_URL` (ex: `http://localhost:8080`)
- `FRONTEND_URL` (para links de verificación)
- `STRIPE_KEY` u otras si integras pago externo

---

Con esto el documento incluye una guía completa y lista para que el frontend implemente todas las pantallas relacionadas con paquetes y juego sin preguntas adicionales. ¿Quieres que además genere JSON Schema para `Package`/`UserPackage` y un archivo `tests/pack-flow.sh` con los curl ordenados para ejecutar el flujo automáticamente? Si es así, lo creo ahora dentro del repo.

---

## Implementación front (ejemplos completos)

Abajo se incluyen los ejemplos concretos de Angular que muestran cómo implementar el servicio de tienda (`ShopService`) y el componente para abrir paquetes (`OpenPackageComponent`) con su plantilla. Copia/pega estos fragmentos en el frontend si lo deseas. No crearé más archivos por mi cuenta; estos ejemplos quedan documentados aquí.

### `ShopService` (ejemplo completo)
```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShopService {
	constructor(private http: HttpClient) {}

	getPackagesForSale(params?: any): Observable<any> {
		return this.http.get('/api/packages/for-sale', { params });
	}

	purchase(productId: string, currency: 'VAL' | 'USD' = 'VAL', paymentMethod: 'wallet' | 'stripe' | 'paypal' = 'wallet') {
		return this.http.post('/api/purchase', { productId, currency, paymentMethod }, { withCredentials: true });
	}

	getUserPackages(): Observable<any> {
		return this.http.get('/api/users/me/packages', { withCredentials: true });
	}

	openUserPackage(userPackageId: string) {
		return this.http.post(`/api/user-packages/${userPackageId}/open`, {}, { withCredentials: true });
	}
}
```

### `OpenPackageComponent` (TypeScript)
```ts
import { Component, OnInit } from '@angular/core';
import { ShopService } from '../../services/shop.service';

@Component({
	selector: 'app-open-package',
	templateUrl: './open-package.component.html'
})
export class OpenPackageComponent implements OnInit {
	userPackages: any[] = [];
	loading = false;
	openingId: string | null = null;
	error: string | null = null;

	constructor(private shop: ShopService) {}

	ngOnInit() {
		this.loadUserPackages();
	}

	loadUserPackages() {
		this.shop.getUserPackages().subscribe({
			next: (res: any) => this.userPackages = res || [],
			error: (err) => this.error = 'No se pudo cargar paquetes'
		});
	}

	openPackage(up: any) {
		if (this.openingId) return; // ya se está abriendo uno
		this.openingId = up._id;
		this.loading = true;
		this.error = null;

		this.shop.openUserPackage(up._id).subscribe({
			next: (res: any) => {
				this.loading = false;
				this.openingId = null;
				// mostrar rewards en modal simple (aquí solo alert)
				if (res && res.itemsGranted) {
					const names = res.itemsGranted.map((i: any) => i.nombre || i.id).join(', ');
					alert('Has recibido: ' + names);
				}
				// recargar paquetes/inventario
				this.loadUserPackages();
			},
			error: (err) => {
				this.loading = false;
				this.openingId = null;
				if (err?.status === 423) {
					this.error = 'El paquete está siendo abierto. Reintentando...';
				} else if (err?.status === 409) {
					this.error = 'El paquete ya fue abierto.';
					this.loadUserPackages();
				} else {
					this.error = 'Error al abrir paquete. Intenta más tarde.';
				}
			}
		});
	}
}
```

### `OpenPackageComponent` (plantilla HTML)
```html
<div class="open-package">
	<h3>Mis paquetes</h3>

	<div *ngIf="error" class="error">{{ error }}</div>

	<div *ngIf="userPackages.length===0">No tienes paquetes.</div>

	<ul>
		<li *ngFor="let up of userPackages">
			<div>
				<strong>{{ up.snapshot?.nombre || up.packageName || 'Paquete' }}</strong>
				<span *ngIf="up.status"> - {{ up.status }}</span>
			</div>
			<div>
				<button (click)="openPackage(up)" [disabled]="loading || openingId===up._id || up.status==='opened'">
					Abrir paquete
				</button>
			</div>
		</li>
	</ul>
</div>
```

---

He añadido los ejemplos completos solicitados en este documento. No crearé más archivos fuera del repositorio sin tu confirmación; si quieres que convierta estos ejemplos en archivos reales en el frontend, dímelo explícitamente y lo hago en el siguiente paso.

---

## ✅ Auditoría del Backend y Plan de Acción (Noviembre 2025)

Fecha de auditoría: 19 de Noviembre de 2025

Tras una revisión profunda del código del backend, se han identificado varios problemas críticos a nivel de arquitectura, funcionalidad y seguridad. Esta sección servirá como registro de las tareas planificadas y el progreso de su implementación.

### Lista de Tareas Priorizadas

1.  **Implementar el Uso de Ítems Consumibles (Crítico)**
    *   **Estado:** Pendiente ⏳
    *   **Problema:** La funcionalidad para usar ítems consumibles está completamente ausente.
    *   **Solución:** Crear la ruta, el controlador y el servicio necesarios para permitir que los usuarios usen consumibles desde su inventario, aplicando sus efectos y gastando sus usos.

2.  **Refactorizar la Lógica de Mazmorras (Grave)**
    *   **Estado:** Pendiente ⏳
    *   **Problema:** Toda la lógica de negocio de las mazmorras reside en el controlador (`dungeons.controller.ts`), haciendo el código difícil de mantener y probar. El `dungeon.service.ts` es código muerto.
    *   **Solución:** Mover toda la lógica de negocio del controlador al servicio, dividiéndola en funciones más pequeñas y manejables.

3.  **Corregir Vulnerabilidades en Mazmorras (Grave)**
    *   **Estado:** Pendiente ⏳
    *   **Problema:** No hay coste de entrada para las mazmorras y el flujo de combate atómico puede ser explotado.
    *   **Solución:** Implementar un coste de entrada (energía, boletos, etc.) y refactorizar el flujo a un modelo de `start`/`complete` para evitar que los jugadores eviten penalizaciones.

4.  **Añadir Transacciones a la Base de Datos (Medio)**
    *   **Estado:** Pendiente ⏳
    *   **Problema:** Las operaciones que modifican múltiples documentos no son atómicas, lo que puede llevar a un estado de datos inconsistente.
    *   **Solución:** Envolver las operaciones críticas (final de mazmorra, apertura de paquetes) en transacciones de base de datos.

---

## ✅ SECCIONES COMPLETADAS DE LA GUÍA (PANTALLA POR PANTALLA)

La guía anterior cubre el flujo de paquetes, inventario y mecánicas básicas. A continuación, se completan las secciones faltantes para que sea una referencia completa pantalla por pantalla, facilitando el desarrollo frontend. Se incluyen todos los endpoints implementados, organizados por flujos/pantallas.

---

## 🔐 AUTENTICACIÓN Y CUENTA (Pantallas de Login/Registro/Configuración)

### Pantalla: Registro (Sign Up)
- **Objetivo:** Crear cuenta nueva con email/username/password.
- **Campos:** email, username, password, confirmPassword.
- **Validaciones Front:** Email válido, username 3-20 chars, password 6+ chars.
- **Endpoint:** `POST /auth/register`
  - Body: `{ email, username, password }`
  - Headers: `Content-Type: application/json`
  - Response 201: `{ message: 'Registro exitoso...' }`
  - Errores: 409 (duplicado), 422 (validación)
- **UX:** Después de registro, mostrar pantalla "Verifica tu email" con botón `Reenviar`.
- **Ejemplo Angular:**
  ```ts
  register(form: any) {
    this.http.post('/auth/register', form.value).subscribe({
      next: () => this.router.navigate(['/verify-email']),
      error: (err) => this.error = err.error.error
    });
  }
  ```

### Pantalla: Verificación de Email
- **Objetivo:** Confirmar cuenta tras registro.
- **Endpoint (Servidor):** `GET /auth/verify/:token` (devuelve HTML de éxito/error).
- **Alternativa SPA:** Implementar `POST /auth/verify` con `{ token }` si prefieres JSON.
- **UX:** Mostrar mensaje de éxito + redirigir a login.

### Pantalla: Reenvío de Verificación
- **Objetivo:** Reenviar email si no llegó.
- **Campos:** email.
- **Endpoint:** `POST /auth/resend-verification`
  - Body: `{ email }`
  - Response 200: `{ message: 'Email enviado' }`
  - Errores: 400 (ya verificado), 429 (esperar)
- **UX:** Rate limit: no permitir reenvíos frecuentes.

### Pantalla: Login
- **Objetivo:** Iniciar sesión.
- **Campos:** email, password.
- **Endpoint:** `POST /auth/login`
  - Body: `{ email, password }`
  - Response 200: `{ user: {...}, token }` + Cookie httpOnly.
  - Errores: 401 (credenciales), 403 (no verificado)
- **UX:** Después de login, llamar `GET /api/users/me` para cargar datos completos.
- **Ejemplo Angular:**
  ```ts
  login(form: any) {
    this.http.post('/auth/login', form.value, { withCredentials: true }).subscribe({
      next: (res) => {
        this.authService.setUser(res.user);
        this.router.navigate(['/dashboard']);
      }
    });
  }
  ```

### Pantalla: Recuperar Contraseña (Forgot Password)
- **Objetivo:** Solicitar reset de password.
- **Campos:** email.
- **Endpoint:** `POST /auth/forgot-password`
  - Body: `{ email }`
  - Response 200: `{ message: 'Si existe, recibirás email' }`
- **UX:** Mostrar mensaje genérico (seguridad).

### Pantalla: Reset Password
- **Objetivo:** Cambiar password con token.
- **Campos:** password, confirmPassword.
- **Endpoint:** `POST /auth/reset-password/:token`
  - Body: `{ password }`
  - Response 200: `{ message: 'Password actualizada' }`
- **UX:** Validar token en URL, redirigir a login tras éxito.

### Pantalla: Logout
- **Objetivo:** Cerrar sesión.
- **Endpoint:** `POST /auth/logout`
  - Headers: Cookie con token.
  - Response 200: `{ message: 'Sesión cerrada' }`
- **UX:** Limpiar estado local, redirigir a landing.

### Pantalla: Configuración de Cuenta (Settings)
- **Objetivo:** Editar perfil, cambiar password, gestionar sesiones.
- **Endpoints:**
  - `GET /api/user-settings` → Obtener configuración actual.
  - `PUT /api/user-settings` → Actualizar (username, preferences).
  - `POST /api/user-settings/reset` → Resetear configuración.
  - `POST /api/users/me/change-password` → Cambiar password (body: `{ currentPassword, newPassword }`).
- **UX:** Pestañas: Cuenta (editar username), Seguridad (cambiar password), Preferencias (tema, etc.), Sesiones (ver/cerrar).
- **Ejemplo Angular:**
  ```ts
  updateSettings(settings: any) {
    this.http.put('/api/user-settings', settings, { withCredentials: true }).subscribe();
  }
  ```

---

## 🏆 RANKINGS (Pantalla de Leaderboards)

### Pantalla: Rankings Globales
- **Objetivo:** Ver top jugadores por puntos.
- **Endpoint:** `GET /api/rankings`
  - Query: `?limit=20&offset=0`
  - Response: `{ rankings: [...], total }`
- **UX:** Lista paginada con posición, username, puntos, victorias/derrotas.

### Pantalla: Rankings por Período
- **Objetivo:** Ver rankings semanales/mensuales.
- **Endpoint:** `GET /api/rankings/period/:periodo` (ej: `2025-W45`)
- **UX:** Filtros por período.

### Pantalla: Mi Ranking
- **Objetivo:** Ver posición personal.
- **Endpoint:** `GET /api/rankings/me`
- **UX:** Mostrar stats personales + comparación global.

---

## 🛒 MARKETPLACE (Pantalla de Comercio P2P)

### Pantalla: Lista de Listings
- **Objetivo:** Ver items en venta.
- **Endpoint:** `GET /api/marketplace/listings`
  - Query: `?page=1&limit=10&search=&type=`
  - Response: `{ listings: [...], total }`
- **UX:** Grid con filtros, precios, vendedores.

### Pantalla: Crear Listing
- **Objetivo:** Poner item en venta.
- **Endpoint:** `POST /api/marketplace/listings`
  - Body: `{ itemId, precio, tipo }`
  - Response 201: `{ listing: {...} }`
- **UX:** Seleccionar item del inventario, setear precio.

### Pantalla: Comprar Item
- **Objetivo:** Adquirir item de otro usuario.
- **Endpoint:** `POST /api/marketplace/listings/:id/buy`
  - Response 200: `{ message: 'Compra exitosa' }`
- **UX:** Confirmación con costo, actualizar inventario.

### Pantalla: Cancelar Listing
- **Objetivo:** Quitar item de venta.
- **Endpoint:** `DELETE /api/marketplace/listings/:id`
- **UX:** Solo si eres el vendedor.

---

## 🔔 NOTIFICACIONES (Pantalla de Notificaciones)

### Pantalla: Lista de Notificaciones
- **Objetivo:** Ver notificaciones del usuario.
- **Endpoint:** `GET /api/notifications`
  - Query: `?page=1&limit=10`
  - Response: `{ notifications: [...], unreadCount }`
- **UX:** Lista con iconos, marcar como leídas.

### Pantalla: Marcar Leída
- **Endpoint:** `PUT /api/notifications/:id/read`
- **UX:** Actualizar contador.

### Pantalla: Marcar Todas Leídas
- **Endpoint:** `PUT /api/notifications/read-all`

### Pantalla: Eliminar Notificación
- **Endpoint:** `DELETE /api/notifications/:id`

---

## ⚙️ DASHBOARD Y PERFIL (Pantalla Principal Post-Login)

### Pantalla: Dashboard
- **Objetivo:** Centro de navegación con resumen.
- **Endpoints:**
  - `GET /api/users/me` → Datos usuario + inventario.
  - `GET /api/users/dashboard` → Resumen personalizado.
  - `GET /api/users/resources` → Recursos (VAL, boletos, etc.).
  - `GET /api/notifications/unread/count` → Contador notificaciones.
- **UX:** Tarjetas para Marketplace, Inventario, Rankings, Mazmorras. Topbar con recursos y notificaciones.
- **Ejemplo Angular:**
  ```ts
  loadDashboard() {
    this.http.get('/api/users/me', { withCredentials: true }).subscribe(user => this.user = user);
  }
  ```

### Pantalla: Perfil de Usuario
- **Objetivo:** Ver stats personales.
- **Endpoint:** `GET /api/users/me` (ya cubierto en dashboard).
- **UX:** Avatar, nivel, stats, personajes activos.

---

## 🏰 MAZMORRAS Y COMBATE (Pantalla de Juego)

### Pantalla: Lista de Mazmorras
- **Objetivo:** Elegir mazmorra para jugar.
- **Endpoint:** `GET /api/dungeons`
  - Response: `{ dungeons: [...] }`
- **UX:** Grid con dificultad, recompensas.

### Pantalla: Iniciar Mazmorra
- **Objetivo:** Comenzar combate.
- **Endpoint:** `POST /api/dungeons/:dungeonId/start`
  - Body: `{ teamId }`
  - Response 201: `{ sessionId, status: 'running' }`
- **UX:** Seleccionar equipo, confirmar.

### Pantalla: Progreso de Mazmorra
- **Endpoint:** `GET /api/dungeons/:dungeonId/progress`
- **UX:** Mostrar estado en tiempo real (WebSocket recomendado).

---

## 🛍️ TIENDA (Pantalla de Compras Directas)

### Pantalla: Info de Tienda
- **Endpoint:** `GET /api/shop/info`
- **UX:** Mostrar paquetes disponibles.

### Pantalla: Comprar EVO
- **Endpoint:** `POST /api/shop/buy-evo`
  - Body: `{ amount }`
- **UX:** Gastar VAL por EVO.

### Pantalla: Comprar VAL
- **Endpoint:** `POST /api/shop/buy-val`
  - Body: `{ packageId }`
- **UX:** Comprar paquetes de VAL.

### Pantalla: Comprar Boletos
- **Endpoint:** `POST /api/shop/buy-boletos`
  - Body: `{ amount? }` (opcional, por defecto 1)
- **UX:** Gastar 100 VAL por boleto extra. Máximo 10 boletos totales.
- **Validaciones:** Suficiente VAL, no exceder límite de boletos (10 totales).

---

## 📦 PAQUETES DE USUARIO (Pantalla de Mis Paquetes)

### Pantalla: Lista de Paquetes
- **Endpoint:** `GET /api/users/me/packages`
  - Response: `{ data: [...], total }`
- **UX:** Lista con status (owned/opened).

### Pantalla: Abrir Paquete (ya cubierto en secciones anteriores)
- **Endpoint:** `POST /api/user-packages/:id/open`

---

## 🎮 GESTIÓN DE PERSONAJES (Pantalla de Equipo)

### Pantalla: Agregar Personaje
- **Endpoint:** `POST /api/users/characters/add`
  - Body: `{ personajeId, rango }`
- **UX:** Seleccionar de gacha o tienda.

### Pantalla: Cambiar Activo
- **Endpoint:** `PUT /api/users/set-active-character/:personajeId`

### Pantalla: Curar Personaje
- **Endpoint:** `POST /api/characters/:characterId/heal`

### Pantalla: Revivir Personaje
- **Endpoint:** `POST /api/characters/:characterId/revive`

### Pantalla: Evolucionar Personaje
- **Endpoint:** `POST /api/characters/:characterId/evolve`

### Pantalla: Añadir Experiencia
- **Endpoint:** `POST /api/characters/:characterId/add-experience`
  - Body: `{ amount }`

### Pantalla: Equipar Item
- **Endpoint:** `POST /api/characters/:characterId/equip`
  - Body: `{ itemId }`

### Pantalla: Desequipar Item
- **Endpoint:** `POST /api/characters/:characterId/unequip`
  - Body: `{ slot }`

### Pantalla: Stats de Personaje
- **Endpoint:** `GET /api/characters/:characterId/stats`

---

## 📊 CONFIGURACIONES GLOBALES (Endpoints de Soporte)

### Pantalla: Configuraciones de Juego
- **Endpoint:** `GET /api/game-settings`

### Pantalla: Requisitos de Nivel
- **Endpoint:** `GET /api/level-requirements`

### Pantalla: Personajes Base
- **Endpoint:** `GET /api/base-characters`

### Pantalla: Items Disponibles
- **Endpoint:** `GET /api/items`

### Pantalla: Consumibles
- **Endpoint:** `GET /api/consumables`

### Pantalla: Equipamiento
- **Endpoint:** `GET /api/equipment`

### Pantalla: Categorías
- **Endpoint:** `GET /api/categories`

---

## 💳 PAGOS (Pantalla de Checkout)

### Pantalla: Iniciar Pago
- **Endpoint:** `POST /api/payments/checkout`
  - Body: `{ amount, currency, method }`

### Pantalla: Webhook de Pago
- **Endpoint:** `POST /api/payments/webhook` (backend interno)

---

## 📦 GESTIÓN DE PAQUETES (Admin/Usuario)

### Pantalla: Agregar Paquete (Admin)
- **Endpoint:** `POST /api/user-packages/agregar`

### Pantalla: Quitar Paquete
- **Endpoint:** `POST /api/user-packages/quitar`

### Pantalla: Enviar por Correo
- **Endpoint:** `POST /api/user-packages/por-correo`

### Pantalla: Ver Paquetes de Usuario
- **Endpoint:** `GET /api/user-packages/:userId`

---

Esta actualización completa la guía `Valnor-guia.md` con todas las pantallas y endpoints implementados, manteniendo la estructura paso a paso. Ahora es una referencia completa para el desarrollo frontend, con ejemplos de llamadas, UX y errores. Si necesitas más detalles en alguna sección o ejemplos de código adicionales, avísame.

---

## 📊 AUDITORÍA ECONÓMICA Y BALANCE DEL JUEGO

### 🎯 OBJETIVOS DE LA ECONOMÍA
- **Equilibrio**: Ganancias = Costos (break even en sesiones normales)
- **Progresión**: Dificultad creciente pero justa
- **Retención**: Recompensas satisfactorias sin abuso
- **Monetización**: VAL como moneda premium, EVO como recurso raro

### 💰 SISTEMA ECONÓMICO ACTUAL (PRE-BALANCE)

#### Recursos del Jugador
- **VAL**: Moneda principal (comprada con USDT)
- **EVO**: Cristales de evolución (raros, de mazmorras)
- **Boletos**: Para entrar a mazmorras (✅ implementado)
- **Boletos Diarios**: Recompensa diaria (máx 10)

#### Costos Actuales (BALANCEADOS)
- **Entrada Mazmorra**: ✅ 1 boleto por entrada
- **Curación**: ✅ 2 VAL = 10 HP (antes 1 VAL)
- **Revivir**: 50 VAL fijos
- **Evolución**: VAL + EVO variables por etapa/rango

#### Ganancias por Mazmorra
- **VAL**: Base + escalado por nivel de mazmorra
- **EXP**: Base + escalado + buffs de consumibles
- **Ítems**: Drop tables con probabilidades variables
- **Personajes Exclusivos**: A partir de nivel 20 de mazmorra

### ⚠️ PROBLEMAS ECONÓMICOS IDENTIFICADOS

#### 1. **Entrada Gratuita a Mazmorras**
- **Problema**: Jugadores pueden farmear infinitamente
- **Impacto**: Economía rota, abuso de drops
- **Solución**: Implementar costo de boletos

#### 2. **Curación Muy Barata**
- **Problema**: 1 VAL = 10 HP permite curar equipos grandes barato
- **Ejemplo**: Equipo de 9 personajes = 90 HP total, costo ~9 VAL
- **Impacto**: Combate sin riesgo económico
- **Solución**: Aumentar costo o implementar límite diario

#### 3. **Equipo Limitado a 3 Personajes**
- **Problema**: Solo 3 personajes reduce estrategia
- **Impacto**: Gameplay limitado, menos engagement
- **Solución**: Expandir a 9 personajes máximo

#### 4. **Ganancias sin Balance**
- **Problema**: Proporción VAL vs dificultad no estudiada
- **Impacto**: Posible pay-to-win o farming excesivo
- **Solución**: Análisis de ROI por sesión

### 🎮 PROPUESTAS DE BALANCE

#### Equipo: 3 → 9 Personajes
```typescript
// Cambiar en GameSettings
MAX_PERSONAJES_POR_EQUIPO: 9  // Antes: 3
```

#### Sistema de Boletos para Mazmorras
- **Costo**: 1 boleto por entrada
- **Regeneración**: 10 boletos diarios gratis
- **Compra**: 100 VAL = 1 boleto extra
- **Máximo**: 10 boletos totales

#### Curación Balanceada
- **Costo Base**: 2 VAL = 10 HP (antes 1)
- **Límite Diario**: Máximo 500 VAL en curaciones por día
- **Alternativa**: Hospital gratuito limitado (3 usos/día)

#### Sistema de Energía/Stamina
- **Energía**: 100 puntos base
- **Costo por Mazmorra**: 20-50 energía (según dificultad)
- **Regeneración**: 10/minuto, completa en 10 minutos
- **Compra**: 50 VAL = 50 energía extra

#### Sistema de Boletos
- **Uso**: 1 boleto por entrada a mazmorra
- **Regeneración**: 10 boletos diarios gratis
- **Compra**: 100 VAL = 1 boleto extra
- **Máximo**: 10 boletos totales
- **Diarios**: Hasta 10 boletos diarios adicionales

### 📊 ANÁLISIS DE GANANCIAS ESPERADAS

#### Sesión Típica (20 minutos)
- **Entrada**: 1 boleto (gratis diario)
- **Ganancias**:
  - VAL: 50-200 (según mazmorra)
  - EXP: 100-500 por personaje
  - Ítems: 0-3 drops (20% probabilidad cada uno)
- **Costos**:
  - Curación: 20-100 VAL (doble de antes)
  - Revivir: 0-150 VAL (si derrota)
- **ROI**: Break even o +50 VAL neto

#### Sesión Premium (con VAL)
- **Compra Boletos**: 100 VAL → 1 boleto extra
- **ROI**: Recuperar inversión en 2-3 mazmorras
- **Beneficio**: Más sesiones = más progreso

### 🎮 ANÁLISIS ECONÓMICO DETALLADO

#### 📈 **Sistema de Experiencia por Nivel**
```
Niveles 1-20:  100 × nivel = 100, 200, 300... (fácil inicio)
Niveles 21-40: 200 × nivel = 4,200, 8,400... (progresión media)
Niveles 41-60: 400 × nivel = 16,400, 24,800... (más desafiante)
Niveles 61-80: 800 × nivel = 48,800, 64,000... (difícil)
Niveles 81-100: 1600 × nivel = 129,600, 160,000... (endgame)
```

#### 💎 **Costos de Evolución (EVO)**
```
Etapa 2 (Común → Raro):
- D: 5 EVO   → 500 VAL (ó 5 sesiones premium)
- C: 8 EVO   → 800 VAL
- B: 10 EVO  → 1000 VAL
- A: 15 EVO  → 1500 VAL
- S: 20 EVO  → 2000 VAL
- SS: 30 EVO → 3000 VAL
- SSS: 50 EVO → 5000 VAL

Etapa 3 (Raro → Épico):
- D: 10 EVO  → 1000 VAL
- C: 15 EVO  → 1500 VAL
- B: 20 EVO  → 2000 VAL
- A: 30 EVO  → 3000 VAL
- S: 40 EVO  → 4000 VAL
- SS: 60 EVO → 6000 VAL
- SSS: 100 EVO → 10000 VAL
```

#### 🏆 **Recompensas de Mazmorras (escaladas)**
```
Mazmorra Nivel 1: 50 VAL base × 1.0 = 50 VAL
Mazmorra Nivel 2: 50 VAL base × 1.1 = 55 VAL (+10%)
Mazmorra Nivel 3: 50 VAL base × 1.2 = 60 VAL (+20%)
...
Mazmorra Nivel 10: 50 VAL base × 1.9 = 95 VAL (+90%)
```

#### 💰 **Balance Económico por Rango**
```
Personaje D (Común):
- Evolución completa: 15 EVO = 1500 VAL
- Tiempo estimado: 15 sesiones premium
- Valor real: Alto (raro en gacha)

Personaje SSS (Legendario):
- Evolución completa: 150 EVO = 15000 VAL
- Tiempo estimado: 150 sesiones premium
- Valor real: Muy alto (ultra raro)
```

### 🎯 CONCLUSIONES DEL ESTUDIO

#### ✅ **Aspectos Positivos**
- **Progresión balanceada**: Costos escalan con rareza
- **Monetización justa**: EVO accesible pero valioso
- **Retención**: Sistema de boletos previene farming infinito
- **Valor percibido**: Personajes raros tienen costo apropiado

#### ⚠️ **Áreas de Ajuste**
- **Boletos diarios**: Considerar aumentar regeneración (5→10 diarios)
- **Curación**: Evaluar si 2 VAL/10 HP es demasiado estricto
- **Recompensas**: Verificar si escalado +10% por nivel es suficiente
- **EVO farming**: Asegurar que drops de EVO sean consistentes

#### 📊 **Comparación con Juegos de Referencia**
```
Genshin Impact:
- Mora (moneda): Similar a VAL
- EXP: Progresión similar
- Materiales: Como EVO pero más complejos

Honkai Star Rail:
- Créditos: Moneda principal
- EXP: Similar escalado
- Materiales: Sistema de evolución comparable

Fire Emblem Heroes:
- Orbes: Moneda premium
- EXP: Más simple pero similar concepto
- Herofes: Sistema de invocación similar
```

### 🛠️ RECOMENDACIONES PARA FASE 2

1. **Aumentar boletos diarios**: 5 → 10 para mejor retención ✅ IMPLEMENTADO
2. **Implementar energía**: Sistema stamina para combate
3. **Ajustar curación**: Posible reducción a 1.5 VAL/10 HP
4. **Mejorar drops de EVO**: Asegurar consistencia en farming
5. **Testing extensivo**: Monitorear comportamiento real de usuarios

### 🛠️ IMPLEMENTACIÓN PASO A PASO

#### Fase 1: Cambios Básicos (Esta Semana) ✅ COMPLETADO
1. **Cambiar límite equipo**: 3 → 9 personajes ✅
2. **Implementar boletos**: Costo 1 boleto/entrada ✅
3. **Aumentar curación**: 1 → 2 VAL por 10 HP ✅
4. **Endpoint compra boletos**: 100 VAL = 1 boleto extra ✅

#### Fase 2: Sistema de Energía (Próxima Semana)
1. **Agregar energía al usuario**
2. **Implementar costo por mazmorra**
3. **Sistema de regeneración automática**

#### Fase 3: Balance Final (Semana Siguiente)
1. **Ajustar ganancias de mazmorras**
2. **Balancear probabilidades de drops**
3. **Testing extensivo de economía**

### 📊 MÉTRICAS A MONITOREAR

#### Economía
- **ARPDAU**: Average Revenue Per Daily Active User
- **Retention**: D1, D7, D30
- **Conversion**: % usuarios que compran VAL

#### Gameplay
- **Session Length**: Duración promedio de sesión
- **Win Rate**: % victorias por mazmorra
- **Churn Rate**: % usuarios que dejan de jugar

#### Balance
- **Level Up Rate**: Velocidad de subida de nivel
- **Resource Sink**: VAL gastado vs ganado
- **Drop Rates**: Probabilidades reales vs teóricas

### 🎯 REGLAS PARA DESARROLLADORES

#### ✅ HACER
- **Monitorear métricas diariamente**
- **A/B testing para cambios económicos**
- **Encuestas a jugadores sobre balance**
- **Logs detallados de transacciones**

#### ❌ EVITAR
- **Cambios económicos sin testing**
- **Nerfs sin compensación**
- **Buffs permanentes sin costo**
- **Features que rompan la economía**

### 📅 CRONOGRAMA

| Semana | Tarea | Estado |
|--------|-------|--------|
| Esta | ✅ Equipo 3→9 + Boletos básicos + Curación 2x + Análisis económico + Análisis de progresión | ✅ Completado |
| +1 | Sistema de energía | 📋 Planificado |
| +2 | Balance final + testing | 📋 Planificado |
| +3 | Monitoreo y ajustes | 📋 Planificado |

---

## ⚔️ SISTEMAS DE COMBATE FUTUROS (PLANIFICACIÓN)

### 🎯 OBJETIVOS ESTRATÉGICOS

El siguiente paso evolutivo de Valgame será implementar **sistemas de combate automático y competitivo** para aumentar la retención y engagement de jugadores. Estos sistemas permitirán:

- **Juego automático**: Los jugadores pueden "jugar" sin estar presentes físicamente
- **Competencia social**: PVP para comparar progreso con otros jugadores
- **Monetización avanzada**: Apuestas, torneos, y compras premium en combate

### 🤖 SISTEMA DE BATALLA AUTOMÁTICA

#### Concepto
Sistema que permite a los jugadores **enviar equipos a combatir automáticamente** mientras están offline, similar a los sistemas de "expedición" o "auto-battle" de juegos como Genshin Impact o Honkai Star Rail.

#### Mecánicas Principales
- **Envío de equipos**: El jugador selecciona equipo y lo envía a una mazmorra específica
- **Combate simulado**: El sistema calcula automáticamente el resultado basado en stats
- **Recompensas automáticas**: Drops y experiencia se otorgan al finalizar
- **Tiempo de ejecución**: 10-30 minutos por batalla
- **Riesgo**: Posibilidad de perder personajes (muerte permanente opcional)

#### Endpoints Requeridos
```typescript
// Enviar equipo a batalla automática
POST /api/combat/auto-battle/start
Body: {
  dungeonId: string,
  teamId: string,
  duration: number // minutos
}

// Ver estado de batalla automática
GET /api/combat/auto-battle/status/:battleId

// Cancelar batalla automática
DELETE /api/combat/auto-battle/:battleId

// Reclamar recompensas de batalla automática
POST /api/combat/auto-battle/:battleId/claim

// Lista de batallas activas del usuario
GET /api/combat/auto-battle/active
```

#### Trabajo de Desarrollo
1. **Backend**:
   - Nuevo modelo `AutoBattle` en MongoDB
   - Servicio de simulación de combate
   - Sistema de colas para procesar batallas
   - Integración con sistema de energía (consumo por batalla)
   - WebSocket para notificaciones de finalización

2. **Frontend**:
   - UI para seleccionar y enviar equipos
   - Pantalla de "batallas activas" con progreso
   - Animaciones de resultado de batalla
   - Notificaciones push cuando termine

3. **Base de Datos**:
   - Colección `auto_battles` con estado, tiempo inicio/fin, recompensas
   - Índices por `userId`, `status`, `endTime`

### ⚔️ SISTEMA PVP SIMULADO

#### Concepto
Sistema de **combate entre jugadores offline** donde los equipos luchan automáticamente en un entorno competitivo. Los resultados se calculan por ranking y matchmaking.

#### Mecánicas Principales
- **Cola de matchmaking**: Los jugadores ponen sus equipos en cola
- **Combate simulado**: Sistema calcula ganador basado en stats y estrategia
- **Sistema de ranking**: ELO o sistema de puntos similar a juegos MOBA
- **Recompensas por temporada**: Mejores posiciones ganan VAL, EVO, items raros
- **Modo casual**: Sin impacto en ranking principal

#### Endpoints Requeridos
```typescript
// Unirse a cola PVP
POST /api/pvp/queue/join
Body: {
  teamId: string,
  mode: 'ranked' | 'casual'
}

// Salir de cola PVP
DELETE /api/pvp/queue/leave

// Ver estado de matchmaking
GET /api/pvp/queue/status

// Historial de combates PVP
GET /api/pvp/history
Query: ?page=1&limit=20&season=?

// Estadísticas PVP del jugador
GET /api/pvp/stats

// Ranking global
GET /api/pvp/rankings
Query: ?page=1&limit=50&region=?
```

#### Trabajo de Desarrollo
1. **Backend**:
   - Sistema de matchmaking por ELO/ranking
   - Algoritmo de simulación de combate PVP
   - Temporadas con reset de ranking
   - Sistema de recompensas por temporada
   - Anti-cheat básico (detección de equipos desbalanceados)

2. **Frontend**:
   - Pantalla de cola con estimación de tiempo
   - Animaciones de combate (simuladas)
   - Pantalla de resultados con detalles
   - Sistema de rankings con posiciones
   - Perfil PVP con estadísticas

3. **Base de Datos**:
   - Colección `pvp_matches` con resultados, equipos, stats
   - Colección `pvp_rankings` con ELO, victorias/derrotas
   - Colección `pvp_seasons` para historial

### 🌐 SISTEMA PVP ONLINE REAL-TIME

#### Concepto
**Combate en tiempo real entre dos jugadores conectados**, con turnos simultáneos y estrategia en vivo. El sistema más avanzado y complejo.

#### Mecánicas Principales
- **Matchmaking en tiempo real**: Conexión P2P o servidor autoritativo
- **Turnos simultáneos**: Ambos jugadores eligen acciones al mismo tiempo
- **Sistema de habilidades**: Habilidades especiales con cooldown
- **Tiempo límite**: 30-60 segundos por turno
- **Espectadores**: Sistema de viewing para otros jugadores

#### Endpoints Requeridos
```typescript
// Buscar partida PVP online
POST /api/pvp/online/find-match
Body: {
  teamId: string,
  preferredRegion: string
}

// Cancelar búsqueda
DELETE /api/pvp/online/cancel-search

// Estado de partida actual
GET /api/pvp/online/current-match

// Enviar acción en turno
POST /api/pvp/online/action
Body: {
  action: 'attack' | 'skill' | 'defend',
  target: string,
  skillId?: string
}

// Conectar como espectador
POST /api/pvp/online/spectate/:matchId

// Lista de partidas en vivo
GET /api/pvp/online/live-matches
```

#### WebSocket Events
```typescript
// Eventos del servidor
{
  type: 'MATCH_FOUND',
  opponent: { username, avatar, ranking },
  matchId: string
}

{
  type: 'TURN_START',
  timeLeft: 30,
  playerState: {...},
  opponentState: {...}
}

{
  type: 'TURN_END',
  actions: [...],
  damage: [...],
  winner?: string
}
```

#### Trabajo de Desarrollo
1. **Backend**:
   - Servidor WebSocket dedicado para combate
   - Sistema de matchmaking geográfico
   - Motor de combate en tiempo real
   - Anti-cheat avanzado (detección de lag switching, etc.)
   - Sistema de reportes y moderación

2. **Frontend**:
   - UI de combate en tiempo real con animaciones
   - Sistema de chat durante partida
   - Replays de partidas
   - Sistema de amigos para desafíos directos

3. **Infraestructura**:
   - Servidores dedicados para regiones
   - CDN para assets de combate
   - Sistema de logging extensivo
   - Monitoreo de latencia y desconexiones

### 📋 PLAN DE IMPLEMENTACIÓN

#### Fase 1: Batalla Automática (1-2 meses)
- Desarrollo backend básico
- Sistema de simulación simple
- Integración con energía
- Testing básico

#### Fase 2: PVP Simulado (2-3 meses)
- Sistema de ranking
- Matchmaking offline
- Temporadas y recompensas
- UI completa

#### Fase 3: PVP Online (3-6 meses)
- Infraestructura WebSocket
- Motor de combate real-time
- Sistema anti-cheat
- Testing masivo

### 🎯 BENEFICIOS ESPERADOS

- **Retención**: Jugadores regresan para ver resultados de batallas automáticas
- **Engagement**: Competencia social aumenta tiempo de juego
- **Monetización**: Compras para acelerar batallas, mejorar ranking, items PVP
- **Comunidad**: Sistema social alrededor del competitivo

### ⚠️ RIESGOS Y CONSIDERACIONES

- **Complejidad técnica**: Especialmente el PVP online
- **Balance**: Dificultad de balancear combate automático vs manual
- **Servidores**: Costos de infraestructura para real-time
- **Moderación**: Necesidad de sistema anti-toxicity y reports

---

**Última actualización:** 19 de noviembre de 2025  
**Estado:** 📈 Análisis de Progresión Completo

