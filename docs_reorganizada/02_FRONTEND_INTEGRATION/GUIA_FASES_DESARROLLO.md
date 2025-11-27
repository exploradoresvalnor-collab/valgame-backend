# 🎮 VALGAME FRONTEND - GUÍA DE DESARROLLO POR FASES

**Última actualización:** 24 de noviembre de 2025  
**Estado:** 📘 Guía estructurada por **10 fases de desarrollo** (MVP → Producción)  
**Propósito:** Ruta clara, secuencial y profesional para implementar el frontend sin bloqueos.  
**Target:** Equipo de desarrollo Angular/Next.js

---

## 📋 TABLA DE FASES

| Fase | Nombre | Duración Est. | Endpoints Clave | Estado |
|------|--------|----------------|-----------------|--------|
| 1 | Configuración & Auth Base | 2-3 días | Register, Login, Logout | 🔴 No iniciado |
| 2 | Verificación Email & Onboarding | 1-2 días | Verify, Resend-Verification | 🔴 No iniciado |
| 3 | Dashboard & Perfil Básico | 1-2 días | Dashboard, /me, Resources | 🔴 No iniciado |
| 4 | Inventario: Personajes & Items | 2-3 días | Personajes, Equip, Stats | 🔴 No iniciado |
| 5 | Tienda Gacha & Paquetes | 2-3 días | Packages, Buy, Open | 🔴 No iniciado |
| 6 | Mazmorras & Sistema de Combate | 3-4 días | Dungeons, Start, Progress | 🔴 No iniciado |
| 7 | Marketplace P2P | 2-3 días | Listings, Create, Buy | 🔴 No iniciado |
| 8 | WebSocket & Real-time | 2-3 días | Socket.IO, Events | 🔴 No iniciado |
| 9 | Rankings & Competencia | 1-2 días | Rankings, Stats | 🔴 No iniciado |
| 10 | Pulido, Tests & Producción | 3-5 días | Todos | 🔴 No iniciado |

---

## 🔴 FASE 1: CONFIGURACIÓN & AUTENTICACIÓN BASE

**Duración:** 2-3 días  
**Objetivo:** Usuario puede registrarse, login y logout.  
**Requisitos previos:** Angular/Next.js configurado, routing, HTTP client listo.

### 1.1 Configuración Inicial

**Tareas:**
1. ✅ Crear `AuthService` con métodos: `register()`, `login()`, `logout()`, `isAuthenticated()`
2. ✅ Crear `AuthGuard` para proteger rutas
3. ✅ Configurar interceptor HTTP para añadir token JWT a headers
4. ✅ Configurar CORS/cookies en HTTP client (`withCredentials: true`)
5. ✅ Crear variables de entorno: `API_URL`, `FRONTEND_URL`

**Código AuthService (Angular):**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth'; // Configurar desde environment
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      email,
      username,
      password
    }, { withCredentials: true });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password
    }, { withCredentials: true })
    .pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
    .pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('user');
      })
    );
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }
}
```

**HTTP Interceptor (Angular):**
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Las cookies se envían automáticamente con withCredentials: true
    // Solo añadimos el header Accept si es necesario
    if (!req.headers.has('Accept')) {
      req = req.clone({
        setHeaders: {
          'Accept': 'application/json'
        }
      });
    }
    return next.handle(req);
  }
}
```

**Auth Guard:**
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

### 1.2 Pantalla de Landing

**Componente:** `LandingComponent`

**Funcionalidad:**
- Logo y titulo ("¡Bienvenido a Valgame!")
- Dos botones: "Registrarse" | "Iniciar Sesión"
- Links legales al pie

**Routing:**
```typescript
{ path: '', component: LandingComponent },
{ path: 'register', component: RegisterComponent },
{ path: 'login', component: LoginComponent }
```

### 1.3 Pantalla de Registro

**Componente:** `RegisterComponent`

**Campos:**
- Email (validación RFC 5322 básica)
- Username (3+ caracteres, alfanuméricos + guión)
- Password (6+ caracteres)
- Confirmación de password (match)

**Validaciones Locales:**
```typescript
const registerForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9-]+$/)]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  passwordConfirm: ['', Validators.required]
}, { validators: this.passwordMatchValidator });
```

**Manejo de Errores:**

| Código | Mensaje | Acción |
|--------|---------|--------|
| 201 | Éxito | Ir a "Verifica tu correo" |
| 400 | Validación fallida | Mostrar errores en campos |
| 409 | Email/Username existe | "Este email ya está registrado" |
| 500 | Error servidor | "Intenta más tarde" |

**Flujo Éxito:**
1. Usuario llena formulario
2. Click "Registrarse"
3. AuthService.register() → backend crea usuario y envía email
4. Mostrar pantalla: "Verifica tu correo en {email}"
5. Mostrar botón: "Reenviar verificación" (si no llegó)

### 1.4 Pantalla de Login

**Componente:** `LoginComponent`

**Campos:**
- Email
- Password
- Checkbox "Recuérdame" (opcional)

**Flujo Éxito:**
1. Usuario llena email + password
2. Click "Iniciar Sesión"
3. AuthService.login() → backend valida y devuelve user
4. Guardar user en localStorage
5. Navegar a `/dashboard`

**Manejo de Errores:**

| Código | Mensaje | Acción |
|--------|---------|--------|
| 200 | Éxito | Navegar a dashboard |
| 401 | Email/Password incorrecto | "Credenciales inválidas" |
| 429 | Demasiados intentos | "Intenta más tarde (Rate limit)" |
| 500 | Error servidor | "Intenta más tarde" |

### 1.5 Pantalla de Logout

**Ubicación:** Botón en header/menu

**Funcionalidad:**
1. Click "Cerrar sesión"
2. AuthService.logout() → backend limpia sesión
3. Borrar localStorage
4. Navegar a `/`

---

## 🟡 FASE 2: VERIFICACIÓN EMAIL & ONBOARDING

**Duración:** 1-2 días  
**Objetivo:** Usuario verifica email y recibe recompensas iniciales (personaje, VAL, items).  
**Dependencias:** Fase 1 completada.

### 2.1 Pantalla de Verificación (Email Link)

**Componente:** `VerifyComponent`

**Rutas:**
- Email user: `FRONTEND_URL/verify/:token`
- Backend endpoint: `GET /api/auth/verify/:token`

**Lógica:**

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  loading = true;
  success = false;
  error: string | null = null;
  rewards: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error = 'Token no proporcionado';
      this.loading = false;
      return;
    }

    // Llamar al backend con ?format=json para obtener respuesta JSON
    this.http.get(`/api/auth/verify/${token}?format=json`, { 
      withCredentials: true 
    }).subscribe({
      next: (response: any) => {
        this.success = true;
        this.rewards = response.rewards || null;
        this.loading = false;

        // Refrescar usuario y guardar en localStorage
        if (response.user) {
          this.auth.updateCurrentUser(response.user);
        }

        // Navegar después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Token inválido o expirado';
        this.loading = false;
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
```

**Template HTML:**
```html
<div class="verify-container">
  <ng-container *ngIf="loading">
    <div class="spinner"></div>
    <p>Verificando tu correo...</p>
  </ng-container>

  <ng-container *ngIf="success && !loading">
    <div class="success-card">
      <h1>✅ ¡Cuenta Verificada!</h1>
      <p>Bienvenido a Valgame, {{ (auth.currentUser$ | async)?.username }}!</p>

      <ng-container *ngIf="rewards">
        <div class="rewards-summary">
          <h2>🎁 Tu Paquete Pionero:</h2>
          <ul>
            <li *ngIf="rewards.personaje">✓ Personaje base: {{ rewards.personaje.nombre }}</li>
            <li *ngIf="rewards.val">💰 {{ rewards.val }} VAL</li>
            <li *ngIf="rewards.boletos">🎫 {{ rewards.boletos }} Boletos</li>
            <li *ngIf="rewards.evo">⚡ {{ rewards.evo }} EVO</li>
            <li *ngIf="rewards.pociones">🧪 {{ rewards.pociones }} Pociones</li>
            <li *ngIf="rewards.arma">⚔️ {{ rewards.arma }}</li>
          </ul>
        </div>
      </ng-container>

      <p style="margin-top: 30px;">Redirigiendo al juego en 3 segundos...</p>
      <button (click)="goToDashboard()" class="btn-primary">🎮 Ir al Juego Ahora</button>
    </div>
  </ng-container>

  <ng-container *ngIf="error && !loading">
    <div class="error-card">
      <h1>❌ Error de Verificación</h1>
      <p>{{ error }}</p>
      <button (click)="router.navigate(['/login'])" class="btn-primary">Volver a Login</button>
    </div>
  </ng-container>
</div>
```

### 2.2 Backend Adaptación (Pequeño Ajuste)

**Nota:** El backend YA devuelve JSON si detect `format=json` o `Accept: application/json`.

Si quieres MEJORAR la respuesta JSON, modifica `src/routes/auth.routes.ts` línea ~140 para incluir los rewards en la respuesta:

```typescript
if (isAPI) {
  const apiResponse: any = {
    ok: true,
    message: 'Usuario verificado exitosamente',
    user: { id: user._id, username: user.username, email: user.email },
    rewards: {
      personaje: { nombre: pioneerCharacter.nombre },
      val: 100,
      boletos: 10,
      evo: 2,
      pociones: 3,
      arma: 'Espada de Hierro'
    }
  };
  return res.json(apiResponse);
}
```

### 2.3 Reenvío de Verificación

**Pantalla:** Formulario simple (después del registro fallido por email no verificado)

**Componente:** `ResendVerificationComponent`

**Campos:**
- Email

**Endpoint:** `POST /api/auth/resend-verification`

**Flujo:**
1. User ingresa email
2. Click "Reenviar"
3. Backend envía nuevo email con token
4. Mostrar: "Correo enviado a {email}"

---

## 🟢 FASE 3: DASHBOARD & PERFIL BÁSICO

**Duración:** 1-2 días  
**Objetivo:** Usuario ve su perfil, recursos y estado general.  
**Dependencias:** Fases 1-2 completadas.

### 3.1 Dashboard Principal

**Componente:** `DashboardComponent`

**Endpoint:** `GET /api/users/dashboard`

**Respuesta Esperada:**
```json
{
  "user": {
    "username": "player1",
    "email": "player@example.com"
  },
  "activeCharacter": {
    "nombre": "Héroe",
    "rango": "D",
    "nivel": 1,
    "saludActual": 100,
    "saludMaxima": 100
  },
  "resources": {
    "val": 100,
    "boletos": 10,
    "evo": 2
  },
  "stats": {
    "combatesGanados": 0,
    "nivel": 1,
    "experiencia": 0
  }
}
```

**Layout Recomendado (Landscape):**

```
┌─────────────────────────────────────────────┐
│ Header: Username | [Recursos] | [Menu]      │
├──────────────────┬──────────────────────────┤
│ Panel Izquierdo  │ Contenido Principal       │
│ - Personaje      │ - Botón Comenzar Mazmorra│
│ - Inventario     │ - Botón Tienda            │
│ - Marketplace    │ - Botón Marketplace       │
│ - Logout         │ - Botones Secundarios     │
└──────────────────┴──────────────────────────┘
```

**Widgets:**

1. **Personaje Activo**
   - Avatar
   - Nombre, Rango, Nivel
   - Barra de salud
   - Botones: "Cambiar personaje", "Ver Stats"

2. **Recursos Rápidos**
   - 💰 VAL
   - 🎫 Boletos
   - ⚡ EVO

3. **Acciones Rápidas**
   - 🏰 Mazmorras
   - 🛍️ Tienda
   - 🏪 Marketplace
   - 🎯 Rankings

### 3.2 Obtener Perfil Completo

**Endpoint:** `GET /api/users/me`

**Respuesta:**
```json
{
  "_id": "user_id",
  "username": "player1",
  "email": "player@example.com",
  "isVerified": true,
  "personajes": [ { ... }, { ... } ],
  "personajeActivo": { ... },
  "val": 100,
  "boletos": 10,
  "evo": 2,
  "inventarioEquipamiento": [ { ... } ],
  "inventarioConsumibles": [ { ... } ]
}
```

**Nota:** Este endpoint devuelve MUCHO. Para optimización, el frontend puede cachear y solo refrescar después de acciones clave.

### 3.3 Obtener Recursos (Ligero)

**Endpoint:** `GET /api/users/resources`

**Respuesta (Pequeña):**
```json
{
  "val": 100,
  "boletos": 10,
  "evo": 2,
  "energia": 100,
  "energiaMaxima": 100
}
```

**Uso:** Refrescar header/barra de recursos sin cargar todo el usuario.

### 3.4 Actualizar Perfil (Opcional en Fase 3)

**Endpoint:** `PUT /api/users/me` (si existe)

**Campos editables (sugeridos):**
- Avatar/Foto
- Bio
- Preferencias de notificación

---

## 🟠 FASE 4: INVENTARIO - PERSONAJES & ITEMS

**Duración:** 2-3 días  
**Objetivo:** Usuario gestiona personajes, equipa items, usa consumibles.  
**Dependencias:** Fases 1-3 completadas.

### 4.1 Listar Personajes

**Endpoint:** `GET /api/users/me` → acceder a `personajes[]`

O crear endpoint específico (si el backend lo tiene):
**Endpoint:** `GET /api/user-characters`

**Respuesta:**
```json
{
  "personajes": [
    {
      "_id": "char_id_1",
      "nombre": "Héroe",
      "rango": "D",
      "nivel": 1,
      "etapa": 1,
      "stats": { "vida": 100, "ataque": 20, "defensa": 10, "velocidad": 15 },
      "saludActual": 100,
      "estado": "saludable",
      "equipamiento": [ "item_id_1" ]
    }
  ]
}
```

### 4.2 Cambiar Personaje Activo

**Endpoint:** `PUT /api/users/set-active-character/:personajeId`

**Body:**
```json
{}
```

**Respuesta:**
```json
{
  "ok": true,
  "personajeActivo": { ... }
}
```

### 4.3 Equipamiento

**4.3.1 Equipar Item**

**Endpoint:** `POST /api/characters/:characterId/equip`

**Body:**
```json
{
  "itemId": "item_id_1",
  "slot": "weapon"  // "weapon", "armor", "accessory"
}
```

**Respuesta:**
```json
{
  "ok": true,
  "character": { ... con equipamiento actualizado ... }
}
```

**4.3.2 Desequipar Item**

**Endpoint:** `POST /api/characters/:characterId/unequip`

**Body:**
```json
{
  "slot": "weapon"
}
```

**Respuesta:**
```json
{
  "ok": true,
  "character": { ... }
}
```

### 4.4 Ver Stats de Personaje

**Endpoint:** `GET /api/characters/:characterId/stats`

**Respuesta:**
```json
{
  "stats": {
    "vida": 100,
    "ataque": 20,
    "defensa": 10,
    "velocidad": 15
  },
  "equipamiento": [
    { "tipo": "weapon", "nombre": "Espada", "stats": { "ataque": 5 } }
  ]
}
```

### 4.5 Consumibles

**4.5.1 Usar Consumible**

**Endpoint:** `POST /api/characters/:characterId/use-consumible`

**Body:**
```json
{
  "consumibleId": "item_id_2"
}
```

**Respuesta:**
```json
{
  "ok": true,
  "character": { ... },
  "effect": "Recuperaste 50 de vida"
}
```

**4.5.2 Curar Personaje**

**Endpoint:** `POST /api/characters/:characterId/heal`

**Body:**
```json
{
  "consumibleId": "item_id_2"
}
```

### 4.6 Revive (Resucitar)

**Endpoint:** `POST /api/characters/:characterId/revive`

**Body:**
```json
{
  "consumibleId": "item_id_2"
}
```

---

## 🔵 FASE 5: TIENDA GACHA & PAQUETES

**Duración:** 2-3 días  
**Objetivo:** Usuario compra y abre paquetes para obtener personajes y items.  
**Dependencias:** Fases 1-4 completadas.

### 5.1 Obtener Paquetes Disponibles

**Endpoint:** `GET /api/packages`

**Respuesta:**
```json
{
  "packages": [
    {
      "_id": "pkg_1",
      "nombre": "Paquete Común",
      "descripcion": "Obtén personajes aleatorios",
      "precio": 100,
      "tipo": "gacha",
      "rareza": "comun",
      "contenido": {
        "personajes": { "garantizado": 1, "aleatorios": 2 },
        "items": { "aleatorios": 5 },
        "val": 50
      }
    }
  ]
}
```

### 5.2 Comprar Paquete

**Endpoint:** `POST /api/user-packages/agregar`

**Body:**
```json
{
  "paqueteId": "pkg_1"
}
```

**Respuesta:**
```json
{
  "ok": true,
  "userPackage": {
    "_id": "user_pkg_1",
    "paqueteId": "pkg_1",
    "usuarioId": "user_id",
    "estado": "sin_abrir",
    "createdAt": "2025-11-24T12:00:00Z"
  },
  "nuevoBalance": { "val": 900, "boletos": 10 }
}
```

**Errores Posibles:**
- **400:** Recursos insuficientes
- **409:** Paquete ya comprado pero sin abrir (límite inventario)

### 5.3 Listar Paquetes del Usuario

**Endpoint:** `GET /api/user-packages`

**Respuesta:**
```json
{
  "packages": [
    {
      "_id": "user_pkg_1",
      "paquete": { "nombre": "Paquete Común", ... },
      "estado": "sin_abrir",
      "createdAt": "2025-11-24T12:00:00Z"
    }
  ]
}
```

### 5.4 Abrir Paquete

**Endpoint:** `POST /api/user-packages/:id/open`

**Body:**
```json
{}
```

**Respuesta:**
```json
{
  "ok": true,
  "rewards": {
    "personajes": [
      { "_id": "char_1", "nombre": "Mago", "rango": "C" }
    ],
    "items": [
      { "_id": "item_1", "nombre": "Armadura de Hierro" }
    ],
    "val": 50
  },
  "nuevoBalance": { "val": 950, "personajes": 2 }
}
```

### 5.5 Eventos WebSocket

Cuando se abre un paquete, el backend emite:

**Evento:** `inventory:updated`

**Payload:**
```json
{
  "personajes": 2,
  "equipamiento": 42,
  "val": 950,
  "newCharacters": ["char_1"],
  "newItems": ["item_1", "item_2"],
  "valGranted": 50
}
```

**Lógica Frontend:**
```typescript
socket.on('inventory:updated', (data) => {
  this.inventory.val = data.val;
  this.inventory.personajes.push(...data.newCharacters);
  // Mostrar modal con rewards
  this.showRewardsModal(data);
});
```

---

## 💜 FASE 6: MAZMORRAS & COMBATE

**Duración:** 3-4 días  
**Objetivo:** Usuario entra en mazmorras, combate automático, recibe premios.  
**Dependencias:** Fases 1-5 completadas.

### 6.1 Listar Mazmorras

**Endpoint:** `GET /api/dungeons`

**Respuesta:**
```json
{
  "dungeons": [
    {
      "_id": "dungeon_1",
      "nombre": "Bosque Sombrío",
      "nivelRecomendado": 1,
      "dificultad": "fácil",
      "enemigos": [ { "nombre": "Goblin", "stats": {...} } ],
      "recompensas": {
        "experiencia": 100,
        "val": 50,
        "items": [ { "_id": "item_1", "nombre": "Espada Oxidada" } ]
      }
    }
  ]
}
```

### 6.2 Iniciar Mazmorra

**Endpoint:** `POST /api/dungeons/:dungeonId/start`

**Body:**
```json
{
  "characterId": "char_id_1"
}
```

**Respuesta IMPORTANTE:**
```json
{
  "ok": true,
  "battleResult": {
    "estado": "victoria",  // "victoria" o "derrota"
    "daño_tomado": 20,
    "experiencia_ganada": 100,
    "val_ganado": 50,
    "items_ganados": [
      { "_id": "item_1", "nombre": "Espada Oxidada" }
    ],
    "character_actualizado": {
      "saludActual": 80,
      "experiencia": 150,
      "nivel": 2  // si subió de nivel
    }
  }
}
```

**⚠️ NOTA CRÍTICA:** El endpoint `/api/dungeons/:id/start` **ya ejecuta el combate completo** y devuelve el resultado. No hay endpoints separados de "atacar", "defender", etc. Es automático y atomico.

### 6.3 Pantalla de Combate

**Experiencia UX:**

1. **Inicio:** Mostrar spinning/loading "Iniciando batalla..."
2. **Durante:** Mostrar animación de combate (auto-generada o simulada)
3. **Resultado:** Mostrar pantalla de victoria/derrota

**Código Angular (Simplificado):**

```typescript
startDungeon(dungeonId: string, characterId: string): void {
  this.loading = true;
  this.http.post(`/api/dungeons/${dungeonId}/start`, { characterId })
    .subscribe({
      next: (result: any) => {
        this.loading = false;
        if (result.battleResult.estado === 'victoria') {
          this.showVictoryScreen(result.battleResult);
        } else {
          this.showDefeatScreen(result.battleResult);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error en la batalla';
      }
    });
}

showVictoryScreen(result: any): void {
  this.victoryModal = {
    title: '🎉 ¡Victoria!',
    rewards: {
      exp: result.experiencia_ganada,
      val: result.val_ganado,
      items: result.items_ganados
    }
  };
  // Mostrar modal
}

showDefeatScreen(result: any): void {
  this.defeatModal = {
    title: '💀 Derrota',
    daño: result.daño_tomado,
    message: 'Tu personaje ha sido derrotado. Usa una poción para revivir.'
  };
  // Mostrar modal
}
```

### 6.4 Pantalla de Victoria

**Componente:** `VictoryScreenComponent`

**Elementos:**
- Icono 🎉
- Título: "¡Victoria!"
- Resumen de premios (XP, VAL, Items)
- Botón: "Siguiente Mazmorra" | "Volver al Dashboard"

### 6.5 Pantalla de Derrota

**Componente:** `DefeatScreenComponent`

**Elementos:**
- Icono 💀
- Título: "Derrota"
- Daño recibido
- Botón: "Usar Poción y Revivir" | "Volver al Dashboard"

---

## 🟣 FASE 7: MARKETPLACE P2P

**Duración:** 2-3 días  
**Objetivo:** Usuarios compran y venden items entre ellos.  
**Dependencias:** Fases 1-5 completadas.

### 7.1 Listar Listings en Venta

**Endpoint:** `GET /api/marketplace/listings`

**Query Params (Opcionales):**
- `estado=disponible` (default)
- `tipo=weapon`
- `rango=D`
- `limit=20`
- `offset=0`

**Respuesta:**
```json
{
  "listings": [
    {
      "_id": "listing_1",
      "itemId": { "nombre": "Espada", "tipo": "weapon" },
      "precio": 150,
      "vendedorId": "user_2",
      "vendedor": { "username": "seller1" },
      "estado": "disponible",
      "createdAt": "2025-11-24T10:00:00Z"
    }
  ],
  "total": 45,
  "hasMore": true
}
```

### 7.2 Crear Listing (Vender)

**Endpoint:** `POST /api/marketplace/listings`

**Body:**
```json
{
  "itemId": "item_1",
  "precio": 150
}
```

**Respuesta:**
```json
{
  "ok": true,
  "listing": {
    "_id": "listing_1",
    "itemId": "item_1",
    "precio": 150,
    "vendedorId": "user_1",
    "estado": "disponible"
  }
}
```

### 7.3 Comprar del Marketplace

**Endpoint:** `POST /api/marketplace/listings/:id/buy`

**Body:**
```json
{}
```

**Respuesta:**
```json
{
  "ok": true,
  "transaction": {
    "_id": "transaction_1",
    "compradorId": "user_1",
    "vendedorId": "user_2",
    "itemId": "item_1",
    "precio": 150,
    "tax": 7.50,
    "estado": "completada"
  },
  "nuevoBalance": { "val": 850 }
}
```

**Errores:**
- **400:** VAL insuficiente
- **409:** Listing ya vendido

---

## ⚫ FASE 8: WEBSOCKET & REAL-TIME

**Duración:** 2-3 días  
**Objetivo:** Actualizaciones en tiempo real sin polling.  
**Dependencias:** Fases 1-7 completadas.

### 8.1 Conexión Socket.IO

**Configuración (Angular):**

```typescript
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket: Socket | null = null;

  connect(token: string): void {
    this.socket = io(environment.socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Escuchar eventos específicos
  on<T>(event: string, callback: (data: T) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Emitir eventos
  emit<T>(event: string, data: T): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}
```

### 8.2 Eventos Reales (Backend)

**El backend emite estos eventos:**

| Evento | Cuándo | Payload |
|--------|--------|---------|
| `inventory:updated` | Compra/abre paquete | `{ val, personajes, newCharacters }` |
| `character:updated` | Equipa, cura, revive | `{ characterId, stats }` |
| `marketplace:updated` | Alguien vende/compra | `{ listingId, estado }` |
| `resource:updated` | Compra VAL/EVO en tienda | `{ val, evo, boletos }` |

### 8.3 Escuchar Eventos en Frontend

**Ejemplo: Actualizar inventario en tiempo real**

```typescript
export class InventoryComponent implements OnInit {
  constructor(private realtime: RealtimeService) {}

  ngOnInit(): void {
    // Escuchar actualizaciones de inventario
    this.realtime.on<any>('inventory:updated', (data) => {
      console.log('Inventario actualizado:', data);
      this.updateInventoryUI(data);
    });

    // Escuchar cambios en personajes
    this.realtime.on<any>('character:updated', (data) => {
      console.log('Personaje actualizado:', data);
      this.updateCharacterUI(data);
    });
  }

  private updateInventoryUI(data: any): void {
    // Actualizar componentes reactivos
    this.inventory.val = data.val;
    if (data.newCharacters) {
      this.inventory.personajes.push(...data.newCharacters);
    }
  }
}
```

---

## ⚪ FASE 9: RANKINGS & COMPETENCIA

**Duración:** 1-2 días  
**Objetivo:** Usuarios ven rankings globales y su posición.  
**Dependencias:** Fases 1-8 completadas.

### 9.1 Obtener Rankings Globales

**Endpoint:** `GET /api/rankings`

**Query Params:**
- `tipo=nivel` | `experiencia` | `victorias` (default: nivel)
- `limit=50`

**Respuesta:**
```json
{
  "rankings": [
    {
      "posicion": 1,
      "username": "TopPlayer",
      "nivel": 50,
      "val": 5000,
      "victorias": 100,
      "avatar": "url_avatar"
    }
  ]
}
```

### 9.2 Mi Posición en el Ranking

**Endpoint:** `GET /api/rankings/me`

**Respuesta:**
```json
{
  "posicion": 250,
  "username": "player1",
  "nivel": 10,
  "proximoEnemigo": { "username": "player2", "nivel": 11 },
  "diferencia": 1000  // puntos para alcanzarlo
}
```

---

## 🎯 FASE 10: PULIDO, TESTS & PRODUCCIÓN

**Duración:** 3-5 días  
**Objetivo:** UI pulida, tests pasando, deploy en prod.  
**Dependencias:** Fases 1-9 completadas.

### 10.1 Checklist de Calidad

- [ ] Todos los endpoints funcionan sin errores
- [ ] Manejo de errores (400, 401, 403, 404, 500) en cada pantalla
- [ ] Responsive design (funciona en mobile landscape)
- [ ] Rate limits respetados (esperar 429, reintentos automáticos)
- [ ] WebSocket conecta/desconecta sin crashes
- [ ] Loading spinners en todas las acciones async
- [ ] Confirmaciones antes de acciones irreversibles
- [ ] Logout funciona y limpia localStorage

### 10.2 Tests Unitarios

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  it('should register new user', (done) => {
    service.register('test@example.com', 'testuser', 'password123')
      .subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
  });

  it('should login user', (done) => {
    service.login('test@example.com', 'password123')
      .subscribe(result => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });
  });
});
```

### 10.3 Deploy en Producción

1. **Configurar variables de entorno:**
   ```
   FRONTEND_URL=https://valgame.com
   API_URL=https://api.valgame.com
   SOCKET_URL=https://api.valgame.com (websocket)
   ```

2. **Build optimizado:**
   ```bash
   ng build --prod --aot --build-optimizer
   ```

3. **Deploy:**
   - Netlify, Vercel, o tu servidor
   - Configurar CORS en backend para dominios de producción
   - Habilitar HTTPS obligatorio

---

## 📌 TABLA DE REFERENCIA RÁPIDA

### Endpoints por Fase

| Fase | Endpoint | Método |
|------|----------|--------|
| 1 | `/auth/register` | POST |
| 1 | `/auth/login` | POST |
| 1 | `/auth/logout` | POST |
| 2 | `/auth/verify/:token` | GET |
| 3 | `/users/dashboard` | GET |
| 3 | `/users/me` | GET |
| 4 | `/users/set-active-character/:id` | PUT |
| 4 | `/characters/:id/equip` | POST |
| 5 | `/packages` | GET |
| 5 | `/user-packages/agregar` | POST |
| 5 | `/user-packages/:id/open` | POST |
| 6 | `/dungeons` | GET |
| 6 | `/dungeons/:id/start` | POST |
| 7 | `/marketplace/listings` | GET/POST |
| 7 | `/marketplace/listings/:id/buy` | POST |
| 9 | `/rankings` | GET |

---

## 📞 SOPORTE & NOTAS

**Duración Total Estimada:** 15-25 días (equipo de 1-2 devs)

**Riesgos Principales:**
- Fase 6 (Combate) puede tomar más si hay cambios de UX
- WebSocket (Fase 8) requiere testing en staging
- Deploy (Fase 10) puede requerir optimizaciones

**Próximos Pasos:**
1. Asignar fase a desarrollador
2. Crear ramas feature por fase
3. Hacer PR y reviews antes de merge a main
4. Testear en staging con datos reales

---

**Documento versión 1.0** | Actualizado: 24 de noviembre de 2025  
**Autor:** Equipo Valgame | **Editor:** Copilot Assistant
