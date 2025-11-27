# ⚙️ Configuración y Setup - Guía de Instalación

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Setup inicial, módulos, configuración, interceptores, variables de entorno

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Inicial](#instalación-inicial)
3. [Variables de Entorno](#variables-de-entorno)
4. [Configuración de Módulos](#configuración-de-módulos)
5. [Interceptores](#interceptores)
6. [Configuración de HTTP](#configuración-de-http)
7. [WebSocket Configuration](#websocket-configuration)
8. [Guards y Resolvers](#guards-y-resolvers)
9. [Configuración de Build](#configuración-de-build)
10. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

### Software Requerido

```bash
# Versiones mínimas recomendadas
- Node.js: v18.0.0 o superior
- npm: v9.0.0 o superior
- Angular CLI: v15.0.0 o superior

# Instalar Angular CLI globalmente
npm install -g @angular/cli@15

# Verificar instalación
ng version
node --version
npm --version
```

### Dependencias Principales

```json
{
  "dependencies": {
    "@angular/animations": "^15.0.0",
    "@angular/common": "^15.0.0",
    "@angular/compiler": "^15.0.0",
    "@angular/core": "^15.0.0",
    "@angular/forms": "^15.0.0",
    "@angular/platform-browser": "^15.0.0",
    "@angular/platform-browser-dynamic": "^15.0.0",
    "@angular/router": "^15.0.0",
    "rxjs": "^7.5.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.12.0",
    "socket.io-client": "^4.5.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^15.0.0",
    "@angular/cli": "^15.0.0",
    "@angular/compiler-cli": "^15.0.0",
    "typescript": "~4.8.0",
    "jasmine-core": "~4.3.0",
    "karma": "~6.4.0",
    "karma-jasmine": "~5.1.0"
  }
}
```

---

## 🚀 Instalación Inicial

### Paso 1: Clonar el repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/exploradoresvalnor-collab/valgame-frontend.git
cd valgame-frontend

# O si ya existe, actualizar
git pull origin main
```

### Paso 2: Instalar dependencias

```bash
# Instalar npm packages
npm install

# Verificar que todo se instaló correctamente
npm list | grep -E "(angular|rxjs|socket)"
```

### Paso 3: Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp src/environments/environment.example.ts src/environments/environment.ts

# Copiar para development
cp src/environments/environment.development.example.ts src/environments/environment.development.ts

# Editar con tus valores
nano src/environments/environment.ts
```

### Paso 4: Iniciar servidor de desarrollo

```bash
# Opción 1: Servidor local por defecto
npm start
# Acceder en: http://localhost:4200

# Opción 2: Con configuración específica
ng serve --open --configuration development

# Opción 3: Con live reload
ng serve --live-reload
```

---

## 🔐 Variables de Entorno

### src/environments/environment.ts

```typescript
// Production
export const environment = {
  production: true,
  apiUrl: 'https://api.valgame.com',
  
  // WebSocket
  wsUrl: 'wss://api.valgame.com',
  wsReconnectInterval: 5000,
  wsMaxReconnectAttempts: 10,
  
  // Stripe
  stripePublicKey: 'pk_live_xxxxxxxxxxxxx',
  
  // Analytics
  googleAnalyticsId: 'G-xxxxxxxxxxxxx',
  
  // Features
  enableDevTools: false,
  enableDebugLogging: false,
  
  // Session
  sessionTimeout: 3600000,  // 1 hora en ms
  tokenRefreshInterval: 1800000  // 30 min
};
```

### src/environments/environment.development.ts

```typescript
// Development
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  
  // WebSocket
  wsUrl: 'ws://localhost:8080',
  wsReconnectInterval: 2000,
  wsMaxReconnectAttempts: 5,
  
  // Stripe (Test keys)
  stripePublicKey: 'pk_test_xxxxxxxxxxxxx',
  
  // Analytics
  googleAnalyticsId: 'G-dev_xxxxxxxxxxxxx',
  
  // Features
  enableDevTools: true,
  enableDebugLogging: true,
  
  // Session
  sessionTimeout: 7200000,  // 2 horas
  tokenRefreshInterval: 3600000  // 1 hora
};
```

### Archivo .env (Alternativo)

```bash
# .env (en raíz del proyecto)
VALGAME_API_URL=http://localhost:8080
VALGAME_WS_URL=ws://localhost:8080
VALGAME_STRIPE_KEY=pk_test_xxxxx
VALGAME_ENV=development
```

---

## 📦 Configuración de Módulos

### AppModule - Módulo Principal

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Interceptores
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';

// Core Providers
import { AuthGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';
import { StorageService } from './core/services/storage.service';

// Feature Modules
import { AuthModule } from './features/auth/auth.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { InventoryModule } from './features/inventory/inventory.module';
import { MarketplaceModule } from './features/marketplace/marketplace.module';
import { ShopModule } from './features/shop/shop.module';
import { DungeonModule } from './features/dungeon/dungeon.module';
import { RankingModule } from './features/ranking/ranking.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    
    // Feature Modules
    AuthModule,
    DashboardModule,
    InventoryModule,
    MarketplaceModule,
    ShopModule,
    DungeonModule,
    RankingModule
  ],
  providers: [
    AuthService,
    StorageService,
    AuthGuard,
    
    // HTTP Interceptores - ORDEN IMPORTA
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### AuthModule - Módulo de Autenticación

```typescript
// src/app/features/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';

// Components
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

// Services
import { AuthService } from '../../core/services/auth.service';

@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AuthRoutingModule
  ],
  providers: [AuthService]
})
export class AuthModule { }
```

### SharedModule - Módulo Compartido

```typescript
// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Shared Components
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ModalComponent } from './components/modal/modal.component';
import { PaginationComponent } from './components/pagination/pagination.component';

// Pipes
import { TruncatePipe } from './pipes/truncate.pipe';
import { FormatNumberPipe } from './pipes/format-number.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

// Directives
import { HighlightDirective } from './directives/highlight.directive';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  declarations: [
    // Components
    LoadingSpinnerComponent,
    NotificationComponent,
    ModalComponent,
    PaginationComponent,
    
    // Pipes
    TruncatePipe,
    FormatNumberPipe,
    TimeAgoPipe,
    
    // Directives
    HighlightDirective,
    ClickOutsideDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    // Components
    LoadingSpinnerComponent,
    NotificationComponent,
    ModalComponent,
    PaginationComponent,
    
    // Pipes
    TruncatePipe,
    FormatNumberPipe,
    TimeAgoPipe,
    
    // Directives
    HighlightDirective,
    ClickOutsideDirective,
    
    // Módulos
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }
```

---

## 🔗 Interceptores

### AuthInterceptor - Inyección de JWT

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    
    // Obtener token
    const token = this.authService.getToken();

    // Si existe token, agregarlo al header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Pasar request modificado
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        
        // Si error 401 (Unauthorized), logout
        if (error.status === 401) {
          this.authService.logout().subscribe({
            next: () => {
              this.router.navigate(['/login']);
            },
            error: (err) => {
              console.error('Error durante logout:', err);
              this.router.navigate(['/login']);
            }
          });
        }

        return throwError(() => error);
      })
    );
  }
}
```

### ErrorInterceptor - Manejo Global de Errores

```typescript
// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(private notificationService: NotificationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        
        let errorMessage = 'Error desconocido';

        // Error del navegador/red
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        }
        // Error del servidor
        else {
          errorMessage = error.error?.message || 
                        `Error ${error.status}: ${error.statusText}`;
        }

        // Mostrar notificación según tipo de error
        switch (error.status) {
          case 400:
            this.notificationService.error(`Datos inválidos: ${errorMessage}`);
            break;
          case 403:
            this.notificationService.error('No tienes permisos para esta acción');
            break;
          case 404:
            this.notificationService.error('Recurso no encontrado');
            break;
          case 500:
            this.notificationService.error('Error interno del servidor');
            break;
          default:
            if (error.status !== 401) {
              this.notificationService.error(errorMessage);
            }
        }

        return throwError(() => error);
      })
    );
  }
}
```

### LoadingInterceptor - Mostrar/Ocultar Loading

```typescript
// src/app/core/interceptors/loading.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  
  private requestCounter = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    
    // No mostrar loading en requests específicas
    if (request.url.includes('/health') || 
        request.url.includes('/ping')) {
      return next.handle(request);
    }

    // Iniciar loading
    this.requestCounter++;
    this.loadingService.show();

    return next.handle(request).pipe(
      finalize(() => {
        this.requestCounter--;
        
        // Ocultar loading si no hay más requests
        if (this.requestCounter === 0) {
          this.loadingService.hide();
        }
      })
    );
  }
}
```

---

## 📡 Configuración de HTTP

### HttpClient Configuration

```typescript
// src/app/core/config/http.config.ts
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN'
    })
  ]
})
export class HttpConfigModule { }
```

### CORS Configuration

```typescript
// cors.config.ts (Backend)
app.use(cors({
  origin: [
    'http://localhost:4200',           // Development
    'http://localhost:3000',           // Alt development
    'https://valgame.com',             // Production
    'https://www.valgame.com'
  ],
  credentials: true,                    // Permitir cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-XSRF-TOKEN'
  ],
  maxAge: 86400                         // 24 horas
}));
```

---

## 🔌 WebSocket Configuration

### WebSocket Service Initialization

```typescript
// src/app/core/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  
  private socket!: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = environment.wsMaxReconnectAttempts;
  private reconnectInterval = environment.wsReconnectInterval;

  constructor(private authService: AuthService) {
    this.setupSocketListeners();
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.warn('No hay token disponible para WebSocket');
      return;
    }

    this.socket = io(environment.wsUrl, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: this.reconnectInterval,
      reconnectionDelayMax: this.reconnectInterval * 2,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling']
    });

    this.setupSocketListeners();
  }

  /**
   * Desconectar del WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.connectedSubject.next(false);
    }
  }

  /**
   * Setup de event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('WebSocket conectado');
      this.connectedSubject.next(true);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket desconectado');
      this.connectedSubject.next(false);
    });

    this.socket.on('reconnect_attempt', () => {
      this.reconnectAttempts++;
      console.log(`Intento de reconexión ${this.reconnectAttempts}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Reconexión fallida');
      this.connectedSubject.next(false);
    });

    // Errores
    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Obtener estado de conexión
   */
  isConnected(): boolean {
    return this.connectedSubject.value;
  }

  /**
   * Emitir evento
   */
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Escuchar evento
   */
  on(event: string): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on(event, (data: any) => {
          observer.next(data);
        });
      }
    });
  }
}
```

---

## 🛡️ Guards y Resolvers

### AuthGuard - Proteger Rutas

```typescript
// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

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
  ): Observable<boolean | UrlTree> {
    
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        
        if (isAuthenticated) {
          return true;
        }

        // Guardar URL solicitada para redirigir después del login
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });

        return false;
      })
    );
  }
}
```

### UserResolver - Cargar datos antes de renderizar

```typescript
// src/app/core/resolvers/user.resolver.ts
import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<any> {
  
  constructor(private userService: UserService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    return this.userService.getUserProfile();
  }
}
```

### Uso en Rutas

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    resolve: { user: UserResolver }
  }
];
```

---

## 🔨 Configuración de Build

### angular.json - Configuración de Build

```json
{
  "projects": {
    "valgame": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/valgame",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": ["src/styles.scss"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "outputHashing": "all",
              "optimization": true,
              "buildOptimizer": true,
              "sourceMap": false,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true
            },
            "development": {
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "browserTarget": "valgame:build"
          },
          "configurations": {
            "production": {
              "browserTarget": "valgame:build:production"
            },
            "development": {
              "browserTarget": "valgame:build:development"
            }
          }
        }
      }
    }
  }
}
```

### Build Commands

```bash
# Development build (rápido, con source maps)
npm run build:dev
# o
ng build --configuration development

# Production build (optimizado)
npm run build
# o
ng build --configuration production

# Build con análisis de bundle
ng build --stats-json
webpack-bundle-analyzer dist/valgame/stats.json

# Development con hot reload
npm start
# o
ng serve --open
```

---

## 🔧 Troubleshooting

### Problema: CORS Error

```
Access to XMLHttpRequest at 'http://localhost:8080/...' 
from origin 'http://localhost:4200' has been blocked
```

**Solución:**

```typescript
// Backend - verify CORS config in main.ts
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

### Problema: 401 Unauthorized Loop

**Solución:**

```typescript
// Verificar que AuthInterceptor está correctamente configurado
// y que getToken() retorna un token válido
const token = this.authService.getToken();
console.log('Token:', token ? 'Present' : 'Missing');
```

### Problema: WebSocket No Conecta

```
WebSocket connection to 'ws://localhost:8080/socket.io' failed
```

**Solución:**

```typescript
// Verificar Socket.IO en backend
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    credentials: true
  }
});

// Verificar que Socket.IO está escuchando
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});
```

### Problema: Módulos No Se Cargan

**Solución:**

```typescript
// Verificar que están en AppModule
@NgModule({
  imports: [
    // ... otros imports
    AuthModule,
    DashboardModule,
    // etc
  ]
})
export class AppModule { }
```

### Problema: Interceptor Ejecutándose Múltiples Veces

**Solución:**

```typescript
// Verificar que solo hay un HTTP_INTERCEPTORS provider por interceptor
// Incorrecto:
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }  // Duplicado!
]

// Correcto:
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
]
```

---

## 📚 Comandos Útiles

```bash
# Instalar packages
npm install

# Actualizar packages
npm update

# Iniciar servidor
npm start

# Build production
npm run build

# Lint
npm run lint

# Tests
npm test

# End-to-end tests
npm run e2e

# Generar componente
ng generate component features/my-component

# Generar servicio
ng generate service services/my-service

# Generar module
ng generate module features/my-feature

# Servir desde dist (simular producción)
npx http-server dist/valgame -p 8000 -g
```

---

## ✅ Checklist de Setup

- [ ] Node.js y npm instalados y actualizados
- [ ] Angular CLI instalado globalmente
- [ ] Repositorio clonado
- [ ] `npm install` completado sin errores
- [ ] Archivos de entorno creados (environment.ts, environment.development.ts)
- [ ] Backend API URL configurada correctamente
- [ ] WebSocket URL configurada correctamente
- [ ] Interceptores configurados en AppModule
- [ ] AuthGuard protegiendo rutas
- [ ] `npm start` ejecutándose sin errores
- [ ] Aplicación accesible en http://localhost:4200
- [ ] Puedes registrarte y loguearte
- [ ] WebSocket conecta correctamente
- [ ] Marketplace, Shop y Dungeon funcionan

---

## 📚 Documentos Relacionados

- **01-Autenticacion-Login.md** - Detalles de componentes de auth
- **09-Servicios-Core.md** - Referencia completa de servicios

---

**¿Preguntas o problemas?**  
Contacta al equipo de desarrollo de Valgame.
