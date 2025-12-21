# Combate y Dungeons (Frontend Angular 17)

Guía práctica para implementar pantallas y servicios de combate/dungeons usando los endpoints publicados y los eventos de WebSocket disponibles.

## Endpoints relevantes
- POST `/combat/dungeons/:dungeonId/start` (auth)
- POST `/combat/attack` (auth)
- POST `/combat/defend` (auth)
- POST `/combat/end` (auth)
- GET `/dungeons` (public)
- GET `/dungeons/:id` (public)
- GET `/dungeons/:dungeonId/progress` (auth)

WebSocket (confirmados):
- `survival:wave:new|end` (para modo Survival)
- `character:level-up`, `character:evolved` (impactan HUD/estado)

Nota: si no hay evento específico de combate por WebSocket, sincroniza estado tras cada acción con `GET /dungeons/:dungeonId/progress`.

## Servicios Angular
`CombatService`
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CombatService {
  private http = inject(HttpClient);
  private base = environment.API_URL;

  start(dungeonId: string){
    return this.http.post(`${this.base}/combat/dungeons/${dungeonId}/start`, {});
  }
  attack(payload: { skillId?: string }){
    return this.http.post(`${this.base}/combat/attack`, payload ?? {});
  }
  defend(payload?: any){
    return this.http.post(`${this.base}/combat/defend`, payload ?? {});
  }
  end(payload?: any){
    return this.http.post(`${this.base}/combat/end`, payload ?? {});
  }
  progress(dungeonId: string){
    return this.http.get(`${this.base}/dungeons/${dungeonId}/progress`);
  }
}
```

## Flujo UI sugerido
1) Selección de mazmorra: `GET /dungeons`, detalle con `GET /dungeons/:id`.
2) Inicio: `POST /combat/dungeons/:dungeonId/start` → guarda `sessionId` si lo devuelve.
3) Turnos/acciones: `POST /combat/attack|defend` → refresca `progress` y actualiza HUD.
4) Fin: `POST /combat/end` → mostrar resumen y recompensas.
5) Realtime opcional: escuchar `survival:*` (si aplica modo Survival) y `character:level-up`.

## Modelo de estado (sencillo)
```ts
export interface CombatState {
  dungeonId: string;
  sessionId?: string;
  turn: number;
  player: { hp: number; mana: number; buffs: any[] };
  enemy: { hp: number; debuffs: any[] };
  log: Array<{ t: number; action: string; value?: any }>;
}
```

## Componente de Combate (esqueleto)
```ts
import { Component, signal } from '@angular/core';
import { CombatService } from '../services/combat.service';

@Component({ selector: 'app-combat', standalone: true, template: `
  <section>
    <button (click)="start()">Iniciar</button>
    <button (click)="attack()" [disabled]="!active()">Atacar</button>
    <button (click)="defend()" [disabled]="!active()">Defender</button>
    <pre>{{ state() | json }}</pre>
  </section>
`})
export class CombatComponent {
  state = signal<any>({});
  active = signal(false);
  constructor(private combat: CombatService){}

  start(){
    this.combat.start('dng_1').subscribe(() => {
      this.active.set(true);
      this.refreshProgress('dng_1');
    });
  }
  attack(){
    this.combat.attack({}).subscribe(() => this.refreshProgress('dng_1'));
  }
  defend(){
    this.combat.defend({}).subscribe(() => this.refreshProgress('dng_1'));
  }
  private refreshProgress(dungeonId: string){
    this.combat.progress(dungeonId).subscribe(p => this.state.set(p));
  }
}
```

## Errores frecuentes
- 401: token inválido/expirado → forzar relogin.
- 403: sin permisos (p.e., dungeon bloqueada) → deshabilitar botón.
- 404: dungeon inexistente o sesión no encontrada.
- 409: conflicto de estado (acción fuera de turno) → refrescar `progress` antes de reintentar.
- 429/5xx: aplicar backoff (ver `ERRORS_AND_LIMITS.md`).

## Checklist
- [ ] Servicios implementados (`CombatService`)
- [ ] Estados/HUD actualizados tras cada acción
- [ ] Manejo de 401/403/404/409/429
- [ ] Logs de combate para depuración
- [ ] Listeners WS básicos (survival/level-up)

## Sesiones y alias de endpoints

**Endpoints canónicos** (usar estos):
- `POST /api/dungeons/:dungeonId/start` — iniciar/entrar a dungeon (auth)
- `GET /api/dungeons/:dungeonId/progress` — consultar progreso actual (auth)

**Alias de compatibilidad** (redirección temporal para front legacy):
- `POST /api/dungeons/enter/:dungeonId` → alias de `start`
- `GET /api/dungeons/:dungeonId/session/:sessionId` → alias de `progress` (el `sessionId` se ignora hoy)

**Próximo paso:** sesiones reales con `enter`/`leave`/`session/:id/finish`, estado persistente y eventos RT. Los alias permitirán migración sin romper el front.

## Cómo impacta en Rankings

- RPG Dungeons: al completar una mazmorra y ganar, el backend registra el resultado (victoria/derrota, racha, nivel alcanzado, tiempo/mejor tiempo). Estos datos alimentan el ranking agregado. Tras una victoria, puedes refrescar:
  - `GET /api/rankings/me` para tu posición
  - `GET /api/rankings` o `GET /api/rankings/leaderboard/:category` según vista
- Survival: al terminar una partida, el servicio de Survival consolida tu puntuación (p.ej., oleadas, tiempo, puntuación total) y actualiza los leaderboards. El Front aplica el mismo patrón: `GET /api/rankings/me` y `GET /api/rankings/leaderboard/:category`.
- Períodos: además de `GET /api/rankings/period/:periodo`, existe alias `GET /api/rankings/period/:period`.
- Recomendación UI: tras una victoria, hacer un refresco ligero de `rankings/me` y, si estás en una vista de tabla, reenfocar `leaderboard` con el mismo `category` y `page` actual.

## Implementación Front (hoy)

1) Entrar e iniciar progreso (alias compatible):
```
POST /api/dungeons/enter/:dungeonId   (auth)
```

2) Consultar progreso (alias con `sessionId`, ignorado hoy):
```
GET  /api/dungeons/:dungeonId/session/:sessionId   (auth)
```

3) Tras detectar victoria (según respuesta del backend): refrescar posiciones:
```
GET /api/rankings/me
GET /api/rankings/leaderboard/:category?page=0&limit=20
```

Snippet Angular (servicio mínimo):
```ts
// dungeon.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DungeonService {
  constructor(private http: HttpClient) {}

  enter(dungeonId: string) {
    return this.http.post(`/api/dungeons/enter/${dungeonId}`, {});
  }

  // sessionId es opcional; hoy se ignora pero dejamos la firma lista
  progress(dungeonId: string, sessionId = 'current') {
    return this.http.get(`/api/dungeons/${dungeonId}/session/${sessionId}`);
  }
}

// rankings.service.ts
@Injectable({ providedIn: 'root' })
export class RankingsService {
  constructor(private http: HttpClient) {}

  me() { return this.http.get(`/api/rankings/me`); }
  leaderboard(category: string, page = 0, limit = 20) {
    return this.http.get(`/api/rankings/leaderboard/${category}`, { params: { page, limit } });
  }
}
```

Patrón de flujo en componente:
- Llamar `enter(dungeonId)` → mostrar estado inicial.
- Polling con `progress(dungeonId)` cada X segundos hasta estado terminal (victoria/derrota).
- En victoria: `rankings.me()` y `rankings.leaderboard(category)` para refrescar.

## WebSocket (eventos mínimos)

**Eventos de Dungeons (RPG):**
- `dungeon:entered` → payload: `{ dungeonId, sessionId: 'current' }`
- `dungeon:progress` → payload: `{ dungeonId, progreso: { victorias, derrotas, nivel_actual, ... } }`

**Eventos de Rankings** (emitido tras victorias en RPG o Survival):
- `rankings:update` → payload:
  ```json
  {
    "reason": "dungeon_victory" | "survival_victory" | "periodic_recalc",
    "affectedCategories": ["general", "dungeon_wins"],
    "timestamp": "2025-12-02T14:30:00Z"
  }
  ```
  Acción recomendada: refrescar `GET /api/rankings/me` y, si estás en vista de tabla, `GET /api/rankings/leaderboard/:category`.

**Nota sobre Survival:**
- Al consolidar victoria en Survival, se emitirá `rankings:update { reason: 'survival_victory' }`. Patrón idéntico al de Dungeons.

### Cliente (Angular) – suscripción básica

```ts
// websocket.service.ts (ejemplo)
import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl, {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket']
    });
  }

  on<T>(event: string, handler: (data: T) => void) {
    this.socket.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    this.socket.off(event, handler as any);
  }

  ngOnDestroy(): void {
    this.socket?.close();
  }
}

// en tu componente
ngOnInit() {
  this.ws.on('dungeon:entered', ({ dungeonId }) => {
    // actualizar UI a "en dungeon"
  });
  this.ws.on('dungeon:progress', ({ dungeonId, progreso }) => {
    // refrescar barra de progreso / estado
  });
  this.ws.on('rankings:update', () => {
    // refrescar tu posición o la tabla visible si corresponde
  });
}
```

## Entrega de resultados (hoy)

- Fuente de la verdad: el backend computa y persiste el resultado del combate. El front no “postea” puntajes arbitrarios.
- Dungeons: el resultado se refleja al consultar `progress`; cuando pasa a victoria/derrota, ya quedó grabado en estadísticas y en los agregados que alimentan Rankings.
- Survival: al terminar una partida, el servicio de Survival persiste la puntuación; la UI solo necesita leer `rankings/me` y `leaderboard` para reflejarlo.
- Errores: manejar 401 (token), 404 (dungeon inexistente), 429 (rate limit), y 5xx.

## Sesiones reales (futuro)

Objetivo: Sesión con estado explícito y eventos RT.
- Endpoints propuestos:
  - `POST /api/dungeons/enter/:dungeonId` → devuelve `{ sessionId, seed, expiresAt }`
  - `GET  /api/dungeons/session/:sessionId` → estado de la sesión
  - `POST /api/dungeons/session/:sessionId/finish` → cierra sesión con resultado
  - `POST /api/dungeons/session/:sessionId/leave` → abandono
- WebSocket:
  - Eventos `dungeon:entered`, `dungeon:progress`, `dungeon:finished` con `sessionId`.
  - Heartbeat opcional para detectar desconexiones.
- Seguridad/anti‑cheat:
  - Semilla/seed firmada por servidor, validaciones de consistencia; el cliente no declara “gané”, el servidor valida.
- Migración desde hoy:
  - Los alias ya usados (`enter`, `session/:id`) continuarán; se añadirá `sessionId` real y el endpoint `finish`.
