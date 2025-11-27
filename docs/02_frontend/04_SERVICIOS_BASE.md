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
        // ⚠️ IMPORTANTE: El token viene en httpOnly cookie, NO en response
        // Solo guarda el usuario si lo necesitas en memoria
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): Observable<void> {
    // Llama al backend para limpiar la cookie
    return this.api.post<void>('/auth/logout', {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
      })
    );
  }

  isAuthenticated(): Observable<boolean> {
    // Verifica con el backend (la cookie se envía automáticamente)
    return this.api.get<User>('/api/users/me').pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private loadUserFromToken(): void {
    // Carga el usuario desde el backend (la cookie se envía automáticamente)
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

## 9️⃣ energy.service.ts

```typescript
// src/app/core/services/energy.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface EnergyConsumeRequest {
  cantidad: number;
}

export interface EnergyConsumeResponse {
  success: boolean;
  message: string;
  energiaRestante: number;
  energiaMaxima: number;
  proximaRegeneracion: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EnergyService {
  constructor(private api: ApiService) {}

  /**
   * Consume energía del usuario para actividades de juego
   * @param cantidad Cantidad de energía a consumir
   * @returns Observable con resultado del consumo
   */
  consumeEnergy(cantidad: number): Observable<EnergyConsumeResponse> {
    return this.api.post<EnergyConsumeResponse>('/api/users/energy/consume', {
      cantidad
    });
  }

  /**
   * Verifica si el usuario tiene suficiente energía
   * @param energiaActual Energía actual del usuario
   * @param energiaRequerida Energía requerida para la actividad
   * @returns true si tiene suficiente energía
   */
  hasEnoughEnergy(energiaActual: number, energiaRequerida: number): boolean {
    return energiaActual >= energiaRequerida;
  }

  /**
   * Calcula el tiempo restante para la próxima regeneración
   * @param ultimoReinicio Última vez que se regeneró energía
   * @returns Tiempo en milisegundos hasta la próxima regeneración
   */
  getTimeToNextRegeneration(ultimoReinicio: Date): number {
    const now = new Date();
    const nextRegen = new Date(ultimoReinicio.getTime() + 30 * 60 * 1000); // 30 minutos
    return Math.max(0, nextRegen.getTime() - now.getTime());
  }

  /**
   * Formatea el tiempo restante en formato legible
   * @param milliseconds Tiempo en milisegundos
   * @returns String formateado (ej: "5m 30s")
   */
  formatTimeRemaining(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
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

---

# ��� SURVIVAL SERVICE - ANGULAR (v2.0)

```typescript
// survival.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SurvivalService {
  private apiUrl = `${environment.apiUrl}/api/survival`;
  private currentSessionSubject = new BehaviorSubject<any>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * 1. Iniciar una sesión de Survival
   */
  startSurvival(
    characterId: string,
    equipmentIds?: string[],
    consumableIds?: string[]
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/start`, {
      characterId,
      equipmentIds,
      consumableIds
    }, { withCredentials: true });
  }

  /**
   * 2. Completar una oleada
   */
  completeWave(
    sessionId: string,
    enemiesDefeated: number,
    damageDealt: number,
    damageTaken: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/complete-wave`, {
      enemiesDefeated,
      damageDealt,
      damageTaken
    }, { withCredentials: true });
  }

  /**
   * 3. Usar consumible durante sesión
   */
  useConsumable(sessionId: string, consumableId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${sessionId}/use-consumable`,
      { consumableId },
      { withCredentials: true }
    );
  }

  /**
   * 4. Recoger drop de enemigo
   */
  pickupDrop(sessionId: string, dropItemId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${sessionId}/pickup-drop`,
      { dropItemId },
      { withCredentials: true }
    );
  }

  /**
   * 5. Finalizar sesión exitosamente
   */
  endSurvival(
    sessionId: string,
    finalWave: number,
    totalEnemiesDefeated: number,
    totalPoints: number,
    duration: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/end`, {
      finalWave,
      totalEnemiesDefeated,
      totalPoints,
      duration
    }, { withCredentials: true });
  }

  /**
   * 6. Reportar muerte/derrota
   */
  reportDeath(
    sessionId: string,
    waveDefeatedAt: number,
    totalEnemiesDefeated: number,
    totalPoints: number,
    duration: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/report-death`, {
      waveDefeatedAt,
      totalEnemiesDefeated,
      totalPoints,
      duration
    }, { withCredentials: true });
  }

  /**
   * 7. Canjear puntos por EXP
   */
  exchangeForExp(
    characterId: string,
    pointsToExchange: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/exchange-points/exp`, {
      characterId,
      pointsToExchange
    }, { withCredentials: true });
  }

  /**
   * 8. Canjear puntos por VAL
   */
  exchangeForVal(pointsToExchange: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/exchange-points/val`, {
      pointsToExchange
    }, { withCredentials: true });
  }

  /**
   * 9. Canjear puntos por items
   */
  exchangeForItems(itemId: string, pointsToSpend: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/exchange-points/items`, {
      itemId,
      pointsToSpend
    }, { withCredentials: true });
  }

  /**
   * 10. Obtener leaderboard global
   */
  getLeaderboard(limit: number = 50, offset: number = 0): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaderboard`, {
      params: { limit, offset },
      withCredentials: true
    });
  }

  /**
   * 11. Obtener mis estadísticas
   */
  getMyStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-stats`, { withCredentials: true });
  }

  /**
   * 12. Abandonar sesión actual
   */
  abandonSession(sessionId: string, reason: string = 'manual'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/abandon`, {
      reason
    }, { withCredentials: true });
  }

  /**
   * Actualizar sesión en tiempo real
   */
  setCurrentSession(session: any): void {
    this.currentSessionSubject.next(session);
  }

  /**
   * Obtener sesión actual
   */
  getCurrentSession(): Observable<any> {
    return this.currentSession$;
  }
}
```

---

## USO EJEMPLO EN COMPONENTE

```typescript
import { Component, OnInit } from '@angular/core';
import { SurvivalService } from './services/survival.service';

@Component({
  selector: 'app-survival',
  templateUrl: './survival.component.html',
  styleUrls: ['./survival.component.scss']
})
export class SurvivalComponent implements OnInit {
  currentSession: any;
  myStats: any;
  leaderboard: any[] = [];
  loading = false;

  constructor(private survivalService: SurvivalService) {}

  ngOnInit(): void {
    this.loadMyStats();
    this.loadLeaderboard();
  }

  /**
   * Iniciar nueva sesión de Survival
   */
  startNewSession(characterId: string): void {
    this.loading = true;
    this.survivalService.startSurvival(characterId).subscribe(
      (response) => {
        this.currentSession = response.session;
        this.survivalService.setCurrentSession(response.session);
        this.loading = false;
        console.log('Sesión iniciada:', response.session);
      },
      (error) => {
        this.loading = false;
        alert('Error: ' + error.error.error);
      }
    );
  }

  /**
   * Completar oleada
   */
  completeWave(enemiesDefeated: number, damageDealt: number, damageTaken: number): void {
    this.survivalService.completeWave(
      this.currentSession.sessionId,
      enemiesDefeated,
      damageDealt,
      damageTaken
    ).subscribe(
      (response) => {
        this.currentSession = response.run;
        console.log('Oleada completada:', response);
      },
      (error) => {
        alert('Error: ' + error.error.error);
      }
    );
  }

  /**
   * Finalizar sesión (ganar)
   */
  finalizeSurvival(finalWave: number, totalEnemies: number, totalPoints: number, duration: number): void {
    this.survivalService.endSurvival(
      this.currentSession.sessionId,
      finalWave,
      totalEnemies,
      totalPoints,
      duration
    ).subscribe(
      (response) => {
        console.log('Sesión completada:', response);
        alert('¡Ganaste! Puntos: ' + response.rewards.survivalPoints);
        this.loadMyStats();
        this.loadLeaderboard();
      },
      (error) => {
        alert('Error: ' + error.error.error);
      }
    );
  }

  /**
   * Reportar muerte
   */
  reportDeath(waveDefeatedAt: number, totalEnemies: number, totalPoints: number, duration: number): void {
    this.survivalService.reportDeath(
      this.currentSession.sessionId,
      waveDefeatedAt,
      totalEnemies,
      totalPoints,
      duration
    ).subscribe(
      (response) => {
        console.log('Muerte reportada:', response);
        alert('Llegaste a oleada ' + waveDefeatedAt);
        this.currentSession = null;
      },
      (error) => {
        alert('Error: ' + error.error.error);
      }
    );
  }

  /**
   * Canjear puntos por EXP
   */
  exchangeForExp(characterId: string, points: number): void {
    this.survivalService.exchangeForExp(characterId, points).subscribe(
      (response) => {
        console.log('Intercambio completado:', response);
        alert('Ganaste +' + response.exchange.expGained + ' EXP');
        this.loadMyStats();
      },
      (error) => {
        alert('Error: ' + error.error.error);
      }
    );
  }

  /**
   * Obtener mis estadísticas
   */
  loadMyStats(): void {
    this.survivalService.getMyStats().subscribe(
      (response) => {
        this.myStats = response.stats;
        console.log('Mis stats:', this.myStats);
      },
      (error) => {
        console.error('Error cargando stats:', error);
      }
    );
  }

  /**
   * Obtener leaderboard
   */
  loadLeaderboard(): void {
    this.survivalService.getLeaderboard(50, 0).subscribe(
      (response) => {
        this.leaderboard = response.leaderboard;
        console.log('Leaderboard:', this.leaderboard);
      },
      (error) => {
        console.error('Error cargando leaderboard:', error);
      }
    );
  }

  /**
   * Usar consumible
   */
  useConsumable(consumableId: string): void {
    this.survivalService.useConsumable(
      this.currentSession.sessionId,
      consumableId
    ).subscribe(
      (response) => {
        console.log('Consumible usado:', response);
        alert('Consumible usado: ' + response.consumable.name);
      },
      (error) => {
        alert('Error: ' + error.error.error);
      }
    );
  }

  /**
   * Abandonar sesión
   */
  abandonCurrentSession(): void {
    if (confirm('¿Abandonar sesión actual?')) {
      this.survivalService.abandonSession(this.currentSession.sessionId).subscribe(
        (response) => {
          console.log('Sesión abandonada:', response);
          this.currentSession = null;
          this.loadMyStats();
        },
        (error) => {
          alert('Error: ' + error.error.error);
        }
      );
    }
  }
}
```
