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

### ⚙️ **Configuración Rápida en AuthService**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ✅ URL base usando localhost (NO 127.0.0.1)
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  register(data: any) {
    // ✅ Ruta pública sin /api/
    return this.http.post(`${this.apiUrl}/auth/register`, data, {
      withCredentials: true  // ⚠️ OBLIGATORIO para cookies
    });
  }

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    });
  }

  getCurrentUser() {
    // ✅ CORRECTO: ruta protegida con /api/
    return this.http.get(`${this.apiUrl}/api/users/me`, {
      withCredentials: true
    });
  }

  // ❌ INCORRECTO:
  // getCurrentUser() {
  //   return this.http.get(`${this.apiUrl}/auth/me`);  ❌
  // }
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

**Archivo**: `src/environments/environment.prod.ts` (Producción)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://valgame-backend.onrender.com',
  wsUrl: 'wss://valgame-backend.onrender.com'
};
```

---

### Paso 2: Configurar angular.json

**Archivo**: `angular.json`

```json
{
  "projects": {
    "tu-proyecto": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "configurations": {
            "production": {
              "buildTarget": "tu-proyecto:build:production"
            },
            "development": {
              "buildTarget": "tu-proyecto:build:development"
            }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
```

---

### Paso 3: Usar en tus servicios

**Archivo**: `src/app/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data, {
      withCredentials: true
    });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify/${token}`, {
      withCredentials: true
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email }, {
      withCredentials: true
    });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password/${token}`, { password }, {
      withCredentials: true
    });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/reset-password/validate/${token}`, {
      withCredentials: true
    });
  }

  restoreSession(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`, {
      withCredentials: true
    });
  }
}
```

---

### Paso 4: Comandos para correr

**Desarrollo (usa environment.ts - localhost):**
```bash
ng serve
# o
npm start
```

**Producción (usa environment.prod.ts - Render):**
```bash
ng serve --configuration=production
# o para build:
ng build --configuration=production
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

### Paso 2: Configurar angular.json

**Archivo**: `angular.json`

```json
{
  "projects": {
    "tu-proyecto": {
      "architect": {
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "proxyConfig": "proxy.conf.json"
          },
          "configurations": {
            "production": {
              "buildTarget": "tu-proyecto:build:production"
            },
            "development": {
              "buildTarget": "tu-proyecto:build:development"
            }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
```

---

### Paso 3: Actualizar servicios (rutas relativas)

**Archivo**: `src/app/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ✅ Sin URL base - usa proxy
  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    // ✅ Ruta relativa - proxy redirige a localhost:8080
    return this.http.post('/auth/register', data, {
      withCredentials: true
    });
  }

  login(credentials: any): Observable<any> {
    return this.http.post('/auth/login', credentials, {
      withCredentials: true
    });
  }

  logout(): Observable<any> {
    return this.http.post('/auth/logout', {}, {
      withCredentials: true
    });
  }
}
```

---

### Paso 4: Iniciar servidor

```bash
ng serve
```

**Consola mostrará:**
```
** Angular Live Development Server is listening on localhost:4200
** Proxy config: proxy.conf.json

[HPM] Proxy created: /auth  -> http://localhost:8080
[HPM] Proxy created: /api   -> http://localhost:8080
```

---

### Para Producción (sin proxy)

Cuando hagas build para producción, Angular NO usa el proxy. Debes configurar la URL completa:

**Opción A: Variable de entorno**

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://valgame-backend.onrender.com'
};

// src/app/services/auth.service.ts
import { environment } from '../../environments/environment';

export class AuthService {
  private apiUrl = environment.production ? environment.apiUrl : '';
  
  register(data: any) {
    const url = this.apiUrl ? `${this.apiUrl}/auth/register` : '/auth/register';
    return this.http.post(url, data, { withCredentials: true });
  }
}
```

**Opción B: Variable de Angular en runtime**

```typescript
// src/app/services/auth.service.ts
import { isDevMode } from '@angular/core';

export class AuthService {
  private apiUrl = isDevMode() ? '' : 'https://valgame-backend.onrender.com';
  
  register(data: any) {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post(url, data, { withCredentials: true });
  }
}
```

---

## 🔧 HTTP Interceptor (Importante)

Para que las cookies funcionen, necesitas un interceptor que agregue `withCredentials: true` a TODAS las peticiones.

**Archivo**: `src/app/interceptors/credentials.interceptor.ts`

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clonar request y agregar withCredentials
    const clonedRequest = req.clone({
      withCredentials: true
    });
    
    return next.handle(clonedRequest);
  }
}
```

---

**Registrar en app.config.ts:**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([CredentialsInterceptor])
    )
  ]
};
```

**O en app.module.ts (si usas módulos):**

```typescript
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
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

# Terminal 2: Frontend
cd valgame-frontend
ng serve
```

**Configuración:**
- ✅ Proxy: `proxy.conf.json` → `http://localhost:8080`
- ✅ Interceptor: `CredentialsInterceptor` para cookies
- ✅ Rutas relativas en servicios (`/auth/register`)

---

### 2. Build Producción

```bash
ng build --configuration=production
```

**Configuración:**
- ✅ Environment: `environment.prod.ts` → `https://valgame-backend.onrender.com`
- ✅ URLs absolutas desde variable de entorno
- ✅ Interceptor sigue funcionando

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
private apiUrl = 'http://localhost:8080/api';
this.http.get(`${this.apiUrl}/users/me`);  // → /api/users/me ❌

// ✅ CORRECTO
private apiUrl = 'http://localhost:8080';
this.http.get(`${this.apiUrl}/auth/me`);  // → /auth/me ✅
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
- [ ] `withCredentials: true` en TODAS las peticiones
- [ ] `proxy.conf.json` creado (si usas proxy)
- [ ] `angular.json` configurado con `proxyConfig`
- [ ] Interceptor `CredentialsInterceptor` registrado
- [ ] Servicios usan rutas correctas (sin `/api/`)

**Frontend - Verificación:**
- [ ] `ng serve` inicia sin errores
- [ ] Ver en logs (si usas proxy): `[HPM] Proxy created: /auth -> http://localhost:8080`
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
- [ ] `environment.prod.ts` con URL: `https://valgame-backend.onrender.com`
- [ ] Servicios usan `environment.apiUrl`
- [ ] Build con: `ng build --configuration=production`
- [ ] CORS configurado en backend con dominio del frontend
- [ ] No usar proxy en producción (solo desarrollo)
- [ ] Rutas siguen siendo `/auth/*` (sin `/api/`)
**Causa**: El backend no permite tu origen.

**Solución**:
```typescript
// Backend: src/app.ts
app.use(cors({
  origin: ['http://localhost:4200', 'https://tu-frontend.com'],
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

**Causa**: Falta `withCredentials: true`.

**Verificar en DevTools:**
```
Application → Cookies → http://localhost:4200
```

**Solución**:
```typescript
// ✅ Opción 1: En cada petición
this.http.post('/auth/login', data, {
  withCredentials: true
});

// ✅ Opción 2: Interceptor (mejor)
@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const cloned = req.clone({ withCredentials: true });
    return next.handle(cloned);
  }
}
```

**Verificar en el backend:**
```typescript
// Backend debe tener:
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true  // ⚠️ OBLIGATORIO
}));
```

---

### ❌ Proxy no funciona

**Causa**: Angular no cargó `proxy.conf.json`.

**Solución**:
```bash
# 1. Detener servidor
Ctrl + C

# 2. Verificar que proxy.conf.json existe
ls proxy.conf.json

# 3. Verificar angular.json
# Debe tener: "proxyConfig": "proxy.conf.json"

# 4. Reiniciar con proxy
ng serve

# 5. Verificar logs (DEBE aparecer):
[HPM] Proxy created: /auth  -> http://localhost:8080
[HPM] Proxy created: /api   -> http://localhost:8080

# Si NO aparecen los logs [HPM], el proxy NO está activo
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
# Debe permitir: http://localhost:4200

# 3. Verificar URL en frontend
# Debe ser: http://localhost:8080 (NO 127.0.0.1)

# 4. Verificar withCredentials
# Debe estar en: true
```

---

## 📝 Checklist Final

### Desarrollo Local

- [ ] Backend corriendo en `http://localhost:8080`
- [ ] `proxy.conf.json` creado
- [ ] `angular.json` configurado con proxy
- [ ] Interceptor `CredentialsInterceptor` registrado
- [ ] Servicios usan rutas relativas (`/auth/login`)
- [ ] `ng serve` muestra logs de proxy

### Producción

- [ ] `environment.prod.ts` con URL de Render
- [ ] Servicios usan `environment.apiUrl`
- [ ] Build con `ng build --configuration=production`
- [ ] Backend en Render responde correctamente
- [ ] CORS configurado con dominio del frontend

---

## 🎯 Ejemplo Completo

### Estructura de Archivos

```
valgame-frontend/
├── proxy.conf.json
├── angular.json
├── src/
│   ├── environments/
│   │   ├── environment.ts         # Local
│   │   └── environment.prod.ts    # Producción
│   ├── app/
│   │   ├── interceptors/
│   │   │   └── credentials.interceptor.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   └── app.config.ts
```

---

### proxy.conf.json
```json
{
  "/auth": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

### environment.ts (Desarrollo)
```typescript
export const environment = {
  production: false,
  apiUrl: '' // Usa proxy
};
```

---

### environment.prod.ts (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://valgame-backend.onrender.com'
};
```

---

### auth.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(data: any) {
    const url = this.apiUrl ? `${this.apiUrl}/auth/register` : '/auth/register';
    return this.http.post(url, data);
  }

  login(credentials: any) {
    const url = this.apiUrl ? `${this.apiUrl}/auth/login` : '/auth/login';
    return this.http.post(url, credentials);
  }
}
```

---

### credentials.interceptor.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const cloned = req.clone({ withCredentials: true });
    return next.handle(cloned);
  }
}
```

---

### app.config.ts
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true
    }
  ]
};
```

---

## 🎉 ¡Listo!

Con esta configuración:
- ✅ **Desarrollo**: Proxy automático a `localhost:8080`
- ✅ **Producción**: URLs a Render
- ✅ **Cookies**: Funcionan con `withCredentials`
- ✅ **CORS**: Resuelto automáticamente

---

**Última Actualización**: 3 de diciembre de 2025  
**Backend Local**: http://localhost:8080  
**Backend Producción**: https://valgame-backend.onrender.com  
**Frontend Local**: http://localhost:4200
