# 🔌 Configuración de Conexión Backend - Frontend

## 🚨 **INFORMACIÓN CRÍTICA - LEER PRIMERO**

### ✅ **URLs Correctas del Backend**

```typescript
// ✅ DESARROLLO LOCAL
http://localhost:8080

// ✅ PRODUCCIÓN
https://valgame-backend.onrender.com

// ❌ NUNCA USES ESTAS:
http://127.0.0.1:8080  ❌ (Usa localhost)
```

---

### 🛣️ **Rutas de la API (CON prefijo /api/ para rutas protegidas)**

**Rutas públicas** (sin autenticación): rutas directas sin `/api/`  
**Rutas protegidas** (requieren JWT): usan prefijo `/api/`

```typescript
// ✅ CORRECTO - Rutas públicas
/auth/register
/auth/login
/auth/logout
/auth/verify/:token
/auth/forgot-password
/auth/reset-password/:token
/health

// ✅ CORRECTO - Rutas protegidas (requieren auth)
/api/users/me
/api/users/profile/:userId
/api/marketplace/list
/api/characters/:id/use-consumable

// ❌ INCORRECTO - NO uses rutas sin /api/ para endpoints protegidos
/users/me  ❌
/marketplace/list  ❌
```

---

### ⚙️ **Configuración Rápida - Hook useAuth (React)**

```tsx
// hooks/useAuth.ts
import { useCallback } from 'react';

// ✅ URL base usando localhost (NO 127.0.0.1)
const API_URL = 'http://localhost:8080';

export function useAuth() {
  const register = useCallback(async (data: { email: string; username: string; password: string }) => {
    // ✅ Ruta pública sin /api/
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // ⚠️ OBLIGATORIO para cookies
      body: JSON.stringify(data)
    });
    return response.json();
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    return response.json();
  }, []);

  const getCurrentUser = useCallback(async () => {
    // ✅ CORRECTO: ruta protegida con /api/
    const response = await fetch(`${API_URL}/api/users/me`, {
      credentials: 'include'
    });
    return response.json();
  }, []);

  // ❌ INCORRECTO:
  // const getCurrentUser = () => fetch(`${API_URL}/auth/me`);  ❌

  return { register, login, getCurrentUser };
}
```

---

### 🔍 **Verificar que el Backend está Corriendo**

**Antes de probar el frontend**, verifica:

```bash
# 1. Iniciar el backend
cd valgame-backend
npm start

# 2. Verificar en otra terminal
curl http://localhost:8080/health

# ✅ Debe responder:
{"ok":true}
```

---

### ❌ **Errores Comunes y Soluciones**

| Error | Causa | Solución |
|-------|-------|----------|
| `ERR_CONNECTION_REFUSED` | Backend NO está corriendo | `npm start` en valgame-backend |
| `127.0.0.1:8080` en logs | URL incorrecta | Cambiar a `localhost:8080` |
| `404 Not Found` | Ruta sin `/api/` para endpoints protegidos | Agregar prefijo `/api/` a rutas protegidas |
| `/users/me` falla | Falta `/api/` en ruta protegida | Usar `/api/users/me` |
| Status `0` | Backend detenido o CORS | Verificar backend con `/health` |

---

## 📋 Índice

1. [Desarrollo Local](#desarrollo-local)
2. [Producción](#producción)
3. [Variables de Entorno](#variables-de-entorno)
4. [Método Proxy (Recomendado)](#método-proxy-recomendado)
5. [Troubleshooting](#troubleshooting)

---

## 🏠 Desarrollo Local

### Backend Local

**URL**: `http://localhost:8080`

**Iniciar Backend:**
```bash
cd valgame-backend
npm start
```

**Verificar que está corriendo:**
```bash
curl http://localhost:8080/health
```

**Respuesta esperada:**
```json
{"ok": true}
```

---

## 🌐 Producción

### Backend en Render

**URL**: `https://valgame-backend.onrender.com`

**Verificar que está corriendo:**
```bash
curl https://valgame-backend.onrender.com/health
```

**⚠️ Nota**: El backend en Render (plan gratuito) se duerme después de 15 minutos de inactividad. La primera petición puede tardar 30-60 segundos.

---

## ⚙️ Variables de Entorno (Método Recomendado)

### Paso 1: Crear archivos de entorno

**Archivo**: `src/environments/environment.ts` (Desarrollo)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080'
};
```

---

**Archivo**: `.env.production` (Producción)

```env
VITE_API_URL=https://valgame-backend.onrender.com
VITE_WS_URL=wss://valgame-backend.onrender.com
```

---

### Paso 2: Configurar vite.config.ts

**Archivo**: `vite.config.ts`

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Disponible en import.meta.env.VITE_*
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
    },
    server: {
      port: 5173,
      // Proxy solo para desarrollo
      proxy: mode === 'development' ? {
        '/auth': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      } : undefined,
    },
  };
});
```

---

### Paso 3: Usar en tus hooks (React)

**Archivo**: `src/hooks/useAuth.ts`

```tsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useAuth() {
  const register = async (data: { email: string; username: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return response.json();
  };

  const login = async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    return response.json();
  };

  const logout = async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return response.json();
  };

  const verifyEmail = async (token: string) => {
    const response = await fetch(`${API_URL}/auth/verify/${token}`, {
      credentials: 'include'
    });
    return response.json();
  };

  const forgotPassword = async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    });
    return response.json();
  };

  const resetPassword = async (token: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password })
    });
    return response.json();
  };

  const validateResetToken = async (token: string) => {
    const response = await fetch(`${API_URL}/auth/reset-password/validate/${token}`, {
      credentials: 'include'
    });
    return response.json();
  };

  const restoreSession = async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include'
    });
    return response.json();
  };

  return {
    register, login, logout, verifyEmail,
    forgotPassword, resetPassword, validateResetToken, restoreSession
  };
}
```

---

### Paso 4: Comandos para correr (Vite)

**Desarrollo (usa .env - localhost):**
```bash
npm run dev
# o
yarn dev
```

**Producción (usa .env.production - Render):**
```bash
npm run build
npm run preview
```

---

## 🔀 Método Proxy (Recomendado para Desarrollo)

### Ventajas
- ✅ No necesitas cambiar URLs entre entornos
- ✅ Evita problemas de CORS en desarrollo
- ✅ Configuración más limpia
- ✅ Rutas relativas en el código

---

### Paso 1: Crear proxy.conf.json

**Archivo**: `proxy.conf.json` (en la raíz del proyecto frontend)

```json
{
  "/auth": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/socket.io": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "ws": true
  }
}
```

**Explicación:**
- `target`: URL del backend local
- `secure`: false para HTTP (true para HTTPS)
- `changeOrigin`: true para evitar problemas de CORS
- `logLevel`: "debug" para ver logs en consola
- `ws`: true para WebSockets

---

### Paso 2: Configurar vite.config.ts

**Archivo**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true, // Importante para WebSockets
      },
    },
  },
});
```

---

### Paso 3: Hook con proxy (rutas relativas) - React

**Archivo**: `src/hooks/useAuth.ts`

```tsx
// ✅ Sin URL base - usa proxy de Vite
export function useAuth() {
  const register = async (data: { email: string; username: string; password: string }) => {
    // ✅ Ruta relativa - proxy redirige a localhost:8080
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return response.json();
  };

  const login = async (credentials: { email: string; password: string }) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    return response.json();
  };

  const logout = async () => {
    const response = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    return response.json();
  };

  return { register, login, logout };
}
```

---

### Paso 4: Iniciar servidor (Vite)

```bash
npm run dev
```

**Consola mostrará:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Proxy:   /auth, /api → http://localhost:8080
```

---

### Para Producción (sin proxy)

Cuando hagas build para producción, Vite NO usa el proxy. Debes configurar la URL completa:

**Opción A: Variable de entorno (.env.production)**

```env
# .env.production
VITE_API_URL=https://valgame-backend.onrender.com
```

```tsx
// src/hooks/useAuth.ts
const API_URL = import.meta.env.VITE_API_URL || '';

export function useAuth() {
  const register = async (data: any) => {
    const url = `${API_URL}/auth/register`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return response.json();
  };
  
  // ... otros métodos
}
```

**Opción B: Detección de entorno en runtime**

```tsx
// src/config/api.ts
const isDev = import.meta.env.DEV;
export const API_URL = isDev ? '' : 'https://valgame-backend.onrender.com';

// src/hooks/useAuth.ts
import { API_URL } from '../config/api';

export function useAuth() {
  const register = async (data: any) => {
    const url = `${API_URL}/auth/register`;
    return this.http.post(url, data, { withCredentials: true });
  }
}
```

---

## 🔧 Hook useApi (Importante)

Para que las cookies funcionen, creamos un hook centralizado que agregue `credentials: 'include'` a TODAS las peticiones.

**Archivo**: `src/hooks/useApi.ts`

```typescript
import { useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useApi() {
  // Función base que siempre incluye credentials
  const fetchWithCredentials = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const url = `${API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // ✅ Siempre envía cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }, []);

  const get = useCallback((endpoint: string) => 
    fetchWithCredentials(endpoint), [fetchWithCredentials]);

  const post = useCallback((endpoint: string, data: unknown) => 
    fetchWithCredentials(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }), [fetchWithCredentials]);

  const put = useCallback((endpoint: string, data: unknown) => 
    fetchWithCredentials(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }), [fetchWithCredentials]);

  const del = useCallback((endpoint: string) => 
    fetchWithCredentials(endpoint, { method: 'DELETE' }), [fetchWithCredentials]);

  return { get, post, put, del, fetchWithCredentials };
}
```

---

**Usar en cualquier componente o hook:**

```tsx
// Ejemplo de uso en un componente
import { useApi } from '../hooks/useApi';

function MyComponent() {
  const { post, get } = useApi();

  const handleLogin = async (credentials: LoginData) => {
    const result = await post('/auth/login', credentials);
    // Cookie se guarda automáticamente
    console.log('Login exitoso:', result);
  };

  return <button onClick={() => handleLogin({ email, password })}>Login</button>;
}
```

---

## 📊 Comparación de Métodos

| Método | Ventajas | Desventajas | Recomendado Para |
|--------|----------|-------------|------------------|
| **Variables de Entorno** | Simple, explícito | Cambiar entre entornos manualmente | Proyectos pequeños |
| **Proxy** | Sin CORS, rutas relativas, automático | Solo funciona en desarrollo | Desarrollo activo |
| **Interceptor** | Centralizado, automático | Configuración inicial | Todos los proyectos |

---

## 🚀 Configuración Completa Recomendada

### 1. Desarrollo Local

```bash
# Terminal 1: Backend
cd valgame-backend
npm start

# Terminal 2: Frontend (Vite)
cd valgame-frontend
npm run dev
```

**Configuración:**
- ✅ Proxy: `vite.config.ts` → `http://localhost:8080`
- ✅ Hook useApi: `credentials: 'include'` para cookies
- ✅ Rutas relativas en hooks (`/auth/register`)

---

### 2. Build Producción

```bash
npm run build
```

**Configuración:**
- ✅ Environment: `VITE_API_URL` → `https://valgame-backend.onrender.com`
- ✅ URLs absolutas desde variable de entorno
- ✅ Hook useApi sigue funcionando

---

## 🛠️ Troubleshooting

### ❌ Error: "ERR_CONNECTION_REFUSED" (Más Común)

**Logs en Consola:**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
http://127.0.0.1:8080/auth/register:1
HttpErrorResponse: Http failure response for http://127.0.0.1:8080/auth/register: 0 Unknown Error
status: 0
```

**Causas Posibles:**

1. **Backend NO está corriendo** (Más común)
2. **URL incorrecta** (`127.0.0.1` en lugar de `localhost`)
3. **Puerto incorrecto** (no es 8080)

**Solución Paso a Paso:**

```bash
# 1. Verificar si algo está en el puerto 8080
netstat -ano | findstr :8080

# Si no hay resultados, el backend NO está corriendo

# 2. Iniciar el backend
cd valgame-backend
npm start

# Deberías ver:
# [API] Servidor corriendo en http://localhost:8080

# 3. Verificar que responde
curl http://localhost:8080/health

# ✅ Debe responder:
{"ok":true}

# 4. Si sigue fallando, cambiar URL en frontend:
# De: http://127.0.0.1:8080
# A:  http://localhost:8080
```

---

### ❌ Error: "404 Not Found" con `/api/`

**Logs en Consola:**
```
GET http://localhost:8080/api/users/me 404 (Not Found)
POST http://localhost:8080/api/auth/register 404 (Not Found)
```

**Causa**: El backend **NO tiene** rutas con prefijo `/api/`.

**Solución**:
```typescript
// ❌ INCORRECTO
const apiUrl = 'http://localhost:8080/api';
await fetch(`${apiUrl}/users/me`);  // → /api/users/me ❌

// ✅ CORRECTO
const apiUrl = 'http://localhost:8080';
await fetch(`${apiUrl}/auth/me`, { credentials: 'include' });  // → /auth/me ✅
```

---

## 📝 Checklist Final

### Desarrollo Local

**Backend:**
- [ ] Backend corriendo: `npm start` en valgame-backend
- [ ] Verificar con: `curl http://localhost:8080/health`
- [ ] Respuesta: `{"ok":true}`
- [ ] Ver en logs: `[API] Servidor corriendo en http://localhost:8080`
- [ ] Ver en logs: `[CORS] ⚠️ PERMITIENDO TODAS LAS CONEXIONES`

**Frontend - Configuración:**
- [ ] URL es `http://localhost:8080` (NO `127.0.0.1`)
- [ ] **NO usar** prefijo `/api/` en las rutas
- [ ] Rutas correctas: `/auth/login`, `/auth/register`, `/auth/me`
- [ ] `credentials: 'include'` en TODAS las peticiones fetch
- [ ] `vite.config.ts` configurado con proxy (si usas proxy)
- [ ] Hook `useApi` centralizado para todas las peticiones

**Frontend - Verificación:**
- [ ] `npm run dev` inicia sin errores (Vite)
- [ ] Abrir DevTools → Network → Ver peticiones a `/auth/*`
- [ ] Status debe ser `200`, `201`, `400`, etc. (NO `0` ni `404`)
- [ ] No ver errores `ERR_CONNECTION_REFUSED`
- [ ] No ver errores con `/api/users/me` (ruta incorrecta)

### Producción

**Backend:**
- [ ] Backend en Render responde: `curl https://valgame-backend.onrender.com/health`
- [ ] Respuesta: `{"ok":true}`
- [ ] Primera petición puede tardar 30-60s (backend despierta)

**Frontend:**
- [ ] `.env.production` con: `VITE_API_URL=https://valgame-backend.onrender.com`
- [ ] Hooks usan `import.meta.env.VITE_API_URL`
- [ ] Build con: `npm run build`
- [ ] CORS configurado en backend con dominio del frontend
- [ ] No usar proxy en producción (solo desarrollo)
- [ ] Rutas siguen siendo `/auth/*` (sin `/api/`)

---

### ❌ Error: CORS

**Causa**: El backend no permite tu origen.

**Solución**:
```typescript
// Backend: src/app.ts
app.use(cors({
  origin: ['http://localhost:5173', 'https://tu-frontend.com'],
  credentials: true
}));
```

**Verificar en el backend:**
```bash
# Deberías ver al iniciar:
[CORS] ⚠️ PERMITIENDO TODAS LAS CONEXIONES DESDE CUALQUIER ORIGEN
```

---

### ❌ Error: "Connection timeout"

**Causa**: Backend dormido (Render plan gratuito).

**Solución**: Espera 30-60 segundos en la primera petición.

---

### ❌ Error: "429 Too Many Requests"

**Logs en Consola:**
```
POST http://localhost:8080/auth/register 429 (Too Many Requests)
{"ok":false,"error":"Demasiadas peticiones"}
```

**Causa**: Rate limiter bloqueó tu IP (50 intentos en 15 minutos).

**Solución**:
```bash
# Opción 1: Esperar 15 minutos
# (No hagas más peticiones)

# Opción 2: Usar backend local
# (IPs locales NO tienen límite)
cd valgame-backend
npm start

# Opción 3: Modo incógnito
# (Nueva sesión = nueva IP aparente)
```

**Límites Configurados:**
- Auth endpoints: 50 peticiones / 15 minutos
- API general: 300 peticiones / 15 minutos
- IPs locales (127.0.0.1, ::1, 192.168.*): Sin límite

---

### ❌ Cookies no se guardan

**Causa**: Falta `credentials: 'include'`.

**Verificar en DevTools:**
```
Application → Cookies → http://localhost:5173
```

**Solución**:
```typescript
// ✅ Opción 1: En cada petición
const response = await fetch('/auth/login', {
  method: 'POST',
  credentials: 'include', // ✅ Importante
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// ✅ Opción 2: Hook useApi centralizado (mejor)
// Ver sección "Hook useApi" arriba
```

**Verificar en el backend:**
```typescript
// Backend debe tener:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true  // ⚠️ OBLIGATORIO
}));
```

---

### ❌ Proxy no funciona

**Causa**: Vite no cargó la configuración de proxy.

**Solución**:
```bash
# 1. Detener servidor
Ctrl + C

# 2. Verificar vite.config.ts tiene la sección proxy
cat vite.config.ts

# Debe tener:
# server: {
#   proxy: {
#     '/auth': 'http://localhost:8080',
#     '/api': 'http://localhost:8080'
#   }
# }

# 3. Reiniciar Vite
npm run dev

# 4. Verificar logs (debe mostrar puerto 5173)
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### ❌ Error: Status 0 (Unknown Error)

**Logs en Consola:**
```
HttpErrorResponse {
  status: 0,
  statusText: "Unknown Error",
  url: "http://localhost:8080/auth/register"
}
```

**Causas Posibles:**
1. Backend NO está corriendo
2. CORS mal configurado
3. URL incorrecta
4. Red bloqueada/firewall

**Diagnóstico:**
```bash
# 1. Verificar backend
curl http://localhost:8080/health

# Si falla → backend NO está corriendo
# Si funciona → revisar CORS

# 2. Verificar CORS en backend
# Debe permitir: http://localhost:5173

# 3. Verificar URL en frontend
# Debe ser: http://localhost:8080 (NO 127.0.0.1)

# 4. Verificar credentials
# Debe estar: credentials: 'include'
```

---

## 📝 Checklist Final

### Desarrollo Local

- [ ] Backend corriendo en `http://localhost:8080`
- [ ] `vite.config.ts` configurado con proxy
- [ ] Hook `useApi` centralizado para peticiones
- [ ] Hooks usan rutas relativas (`/auth/login`)
- [ ] `npm run dev` inicia sin errores

### Producción

- [ ] `.env.production` con `VITE_API_URL` de Render
- [ ] Hooks usan `import.meta.env.VITE_API_URL`
- [ ] Build con `npm run build`
- [ ] Backend en Render responde correctamente
- [ ] CORS configurado con dominio del frontend

---

## 🎯 Ejemplo Completo

### Estructura de Archivos

```
valgame-frontend/
├── vite.config.ts
├── .env                        # Desarrollo
├── .env.production            # Producción
├── src/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   ├── components/
│   └── App.tsx
```

---

### vite.config.ts (Proxy desarrollo)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

---

### .env (Desarrollo)
```env
# Vacío o sin VITE_API_URL - usa proxy
```

---

### .env.production (Producción)
```env
VITE_API_URL=https://valgame-backend.onrender.com
```

---

### useAuth.ts (Hook de autenticación)
```typescript
// src/hooks/useAuth.ts
import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithCredentials = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const url = API_URL ? `${API_URL}${endpoint}` : endpoint;
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithCredentials('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en registro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWithCredentials]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithCredentials('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWithCredentials]);

  return { register, login, loading, error };
}
```

---

### vite.config.ts (Proxy para desarrollo)
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 🎉 ¡Listo!

Con esta configuración:
- ✅ **Desarrollo**: Proxy automático a `localhost:8080`
- ✅ **Producción**: URLs a Render via `VITE_API_URL`
- ✅ **Cookies**: Funcionan con `credentials: 'include'`
- ✅ **CORS**: Resuelto automáticamente

---

**Última Actualización**: 3 de diciembre de 2025  
**Backend Local**: http://localhost:8080  
**Backend Producción**: https://valgame-backend.onrender.com  
**Frontend Local**: http://localhost:5173
