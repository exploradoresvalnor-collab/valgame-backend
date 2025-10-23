# Arquitectura Frontend - Exploradores de Valnor (Angular)

## 1. Visión General
El frontend de Exploradores de Valnor será una aplicación web moderna construida con Angular 17+, aprovechando las últimas características del framework para ofrecer una experiencia de usuario óptima y reactiva.

## 2. Estructura de Rutas y Módulos

### 2.1 Área Pública
```
/                           # Landing page
├── /auth
│   ├── /login             # Inicio de sesión
│   ├── /register          # Registro de cuenta
│   ├── /verify-email      # Verificación de email
│   └── /forgot-password   # Recuperación de contraseña
└── /about                 # Información del juego
```

### 2.2 Área de Juego Principal
```
/game
├── /characters            # Lista de personajes
│   ├── /:id              # Detalles del personaje
│   └── /evolution        # Evolución del personaje
├── /inventory            # Inventario del jugador
│   ├── /equipment        # Gestión de equipamiento
│   └── /consumables      # Gestión de consumibles
├── /dungeons             # Lista de mazmorras
│   └── /:id             # Mazmorra específica y combate
└── /rankings            # Clasificaciones globales
```

### 2.3 Marketplace
```
/marketplace
├── /browse              # Explorar items
│   ├── /characters     # Personajes en venta
│   ├── /equipment      # Equipamiento en venta
│   └── /consumables    # Consumibles en venta
├── /my-listings        # Mis items en venta
├── /history           # Historial de transacciones
└── /create-listing    # Crear nuevo listing
```

### 2.4 Área de Usuario
```
/user
├── /profile           # Perfil del jugador
├── /wallet           # Gestión de VAL y crypto
├── /settings         # Configuración de cuenta
└── /notifications    # Centro de notificaciones
```

### 2.5 Tienda
```
/store
├── /packages         # Paquetes de personajes
├── /special-offers   # Ofertas especiales
├── /val-purchase    # Compra de VAL
└── /history         # Historial de compras
```

## 3. Stack Tecnológico

### 3.1 Core Technologies
- **Framework**: Angular 17+
- **Lenguaje**: TypeScript 5+
- **State Management**: NgRx (Store, Effects, Entity)
- **Estilado**: TailwindCSS + Angular Material
- **Web3**: ethers.js v6
- **HTTP Client**: HttpClient (Angular)
- **WebSocket**: Socket.io-client
- **Forms**: Reactive Forms

### 3.2 Dependencias Principales
```json
{
  "dependencies": {
    "@angular/core": "^17.x",
    "@angular/common": "^17.x",
    "@angular/router": "^17.x",
    "@angular/forms": "^17.x",
    "@angular/material": "^17.x",
    "@ngrx/store": "^17.x",
    "@ngrx/effects": "^17.x",
    "@ngrx/entity": "^17.x",
    "@ngrx/store-devtools": "^17.x",
    "tailwindcss": "^3.x",
    "ethers": "^6.x",
    "socket.io-client": "^4.x",
    "rxjs": "^7.x"
  }
}
```

## 4. Estructura del Proyecto

```bash
src/
├── app/
│   ├── core/                    # Módulo Core (singleton)
│   │   ├── guards/             # Guards de rutas
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/       # HTTP Interceptors
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   ├── services/           # Servicios globales
│   │   │   ├── auth.service.ts
│   │   │   ├── api.service.ts
│   │   │   ├── socket.service.ts
│   │   │   └── notification.service.ts
│   │   └── core.module.ts
│   │
│   ├── shared/                  # Módulo Shared (reutilizable)
│   │   ├── components/         # Componentes compartidos
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── sidebar/
│   │   │   ├── loading-spinner/
│   │   │   └── modal/
│   │   ├── directives/         # Directivas personalizadas
│   │   ├── pipes/              # Pipes personalizados
│   │   │   ├── rarity-color.pipe.ts
│   │   │   └── time-ago.pipe.ts
│   │   └── shared.module.ts
│   │
│   ├── features/               # Módulos de características
│   │   ├── auth/              # Módulo de autenticación
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── characters/        # Módulo de personajes
│   │   │   ├── components/
│   │   │   │   ├── character-card/
│   │   │   │   ├── character-detail/
│   │   │   │   └── evolution-dialog/
│   │   │   ├── pages/
│   │   │   │   ├── character-list/
│   │   │   │   └── character-detail/
│   │   │   ├── services/
│   │   │   │   └── character.service.ts
│   │   │   ├── store/
│   │   │   │   ├── character.actions.ts
│   │   │   │   ├── character.effects.ts
│   │   │   │   ├── character.reducer.ts
│   │   │   │   └── character.selectors.ts
│   │   │   └── characters.module.ts
│   │   │
│   │   ├── inventory/         # Módulo de inventario
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── inventory.module.ts
│   │   │
│   │   ├── dungeons/          # Módulo de mazmorras
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── dungeons.module.ts
│   │   │
│   │   ├── marketplace/       # Módulo de marketplace
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── marketplace.module.ts
│   │   │
│   │   └── user/             # Módulo de usuario
│   │       ├── components/
│   │       ├── pages/
│   │       ├── services/
│   │       ├── store/
│   │       └── user.module.ts
│   │
│   ├── store/                 # Store global de NgRx
│   │   ├── app.state.ts      # Estado global
│   │   ├── app.reducer.ts    # Reducers combinados
│   │   └── app.effects.ts    # Effects globales
│   │
│   ├── models/               # Interfaces y tipos
│   │   ├── user.model.ts
│   │   ├── character.model.ts
│   │   ├── item.model.ts
│   │   ├── dungeon.model.ts
│   │   └── marketplace.model.ts
│   │
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.routes.ts         # Configuración de rutas
│   └── app.config.ts         # Configuración de la app
│
├── assets/                   # Recursos estáticos
│   ├── images/
│   ├── icons/
│   └── i18n/                # Archivos de traducción
│       ├── es.json
│       ├── en.json
│       └── pt.json
│
└── environments/            # Configuración de entornos
    ├── environment.ts
    └── environment.prod.ts
```

## 5. Arquitectura de Estado con NgRx

### 5.1 Estado Global
```typescript
// store/app.state.ts
import { CharacterState } from '../features/characters/store/character.reducer';
import { InventoryState } from '../features/inventory/store/inventory.reducer';
import { MarketplaceState } from '../features/marketplace/store/marketplace.reducer';
import { UserState } from '../features/user/store/user.reducer';

export interface AppState {
  characters: CharacterState;
  inventory: InventoryState;
  marketplace: MarketplaceState;
  user: UserState;
}
```

### 5.2 Ejemplo de Store de Personajes
```typescript
// features/characters/store/character.actions.ts
import { createAction, props } from '@ngrx/store';
import { Character } from '@models/character.model';

export const loadCharacters = createAction('[Characters] Load Characters');
export const loadCharactersSuccess = createAction(
  '[Characters] Load Characters Success',
  props<{ characters: Character[] }>()
);
export const loadCharactersFailure = createAction(
  '[Characters] Load Characters Failure',
  props<{ error: any }>()
);

export const evolveCharacter = createAction(
  '[Characters] Evolve Character',
  props<{ characterId: string }>()
);
export const evolveCharacterSuccess = createAction(
  '[Characters] Evolve Character Success',
  props<{ character: Character }>()
);

// features/characters/store/character.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Character } from '@models/character.model';
import * as CharacterActions from './character.actions';

export interface CharacterState extends EntityState<Character> {
  loading: boolean;
  error: any;
  selectedCharacterId: string | null;
}

export const adapter: EntityAdapter<Character> = createEntityAdapter<Character>({
  selectId: (character: Character) => character._id
});

export const initialState: CharacterState = adapter.getInitialState({
  loading: false,
  error: null,
  selectedCharacterId: null
});

export const characterReducer = createReducer(
  initialState,
  on(CharacterActions.loadCharacters, (state) => ({
    ...state,
    loading: true
  })),
  on(CharacterActions.loadCharactersSuccess, (state, { characters }) =>
    adapter.setAll(characters, { ...state, loading: false })
  ),
  on(CharacterActions.loadCharactersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

// features/characters/store/character.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CharacterState, adapter } from './character.reducer';

export const selectCharacterState = createFeatureSelector<CharacterState>('characters');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = adapter.getSelectors(selectCharacterState);

export const selectCharactersLoading = createSelector(
  selectCharacterState,
  (state) => state.loading
);

export const selectCharacterById = (id: string) => createSelector(
  selectEntities,
  (entities) => entities[id]
);

// features/characters/store/character.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { CharacterService } from '../services/character.service';
import * as CharacterActions from './character.actions';

@Injectable()
export class CharacterEffects {
  loadCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharacterActions.loadCharacters),
      switchMap(() =>
        this.characterService.getCharacters().pipe(
          map(characters => CharacterActions.loadCharactersSuccess({ characters })),
          catchError(error => of(CharacterActions.loadCharactersFailure({ error })))
        )
      )
    )
  );

  evolveCharacter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharacterActions.evolveCharacter),
      switchMap(({ characterId }) =>
        this.characterService.evolveCharacter(characterId).pipe(
          map(character => CharacterActions.evolveCharacterSuccess({ character })),
          catchError(error => of(CharacterActions.loadCharactersFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private characterService: CharacterService
  ) {}
}
```

## 6. Servicios HTTP

### 6.1 Servicio Base de API
```typescript
// core/services/api.service.ts
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

### 6.2 Servicio de Personajes
```typescript
// features/characters/services/character.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Character } from '@models/character.model';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  constructor(private api: ApiService) {}

  getCharacters(): Observable<Character[]> {
    return this.api.get<Character[]>('/api/characters');
  }

  getCharacterById(id: string): Observable<Character> {
    return this.api.get<Character>(`/api/characters/${id}`);
  }

  evolveCharacter(characterId: string): Observable<Character> {
    return this.api.post<Character>('/api/characters/evolve', { characterId });
  }

  equipItem(characterId: string, itemId: string): Observable<Character> {
    return this.api.post<Character>('/api/characters/equip', { characterId, itemId });
  }

  unequipItem(characterId: string, itemId: string): Observable<Character> {
    return this.api.post<Character>('/api/characters/unequip', { characterId, itemId });
  }

  useConsumable(characterId: string, consumableId: string): Observable<Character> {
    return this.api.post<Character>('/api/characters/use-consumable', { 
      characterId, 
      consumableId 
    });
  }

  setActiveCharacter(characterId: string): Observable<void> {
    return this.api.post<void>('/api/characters/set-active', { characterId });
  }
}
```

## 7. Interceptores HTTP

### 7.1 Interceptor de Autenticación
```typescript
// core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
```

### 7.2 Interceptor de Errores
```typescript
// core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado o inválido
          this.router.navigate(['/auth/login']);
          this.notificationService.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 403) {
          this.notificationService.error('No tienes permisos para realizar esta acción.');
        } else if (error.status === 404) {
          this.notificationService.error('Recurso no encontrado.');
        } else if (error.status >= 500) {
          this.notificationService.error('Error del servidor. Intenta nuevamente más tarde.');
        }
        
        return throwError(() => error);
      })
    );
  }
}
```

## 8. Guards de Rutas

### 8.1 Auth Guard
```typescript
// core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

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
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Guardar la URL intentada para redirigir después del login
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}
```

## 9. Integración con WebSocket

### 9.1 Servicio de Socket
```typescript
// core/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connected$ = new Subject<boolean>();

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.wsUrl, {
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Socket conectado');
      const token = this.authService.getToken();
      if (token) {
        this.socket?.emit('auth', token);
      }
      this.connected$.next(true);
    });

    this.socket.on('auth:success', () => {
      console.log('Socket autenticado correctamente');
    });

    this.socket.on('auth:error', (error: any) => {
      console.error('Error de autenticación del socket:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket desconectado');
      this.connected$.next(false);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Escuchar eventos
  on<T>(eventName: string): Observable<T> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('Socket no conectado');
        return;
      }

      this.socket.on(eventName, (data: T) => {
        observer.next(data);
      });

      return () => {
        this.socket?.off(eventName);
      };
    });
  }

  // Emitir eventos
  emit(eventName: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    }
  }

  // Observable del estado de conexión
  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }
}
```

### 9.2 Uso en Componentes
```typescript
// features/marketplace/pages/marketplace-list/marketplace-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { SocketService } from '@core/services/socket.service';
import * as MarketplaceActions from '../../store/marketplace.actions';

@Component({
  selector: 'app-marketplace-list',
  templateUrl: './marketplace-list.component.html',
  styleUrls: ['./marketplace-list.component.scss']
})
export class MarketplaceListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    // Cargar listings iniciales
    this.store.dispatch(MarketplaceActions.loadListings());

    // Escuchar actualizaciones en tiempo real
    this.socketService.on<any>('marketplace:update')
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => {
        if (update.type === 'new') {
          this.store.dispatch(MarketplaceActions.addListing({ listing: update.data }));
        } else if (update.type === 'sold') {
          this.store.dispatch(MarketplaceActions.removeListing({ listingId: update.data._id }));
        } else if (update.type === 'refresh') {
          this.store.dispatch(MarketplaceActions.loadListings());
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 10. Integración Web3

### 10.1 Servicio Web3
```typescript
// core/services/web3.service.ts
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { Observable, from, throwError } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;

  constructor() {
    this.initProvider();
  }

  private initProvider(): void {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
    }
  }

  connectWallet(): Observable<string> {
    if (!this.provider) {
      return throwError(() => new Error('MetaMask no está instalado'));
    }

    return from(
      this.provider.send('eth_requestAccounts', [])
        .then(accounts => accounts[0])
    );
  }

  getBalance(address: string): Observable<string> {
    if (!this.provider) {
      return throwError(() => new Error('Provider no disponible'));
    }

    return from(
      this.provider.getBalance(address)
        .then(balance => ethers.formatEther(balance))
    );
  }

  async purchaseWithCrypto(productId: string, amount: string): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider no disponible');
    }

    const signer = await this.provider.getSigner();
    const contract = new ethers.Contract(
      environment.gameContractAddress,
      environment.gameContractABI,
      signer
    );

    const tx = await contract.purchase(productId, {
      value: ethers.parseEther(amount)
    });

    return await tx.wait();
  }
}
```

## 11. Formularios Reactivos

### 11.1 Ejemplo de Formulario de Login
```typescript
// features/auth/pages/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading$ = this.store.select(state => state.auth.loading);
  error$ = this.store.select(state => state.auth.error);

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.store.dispatch(AuthActions.login({ email, password }));
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
```

```html
<!-- features/auth/pages/login/login.component.html -->
<div class="login-container">
  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
    <h2>Iniciar Sesión</h2>
    
    <mat-form-field appearance="outline">
      <mat-label>Email</mat-label>
      <input matInput type="email" formControlName="email">
      <mat-error *ngIf="email?.hasError('required')">
        El email es requerido
      </mat-error>
      <mat-error *ngIf="email?.hasError('email')">
        Email inválido
      </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Contraseña</mat-label>
      <input matInput type="password" formControlName="password">
      <mat-error *ngIf="password?.hasError('required')">
        La contraseña es requerida
      </mat-error>
      <mat-error *ngIf="password?.hasError('minlength')">
        Mínimo 6 caracteres
      </mat-error>
    </mat-form-field>

    <button 
      mat-raised-button 
      color="primary" 
      type="submit"
      [disabled]="loginForm.invalid || (loading$ | async)">
      <span *ngIf="!(loading$ | async)">Iniciar Sesión</span>
      <mat-spinner *ngIf="loading$ | async" diameter="20"></mat-spinner>
    </button>

    <div *ngIf="error$ | async as error" class="error-message">
      {{ error }}
    </div>
  </form>
</div>
```

## 12. Modelos de Datos (Interfaces TypeScript)

### 12.1 Usuario
```typescript
// models/user.model.ts
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
  fechaRegistro: Date;
  ultimaActualizacion: Date;
  receivedPioneerPackage?: boolean;
}
```

### 12.2 Personaje
```typescript
// models/character.model.ts
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

### 12.3 Items
```typescript
// models/item.model.ts
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

### 12.4 Mazmorra
```typescript
// models/dungeon.model.ts
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

### 12.5 Marketplace
```typescript
// models/marketplace.model.ts
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
  item?: any;
  vendedorData?: {
    username: string;
  };
}
```

## 13. Endpoints del Backend

### 13.1 Autenticación
```typescript
// POST /auth/register
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

// POST /auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /auth/verify-email
interface VerifyEmailRequest {
  token: string;
}

// POST /auth/forgot-password
interface ForgotPasswordRequest {
  email: string;
}

// POST /auth/reset-password
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

### 13.2 Personajes
```typescript
// GET /api/characters - Obtiene todos los personajes del usuario
// GET /api/characters/:id - Obtiene detalles de un personaje
// POST /api/characters/evolve - Evoluciona un personaje
// POST /api/characters/equip - Equipa un item
// POST /api/characters/unequip - Desequipa un item
// POST /api/characters/use-consumable - Usa un consumible
// POST /api/characters/set-active - Establece personaje activo
```

### 13.3 Mazmorras
```typescript
// GET /api/dungeons - Lista todas las mazmorras
// GET /api/dungeons/:id - Detalles de una mazmorra
// POST /api/dungeons/:id/enter - Entra a una mazmorra
```

### 13.4 Marketplace
```typescript
// GET /api/marketplace/listings - Lista todos los listings
// POST /api/marketplace/listings - Crea un nuevo listing
// DELETE /api/marketplace/listings/:id - Cancela un listing
// POST /api/marketplace/listings/:id/buy - Compra un item
// GET /api/marketplace/my-listings - Listings del usuario
// GET /api/marketplace/history - Historial de transacciones
```

### 13.5 Paquetes
```typescript
// GET /api/packages - Lista todos los paquetes
// POST /api/user-packages/purchase - Compra un paquete
// POST /api/user-packages/open - Abre un paquete
// GET /api/user-packages - Paquetes sin abrir del usuario
```

### 13.6 Usuario
```typescript
// GET /api/users/me - Información del usuario
// PATCH /api/users/me - Actualiza información del usuario
// GET /api/users/me/wallet - Balance de monedas
// GET /api/users/me/inventory - Inventario completo
```

## 14. Eventos WebSocket

### 14.1 Eventos del Cliente al Servidor
```typescript
socket.emit('auth', token: string);
socket.emit('subscribe:marketplace');
socket.emit('subscribe:battle', battleId: string);
```

### 14.2 Eventos del Servidor al Cliente
```typescript
socket.on('auth:success', () => void);
socket.on('auth:error', (error: { message: string }) => void);
socket.on('inventory:update', (inventory: any) => void);
socket.on('reward:received', (reward: any) => void);
socket.on('character:update', (data: any) => void);
socket.on('marketplace:update', (data: any) => void);
socket.on('game:event', (eventData: any) => void);
socket.on('rankings:update', (rankings: any) => void);
socket.on('battle:update', (battleState: any) => void);
```

## 15. Configuración de Rutas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component')
      .then(m => m.LandingComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: 'game',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/game/game.routes')
      .then(m => m.GAME_ROUTES)
  },
  {
    path: 'marketplace',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/marketplace/marketplace.routes')
      .then(m => m.MARKETPLACE_ROUTES)
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/user/user.routes')
      .then(m => m.USER_ROUTES)
  },
  {
    path: 'store',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/store/store.routes')
      .then(m => m.STORE_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```

## 16. Variables de Entorno

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080',
  gameContractAddress: '0x...',
  gameContractABI: [],
  chainId: 1,
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY'
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.valnor.com',
  wsUrl: 'wss://api.valnor.com',
  gameContractAddress: '0x...',
  gameContractABI: [],
  chainId: 1,
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY'
};
```

## 17. Pipes Personalizados

### 17.1 Pipe de Rareza
```typescript
// shared/pipes/rarity-color.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rarityColor',
  standalone: true
})
export class RarityColorPipe implements PipeTransform {
  transform(rarity: string): string {
    const colors: { [key: string]: string } = {
      'comun': 'text-gray-500',
      'raro': 'text-blue-500',
      'epico': 'text-purple-500',
      'legendario': 'text-orange-500'
    };
    return colors[rarity] || 'text-gray-500';
  }
}
```

### 17.2 Pipe de Tiempo Relativo
```typescript
// shared/pipes/time-ago.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'hace un momento';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
    return `hace ${Math.floor(seconds / 86400)} días`;
  }
}
```

## 18. Internacionalización (i18n)

### 18.1 Configuración
```typescript
// app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'es',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};
```

### 18.2 Archivos de Traducción
```json
// assets/i18n/es.json
{
  "common": {
    "welcome": "Bienvenido a Exploradores de Valnor",
    "login": "Iniciar Sesión",
    "register": "Registrarse",
    "logout": "Cerrar Sesión"
  },
  "characters": {
    "title": "Personajes",
    "level": "Nivel",
    "rank": "Rango",
    "evolve": "Evolucionar"
  }
}

// assets/i18n/en.json
{
  "common": {
    "welcome": "Welcome to Valnor Explorers",
    "login": "Login",
    "register": "Register",
    "logout": "Logout"
  },
  "characters": {
    "title": "Characters",
    "level": "Level",
    "rank": "Rank",
    "evolve": "Evolve"
  }
}
```

### 18.3 Uso en Componentes
```typescript
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{ 'common.welcome' | translate }}</h1>
    <button (click)="changeLanguage('es')">Español</button>
    <button (click)="changeLanguage('en')">English</button>
  `
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('es');
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
  }
}
```

## 19. Testing

### 19.1 Configuración de Karma
```typescript
// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {},
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    restartOnFileChange: true
  });
};
```

### 19.2 Ejemplo de Test de Componente
```typescript
// features/characters/components/character-card/character-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterCardComponent } from './character-card.component';
import { Character } from '@models/character.model';

describe('CharacterCardComponent', () => {
  let component: CharacterCardComponent;
  let fixture: ComponentFixture<CharacterCardComponent>;

  const mockCharacter: Character = {
    _id: '1',
    personajeId: 'hero-001',
    nombre: 'Héroe',
    rango: 'A',
    nivel: 10,
    etapa: 1,
    progreso: 50,
    experiencia: 1000,
    stats: { atk: 100, vida: 500, defensa: 50 },
    saludActual: 100,
    saludMaxima: 100,
    estado: 'saludable',
    fechaHerido: null,
    equipamiento: [],
    activeBuffs: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterCardComponent);
    component = fixture.componentInstance;
    component.character = mockCharacter;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display character name', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.character-name').textContent).toContain('Héroe');
  });

  it('should display character stats', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.atk').textContent).toContain('100');
    expect(compiled.querySelector('.vida').textContent).toContain('500');
    expect(compiled.querySelector('.defensa').textContent).toContain('50');
  });
});
```

### 19.3 Ejemplo de Test de Servicio
```typescript
// features/characters/services/character.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CharacterService } from './character.service';
import { Character } from '@models/character.model';

describe('CharacterService', () => {
  let service: CharacterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CharacterService]
    });
    service = TestBed.inject(CharacterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch characters', () => {
    const mockCharacters: Character[] = [
      // ... mock data
    ];

    service.getCharacters().subscribe(characters => {
      expect(characters.length).toBe(mockCharacters.length);
      expect(characters).toEqual(mockCharacters);
    });

    const req = httpMock.expectOne('/api/characters');
    expect(req.request.method).toBe('GET');
    req.flush(mockCharacters);
  });
});
```

## 20. Optimización y Rendimiento

### 20.1 Lazy Loading de Módulos
```typescript
// Ya implementado en app.routes.ts con loadChildren
```

### 20.2 OnPush Change Detection
```typescript
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-character-card',
  templateUrl: './character-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterCardComponent {
  @Input() character!: Character;
}
```

### 20.3 TrackBy en ngFor
```typescript
@Component({
  template: `
    <div *ngFor="let character of characters; trackBy: trackByCharacterId">
      <app-character-card [character]="character"></app-character-card>
    </div>
  `
})
export class CharacterListComponent {
  characters: Character[] = [];

  trackByCharacterId(index: number, character: Character): string {
    return character._id;
  }
}
```

## 21. Build y Deployment

### 21.1 Configuración de Build
```json
// angular.json
{
  "projects": {
    "valnor-frontend": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                }
              ],
              "outputHashing": "all",
              "optimization": true,
              "sourceMap": false,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
}
```

### 21.2 Scripts de Package.json
```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  }
}
```

## 22. Estructura de Respuestas del Backend

### 22.1 Respuesta Exitosa
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
```

### 22.2 Respuesta de Error
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 22.3 Códigos de Error
```typescript
export enum ErrorCodes {
  // Autenticación
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Validación
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Recursos
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Juego
  INSUFFICIENT_RESOURCES = 'INSUFFICIENT_RESOURCES',
  CHARACTER_NOT_READY = 'CHARACTER_NOT_READY',
  INVALID_EVOLUTION = 'INVALID_EVOLUTION',
  INVENTORY_FULL = 'INVENTORY_FULL',
  
  // Marketplace
  LISTING_EXPIRED = 'LISTING_EXPIRED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ITEM_ALREADY_LISTED = 'ITEM_ALREADY_LISTED',
  
  // Sistema
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}
```

## 23. Mejores Prácticas

### 23.1 Organización de Código
- Un componente por archivo
- Usar módulos standalone cuando sea posible
- Mantener componentes pequeños y enfocados
- Separar lógica de negocio en servicios

### 23.2 Naming Conventions
- Componentes: `character-card.component.ts`
- Servicios: `character.service.ts`
- Guards: `auth.guard.ts`
- Pipes: `rarity-color.pipe.ts`
- Modelos: `character.model.ts`

### 23.3 RxJS Best Practices
- Siempre desuscribirse de observables
- Usar operadores como `takeUntil`, `take`, `first`
- Evitar suscripciones anidadas
- Usar `async` pipe en templates cuando sea posible

### 23.4 Performance
- Usar OnPush change detection
- Implementar trackBy en ngFor
- Lazy load de módulos
- Optimizar imágenes
- Minimizar el uso de `any`

## 24. Monitoreo y Analytics

### 24.1 Integración con Google Analytics
```typescript
// core/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private router: Router) {
    this.initGoogleAnalytics();
  }

  private initGoogleAnalytics(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (typeof gtag === 'function') {
        gtag('config', 'G-XXXXXXXXXX', {
          page_path: event.urlAfterRedirects
        });
      }
    });
  }

  trackEvent(eventName: string, eventParams?: any): void {
    if (typeof gtag === 'function') {
      gtag('event', eventName, eventParams);
    }
  }
}
```

### 24.2 Error Tracking con Sentry
```typescript
// app.config.ts
import * as Sentry from '@sentry/angular';
import { ErrorHandler } from '@angular/core';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 1.0
});

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false
      })
    }
  ]
};
```

## 25. Accesibilidad (a11y)

### 25.1 Directrices WCAG
- Contraste mínimo de 4.5:1 para texto
- Navegación completa por teclado
- Etiquetas ARIA apropiadas
- Textos alternativos para imágenes

### 25.2 Ejemplo de Componente Accesible
```html
<article 
  role="article"
  [attr.aria-label]="'Personaje ' + character.nombre"
  tabindex="0">
  <h3 [id]="'char-' + character._id">
    {{ character.nombre }}
  </h3>
  <div [attr.aria-labelledby]="'char-' + character._id">
    <span aria-label="Nivel">Nivel {{ character.nivel }}</span>
    <span aria-label="Rango">Rango {{ character.rango }}</span>
  </div>
</article>
```

---

## Resumen

Esta arquitectura proporciona una base sólida para el desarrollo del frontend de Exploradores de Valnor usando Angular 17+. Los puntos clave incluyen:

1. **Modularidad**: Estructura clara con módulos de características
2. **Estado Centralizado**: NgRx para gestión de estado predecible
3. **Comunicación Eficiente**: HTTP + WebSocket para tiempo real
4. **Tipado Fuerte**: TypeScript en toda la aplicación
5. **Escalabilidad**: Lazy loading y optimizaciones de rendimiento
6. **Mantenibilidad**: Código organizado y siguiendo mejores prácticas
7. **Testing**: Configuración completa para pruebas unitarias
8. **Internacionalización**: Soporte multi-idioma desde el inicio
