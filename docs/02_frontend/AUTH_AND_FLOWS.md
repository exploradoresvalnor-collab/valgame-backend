# Autenticación y Flujos (Frontend)

## Resumen
- Base URL: `API_URL` (ej: `http://localhost:8080/api`)
- Header: `Authorization: Bearer <jwt>` para endpoints que requieren auth.
- Cookies: si se habilita cookie HttpOnly, el token también puede viajar por cookie (consultar backend actual).

## Registro y Verificación
1) POST `/auth/register`
   - Body: `{ email, password, username }`
   - Respuesta 200: usuario creado y correo de verificación enviado.
2) GET `/auth/verify/:token`
   - Abre el enlace enviado por email. Si es SPA, redirige y pega el resultado.

## Login / Logout
- POST `/auth/login` → `{ email, password }` → `{ token, user }`
- Guardar `token` en memoria/secure storage.
- POST `/auth/logout` (auth) invalida sesión en backend si aplica.

## Reset Password
- POST `/auth/forgot-password` → envía email con token
- GET `/auth/reset-password/validate/:token` → valida token
- POST `/auth/reset-password/:token` → setea nueva contraseña

## En cada request autenticada
- Header: `Authorization: Bearer <token>`
- Manejo de 401/403: renovar sesión o redirigir a login.

## Socket.IO (Realtime)
- Endpoint: `${API_URL.replace('/api','')}/socket.io`
- Autenticación: enviar token en `auth: { token }` al conectar.
- Reintentos: habilitar backoff exponencial.

Ejemplo (TypeScript):
```ts
import { io } from 'socket.io-client';

const socket = io(BASE_URL, {
  path: '/socket.io',
  transports: ['websocket'],
  auth: { token: jwt },
  reconnection: true,
  reconnectionAttempts: 5,
});

socket.on('connect', () => console.log('WS conectado'));
```

## Estados del Usuario
- GET `/users/me` para perfilar usuario al iniciar.
- GET `/users/resources` para recursos (val, evo, boletos, energía).

## Seguridad
- CORS: frontend domain en `FRONTEND_ORIGIN`.
- JWT: caducidad y refresco (si aplica). Mientras, forzar relogin al caducar.

## Tienda / Paquetes: Apertura de paquete

Endpoint recomendado para UX simple (abre el siguiente paquete pendiente del usuario sin especificar id).

- Método: `POST`
- Path: `/user-packages/open` (prefijo `/api` según tu `API_URL`)
- Auth: `Authorization: Bearer <token>`
- Body: vacío

Respuesta 200 (ejemplo):
```json
{
   "ok": true,
   "assigned": {
      "userPackageId": "upkg_123",
      "paqueteId": "pkg_basic_01",
      "openedAt": "2025-12-01T22:00:00.000Z"
   },
   "summary": {
      "charactersReceived": 1,
      "itemsReceived": 2,
      "consumablesReceived": 1,
      "valReceived": 0,
      "totalCharacters": 3,
      "totalItems": 14,
      "totalConsumables": 5,
      "valBalance": 1200
   },
   "inventory": {
      "equipamientoNuevos": ["itm_eq_001"],
      "consumiblesNuevos": [{ "consumableId": "cons_001", "usos_restantes": 3 }]
   }
}
```

Notas importantes:
- Consumibles: se agregan en `inventarioConsumibles` con `consumableId` y `usos_restantes` por instancia.
- Equipamiento: se agrega en `inventarioEquipamiento`.
- Idempotencia: no reintentes ciegamente; el backend usa un lock por paquete. Si hubo contención, devuelve 409.
- UI: tras abrir, refresca `GET /users/me` y/o `GET /inventory` para reflejar inventario actualizado.

Ejemplo con Fetch:
```ts
const res = await fetch(`${API_URL}/user-packages/open`, {
   method: 'POST',
   headers: { Authorization: `Bearer ${jwt}` },
});
if (!res.ok) throw await res.json();
const data = await res.json();
// Actualiza stores: balance, inventario y toasts de recompensa
```

Ejemplo con Axios:
```ts
import axios from 'axios';

const { data } = await axios.post(`${API_URL}/user-packages/open`, null, {
   headers: { Authorization: `Bearer ${jwt}` },
});
```

Posibles errores:
- 401: falta/expiró el token.
- 404: no hay paquetes pendientes para abrir.
- 409: contención de lock (otro proceso ya lo abrió). Reintentar tras breve delay.
- 429: respeta rate limit (ver `ERRORS_AND_LIMITS.md`).

### Conceptos: Tienda vs Paquetes del Usuario
- Tienda: catálogo de paquetes disponibles para comprar (`GET /shop/packages`, `POST /shop/purchase`).
- Paquetes del Usuario: paquetes ya acreditados al usuario tras la compra (`GET /user-packages/:userId`, `POST /user-packages/open`).
- El flujo típico es: Comprar en Tienda → esperar `payments:status=confirmed` → aparece un `UserPackage` → Abrir paquete(s) → refrescar inventario.
