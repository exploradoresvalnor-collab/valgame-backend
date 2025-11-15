# Pruebas y diagnóstico CORS para valgame-backend

Este documento recopila los comandos y pasos que usamos para depurar problemas de CORS en producción (Render) y en desarrollo (localhost). Incluye las pruebas `OPTIONS` (preflight), `POST` con el header `Origin`, ejemplos para `curl`, y acciones concretas a tomar en Render y en tu frontend.

---

## Resumen rápido

- El backend ya soporta múltiples orígenes mediante la variable de entorno `FRONTEND_ORIGIN`.
- El servidor devolvía correctamente los headers CORS para el origen de Netlify, pero rechazaba el origen `http://localhost:4200` (error JSON: `{"ok":false,"error":"No permitido por CORS"}`).
- Causa más probable: la variable `FRONTEND_ORIGIN` no contenía el protocolo `http://` para `localhost:4200`, o el servicio no se reinició después del cambio.

---

## Comprobaciones que ejecutamos (curl)

> Nota: reemplaza `https://valgame-backend.onrender.com` por tu URL si es diferente.

1) Preflight OPTIONS — origen localhost

```bash
curl -i -X OPTIONS "https://valgame-backend.onrender.com/auth/register" \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" -v
```

- Qué busca: verificar si el servidor responde con `Access-Control-Allow-Origin: http://localhost:4200` y otros headers relevantes.
- Resultado observado: el servidor devolvía `500` con body `{ "ok": false, "error": "No permitido por CORS" }` (indica que el middleware CORS rechazó ese Origin).

2) Preflight OPTIONS — origen Netlify

```bash
curl -i -X OPTIONS "https://valgame-backend.onrender.com/auth/register" \
  -H "Origin: https://cool-faloodeh-b39ece.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

- Resultado esperado/observado: `HTTP/1.1 204 No Content` y cabeceras:
  - `access-control-allow-origin: https://cool-faloodeh-b39ece.netlify.app`
  - `access-control-allow-credentials: true`
  - `access-control-allow-headers: Content-Type`
  - `access-control-allow-methods: GET,HEAD,PUT,PATCH,POST,DELETE`

3) POST con Origin — localhost

```bash
curl -i -X POST "https://valgame-backend.onrender.com/auth/register" \
  -H "Origin: http://localhost:4200" \
  -H "Content-Type: application/json" \
  -d '{"email":"prueba2@ejemplo.com","username":"prueba2","password":"123456"}'
```

- Resultado observado: respuesta JSON con `{"ok":false,"error":"No permitido por CORS"}` o fallo del preflight; el navegador bloquea.

4) POST con Origin — Netlify

```bash
curl -i -X POST "https://valgame-backend.onrender.com/auth/register" \
  -H "Origin: https://cool-faloodeh-b39ece.netlify.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"prueba-net@ejemplo.com","username":"pruebanet","password":"123456"}'
```

- Resultado observado: la petición funcionó (preflight 204 y POST aceptado/ejecutado por el backend).

5) Login directo (sin Origin) — ejemplo para probar la respuesta JSON del backend

```bash
curl -i -X POST https://valgame-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prueba1@ejemplo.com", "password":"123456"}'
```

- Resultado observado (ejemplo): `{"error":"Debes verificar tu cuenta antes de iniciar sesión."}`

---

## Interpretación de headers CORS importantes

- `Access-Control-Allow-Origin` — debe coincidir exactamente con el `Origin` enviado por el navegador. Si envías `http://localhost:4200` la respuesta debe contener exactamente `http://localhost:4200`.
- `Access-Control-Allow-Credentials: true` — necesario si usas cookies httpOnly (tu backend las usa).
- `Access-Control-Allow-Headers` — debe incluir `Content-Type` si envías JSON.
- `Access-Control-Allow-Methods` — debe incluir `POST` para registrar/login.

Si alguno falta, el navegador bloqueará la petición (preflight fallido o petición real bloqueada).

---

## Pasos recomendados para corregir (Render)

1. En la sección Environment de Render, confirma el valor exacto de `FRONTEND_ORIGIN`. Debe incluir protocolos explícitos:

```
http://localhost:4200,https://cool-faloodeh-b39ece.netlify.app
```

2. Guarda cambios y reinicia manualmente el servicio (Deploy → Manual Deploy o Restart). El servidor necesita recargar variables de entorno.

3. Tras reinicio, prueba de nuevo la preflight para localhost (ver comandos arriba). Ahora deberías ver `access-control-allow-origin: http://localhost:4200`.

4. Revisa logs en Render si aún falla: busca mensajes del middleware CORS o `No permitido por CORS`.

---

## Alternativa temporal y práctica para desarrollo (Angular proxy)

Si no quieres depender de CORS mientras debuggeas localmente, usa el proxy de Angular:

`proxy.conf.json` (en el proyecto frontend):

```json
{
  "/auth": {
    "target": "https://valgame-backend.onrender.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/api": {
    "target": "https://valgame-backend.onrender.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Inicia Angular con:

```bash
ng serve --proxy-config proxy.conf.json
```

Con esto las llamadas del frontend local se proxean al backend remoto desde el mismo origen (evita CORS durante desarrollo).

---

## Logs útiles a inspeccionar (Render)

- Logs HTTP/Access: busca la petición que vino con `Origin: http://localhost:4200` y el motivo del rechazo.
- Mensajes del startup: confirma que `FRONTEND_ORIGIN` se registró o que no hay errores al arrancar.

---

## Diagnóstico adicional (si persiste el problema)

1. Comprueba exactamente qué `Origin` envía el navegador: abre DevTools → pestaña Network → selecciona la petición → Header `Origin`.
2. Verifica que la cadena esté incluida en `FRONTEND_ORIGIN` exactamente igual (protocolo, host, puerto).
3. Si el origen coincide y el servidor sigue rechazando, añade temporalmente en el backend un log en la función `origin` del middleware CORS para imprimir el valor recibido y la lista `allowedOrigins`. Ejemplo de log (temporal):

```ts
origin: function (origin: string | undefined, callback) {
  console.log('[CORS DEBUG] origin:', origin);
  console.log('[CORS DEBUG] allowedOrigins:', allowedOrigins);
  // ...existing logic...
}
```

4. Evita dejar esos logs en producción por mucho tiempo.

---

## Resumen de comandos listos para copiar

- OPTIONS preflight (localhost):

```bash
curl -i -X OPTIONS "https://valgame-backend.onrender.com/auth/register" \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" -v
```

- OPTIONS preflight (Netlify):

```bash
curl -i -X OPTIONS "https://valgame-backend.onrender.com/auth/register" \
  -H "Origin: https://cool-faloodeh-b39ece.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" -v
```

- POST con Origin (localhost):

```bash
curl -i -X POST "https://valgame-backend.onrender.com/auth/register" \
  -H "Origin: http://localhost:4200" \
  -H "Content-Type: application/json" \
  -d '{"email":"prueba2@ejemplo.com","username":"prueba2","password":"123456"}'
```

- POST con Origin (Netlify):

```bash
curl -i -X POST "https://valgame-backend.onrender.com/auth/register" \
  -H "Origin: https://cool-faloodeh-b39ece.netlify.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"prueba-net@ejemplo.com","username":"pruebanet","password":"123456"}'
```

- Login (sin Origin — para ver respuesta JSON):

```bash
curl -i -X POST https://valgame-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prueba1@ejemplo.com", "password":"123456"}'
```

---

## Próximos pasos sugeridos

- Reinicia el servicio en Render tras confirmar `FRONTEND_ORIGIN` con protocolos.
- Ejecuta la preflight para `http://localhost:4200` (comando más arriba) y copia la salida si sigues viendo rechazo; la revisaré contigo.
- Si quieres, puedo preparar el pequeño patch temporal para loguear el `origin` recibido por el middleware CORS (lo añadimos solo unos minutos y luego lo revertimos).

---

Si quieres que además cree un pequeño script bash que ejecute automáticamente las 4 comprobaciones (OPTIONS/POST para localhost y Netlify) y guarde la salida en `logs/cors_check.txt`, dime y lo creo aquí mismo.

---

Archivo generado: `docs/CORS_TESTING.md` (en la raíz `docs/`).
