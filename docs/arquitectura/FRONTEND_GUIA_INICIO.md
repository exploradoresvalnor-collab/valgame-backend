# 🚀 GUÍA DE INICIO - FRONTEND ANGULAR

## 📋 RESUMEN EJECUTIVO

**Estado del Backend:** ✅ MVP LISTO  
**Framework Frontend:** Angular 17+  
**Estrategia:** PWA (Progressive Web App)  
**Tiempo Estimado MVP:** 8-12 semanas  

---

## 🎯 OBJETIVO DEL MVP

Crear una aplicación web funcional que permita:
1. ✅ Registro y login de usuarios
2. ✅ Visualización de personajes
3. ✅ Sistema de inventario básico
4. ✅ Marketplace para comprar/vender
5. ✅ Sistema de evolución de personajes
6. ✅ Mazmorras básicas

---

## 📊 ENDPOINTS DISPONIBLES EN EL BACKEND

### 🔐 Autenticación
```typescript
POST /auth/register
Body: { email, username, password }
Response: { message: "Registro exitoso..." }

GET /auth/verify/:token
Response: { message: "Cuenta verificada", package: {...} }

POST /auth/login
Body: { email, password }
Response: { token, user }
```

### 👤 Usuario
```typescript
GET /api/users/me (requiere auth)
Response: User completo con personajes e inventario
```

### 🎮 Personajes
```typescript
POST /api/characters/:characterId/use-consumable (requiere auth)
Body: { consumableId }

POST /api/characters/:characterId/revive (requiere auth)

POST /api/characters/:characterId/heal (requiere auth)

POST /api/characters/:characterId/evolve (requiere auth)

POST /api/characters/:characterId/add-experience (requiere auth)
Body: { amount }
```

### 🏪 Marketplace
```typescript
GET /api/marketplace/listings
Query: { type?, precioMin?, precioMax?, destacados?, rango?, limit?, offset? }

POST /api/marketplace/listings (requiere auth)
Body: { itemId, precio, destacar?, metadata? }

POST /api/marketplace/listings/:id/buy (requiere auth)

POST /api/marketplace/listings/:id/cancel (requiere auth)
```

### 📦 Paquetes
```typescript
GET /api/packages
Response: Lista de paquetes disponibles

GET /api/user-packages (requiere auth)
Response: Paquetes sin abrir del usuario

POST /api/user-packages/purchase (requiere auth)
Body: { packageId, paymentMethod }

POST /api/user-packages/open (requiere auth)
Body: { userPackageId }
```

### 🏰 Mazmorras
```typescript
GET /api/dungeons
Response: Lista de mazmorras

GET /api/dungeons/:id
Response: Detalles de la mazmorra

POST /api/dungeons/:id/enter (requiere auth)
Body: { characterIds: string[] }
```

### ⚙️ Configuración
```typescript
GET /api/game-settings
Response: Configuración global del juego

GET /api/level-requirements
Response: Requisitos de experiencia por nivel

GET /api/base-characters
Response: Personajes base disponibles
```

### 🛡️ Items
```typescript
GET /api/equipment
Response: Lista de equipamiento

GET /api/consumables
Response: Lista de consumibles
```

---

## 🏗️ ESTRUCTURA DEL PROYECTO ANGULAR

```
valgame-frontend/
├── src/
│   ├── app/
│   │   ├── core/                      # Servicios singleton
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── socket.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   └── core.module.ts
│   │   │
│   │   ├── shared/                    # Componentes reutilizables
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   ├── loading-spinner/
│   │   │   │   └── character-card/
│   │   │   ├── pipes/
│   │   │   │   ├── rarity-color.pipe.ts
│   │   │   │   └── time-ago.pipe.ts
│   │   │   └── shared.module.ts
│   │   │
│   │   ├── features/                  # Módulos de características
│   │   │   ├── auth/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   └── verify-email/
│   │   │   │   ├── services/
│   │   │   │   └── auth.module.ts
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── pages/
│   │   │   │   │   └── dashboard/
│   │   │   │   └── dashboard.module.ts
│   │   │   │
│   │   │   ├── characters/
│   │   │   │   ├── components/
│   │   │   │   │   ├── character-card/
│   │   │   │   │   ├── character-detail/
│   │   │   │   │   └── evolution-dialog/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── character-list/
│   │   │   │   │   └── character-detail/
│   │   │   │   ├── services/
│   │   │   │   │   └── character.service.ts
│   │   │   │   └── characters.module.ts
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   ├── services/
│   │   │   │   └── inventory.module.ts
│   │   │   │
│   │   │   ├── marketplace/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   ├── services/
│   │   │   │   └── marketplace.module.ts
│   │   │   │
│   │   │   └── dungeons/
│   │   │       ├── components/
│   │   │       ├── pages/
│   │   │       ├── services/
│   │   │       └── dungeons.module.ts
│   │   │
│   │   ├── models/                    # Interfaces TypeScript
│   │   │   ├── user.model.ts
│   │   │   ├── character.model.ts
│   │   │   ├── item.model.ts
│   │   │   ├── dungeon.model.ts
│   │   │   └── marketplace.model.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   │
│   ├── assets/
│   │   ├── images/
���   │   ├── icons/
│   │   └── i18n/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── styles.scss
│   └── index.html
│
├── angular.json
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## 🚀 SETUP INICIAL (PASO A PASO)

### 1. Crear el Proyecto Angular

```bash
# Instalar Angular CLI
npm install -g @angular/cli@17

# Crear proyecto
ng new valgame-frontend --routing --style=scss --ssr=false

cd valgame-frontend
```

### 2. Instalar Dependencias

```bash
# Angular Material
ng add @angular/material

# TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# Socket.io Client
npm install socket.io-client

# Ethers.js (para Web3)
npm install ethers

# Otras utilidades
npm install date-fns
npm install @ngneat/until-destroy
```

### 3. Configurar TailwindCSS

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        success: '#4caf50',
        warning: '#ff9800',
        danger: '#f44336',
        'rarity-common': '#9e9e9e',
        'rarity-rare': '#2196f3',
        'rarity-epic': '#9c27b0',
        'rarity-legendary': '#ff9800',
      }
    },
  },
  plugins: [],
}
```

```scss
/* src/styles.scss */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Estilos globales personalizados */
body {
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
}
```

### 4. Configurar Environments

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.valnor.com',
  wsUrl: 'wss://api.valnor.com'
};
```

---

## 📝 MODELOS TYPESCRIPT (COPIAR Y PEGAR)

### user.model.ts
```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  walletAddress?: string;
  val: number;
  boletos: number;
  evo: number;
  invocaciones: number;
  evoluciones: number;
  boletosDiarios: number;
  ultimoReinicio?: Date;
  personajeActivoId?: string;
  personajes: Character[];
  inventarioEquipamiento: string[];
  inventarioConsumibles: ConsumableInventoryItem[];
  limiteInventarioEquipamiento: number;
  limiteInventarioConsumibles: number;
  fechaRegistro: Date;
  ultimaActualizacion: Date;
  receivedPioneerPackage?: boolean;
}
```

### character.model.ts
```typescript
export interface Character {
  _id: string;
  personajeId: string;
  rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  nivel: number;
  etapa: 1 | 2 | 3;
  progreso: number;
  experiencia: number;
  stats: CharacterStats;
  saludActual: number;
  saludMaxima: number;
  estado: 'saludable' | 'herido';
  fechaHerido: Date | null;
  equipamiento: string[];
  activeBuffs: ActiveBuff[];
}

export interface CharacterStats {
  atk: number;
  vida: number;
  defensa: number;
}

export interface ActiveBuff {
  consumableId: string;
  effects: BuffEffects;
  expiresAt: Date;
}

export interface BuffEffects {
  mejora_atk?: number;
  mejora_defensa?: number;
  mejora_vida?: number;
  mejora_xp_porcentaje?: number;
}
```

### item.model.ts
```typescript
export interface Equipment {
  _id: string;
  nombre: string;
  descripcion: string;
  rareza: 'comun' | 'raro' | 'epico' | 'legendario';
  tipoItem: 'Equipment';
  tipoEquipamiento: 'arma' | 'armadura' | 'accesorio';
  stats: {
    mejora_atk?: number;
    mejora_defensa?: number;
    mejora_vida?: number;
  };
  requisitos?: {
    nivel_minimo?: number;
    rango_minimo?: string;
  };
  precio_val?: number;
  imagen?: string;
}

export interface Consumable {
  _id: string;
  nombre: string;
  descripcion: string;
  rareza: 'comun' | 'raro' | 'epico' | 'legendario';
  tipoItem: 'Consumable';
  efectos: {
    mejora_atk?: number;
    mejora_defensa?: number;
    mejora_vida?: number;
    mejora_xp_porcentaje?: number;
  };
  duracion_minutos: number;
  usos_maximos: number;
  precio_val?: number;
  imagen?: string;
}

export interface ConsumableInventoryItem {
  consumableId: string;
  usos_restantes: number;
  consumable?: Consumable;
}
```

### marketplace.model.ts
```typescript
export interface Listing {
  _id: string;
  vendedor: string;
  tipo: 'character' | 'equipment' | 'consumable';
  itemId: string;
  precio: number;
  estado: 'activo' | 'vendido' | 'cancelado' | 'expirado';
  fechaCreacion: Date;
  fechaExpiracion: Date;
  fechaVenta?: Date;
  comprador?: string;
  destacado?: boolean;
  metadata?: {
    nivel?: number;
    rango?: string;
    durabilidad?: number;
    usos?: number;
    stats?: {
      atk?: number;
      defensa?: number;
      vida?: number;
    };
  };
  item?: any;
  vendedorData?: {
    username: string;
  };
}
```

### dungeon.model.ts
```typescript
export interface Dungeon {
  _id: string;
  nombre: string;
  descripcion: string;
  dificultad: 'facil' | 'normal' | 'dificil' | 'extremo';
  nivel_recomendado: number;
  max_personajes: number;
  recompensas: DungeonRewards;
  enemigos: Enemy[];
  activa: boolean;
}

export interface DungeonRewards {
  val_min: number;
  val_max: number;
  experiencia_base: number;
  items_posibles: string[];
}

export interface Enemy {
  nombre: string;
  nivel: number;
  stats: {
    atk: number;
    vida: number;
    defensa: number;
  };
}
```

---

## 🔧 SERVICIOS CORE (COPIAR Y PEGAR)

### api.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body);
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`);
  }
}
```

### auth.service.ts
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '@models/user.model';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'auth_token';

  constructor(private api: ApiService) {
    this.loadUserFromToken();
  }

  register(email: string, username: string, password: string): Observable<RegisterResponse> {
    return this.api.post<RegisterResponse>('/auth/register', { email, username, password });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      // Cargar datos del usuario
      this.api.get<User>('/api/users/me').subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
```

### character.service.ts
```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Character } from '@models/character.model';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  constructor(private api: ApiService) {}

  useConsumable(characterId: string, consumableId: string): Observable<any> {
    return this.api.post(`/api/characters/${characterId}/use-consumable`, { consumableId });
  }

  reviveCharacter(characterId: string): Observable<any> {
    return this.api.post(`/api/characters/${characterId}/revive`, {});
  }

  healCharacter(characterId: string): Observable<any> {
    return this.api.post(`/api/characters/${characterId}/heal`, {});
  }

  evolveCharacter(characterId: string): Observable<any> {
    return this.api.post(`/api/characters/${characterId}/evolve`, {});
  }

  addExperience(characterId: string, amount: number): Observable<any> {
    return this.api.post(`/api/characters/${characterId}/add-experience`, { amount });
  }
}
```

### marketplace.service.ts
```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  constructor(private api: ApiService) {}

  getListings(filters?: any): Observable<Listing[]> {
    return this.api.get<Listing[]>('/api/marketplace/listings', filters);
  }

  createListing(itemId: string, precio: number, destacar?: boolean, metadata?: any): Observable<Listing> {
    return this.api.post<Listing>('/api/marketplace/listings', { 
      itemId, 
      precio, 
      destacar, 
      metadata 
    });
  }

  buyItem(listingId: string): Observable<any> {
    return this.api.post(`/api/marketplace/listings/${listingId}/buy`, {});
  }

  cancelListing(listingId: string): Observable<any> {
    return this.api.post(`/api/marketplace/listings/${listingId}/cancel`, {});
  }
}
```

---

## 🛡️ INTERCEPTORES

### auth.interceptor.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token && !req.url.includes('/auth/')) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
```

### error.interceptor.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

---

## 🎨 COMPONENTE DE EJEMPLO: Character Card

### character-card.component.ts
```typescript
import { Component, Input } from '@angular/core';
import { Character } from '@models/character.model';

@Component({
  selector: 'app-character-card',
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent {
  @Input() character!: Character;

  getRarityClass(): string {
    const rarityMap: Record<string, string> = {
      'D': 'bg-gray-400',
      'C': 'bg-green-400',
      'B': 'bg-blue-400',
      'A': 'bg-purple-400',
      'S': 'bg-orange-400',
      'SS': 'bg-red-400',
      'SSS': 'bg-yellow-400'
    };
    return rarityMap[this.character.rango] || 'bg-gray-400';
  }

  getHealthPercentage(): number {
    return (this.character.saludActual / this.character.saludMaxima) * 100;
  }
}
```

### character-card.component.html
```html
<div class="character-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
  <!-- Header con rango -->
  <div class="card-header p-2 text-white text-center font-bold" [ngClass]="getRarityClass()">
    Rango {{ character.rango }}
  </div>

  <!-- Imagen del personaje -->
  <div class="card-image bg-gray-200 h-48 flex items-center justify-center">
    <span class="text-4xl">🎮</span>
  </div>

  <!-- Información del personaje -->
  <div class="card-body p-4">
    <h3 class="text-xl font-bold mb-2">{{ character.personajeId }}</h3>
    
    <!-- Nivel y Etapa -->
    <div class="flex justify-between mb-2">
      <span class="text-sm">Nivel {{ character.nivel }}</span>
      <span class="text-sm">Etapa {{ character.etapa }}</span>
    </div>

    <!-- Barra de salud -->
    <div class="mb-3">
      <div class="flex justify-between text-xs mb-1">
        <span>Salud</span>
        <span>{{ character.saludActual }}/{{ character.saludMaxima }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-green-500 h-2 rounded-full transition-all"
          [style.width.%]="getHealthPercentage()">
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-2 text-center text-sm">
      <div class="bg-red-100 rounded p-2">
        <div class="font-bold">{{ character.stats.atk }}</div>
        <div class="text-xs">ATK</div>
      </div>
      <div class="bg-blue-100 rounded p-2">
        <div class="font-bold">{{ character.stats.defensa }}</div>
        <div class="text-xs">DEF</div>
      </div>
      <div class="bg-green-100 rounded p-2">
        <div class="font-bold">{{ character.stats.vida }}</div>
        <div class="text-xs">HP</div>
      </div>
    </div>

    <!-- Estado -->
    <div class="mt-3">
      <span 
        class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
        [ngClass]="{
          'bg-green-200 text-green-800': character.estado === 'saludable',
          'bg-red-200 text-red-800': character.estado === 'herido'
        }">
        {{ character.estado === 'saludable' ? '✓ Saludable' : '⚠ Herido' }}
      </span>
    </div>
  </div>
</div>
```

---

## 📱 RUTAS PRINCIPALES

### app.routes.ts
```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'characters',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/characters/characters.routes').then(m => m.CHARACTER_ROUTES)
  },
  {
    path: 'inventory',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES)
  },
  {
    path: 'marketplace',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/marketplace/marketplace.routes').then(m => m.MARKETPLACE_ROUTES)
  },
  {
    path: 'dungeons',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dungeons/dungeons.routes').then(m => m.DUNGEON_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
```

---

## ✅ CHECKLIST DE DESARROLLO (SEMANA POR SEMANA)

### Semana 1-2: Setup y Autenticación
- [ ] Crear proyecto Angular
- [ ] Configurar TailwindCSS y Angular Material
- [ ] Crear modelos TypeScript
- [ ] Implementar servicios core (API, Auth)
- [ ] Crear interceptores (Auth, Error)
- [ ] Página de Login
- [ ] Página de Registro
- [ ] Página de Verificación de Email
- [ ] Guard de autenticación

### Semana 3-4: Dashboard y Personajes
- [ ] Dashboard principal
- [ ] Lista de personajes
- [ ] Detalle de personaje
- [ ] Character Card component
- [ ] Sistema de evolución
- [ ] Usar consumibles

### Semana 5-6: Inventario y Marketplace
- [ ] Vista de inventario
- [ ] Filtros de inventario
- [ ] Lista de marketplace
- [ ] Crear listing
- [ ] Comprar item
- [ ] Cancelar listing

### Semana 7-8: Mazmorras y Pulido
- [ ] Lista de mazmorras
- [ ] Detalle de mazmorra
- [ ] Sistema de combate básico
- [ ] Animaciones y transiciones
- [ ] Responsive design
- [ ] Testing
- [ ] Optimizaciones

---

## 🚀 COMANDOS PARA EMPEZAR HOY

```bash
# 1. Crear proyecto
ng new valgame-frontend --routing --style=scss --ssr=false
cd valgame-frontend

# 2. Instalar dependencias
ng add @angular/material
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
npm install socket.io-client ethers date-fns

# 3. Crear estructura básica
ng generate module core
ng generate module shared
ng generate module features/auth
ng generate module features/dashboard
ng generate module features/characters

# 4. Crear servicios
ng generate service core/services/api
ng generate service core/services/auth
ng generate service features/characters/services/character

# 5. Crear guards e interceptors
ng generate guard core/guards/auth
ng generate interceptor core/interceptors/auth
ng generate interceptor core/interceptors/error

# 6. Crear componentes iniciales
ng generate component features/auth/pages/login
ng generate component features/auth/pages/register
ng generate component features/dashboard/pages/dashboard
ng generate component features/characters/pages/character-list
ng generate component shared/components/character-card

# 7. Iniciar desarrollo
ng serve
```

---

## 📚 RECURSOS ADICIONALES

### Documentación
- [Angular Docs](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [RxJS](https://rxjs.dev/)

### Herramientas Recomendadas
- **VS Code Extensions:**
  - Angular Language Service
  - Angular Snippets
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

### Testing
```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Coverage
ng test --code-coverage
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **HOY:** Crear proyecto y estructura básica
2. **Mañana:** Implementar autenticación (login/register)
3. **Esta semana:** Dashboard y visualización de personajes
4. **Próxima semana:** Inventario y marketplace básico

---

## 💡 TIPS IMPORTANTES

1. **Mobile First:** Diseña primero para móvil
2. **Lazy Loading:** Usa lazy loading para todos los módulos
3. **OnPush:** Usa OnPush change detection para mejor rendimiento
4. **RxJS:** Siempre desuscríbete de observables
5. **TypeScript:** Usa tipado fuerte, evita `any`
6. **Componentes Pequeños:** Mantén componentes pequeños y enfocados
7. **Servicios:** Toda la lógica de negocio en servicios
8. **Testing:** Escribe tests desde el inicio

---

## 🆘 SOPORTE

Si tienes dudas durante el desarrollo:
1. Revisa la documentación del backend en `/docs`
2. Consulta los tests E2E para ver ejemplos de uso
3. Revisa los modelos TypeScript para entender la estructura de datos

**¡ESTÁS LISTO PARA COMENZAR! 🚀**
