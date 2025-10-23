# 🔧 SERVICIOS BASE - COPIAR Y PEGAR

## 📁 Ubicación
Crear estos archivos en: `src/app/core/services/`

---

## 1️⃣ api.service.ts

```typescript
// src/app/core/services/api.service.ts

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

---

## 2️⃣ auth.service.ts

```typescript
// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '@models/user.model';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@models/auth.model';

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

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.api.post<RegisterResponse>('/auth/register', data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', data).pipe(
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
      this.api.get<User>('/api/users/me').subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshUser(): void {
    if (this.isAuthenticated()) {
      this.api.get<User>('/api/users/me').subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }
}
```

---

## 3️⃣ character.service.ts

```typescript
// src/app/core/services/character.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
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

---

## 4️⃣ marketplace.service.ts

```typescript
// src/app/core/services/marketplace.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Listing, CreateListingRequest, ListingFilters } from '@models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  constructor(private api: ApiService) {}

  getListings(filters?: ListingFilters): Observable<Listing[]> {
    return this.api.get<Listing[]>('/api/marketplace/listings', filters);
  }

  createListing(data: CreateListingRequest): Observable<Listing> {
    return this.api.post<Listing>('/api/marketplace/listings', data);
  }

  buyItem(listingId: string): Observable<any> {
    return this.api.post(`/api/marketplace/listings/${listingId}/buy`, {});
  }

  cancelListing(listingId: string): Observable<any> {
    return this.api.post(`/api/marketplace/listings/${listingId}/cancel`, {});
  }

  getMyListings(): Observable<Listing[]> {
    return this.api.get<Listing[]>('/api/marketplace/my-listings');
  }

  getHistory(): Observable<any[]> {
    return this.api.get<any[]>('/api/marketplace/history');
  }
}
```

---

## 5️⃣ dungeon.service.ts

```typescript
// src/app/core/services/dungeon.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Dungeon, EnterDungeonRequest, DungeonResult } from '@models/dungeon.model';

@Injectable({
  providedIn: 'root'
})
export class DungeonService {
  constructor(private api: ApiService) {}

  getDungeons(): Observable<Dungeon[]> {
    return this.api.get<Dungeon[]>('/api/dungeons');
  }

  getDungeonById(id: string): Observable<Dungeon> {
    return this.api.get<Dungeon>(`/api/dungeons/${id}`);
  }

  enterDungeon(dungeonId: string, data: EnterDungeonRequest): Observable<DungeonResult> {
    return this.api.post<DungeonResult>(`/api/dungeons/${dungeonId}/enter`, data);
  }
}
```

---

## 6️⃣ package.service.ts

```typescript
// src/app/core/services/package.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Package, UserPackage, PurchasePackageRequest, OpenPackageRequest, PackageContent } from '@models/package.model';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  constructor(private api: ApiService) {}

  getPackages(): Observable<Package[]> {
    return this.api.get<Package[]>('/api/packages');
  }

  getUserPackages(): Observable<UserPackage[]> {
    return this.api.get<UserPackage[]>('/api/user-packages');
  }

  purchasePackage(data: PurchasePackageRequest): Observable<UserPackage> {
    return this.api.post<UserPackage>('/api/user-packages/purchase', data);
  }

  openPackage(data: OpenPackageRequest): Observable<{ message: string; rewards: PackageContent }> {
    return this.api.post<{ message: string; rewards: PackageContent }>('/api/user-packages/open', data);
  }
}
```

---

## 7️⃣ socket.service.ts

```typescript
// src/app/core/services/socket.service.ts

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

  emit(eventName: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    }
  }

  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }
}
```

---

## 8️⃣ notification.service.ts

```typescript
// src/app/core/services/notification.service.ts

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  error(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  info(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  warning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
```

---

## 9️⃣ game-settings.service.ts

```typescript
// src/app/core/services/game-settings.service.ts

import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import { GameSettings, LevelRequirement } from '@models/game-settings.model';

@Injectable({
  providedIn: 'root'
})
export class GameSettingsService {
  private settings$: Observable<GameSettings> | null = null;
  private levelRequirements$: Observable<LevelRequirement[]> | null = null;

  constructor(private api: ApiService) {}

  getSettings(): Observable<GameSettings> {
    if (!this.settings$) {
      this.settings$ = this.api.get<GameSettings>('/api/game-settings').pipe(
        shareReplay(1)
      );
    }
    return this.settings$;
  }

  getLevelRequirements(): Observable<LevelRequirement[]> {
    if (!this.levelRequirements$) {
      this.levelRequirements$ = this.api.get<LevelRequirement[]>('/api/level-requirements').pipe(
        shareReplay(1)
      );
    }
    return this.levelRequirements$;
  }
}
```

---

## ✅ CHECKLIST DE SERVICIOS

Después de copiar todos los archivos, verifica:

- [ ] Todos los archivos están en `src/app/core/services/`
- [ ] No hay errores de TypeScript
- [ ] Las importaciones de modelos están correctas
- [ ] Los servicios están registrados con `providedIn: 'root'`

---

## 📝 EJEMPLO DE USO

```typescript
// En un componente
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { CharacterService } from '@core/services/character.service';

@Component({
  selector: 'app-dashboard',
  template: `...`
})
export class DashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private characterService: CharacterService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      console.log('Usuario actual:', user);
    });
  }

  evolveCharacter(characterId: string) {
    this.characterService.evolveCharacter(characterId).subscribe({
      next: (result) => console.log('Evolución exitosa', result),
      error: (error) => console.error('Error', error)
    });
  }
}
```

---

**Siguiente paso:** Ve a `05_COMPONENTES_EJEMPLO.md`
