# 🍪 Manejo de Cookies HttpOnly - Backend a Frontend

**Fecha**: 3 de diciembre de 2025  
**Para**: Desarrollador Frontend  
**Backend**: https://valgame-backend.onrender.com

---

## 📋 ¿Qué son las Cookies HttpOnly?

Las **cookies httpOnly** son cookies que:

- ✅ **Solo el servidor puede leer/escribir** (el navegador las envía automáticamente)
- ✅ **JavaScript NO puede acceder a ellas** (protección contra XSS)
- ✅ **Se envían automáticamente** en cada petición al mismo dominio
- ✅ **Más seguras** que localStorage para tokens sensibles

---

## 🔄 Flujo Completo de Cookies

```
┌──────────────────────────────────────────────────────────┐
│  PASO 1: LOGIN (Backend setea cookie)                   │
├──────────────────────────────────────────────────────────┤
│  Frontend → POST /auth/login                             │
│             Body: { email, password }                    │
│             Headers: { withCredentials: true }           │
│                                                          │
│  Backend → Valida credenciales                           │
│         → Genera JWT token                               │
│         → Setea cookie httpOnly en la respuesta:         │
│                                                          │
│           Set-Cookie: token=eyJhbGc...;                  │
│                       HttpOnly;                          │
│                       Secure;                            │
│                       SameSite=Strict;                   │
│                       Max-Age=604800                     │
│                                                          │
│  Navegador → Guarda cookie automáticamente               │
│           → Frontend NO ve la cookie en JS               │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  PASO 2: PETICIONES AUTENTICADAS                         │
├──────────────────────────────────────────────────────────┤
│  Frontend → GET /api/users/profile                       │
│             Headers: {                                   │
│               withCredentials: true  ← CRÍTICO           │
│             }                                            │
│                                                          │
│  Navegador → Automáticamente adjunta cookie:             │
│              Cookie: token=eyJhbGc...                    │
│                                                          │
│  Backend → Lee cookie del header                         │
│         → Decodifica JWT                                 │
│         → Valida token                                   │
│         → Devuelve datos del usuario                     │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  PASO 3: LOGOUT (Backend elimina cookie)                 │
├──────────────────────────────────────────────────────────┤
│  Frontend → POST /auth/logout                            │
│             Headers: { withCredentials: true }           │
│                                                          │
│  Backend → Elimina cookie:                               │
│           Set-Cookie: token=; Max-Age=0                  │
│                                                          │
│  Navegador → Elimina cookie automáticamente              │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Implementación en el Frontend

### 1. Servicio de Autenticación (auth.service.ts)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  val: number;
  boletos: number;
  evo: number;
  personajes: any[];
  // ... otros campos
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://valgame-backend.onrender.com';
  
  // BehaviorSubject para trackear el estado del usuario
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Intentar restaurar sesión al iniciar
    this.restoreSession();
  }

  /**
   * LOGIN
   * La cookie se setea automáticamente por el navegador
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/login`,
      { email, password },
      {
        withCredentials: true  // ⚠️ CRÍTICO: Permite enviar/recibir cookies
      }
    ).pipe(
      tap((response: any) => {
        // ✅ Cookie ya fue seteada por el navegador automáticamente
        // Solo guardamos datos del usuario en memoria
        this.currentUserSubject.next(response.user);
        
        // Opcional: guardar datos básicos en localStorage
        // (NO el token, solo info no sensible)
        localStorage.setItem('user', JSON.stringify(response.user));
        
        console.log('✅ Login exitoso. Cookie httpOnly seteada automáticamente.');
      })
    );
  }

  /**
   * LOGOUT
   * El backend elimina la cookie
   */
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      {
        withCredentials: true  // ⚠️ Para enviar la cookie al backend
      }
    ).pipe(
      tap(() => {
        // Limpiar estado local
        this.currentUserSubject.next(null);
        localStorage.removeItem('user');
        
        console.log('✅ Logout exitoso. Cookie eliminada por el backend.');
      })
    );
  }

  /**
   * RESTAURAR SESIÓN
   * Verifica si hay una sesión activa (cookie válida)
   */
  restoreSession(): void {
    // Intentar obtener el perfil del usuario
    // Si hay cookie válida, el backend responderá con los datos
    this.http.get<any>(
      `${this.apiUrl}/api/users/profile`,
      {
        withCredentials: true  // Envía la cookie automáticamente
      }
    ).subscribe({
      next: (response) => {
        // ✅ Hay sesión activa
        this.currentUserSubject.next(response.user || response);
        localStorage.setItem('user', JSON.stringify(response.user || response));
        console.log('✅ Sesión restaurada desde cookie');
      },
      error: () => {
        // ❌ No hay sesión activa o token expirado
        this.currentUserSubject.next(null);
        localStorage.removeItem('user');
        console.log('ℹ️ No hay sesión activa');
      }
    });
  }

  /**
   * VERIFICAR SI ESTÁ AUTENTICADO
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * OBTENER USUARIO ACTUAL
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
```

---

### 2. Interceptor HTTP (http.interceptor.ts)

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // ⚠️ IMPORTANTE: Agregar withCredentials a TODAS las peticiones
    // al backend para que las cookies se envíen automáticamente
    const apiUrl = 'https://valgame-backend.onrender.com';
    
    if (request.url.startsWith(apiUrl)) {
      request = request.clone({
        withCredentials: true  // Envía cookies automáticamente
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si recibimos 401, la sesión expiró
        if (error.status === 401) {
          console.error('❌ Sesión expirada o no autenticado');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
}
```

---

### 3. Guard de Rutas (auth.guard.ts)

```typescript
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    
    // Verificar si hay usuario en memoria
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Si no hay usuario, intentar restaurar sesión desde cookie
    return this.authService.currentUser$.pipe(
      map(user => {
        if (user) {
          return true;
        } else {
          // No hay sesión, redirigir al login
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      })
    );
  }
}
```

---

### 4. Configuración del Módulo (app.module.ts)

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    // ... otros componentes
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule  // ⚠️ Necesario para HTTP
  ],
  providers: [
    // ⚠️ Registrar el interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## 🔐 Configuración del Backend (Ya está implementada)

### Cookie Configuration

```typescript
res.cookie('token', token, {
  httpOnly: true,    // ⚠️ JavaScript no puede acceder
  secure: true,      // ⚠️ Solo HTTPS en producción
  sameSite: 'strict', // ⚠️ Protección CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 días
});
```

### CORS Configuration

```typescript
app.use(cors({
  origin: true,        // Permite todos los orígenes (cambiar en producción)
  credentials: true    // ⚠️ CRÍTICO: Permite cookies cross-origin
}));
```

---

## 🧪 Ejemplo Completo de Uso

### Componente de Login

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
      <input formControlName="email" placeholder="Email" />
      <input formControlName="password" type="password" placeholder="Password" />
      <button type="submit" [disabled]="loginForm.invalid">Login</button>
    </form>
  `
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        console.log('✅ Login exitoso');
        // La cookie ya está seteada automáticamente
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        alert('Credenciales inválidas');
      }
    });
  }
}
```

---

### Componente Protegido

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  template: `
    <h1>Dashboard</h1>
    <p>VAL: {{ user?.val }}</p>
    <button (click)="logout()">Cerrar Sesión</button>
  `
})
export class DashboardComponent implements OnInit {
  user: any;
  
  private apiUrl = 'https://valgame-backend.onrender.com';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // La cookie se envía automáticamente con withCredentials
    this.http.get(`${this.apiUrl}/api/users/profile`, {
      withCredentials: true  // ⚠️ Envía cookie automáticamente
    }).subscribe({
      next: (response: any) => {
        this.user = response.user || response;
      },
      error: (error) => {
        console.error('Error al obtener perfil:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Logout exitoso');
        this.router.navigate(['/login']);
      }
    });
  }
}
```

---

## 🔍 Debugging: Verificar Cookies

### En el Navegador (DevTools)

1. **Abrir DevTools**: F12
2. **Ir a "Application" o "Almacenamiento"**
3. **Cookies → https://valgame-backend.onrender.com**
4. **Buscar cookie "token"**

Deberías ver:

```
Name:     token
Value:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Domain:   valgame-backend.onrender.com
Path:     /
HttpOnly: ✓ (marcado)
Secure:   ✓ (marcado)
SameSite: Strict
Expires:  (7 días desde ahora)
```

### En Network Tab

1. **DevTools → Network**
2. **Hacer login**
3. **Click en la petición POST /auth/login**
4. **Ver "Response Headers"**:

```
Set-Cookie: token=eyJhbGc...; 
            Path=/; 
            HttpOnly; 
            Secure; 
            SameSite=Strict; 
            Max-Age=604800
```

5. **Ver petición siguiente (ej: GET /api/users/profile)**
6. **Ver "Request Headers"**:

```
Cookie: token=eyJhbGc...
```

---

## ⚠️ ERRORES COMUNES

### 1. Cookie NO se setea

**Síntoma**: No aparece en DevTools → Cookies

**Causas**:
- ❌ Falta `withCredentials: true` en el frontend
- ❌ Falta `credentials: true` en CORS del backend
- ❌ `secure: true` pero estás en HTTP (no HTTPS)

**Solución**:
```typescript
// Frontend
this.http.post(url, body, { withCredentials: true })

// Backend (ya configurado)
app.use(cors({ credentials: true }))
```

---

### 2. Cookie NO se envía en peticiones

**Síntoma**: Backend responde 401 "No token provided"

**Causas**:
- ❌ Falta `withCredentials: true` en la petición
- ❌ Dominios diferentes (CORS issue)

**Solución**:
```typescript
// Agregar a TODAS las peticiones
this.http.get(url, { withCredentials: true })

// O usar interceptor (ver arriba)
```

---

### 3. Cookie se borra al refrescar la página

**Síntoma**: Usuario logueado → F5 → se desloguea

**Causa**:
- ❌ No se está restaurando la sesión en `ngOnInit` o `APP_INITIALIZER`

**Solución**:
```typescript
// En auth.service.ts constructor
constructor(private http: HttpClient) {
  this.restoreSession();  // ⚠️ Llamar al iniciar la app
}
```

---

### 4. "SameSite=Strict" bloquea la cookie

**Síntoma**: Cookie no funciona en iframe o cross-site

**Causa**:
- Backend usa `sameSite: 'strict'`

**Solución** (solo si necesitas cross-site):
```typescript
// Backend
res.cookie('token', token, {
  sameSite: 'none',  // Permite cross-site
  secure: true       // ⚠️ DEBE ser true con sameSite=none
});
```

---

## 📊 Comparación: Cookie vs localStorage

| Feature | HttpOnly Cookie | localStorage |
|---------|----------------|--------------|
| **Acceso desde JS** | ❌ No | ✅ Sí |
| **Protección XSS** | ✅ Sí | ❌ No |
| **Envío automático** | ✅ Sí | ❌ No (manual) |
| **Expiración automática** | ✅ Sí | ❌ No |
| **Cross-domain** | ⚠️ Complejo | ✅ Simple |
| **Tamaño máximo** | ~4KB | ~5-10MB |
| **Recomendado para tokens** | ✅ Sí | ⚠️ Solo si no hay alternativa |

---

## 🎯 Checklist de Implementación

### Backend (Ya listo ✅)
- [x] CORS con `credentials: true`
- [x] Cookie con `httpOnly: true`
- [x] Cookie con `secure: true` en producción
- [x] Cookie con `sameSite: 'strict'`
- [x] Endpoint de login setea cookie
- [x] Endpoint de logout borra cookie
- [x] Middleware de auth lee cookie

### Frontend (Implementar)
- [ ] `withCredentials: true` en login
- [ ] `withCredentials: true` en todas las peticiones autenticadas
- [ ] Interceptor HTTP global
- [ ] AuthService con BehaviorSubject
- [ ] Método `restoreSession()` al iniciar app
- [ ] AuthGuard para rutas protegidas
- [ ] Manejo de 401 (sesión expirada)

---

## 🚀 Resumen Rápido

1. **Login**: Backend setea cookie → Navegador guarda automáticamente
2. **Peticiones**: Frontend usa `withCredentials: true` → Navegador envía cookie automáticamente
3. **Logout**: Backend borra cookie → Navegador elimina automáticamente

**No necesitas**:
- ❌ Guardar token en localStorage
- ❌ Agregar manualmente headers `Authorization`
- ❌ Manejar expiración del token (lo hace el backend)

**Solo necesitas**:
- ✅ `withCredentials: true` en TODAS las peticiones
- ✅ CORS con `credentials: true` en el backend (ya está)

---

**Última Actualización**: 3 de diciembre de 2025  
**Backend**: https://valgame-backend.onrender.com  
**Cookie Name**: `token`  
**Cookie Duration**: 7 días
