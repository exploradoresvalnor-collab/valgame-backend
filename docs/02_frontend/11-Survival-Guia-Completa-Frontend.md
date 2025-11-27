# 🎮 SURVIVAL OLEADAS - Guía Completa para Frontend

**Fecha:** 24 de noviembre de 2025  
**Versión:** 1.0  
**Audiencia:** Frontend Developers (Angular)  
**Estado:** Listo para implementación

---

## 📋 Índice

1. [Arquitectura General](#arquitectura-general)
2. [Flujo de Usuario](#flujo-de-usuario)
3. [Componentes Necesarios](#componentes-necesarios)
4. [Servicios Angular](#servicios-angular)
5. [Endpoints Backend](#endpoints-backend)
6. [Modelos TypeScript](#modelos-typescript)
7. [Ejemplos de Código](#ejemplos-de-código)

---

## 🏗️ Arquitectura General

### **Estructura de Carpetas**

```
src/
  ├─ games/
  │   ├─ rpg/              (Mazmorras - Existente)
  │   │   ├─ components/
  │   │   ├─ services/
  │   │   └─ rpg.module.ts
  │   │
  │   └─ survival/         (NUEVO - Oleadas)
  │       ├─ components/
  │       │   ├─ survival-selector/
  │       │   ├─ survival-game/
  │       │   ├─ wave-display/
  │       │   ├─ item-drop/
  │       │   ├─ leaderboard-survival/
  │       │   └─ exchange-points/
  │       │
  │       ├─ services/
  │       │   └─ survival.service.ts
  │       │
  │       └─ survival.module.ts
  │
  ├─ shared/              (Compartido)
  │   ├─ components/
  │   │   ├─ inventory/
  │   │   ├─ profile/
  │   │   └─ dashboard/
  │   └─ services/
  │       ├─ auth.service.ts
  │       ├─ user.service.ts
  │       └─ inventory.service.ts
  │
  └─ app-routing.module.ts
```

---

## 👤 Flujo de Usuario

### **1. Usuario abre app**

```
Dashboard (game-selector)
  ├─ Botón: "⚔️ RPG Mazmorras"
  └─ Botón: "🌊 Survival Oleadas"
```

### **2. Elige Survival**

```
→ /games/survival/selector
  ├─ Selecciona personaje
  ├─ Selecciona equipo (4 slots: cabeza, cuerpo, manos, pies)
  ├─ Selecciona consumibles (máx 5)
  └─ Botón: "Comenzar oleadas"
```

### **3. Inicia sesión**

```
Backend: POST /api/survival/start
  └─ Crea SurvivalSession
  └─ Inicia WebSocket connection
  └─ Muestra interfaz de juego

Pantalla:
├─ Oleada actual (Wave 1)
├─ Puntos acumulados
├─ Salud del personaje
├─ Enemigos on-screen
└─ Botones de acción
```

### **4. Juega (Oleadas)**

```
Cliente → Servidor (WebSocket):
  ├─ "complete-wave" (enemigos derrotados)
  ├─ "use-consumable" (curar, buff)
  └─ "pickup-item" (recoger drop)

Servidor → Cliente (WebSocket):
  ├─ "wave-started" (enemigos nuevos)
  ├─ "item-dropped" (item cayó)
  ├─ "leaderboard-update" (nuevo ranking)
  └─ "wave-completed" (confirmación)
```

### **5. Fin (Derrota o Abandono)**

```
POST /api/survival/:sessionId/death
  └─ Calcula rewards
  └─ Guarda SurvivalRun
  └─ Actualiza leaderboard

Pantalla de resultados:
├─ Oleada alcanzada
├─ Puntos ganados
├─ Items obtenidos
├─ Rewards (EXP, VAL)
└─ Opción: "Volver al dashboard" o "Jugar otra vez"
```

### **6. Canjear Puntos**

```
POST /api/survival/exchange-points/exp
  ├─ 100 puntos → 500 EXP

POST /api/survival/exchange-points/val
  ├─ 100 puntos → 50 VAL

POST /api/survival/exchange-points/guaranteed-item
  ├─ 250 puntos → Item raro garantizado
```

---

## 🎯 Componentes Necesarios

### **1. GameSelectorComponent** (Dashboard principal)

**Ubicación:** `shared/components/game-selector/`

**Responsabilidad:** Mostrar botones para elegir qué juego jugar

**Template:**
```html
<div class="game-selector">
  <h1>¿Qué quieres jugar?</h1>
  
  <div class="games-grid">
    <!-- RPG -->
    <card 
      title="⚔️ RPG Mazmorras"
      description="Dungeons con IA automática"
      stats="Personajes: 3 | Combate: Automático"
      (click)="selectRPG()">
    </card>
    
    <!-- SURVIVAL -->
    <card 
      title="🌊 Survival Oleadas"
      description="Oleadas infinitas"
      stats="Personajes: 1 | Combate: Manual"
      (click)="selectSurvival()">
    </card>
  </div>
</div>
```

**Component:**
```typescript
export class GameSelectorComponent {
  selectRPG() {
    this.router.navigate(['/games/rpg']);
  }
  
  selectSurvival() {
    this.router.navigate(['/games/survival/selector']);
  }
}
```

---

### **2. SurvivalSelectorComponent** (Preparación)

**Ubicación:** `games/survival/components/survival-selector/`

**Responsabilidad:** Seleccionar personaje, equipo, consumibles

**Template:**
```html
<div class="survival-setup">
  <h2>Preparar Survival</h2>
  
  <!-- Personaje -->
  <section class="character-select">
    <h3>Selecciona tu personaje:</h3>
    <div class="characters-list">
      <div *ngFor="let char of characters" 
           [class.selected]="selectedCharacter?.id === char.id"
           (click)="selectCharacter(char)"
           class="character-card">
        <img [src]="char.imagen">
        <h4>{{ char.nombre }}</h4>
        <p>Nivel {{ char.nivel }} - {{ char.rango }}</p>
        <span class="hp">❤️ {{ char.saludMaxima }} HP</span>
      </div>
    </div>
  </section>
  
  <!-- Equipo (4 slots) -->
  <section class="equipment-select">
    <h3>Equipo (4 slots):</h3>
    <div class="equipment-slots">
      <!-- Head -->
      <div class="slot" (click)="selectEquipment('head')">
        <img *ngIf="equipment.head" [src]="equipment.head.imagen">
        <span *ngIf="!equipment.head">👑 Cabeza</span>
      </div>
      
      <!-- Body -->
      <div class="slot" (click)="selectEquipment('body')">
        <img *ngIf="equipment.body" [src]="equipment.body.imagen">
        <span *ngIf="!equipment.body">🛡️ Cuerpo</span>
      </div>
      
      <!-- Hands -->
      <div class="slot" (click)="selectEquipment('hands')">
        <img *ngIf="equipment.hands" [src]="equipment.hands.imagen">
        <span *ngIf="!equipment.hands">🖐️ Manos</span>
      </div>
      
      <!-- Feet -->
      <div class="slot" (click)="selectEquipment('feet')">
        <img *ngIf="equipment.feet" [src]="equipment.feet.imagen">
        <span *ngIf="!equipment.feet">👟 Pies</span>
      </div>
    </div>
  </section>
  
  <!-- Consumibles (máx 5) -->
  <section class="consumables-select">
    <h3>Consumibles (máx 5):</h3>
    <div class="consumables-list">
      <div *ngFor="let item of consumables"
           [class.selected]="isConsumableSelected(item.id)"
           (click)="toggleConsumable(item)"
           class="consumable-item">
        <img [src]="item.imagen">
        <p>{{ item.nombre }}</p>
        <span class="count">x{{ getConsumableCount(item.id) }}</span>
      </div>
    </div>
  </section>
  
  <!-- Bonos -->
  <section class="bonuses">
    <h3>Bonos totales:</h3>
    <div class="bonus-grid">
      <span>🔥 ATK: +{{ calculateAttackBonus() }}</span>
      <span>🛡️ DEF: +{{ calculateDefenseBonus() }}</span>
      <span>⚡ VEL: +{{ calculateSpeedBonus() }}</span>
      <span>🏥 HP: {{ calculateHealth() }}</span>
    </div>
  </section>
  
  <!-- Botón Start -->
  <button 
    (click)="startSurvival()" 
    [disabled]="!selectedCharacter"
    class="btn-start">
    🚀 Comenzar Oleadas
  </button>
</div>
```

**Component:**
```typescript
export class SurvivalSelectorComponent implements OnInit {
  characters: any[] = [];
  consumables: any[] = [];
  selectedCharacter: any;
  equipment = { head: null, body: null, hands: null, feet: null };
  selectedConsumables: any[] = [];
  
  constructor(
    private userService: UserService,
    private inventoryService: InventoryService,
    private survivalService: SurvivalService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadCharacters();
    this.loadInventory();
  }
  
  loadCharacters() {
    this.userService.getUserCharacters().subscribe(chars => {
      this.characters = chars;
    });
  }
  
  loadInventory() {
    this.inventoryService.getInventory().subscribe(inv => {
      this.consumables = inv.consumables;
    });
  }
  
  selectCharacter(char: any) {
    this.selectedCharacter = char;
  }
  
  selectEquipment(slot: string) {
    // Modal para seleccionar item del inventario
  }
  
  toggleConsumable(item: any) {
    if (this.selectedConsumables.length < 5) {
      this.selectedConsumables.push(item);
    }
  }
  
  calculateAttackBonus(): number {
    // Sumar bonos de equipo
    return 0;
  }
  
  calculateHealth(): number {
    return this.selectedCharacter?.saludMaxima || 100;
  }
  
  startSurvival() {
    const payload = {
      characterId: this.selectedCharacter.id,
      equipment: this.equipment,
      consumables: this.selectedConsumables.map(c => c.id)
    };
    
    this.survivalService.startSurvival(payload).subscribe(session => {
      this.router.navigate(['/games/survival/play', session.sessionId]);
    });
  }
}
```

---

### **3. SurvivalGameComponent** (Juego principal)

**Ubicación:** `games/survival/components/survival-game/`

**Responsabilidad:** Pantalla de juego, oleadas, enemigos, puntos

**Template:**
```html
<div class="survival-game">
  <!-- Interfaz superior -->
  <header class="game-header">
    <div class="wave-info">
      🌊 Oleada {{ currentWave }}
    </div>
    <div class="points-display">
      ⭐ {{ currentPoints }} pts
    </div>
    <div class="health-bar">
      <div class="health-fill" [style.width.%]="healthPercent"></div>
      <span>{{ currentHealth }}/{{ maxHealth }} HP</span>
    </div>
  </header>
  
  <!-- Área de juego (Enemigos on-screen) -->
  <section class="game-area">
    <!-- Enemigos -->
    <div *ngFor="let enemy of enemies" class="enemy">
      <img [src]="enemy.imagen">
      <div class="enemy-health-bar">
        <div [style.width.%]="(enemy.health / enemy.maxHealth) * 100"></div>
      </div>
      <p>{{ enemy.name }}</p>
    </div>
    
    <!-- Items droppados -->
    <div *ngFor="let drop of itemsOnGround" (click)="pickupItem(drop)" class="drop-item">
      <img [src]="drop.imagen">
      <span class="rarity" [class]="drop.rareza">{{ drop.rareza }}</span>
    </div>
  </section>
  
  <!-- Interfaz de acciones -->
  <footer class="game-footer">
    <div class="action-buttons">
      <!-- Atacar -->
      <button class="btn-attack">⚔️ Atacar</button>
      
      <!-- Consumibles (slots dinámicos) -->
      <div class="consumables-bar">
        <button *ngFor="let cons of activeConsumables" 
                (click)="useConsumable(cons)"
                class="btn-consumable">
          <img [src]="cons.imagen">
          <span>x{{ cons.usos_restantes }}</span>
        </button>
      </div>
      
      <!-- Rendirse -->
      <button (click)="surrender()" class="btn-danger">🏳️ Rendirse</button>
    </div>
    
    <!-- Log de eventos -->
    <div class="event-log">
      <p *ngFor="let log of eventLogs" [class]="log.type">
        {{ log.message }}
      </p>
    </div>
  </footer>
</div>
```

**Component:**
```typescript
export class SurvivalGameComponent implements OnInit, OnDestroy {
  @Input() sessionId: string;
  
  currentWave = 1;
  currentPoints = 0;
  currentHealth = 100;
  maxHealth = 100;
  enemies: any[] = [];
  itemsOnGround: any[] = [];
  activeConsumables: any[] = [];
  eventLogs: any[] = [];
  
  private socket: any;
  private waveSubscription: any;
  
  constructor(
    private survivalService: SurvivalService,
    private socketService: WebSocketService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId');
    this.initializeGame();
  }
  
  initializeGame() {
    this.socket = this.socketService.connectToSurvival(this.sessionId);
    
    // Escuchar eventos del servidor
    this.socket.on('wave-started', (data: any) => {
      this.currentWave = data.waveNumber;
      this.enemies = data.enemies;
      this.addLog(`🌊 Oleada ${data.waveNumber} iniciada`, 'info');
    });
    
    this.socket.on('item-dropped', (data: any) => {
      this.itemsOnGround.push(data);
      this.addLog(`✨ ${data.itemName} apareció!`, 'item');
    });
    
    this.socket.on('enemy-defeated', (data: any) => {
      this.currentPoints += data.pointsGained;
      this.enemies = this.enemies.filter(e => e.id !== data.enemyId);
      this.addLog(`${data.enemyName} derrotado! +${data.pointsGained} pts`, 'victory');
    });
    
    this.socket.on('player-damaged', (data: any) => {
      this.currentHealth -= data.damage;
      if (this.currentHealth <= 0) {
        this.gameOver();
      }
      this.addLog(`❌ Tomaste ${data.damage} daño`, 'damage');
    });
  }
  
  useConsumable(consumable: any) {
    this.socket.emit('use-consumable', {
      consumableId: consumable.id,
      wave: this.currentWave
    });
    
    consumable.usos_restantes--;
    if (consumable.usos_restantes <= 0) {
      this.activeConsumables = this.activeConsumables.filter(c => c.id !== consumable.id);
    }
    
    this.addLog(`🧪 Usaste ${consumable.nombre}`, 'action');
  }
  
  pickupItem(item: any) {
    this.socket.emit('pickup-item', {
      dropId: item.id,
      wave: this.currentWave
    });
    
    this.itemsOnGround = this.itemsOnGround.filter(i => i.id !== item.id);
    this.addLog(`📦 Recogiste ${item.nombre}!`, 'item');
  }
  
  surrender() {
    if (confirm('¿Estás seguro de que quieres rendirte?')) {
      this.survivalService.abandonSurvival(this.sessionId).subscribe(() => {
        this.gameOver();
      });
    }
  }
  
  gameOver() {
    // Ir a pantalla de resultados
  }
  
  addLog(message: string, type: 'info' | 'damage' | 'victory' | 'action' | 'item') {
    this.eventLogs.push({ message, type });
    if (this.eventLogs.length > 10) {
      this.eventLogs.shift();
    }
  }
  
  get healthPercent(): number {
    return (this.currentHealth / this.maxHealth) * 100;
  }
  
  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
```

---

### **4. SurvivalResultsComponent** (Pantalla de resultados)

**Ubicación:** `games/survival/components/survival-results/`

**Template:**
```html
<div class="survival-results">
  <h1>🎉 Run Completada</h1>
  
  <!-- Estadísticas -->
  <section class="stats-grid">
    <div class="stat">
      <span class="label">Oleada alcanzada</span>
      <span class="value">{{ runData.finalWave }}</span>
    </div>
    <div class="stat">
      <span class="label">Puntos ganados</span>
      <span class="value">⭐ {{ runData.finalPoints }}</span>
    </div>
    <div class="stat">
      <span class="label">Enemigos derrotados</span>
      <span class="value">{{ runData.totalEnemiesDefeated }}</span>
    </div>
    <div class="stat">
      <span class="label">Duración</span>
      <span class="value">{{ runData.duration | timeFormat }}</span>
    </div>
  </section>
  
  <!-- Recompensas -->
  <section class="rewards">
    <h2>💎 Recompensas</h2>
    <div class="reward-item">
      <span>📚 Experiencia</span>
      <span class="amount">+{{ runData.rewards.expGained }}</span>
    </div>
    <div class="reward-item">
      <span>💰 Moneda (VAL)</span>
      <span class="amount">+{{ runData.rewards.valGained }}</span>
    </div>
    <div class="reward-item">
      <span>⭐ Puntos Survival</span>
      <span class="amount">+{{ runData.rewards.pointsAvailable }}</span>
    </div>
  </section>
  
  <!-- Items obtenidos -->
  <section class="items-obtained" *ngIf="runData.itemsObtained.length > 0">
    <h2>🎁 Items Obtenidos</h2>
    <div class="items-grid">
      <div *ngFor="let item of runData.itemsObtained" class="item-card">
        <img [src]="item.imagen">
        <p>{{ item.nombre }}</p>
        <span class="rarity" [class]="item.rareza">{{ item.rareza }}</span>
      </div>
    </div>
  </section>
  
  <!-- Ranking position -->
  <section class="ranking-position">
    <h2>🏆 Posición en Ranking</h2>
    <p>Estás en posición #{{ runData.positionInRanking }}</p>
  </section>
  
  <!-- Acciones -->
  <div class="actions">
    <button (click)="playAgain()" class="btn-primary">
      🔄 Jugar de Nuevo
    </button>
    <button (click)="exchangePoints()" class="btn-secondary">
      💱 Canjear Puntos
    </button>
    <button (click)="goHome()" class="btn-tertiary">
      🏠 Volver al Dashboard
    </button>
  </div>
</div>
```

---

### **5. SurvivalLeaderboardComponent** (Ranking)

**Ubicación:** `games/survival/components/leaderboard-survival/`

**Template:**
```html
<div class="survival-leaderboard">
  <h1>🏆 Ranking Survival</h1>
  
  <!-- Filtros -->
  <div class="filters">
    <button *ngFor="let timeframe of timeframes"
            [class.active]="selectedTimeframe === timeframe"
            (click)="filterByTimeframe(timeframe)">
      {{ timeframe }}
    </button>
  </div>
  
  <!-- Tabla de ranking -->
  <table class="leaderboard-table">
    <thead>
      <tr>
        <th>Posición</th>
        <th>Usuario</th>
        <th>Mejor Oleada</th>
        <th>Puntos Totales</th>
        <th>Runs</th>
        <th>Promedio</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let player of leaderboard; let i = index"
          [class.highlight]="player.userId === currentUserId">
        <td class="rank">
          <span class="badge" [class]="getRankBadgeClass(i)">
            {{ i + 1 }}
          </span>
        </td>
        <td class="username">{{ player.username }}</td>
        <td class="stat">{{ player.maxWave }}</td>
        <td class="stat">{{ player.totalPoints }}</td>
        <td class="stat">{{ player.totalRuns }}</td>
        <td class="stat">{{ player.averageWave | number: '1.1-1' }}</td>
      </tr>
    </tbody>
  </table>
  
  <!-- Tu posición (si no estás en top 100) -->
  <div class="your-position" *ngIf="userRanking && userRanking.rank > 100">
    <p>Tu posición: #{{ userRanking.rank }}</p>
    <p>Puntos: {{ userRanking.totalPoints }}</p>
  </div>
</div>
```

---

### **6. ExchangePointsComponent** (Canjear puntos)

**Ubicación:** `games/survival/components/exchange-points/`

**Template:**
```html
<div class="exchange-points">
  <h1>💱 Canjear Puntos Survival</h1>
  
  <div class="points-info">
    <p>Puntos disponibles: <strong>{{ availablePoints }}</strong></p>
  </div>
  
  <!-- Opciones de canje -->
  <div class="exchange-options">
    <!-- EXP -->
    <div class="exchange-card">
      <h3>📚 Por Experiencia</h3>
      <p class="rate">100 puntos = 500 EXP</p>
      <input type="number" placeholder="Cantidad de puntos" min="100" max="{{ availablePoints }}" [(ngModel)]="pointsForExp">
      <p class="preview">= {{ calculateExpReward() }} EXP</p>
      <button (click)="exchangeForExp()" class="btn-exchange">Canjear</button>
    </div>
    
    <!-- VAL -->
    <div class="exchange-card">
      <h3>💰 Por Moneda (VAL)</h3>
      <p class="rate">100 puntos = 50 VAL</p>
      <input type="number" placeholder="Cantidad de puntos" min="100" max="{{ availablePoints }}" [(ngModel)]="pointsForVal">
      <p class="preview">= {{ calculateValReward() }} VAL</p>
      <button (click)="exchangeForVal()" class="btn-exchange">Canjear</button>
    </div>
    
    <!-- Item Garantizado -->
    <div class="exchange-card">
      <h3>🎁 Por Item Raro Garantizado</h3>
      <p class="rate">250 puntos = 1 Item Raro</p>
      <p class="preview">Items disponibles: {{ availablePoints / 250 | number: '1.0-0' }}</p>
      <button 
        (click)="exchangeForItem()" 
        [disabled]="availablePoints < 250"
        class="btn-exchange">
        Canjear
      </button>
    </div>
  </div>
</div>
```

---

## 🔌 Servicios Angular

### **SurvivalService**

**Ubicación:** `games/survival/services/survival.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurvivalService {
  private apiUrl = '/api/survival';
  
  constructor(private http: HttpClient) {}
  
  // Iniciar sesión de survival
  startSurvival(payload: {
    characterId: string;
    equipment: any;
    consumables: string[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/start`, payload);
  }
  
  // Completar oleada
  completeWave(sessionId: string, data: {
    waveNumber: number;
    enemiesDefeated: number;
    damageTaken: number;
    consumablesUsed: any[];
    clientTimestamp: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/complete-wave`, data);
  }
  
  // Usar consumible
  useConsumable(sessionId: string, data: {
    consumableItemId: string;
    waveNumber: number;
    clientTimestamp: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/use-consumable`, data);
  }
  
  // Recoger item
  pickupItem(sessionId: string, data: {
    dropId: string;
    waveNumber: number;
    clientTimestamp: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/pickup-drop`, data);
  }
  
  // Terminar sesión (voluntario)
  endSurvival(sessionId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/end`, data);
  }
  
  // Muerte (game over)
  reportDeath(sessionId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/death`, data);
  }
  
  // Canjear puntos por EXP
  exchangeForExp(points: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/exchange-points/exp`, { pointsToExchange: points });
  }
  
  // Canjear puntos por VAL
  exchangeForVal(points: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/exchange-points/val`, { pointsToExchange: points });
  }
  
  // Canjear puntos por item garantizado
  exchangeForItem(points: number = 250): Observable<any> {
    return this.http.post(`${this.apiUrl}/exchange-points/guaranteed-item`, { 
      pointsToExchange: points 
    });
  }
  
  // Obtener leaderboard
  getLeaderboard(params?: { timeframe?: string; limit?: number; page?: number }): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaderboard`, { params });
  }
  
  // Obtener mis estadísticas
  getMyStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-stats`);
  }
  
  // Abandonar sesión
  abandonSurvival(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/abandon`, {});
  }
}
```

---

### **WebSocketService (Extensión para Survival)**

```typescript
export class WebSocketService {
  // ... métodos existentes ...
  
  connectToSurvival(sessionId: string): Socket {
    const token = this.authService.getToken();
    const socket = io(`${environment.apiUrl}`, {
      auth: { token },
      query: { 
        sessionId,
        type: 'survival'
      }
    });
    
    return socket;
  }
}
```

---

## 📡 Endpoints Backend (Para referencia)

```
POST /api/survival/start
POST /api/survival/:sessionId/complete-wave
POST /api/survival/:sessionId/use-consumable
POST /api/survival/:sessionId/pickup-drop
POST /api/survival/:sessionId/end
POST /api/survival/:sessionId/death
POST /api/survival/exchange-points/exp
POST /api/survival/exchange-points/val
POST /api/survival/exchange-points/guaranteed-item
GET /api/survival/leaderboard
GET /api/survival/my-stats
POST /api/survival/:sessionId/abandon
```

---

## 📊 Modelos TypeScript

### **ISurvivalSession**
```typescript
export interface ISurvivalSession {
  sessionId: string;
  userId: string;
  characterId: string;
  state: 'active' | 'completed' | 'abandoned';
  currentWave: number;
  currentPoints: number;
  totalPointsAccumulated: number;
  enemiesDefeated: number;
  healthCurrent: number;
  healthMax: number;
  equipment: {
    head?: IEquipmentItem;
    body?: IEquipmentItem;
    hands?: IEquipmentItem;
    feet?: IEquipmentItem;
  };
  consumables: IConsumableInstance[];
  dropsCollected: IDropItem[];
  startedAt: Date;
  lastActionAt: Date;
}
```

### **ISurvivalRun**
```typescript
export interface ISurvivalRun {
  runId: string;
  userId: string;
  characterId: string;
  finalWave: number;
  finalPoints: number;
  totalEnemiesDefeated: number;
  itemsObtained: IDropItem[];
  rewards: {
    expGained: number;
    valGained: number;
    pointsAvailable: number;
  };
  startedAt: Date;
  completedAt: Date;
  duration: number;
}
```

---

## 🎮 Ejemplos de Código

### **Flujo completo: Iniciar Survival**

```typescript
// 1. Usuario selecciona equipo y consumibles
const payload = {
  characterId: 'char_123',
  equipment: {
    head: 'item_1',
    body: 'item_2',
    hands: null,
    feet: 'item_3'
  },
  consumables: ['potion_1', 'potion_2']
};

// 2. Llamar servicio
this.survivalService.startSurvival(payload).subscribe(session => {
  // 3. Guardar sessionId
  const sessionId = session.sessionId;
  
  // 4. Conectar a WebSocket
  this.socket = this.webSocketService.connectToSurvival(sessionId);
  
  // 5. Escuchar eventos
  this.socket.on('wave-started', (data) => {
    console.log(`Oleada ${data.waveNumber} comenzó`);
    this.enemies = data.enemies;
  });
  
  // 6. Navegar a juego
  this.router.navigate(['/games/survival/play', sessionId]);
});
```

### **Flujo: Completar oleada**

```typescript
// Cuando oleada se completa
const completeWaveData = {
  waveNumber: 1,
  enemiesDefeated: 5,
  damageTaken: 20,
  consumablesUsed: [],
  clientTimestamp: Date.now()
};

this.survivalService.completeWave(sessionId, completeWaveData)
  .subscribe(response => {
    // Actualizar UI
    this.currentPoints = response.totalPoints;
    this.currentWave = response.nextWave;
  });
```

---

## ✅ Checklist de Implementación

- [ ] **Componentes creados (6)**
  - [ ] GameSelectorComponent
  - [ ] SurvivalSelectorComponent
  - [ ] SurvivalGameComponent
  - [ ] SurvivalResultsComponent
  - [ ] SurvivalLeaderboardComponent
  - [ ] ExchangePointsComponent

- [ ] **Servicios creados (2)**
  - [ ] SurvivalService
  - [ ] WebSocketService (extensión)

- [ ] **Rutas configuradas**
  - [ ] /games/survival/selector
  - [ ] /games/survival/play/:sessionId
  - [ ] /games/survival/results/:runId
  - [ ] /games/survival/leaderboard

- [ ] **Integración con Backend**
  - [ ] Endpoints conectados
  - [ ] WebSocket eventos mapeados
  - [ ] Manejo de errores

- [ ] **UI/UX**
  - [ ] Estilos CSS
  - [ ] Animaciones
  - [ ] Responsive design

---

_Guía Frontend Survival - Valgame v2.0  
24 de noviembre de 2025_
