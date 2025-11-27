# 🔧 Servicios Core - Guía de Referencia Completa

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Catálogo completo de servicios, patrones de uso, inyección de dependencias, interceptores

---

## 📋 Tabla de Contenidos

1. [Arquitectura de Servicios](#arquitectura-de-servicios)
2. [AuthService](#authservice)
3. [UserService](#userservice)
4. [InventoryService](#inventoryservice)
5. [ShopService](#shopservice)
6. [MarketplaceService](#marketplaceservice)
7. [DungeonService](#dungeonservice)
8. [RankingService](#rankingservice)
9. [SeasonService](#seasonservice)
10. [WebSocketService](#websocketservice)
11. [NotificationService](#notificationservice)
12. [StorageService](#storageservice)
13. [Interceptores](#interceptores)
14. [Patrones de Uso](#patrones-de-uso)

---

## 🏗️ Arquitectura de Servicios

### Árbol de Dependencias

```
┌─ AuthService (Base - Autenticación)
│  ├─ UserService (Perfil del usuario)
│  ├─ InventoryService (Inventario)
│  └─ StorageService (Token storage)
│
├─ ShopService (Compra de paquetes)
│  ├─ UserService
│  └─ NotificationService
│
├─ MarketplaceService (Transacciones P2P)
│  ├─ UserService
│  ├─ InventoryService
│  └─ NotificationService
│
├─ DungeonService (Combate)
│  ├─ UserService
│  └─ NotificationService
│
├─ RankingService (Leaderboards)
│  └─ UserService
│
├─ SeasonService (Temporadas)
│  ├─ RankingService
│  └─ UserService
│
├─ WebSocketService (Comunicación en tiempo real)
│  ├─ AuthService
│  └─ NotificationService
│
└─ StorageService (Almacenamiento local)
   └─ Independiente
```

### Patrón de Inyección

```typescript
// CORRECTO - Inyectar servicios específicos
constructor(
  private authService: AuthService,
  private userService: UserService,
  private router: Router
) {}

// EVITAR - Inyectar NgZone o elementos nativos directamente
// Los servicios deben abstraer estas dependencias
```

---

## 🔐 AuthService

**Propósito:** Gestionar autenticación, sesiones, tokens JWT

### Métodos

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.loadUserFromStorage();
  }

  /**
   * Registrar nuevo usuario
   * @param email Email del usuario
   * @param password Contraseña (mínimo 8 caracteres)
   * @param username Username único
   * @returns Observable<any> Token JWT
   */
  register(email: string, password: string, username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      email,
      password,
      username
    }).pipe(
      tap(response => {
        this.storageService.setToken(response.token);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Login con credenciales
   * @param email Email o username
   * @param password Contraseña
   * @param rememberMe Recordar dispositivo
   * @returns Observable<any> Token JWT
   */
  login(email: string, password: string, rememberMe: boolean = false): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password,
      rememberMe
    }, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.storageService.setToken(response.token);
        if (rememberMe) {
          this.storageService.setDeviceTrusted(response.deviceId);
        }
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Verificar email con token
   * @param token Token de verificación
   * @returns Observable<any> Usuario verificado + Pioneer package
   */
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/${token}`).pipe(
      tap(response => {
        this.storageService.setToken(response.token);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Reenviar email de verificación
   * @param email Email del usuario
   * @returns Observable<any>
   */
  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  /**
   * Solicitar reset de contraseña
   * @param email Email del usuario
   * @returns Observable<any>
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Validar token de reset
   * @param token Token de reset
   * @returns Observable<any> Validez del token
   */
  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-reset/${token}`);
  }

  /**
   * Resetear contraseña
   * @param token Token de reset
   * @param newPassword Nueva contraseña
   * @returns Observable<any>
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  /**
   * Obtener usuario actual
   * @returns Observable<any> Datos del usuario
   */
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      withCredentials: true
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(!!user);
      })
    );
  }

  /**
   * Logout - Destruir sesión
   * @returns Observable<any>
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.storageService.removeToken();
        this.storageService.removeDeviceTrusted();
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      })
    );
  }

  /**
   * Verificar si está autenticado
   * @returns boolean
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtener token actual
   * @returns string | null
   */
  getToken(): string | null {
    return this.storageService.getToken();
  }

  /**
   * Habilitar autenticación de dos factores
   * @returns Observable<any> QR code para 2FA
   */
  enable2FA(): Observable<any> {
    return this.http.post(`${this.apiUrl}/2fa/enable`, {});
  }

  /**
   * Verificar código 2FA
   * @param code Código de 6 dígitos
   * @returns Observable<any>
   */
  verify2FA(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/2fa/verify`, { code });
  }

  private loadUserFromStorage(): void {
    const token = this.storageService.getToken();
    if (token) {
      this.isAuthenticatedSubject.next(true);
      this.getCurrentUser().subscribe();
    }
  }
}
```

---

## 👤 UserService

**Propósito:** Gestionar datos del usuario, perfil, estadísticas

```typescript
// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener perfil completo del usuario
   * @param userId ID del usuario
   * @returns Observable<any> Perfil con stats
   */
  getUserProfile(userId?: string): Observable<any> {
    const url = userId ? `${this.apiUrl}/${userId}` : `${this.apiUrl}/profile`;
    return this.http.get(url, { withCredentials: true });
  }

  /**
   * Actualizar perfil del usuario
   * @param data Datos a actualizar (username, bio, avatar)
   * @returns Observable<any> Perfil actualizado
   */
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, {
      withCredentials: true
    });
  }

  /**
   * Obtener estadísticas del usuario
   * @returns Observable<any> Stats (victorias, derrotas, nivel, etc)
   */
  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, {
      withCredentials: true
    });
  }

  /**
   * Obtener caracteres del usuario
   * @returns Observable<any[]> Array de personajes
   */
  getUserCharacters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/characters`, {
      withCredentials: true
    });
  }

  /**
   * Crear nuevo personaje
   * @param characterData Datos del personaje
   * @returns Observable<any> Personaje creado
   */
  createCharacter(characterData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/characters`, characterData, {
      withCredentials: true
    });
  }

  /**
   * Obtener actividad reciente
   * @param limit Número de actividades
   * @returns Observable<any[]> Historial
   */
  getRecentActivity(limit: number = 20): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/activity?limit=${limit}`,
      { withCredentials: true }
    );
  }

  /**
   * Cambiar contraseña
   * @param oldPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @returns Observable<any>
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }, {
      withCredentials: true
    });
  }

  /**
   * Descargar datos del usuario (GDPR)
   * @returns Observable<Blob> Archivo ZIP con todos los datos
   */
  downloadUserData(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download-data`, {
      responseType: 'blob',
      withCredentials: true
    });
  }

  /**
   * Eliminar cuenta permanentemente
   * @param password Contraseña para confirmación
   * @returns Observable<any>
   */
  deleteAccount(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-account`, {
      password
    }, {
      withCredentials: true
    });
  }
}
```

---

## 📦 InventoryService

**Propósito:** Gestionar inventario, equipamiento, consumibles

```typescript
// inventory.service.ts
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/api/inventory`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener inventario completo
   * @returns Observable<any> Inventario del usuario
   */
  getInventory(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, {
      withCredentials: true
    });
  }

  /**
   * Obtener equipamiento actual
   * @returns Observable<any> Items equipados en cada slot
   */
  getEquipment(): Observable<any> {
    return this.http.get(`${this.apiUrl}/equipment`, {
      withCredentials: true
    });
  }

  /**
   * Equipar item
   * @param itemId ID del item
   * @param slot Slot a equipar (arma, armadura, etc)
   * @returns Observable<any> Equipamiento actualizado
   */
  equipItem(itemId: string, slot: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/equip`, {
      itemId,
      slot
    }, {
      withCredentials: true
    });
  }

  /**
   * Desequipar item
   * @param slot Slot a desequipar
   * @returns Observable<any> Equipamiento actualizado
   */
  unequipItem(slot: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/unequip`, {
      slot
    }, {
      withCredentials: true
    });
  }

  /**
   * Obtener consumibles
   * @returns Observable<any[]> Array de consumibles
   */
  getConsumables(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/consumables`, {
      withCredentials: true
    });
  }

  /**
   * Usar consumible
   * @param consumibleId ID del consumible
   * @returns Observable<any> Efecto aplicado
   */
  useConsumable(consumibleId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/use-consumable`, {
      consumibleId
    }, {
      withCredentials: true
    });
  }

  /**
   * Vender item
   * @param itemId ID del item
   * @param cantidad Cantidad a vender
   * @returns Observable<any> VAL obtenido
   */
  sellItem(itemId: string, cantidad: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/sell`, {
      itemId,
      cantidad
    }, {
      withCredentials: true
    });
  }

  /**
   * Descartar item
   * @param itemId ID del item
   * @returns Observable<any>
   */
  discardItem(itemId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/discard`, {
      itemId
    }, {
      withCredentials: true
    });
  }

  /**
   * Obtener detalles de item
   * @param itemId ID del item
   * @returns Observable<any> Información completa
   */
  getItemDetails(itemId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/item/${itemId}`, {
      withCredentials: true
    });
  }

  /**
   * Comparar dos items
   * @param itemId1 Primer item
   * @param itemId2 Segundo item
   * @returns Observable<any> Comparación de stats
   */
  compareItems(itemId1: string, itemId2: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/compare?item1=${itemId1}&item2=${itemId2}`, {
      withCredentials: true
    });
  }

  /**
   * Buscar items por rarity
   * @param rareza Tipo de rareza
   * @returns Observable<any[]> Items encontrados
   */
  getItemsByRarity(rareza: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/by-rarity/${rareza}`,
      { withCredentials: true }
    );
  }
}
```

---

## 🛒 ShopService

**Propósito:** Gestionar compra de paquetes, recompensas

```typescript
// shop.service.ts
@Injectable({ providedIn: 'root' })
export class ShopService {
  private apiUrl = `${environment.apiUrl}/api/shop`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los paquetes
   * @returns Observable<any[]> Catálogo de paquetes
   */
  getAllPackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/packages`, {
      withCredentials: true
    });
  }

  /**
   * Obtener paquetes por categoría
   * @param category Categoría (iniciador, diario, elite, etc)
   * @returns Observable<any[]> Paquetes filtrados
   */
  getPackagesByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/packages/category/${category}`,
      { withCredentials: true }
    );
  }

  /**
   * Obtener detalles de paquete
   * @param packageId ID del paquete
   * @returns Observable<any> Contenido y precio
   */
  getPackageDetails(packageId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/packages/${packageId}`, {
      withCredentials: true
    });
  }

  /**
   * Comprar paquete
   * @param packageId ID del paquete
   * @param paymentMethod Método (stripe, blockchain, etc)
   * @returns Observable<any> Compra procesada
   */
  purchasePackage(packageId: string, paymentMethod: string = 'stripe'): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase`, {
      packageId,
      paymentMethod
    }, {
      withCredentials: true
    });
  }

  /**
   * Abrir paquete (reclama recompensas)
   * @param packageId ID del paquete comprado
   * @returns Observable<any> Recompensas asignadas atomicamente
   */
  openPackage(packageId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/open-package`, {
      packageId
    }, {
      withCredentials: true
    });
  }

  /**
   * Obtener paquetes del usuario (comprados pero no abiertos)
   * @returns Observable<any[]> Paquetes pendientes
   */
  getMyPackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-packages`, {
      withCredentials: true
    });
  }

  /**
   * Obtener historial de compras
   * @returns Observable<any[]> Todas las compras realizadas
   */
  getPurchaseHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/purchase-history`, {
      withCredentials: true
    });
  }
}
```

---

## 🛍️ MarketplaceService

**Propósito:** Gestionar transacciones P2P, listados, ofertas

```typescript
// marketplace.service.ts
@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private apiUrl = `${environment.apiUrl}/api/marketplace`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los listados
   * @param page Número de página
   * @param limit Límite por página
   * @returns Observable<any[]> Listados activos
   */
  getAllListings(page: number = 0, limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/listings?page=${page}&limit=${limit}`,
      { withCredentials: true }
    );
  }

  /**
   * Buscar listados con filtros
   * @param filters Objeto de filtros (rareza, precio min/max, etc)
   * @returns Observable<any[]> Listados filtrados
   */
  getListingsByFilter(filters: any): Observable<any[]> {
    const query = new URLSearchParams(filters).toString();
    return this.http.get<any[]>(
      `${this.apiUrl}/listings/search?${query}`,
      { withCredentials: true }
    );
  }

  /**
   * Obtener detalles de listado
   * @param listingId ID del listado
   * @returns Observable<any> Información completa
   */
  getListingDetails(listingId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/listings/${listingId}`, {
      withCredentials: true
    });
  }

  /**
   * Crear nuevo listado
   * @param data Datos del listado (itemId, precio, cantidad)
   * @returns Observable<any> Listado creado
   */
  createListing(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/listings`, data, {
      withCredentials: true
    });
  }

  /**
   * Comprar item del marketplace (TRANSACCIÓN ATÓMICA)
   * @param listingId ID del listado
   * @param cantidad Cantidad a comprar
   * @returns Observable<any> Compra confirmada + item transferido
   */
  buyItem(listingId: string, cantidad: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/buy`, {
      listingId,
      cantidad
    }, {
      withCredentials: true
    });
  }

  /**
   * Hacer oferta en listado
   * @param listingId ID del listado
   * @param pujaPrecio Precio ofrecido
   * @returns Observable<any> Oferta creada
   */
  makeOffer(listingId: string, pujaPrecio: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/offer`, {
      listingId,
      pujaPrecio
    }, {
      withCredentials: true
    });
  }

  /**
   * Aceptar oferta recibida
   * @param offerId ID de la oferta
   * @returns Observable<any>
   */
  acceptOffer(offerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/accept-offer`, {
      offerId
    }, {
      withCredentials: true
    });
  }

  /**
   * Rechazar oferta
   * @param offerId ID de la oferta
   * @returns Observable<any>
   */
  rejectOffer(offerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reject-offer`, {
      offerId
    }, {
      withCredentials: true
    });
  }

  /**
   * Cancelar listado propio
   * @param listingId ID del listado
   * @returns Observable<any> Item devuelto
   */
  cancelListing(listingId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel`, {
      listingId
    }, {
      withCredentials: true
    });
  }

  /**
   * Obtener mis listados
   * @returns Observable<any[]> Listados del usuario
   */
  getMyListings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-listings`, {
      withCredentials: true
    });
  }

  /**
   * Obtener historial de transacciones
   * @returns Observable<any[]> Compras y ventas
   */
  getTransactionHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`, {
      withCredentials: true
    });
  }

  /**
   * Obtener estadísticas del marketplace
   * @returns Observable<any> Stats globales
   */
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, {
      withCredentials: true
    });
  }
}
```

---

## ⚔️ DungeonService

**Propósito:** Gestionar combates, mazmorras, recompensas

```typescript
// dungeon.service.ts
@Injectable({ providedIn: 'root' })
export class DungeonService {
  private apiUrl = `${environment.apiUrl}/api/dungeons`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las mazmorras disponibles
   * @returns Observable<any[]> Catálogo de mazmorras
   */
  getAllDungeons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, {
      withCredentials: true
    });
  }

  /**
   * Obtener detalles de mazmorra
   * @param dungeonId ID de la mazmorra
   * @returns Observable<any> Descripción, enemigos, recompensas
   */
  getDungeonDetails(dungeonId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${dungeonId}`, {
      withCredentials: true
    });
  }

  /**
   * Iniciar combate
   * @param dungeonId ID de la mazmorra
   * @param characterId ID del personaje
   * @returns Observable<any> Sesión de combate
   */
  startCombat(dungeonId: string, characterId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${dungeonId}/start-combat`, {
      characterId
    }, {
      withCredentials: true
    });
  }

  /**
   * Realizar acción en combate
   * @param dungeonId ID de la mazmorra
   * @param accion Tipo (ataque, defensa, habilidad, consumible)
   * @param datos Detalles de la acción
   * @returns Observable<any> Resultado de la acción
   */
  performAction(dungeonId: string, accion: string, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${dungeonId}/action`, {
      accion,
      ...datos
    }, {
      withCredentials: true
    });
  }

  /**
   * Abandonar combate
   * @param dungeonId ID de la mazmorra
   * @returns Observable<any>
   */
  abandonCombat(dungeonId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${dungeonId}/abandon`, {}, {
      withCredentials: true
    });
  }

  /**
   * Obtener resultado de combate (CON RECOMPENSAS ASIGNADAS)
   * @param resultId ID del resultado
   * @returns Observable<any> EXP, VAL, items ya asignados
   */
  getCombatResult(resultId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/results/${resultId}`, {
      withCredentials: true
    });
  }

  /**
   * Obtener historial de combates
   * @returns Observable<any[]> Últimos combates
   */
  getCombatHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`, {
      withCredentials: true
    });
  }

  /**
   * Obtener estadísticas de mazmorras
   * @returns Observable<any> Stats personales
   */
  getDungeonStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, {
      withCredentials: true
    });
  }
}
```

---

## 🏆 RankingService & SeasonService

```typescript
// ranking.service.ts
@Injectable({ providedIn: 'root' })
export class RankingService {
  private apiUrl = `${environment.apiUrl}/api/rankings`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener leaderboard por categoría
   * @param categoryId Categoría (nivel, victorias, winrate, etc)
   * @param offset Offset para paginación
   * @param limit Límite por página
   * @returns Observable<any[]> Ranking
   */
  getLeaderboard(categoryId: string, offset: number = 0, limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/leaderboard/${categoryId}?offset=${offset}&limit=${limit}`,
      { withCredentials: true }
    );
  }

  /**
   * Obtener posición del usuario
   * @param userId ID del usuario
   * @returns Observable<any> Ranking actual
   */
  getUserRankingPosition(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-position/${userId}`, {
      withCredentials: true
    });
  }

  /**
   * Obtener estadísticas del jugador
   * @param userId ID del usuario
   * @returns Observable<any> Stats completas
   */
  getPlayerStats(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/${userId}`, {
      withCredentials: true
    });
  }
}

// season.service.ts
@Injectable({ providedIn: 'root' })
export class SeasonService {
  private apiUrl = `${environment.apiUrl}/api/seasons`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener temporada actual
   * @returns Observable<any> Información de temporada
   */
  getCurrentSeason(): Observable<any> {
    return this.http.get(`${this.apiUrl}/current`, {
      withCredentials: true
    });
  }

  /**
   * Obtener próxima temporada
   * @returns Observable<any>
   */
  getNextSeason(): Observable<any> {
    return this.http.get(`${this.apiUrl}/next`, {
      withCredentials: true
    });
  }

  /**
   * Obtener ranking de temporada específica
   * @param seasonId ID de la temporada
   * @returns Observable<any[]> Ranking de temporada
   */
  getSeasonRanking(seasonId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/${seasonId}/ranking`,
      { withCredentials: true }
    );
  }

  /**
   * Obtener recompensas de temporada para usuario (ASIGNADAS ATOMICAMENTE)
   * @param seasonId ID de la temporada
   * @returns Observable<any> Recompensas ya reclamadas
   */
  getUserSeasonRewards(seasonId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${seasonId}/rewards`,
      { withCredentials: true }
    );
  }
}
```

---

## 🔌 WebSocketService

**Propósito:** Comunicación en tiempo real con Socket.IO

```typescript
// websocket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  private notificationSubject = new BehaviorSubject<any>(null);
  public notification$ = this.notificationSubject.asObservable();

  private marketplaceUpdateSubject = new BehaviorSubject<any>(null);
  public marketplaceUpdate$ = this.marketplaceUpdateSubject.asObservable();

  constructor(private authService: AuthService) {}

  /**
   * Conectar a WebSocket con JWT
   */
  connect(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io(environment.apiUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this.connectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connectedSubject.next(false);
    });

    // Escuchar notificaciones
    this.socket.on('notification', (data: any) => {
      this.notificationSubject.next(data);
    });

    // Escuchar updates del marketplace
    this.socket.on('marketplace-update', (data: any) => {
      this.marketplaceUpdateSubject.next(data);
    });
  }

  /**
   * Desconectar
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * Emitir evento
   * @param event Nombre del evento
   * @param data Datos a enviar
   */
  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Escuchar evento
   * @param event Nombre del evento
   * @returns Observable<any>
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

  /**
   * Obtener estado de conexión
   * @returns boolean
   */
  isConnected(): boolean {
    return this.connectedSubject.value;
  }
}
```

---

## 🔔 NotificationService

**Propósito:** Mostrar notificaciones al usuario

```typescript
// notification.service.ts
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  /**
   * Mostrar notificación de éxito
   * @param mensaje Texto del mensaje
   * @param duracion Tiempo en ms (default 3000)
   */
  success(mensaje: string, duracion: number = 3000): void {
    this.show({
      tipo: 'success',
      mensaje,
      duracion,
      icon: '✅'
    });
  }

  /**
   * Mostrar notificación de error
   * @param mensaje Texto del mensaje
   * @param duracion Tiempo en ms (default 5000)
   */
  error(mensaje: string, duracion: number = 5000): void {
    this.show({
      tipo: 'error',
      mensaje,
      duracion,
      icon: '❌'
    });
  }

  /**
   * Mostrar notificación de advertencia
   * @param mensaje Texto del mensaje
   */
  warning(mensaje: string): void {
    this.show({
      tipo: 'warning',
      mensaje,
      duracion: 4000,
      icon: '⚠️'
    });
  }

  /**
   * Mostrar notificación de información
   * @param mensaje Texto del mensaje
   */
  info(mensaje: string): void {
    this.show({
      tipo: 'info',
      mensaje,
      duracion: 3000,
      icon: 'ℹ️'
    });
  }

  private show(notification: any): void {
    const notifications = this.notificationsSubject.value;
    notifications.push({
      ...notification,
      id: Date.now()
    });
    this.notificationsSubject.next(notifications);

    setTimeout(() => {
      this.remove(notification.id);
    }, notification.duracion);
  }

  private remove(id: number): void {
    const notifications = this.notificationsSubject.value
      .filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
  }
}
```

---

## 💾 StorageService

**Propósito:** Gestionar almacenamiento local seguro

```typescript
// storage.service.ts
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly DEVICE_TRUSTED_KEY = 'device_trusted';
  private readonly USER_PREFS_KEY = 'user_prefs';

  /**
   * Guardar token JWT
   * @param token Token a guardar
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtener token JWT
   * @returns string | null
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Remover token
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Marcar dispositivo como confiable
   * @param deviceId ID del dispositivo
   */
  setDeviceTrusted(deviceId: string): void {
    localStorage.setItem(this.DEVICE_TRUSTED_KEY, deviceId);
  }

  /**
   * Obtener dispositivo confiable
   * @returns string | null
   */
  getDeviceTrusted(): string | null {
    return localStorage.getItem(this.DEVICE_TRUSTED_KEY);
  }

  /**
   * Remover dispositivo confiable
   */
  removeDeviceTrusted(): void {
    localStorage.removeItem(this.DEVICE_TRUSTED_KEY);
  }

  /**
   * Guardar preferencias del usuario
   * @param prefs Objeto de preferencias
   */
  setUserPreferences(prefs: any): void {
    localStorage.setItem(this.USER_PREFS_KEY, JSON.stringify(prefs));
  }

  /**
   * Obtener preferencias
   * @returns any
   */
  getUserPreferences(): any {
    const prefs = localStorage.getItem(this.USER_PREFS_KEY);
    return prefs ? JSON.parse(prefs) : {};
  }

  /**
   * Limpiar todo el almacenamiento
   */
  clear(): void {
    localStorage.clear();
  }
}
```

---

## 🔗 Interceptores

### AuthInterceptor

```typescript
// auth.interceptor.ts
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

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado o inválido
          this.authService.logout().subscribe(() => {
            this.router.navigate(['/login']);
          });
        }
        return throwError(() => error);
      })
    );
  }
}
```

### ErrorInterceptor

```typescript
// error.interceptor.ts
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error desconocido';

        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = error.error?.message || `Error ${error.status}`;
        }

        // Mostrar notificación de error
        if (error.status !== 401) {
          this.notificationService.error(errorMessage);
        }

        return throwError(() => error);
      })
    );
  }
}
```

---

## 📚 Patrones de Uso

### Patrón 1: Composición Observable

```typescript
// En component.ts
this.data$ = combineLatest([
  this.userService.getUserProfile(),
  this.userService.getUserStats(),
  this.inventoryService.getInventory()
]).pipe(
  map(([profile, stats, inventory]) => ({
    profile,
    stats,
    inventory
  })),
  tap(() => this.loading$.next(false))
);
```

### Patrón 2: Error Handling

```typescript
this.service.performAction().subscribe({
  next: (result) => {
    this.notificationService.success('Acción completada');
    this.refreshData();
  },
  error: (error) => {
    this.notificationService.error(error.message);
  }
});
```

### Patrón 3: Inyección de Dependencias

```typescript
@Injectable({
  providedIn: 'root'
})
export class CustomService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
}
```

---

## 📡 Endpoints Rápida Referencia

| Servicio | Método | Endpoint |
|----------|--------|----------|
| Auth | POST | `/api/auth/register` |
| Auth | GET | `/api/auth/verify/:token` |
| Auth | POST | `/api/auth/login` |
| User | GET | `/api/users/profile` |
| User | PUT | `/api/users/profile` |
| Inventory | GET | `/api/inventory` |
| Inventory | POST | `/api/inventory/equip` |
| Shop | GET | `/api/shop/packages` |
| Shop | POST | `/api/shop/purchase` |
| Shop | POST | `/api/shop/open-package` |
| Marketplace | GET | `/api/marketplace/listings` |
| Marketplace | POST | `/api/marketplace/buy` |
| Dungeon | GET | `/api/dungeons` |
| Dungeon | POST | `/api/dungeons/:id/start-combat` |
| Dungeon | POST | `/api/dungeons/:id/action` |
| Ranking | GET | `/api/rankings/leaderboard/:category` |
| Season | GET | `/api/seasons/current` |
| Season | POST | `/api/seasons/:id/distribute-rewards` |

---

**¿Preguntas o cambios?**  
Contacta al equipo de desarrollo de Valgame.
