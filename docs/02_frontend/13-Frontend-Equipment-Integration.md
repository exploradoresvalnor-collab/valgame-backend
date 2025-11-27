# 13 - Integración de Equipamiento en Survival Oleadas - Guía Frontend

## 1. Visión General: Dónde va el Equipamiento

El sistema de equipamiento en **Survival Oleadas** funciona de manera integrada entre:

```
User.inventarioEquipamiento (Storage Global)
        ↓
Selector en UI (LargoAntesDeIniciar)
        ↓
SurvivalSession.equipment[4] (Slots Activos)
        ↓
Bonificaciones en Combate (Wave Battles)
        ↓
Rewards + Leaderboard (Final)
```

## 2. Modelo de Datos: Estructura del Equipamiento

### 2.1 Almacenamiento Global (User Model)

```typescript
// En src/models/User.ts
interface IUser {
  // ... otros campos
  
  // Array de equipamiento disponible
  inventarioEquipamiento: IEquipmentInstance[];
  
  // Referencia a sesión activa (si existe)
  currentSurvivalSession?: ObjectId; // ref SurvivalSession
  
  // Stats de survival
  survivalStats: {
    totalRuns: number;
    maxWave: number;
    totalPoints: number;
    averageWave: number;
  };
}

interface IEquipmentInstance {
  _id: ObjectId;
  itemId: ObjectId;  // Referencia al Item en BD
  name: string;
  tipo: 'armor' | 'weapon' | 'accessory' | 'relic';
  rareza: 'común' | 'raro' | 'épico' | 'legendario';
  
  // Bonificaciones
  stats: {
    healthBonus?: number;        // +30 vida
    damageBonus?: number;        // +15% daño
    defenseBonus?: number;       // +25% defensa
    criticalChance?: number;     // +10% crítico
    resilienceBonus?: number;    // +5 resistencia
  };
  
  level: number;                 // 1-50
  enchantmentLevel: number;      // 0-10
  durability: number;            // 0-100
}
```

### 2.2 En Sesión Activa (SurvivalSession Model)

```typescript
// En src/models/SurvivalSession.ts
interface ISurvivalSession {
  // ... otros campos
  
  // 4 slots de equipamiento activo
  equipment: [
    IEquipmentInstance | null,  // Slot 1: Armor
    IEquipmentInstance | null,  // Slot 2: Weapon
    IEquipmentInstance | null,  // Slot 3: Accessory
    IEquipmentInstance | null   // Slot 4: Relic
  ];
  
  // Bonificaciones calculadas
  equipmentBonuses: {
    totalHealthBonus: number;
    totalDamageBonus: number;
    totalDefenseBonus: number;
    totalCriticalChance: number;
    totalResilienceBonus: number;
  };
  
  // Consumibles (potions, revives, etc)
  consumables: IConsumableInstance[];
}
```

## 3. Flujo de Integración: De Selector a Combate

### 3.1 Paso 1: Selector de Equipamiento (Pre-Start UI)

```typescript
// En componente Angular: survivor-session-start.component.ts

export class SurvivorSessionStartComponent implements OnInit {
  characterId: string;
  
  // Inventario disponible (equipamiento)
  availableEquipment: IEquipmentInstance[] = [];
  
  // Slots seleccionados (4 items máximo, uno por tipo)
  selectedEquipment: {
    armor?: IEquipmentInstance;
    weapon?: IEquipmentInstance;
    accessory?: IEquipmentInstance;
    relic?: IEquipmentInstance;
  } = {};
  
  constructor(private survivalService: SurvivalService) {}
  
  ngOnInit() {
    // 1. Cargar equipamiento disponible
    this.loadAvailableEquipment();
  }
  
  loadAvailableEquipment() {
    // GET /api/user-characters/{characterId}
    this.survivalService.getCharacterEquipment(this.characterId)
      .subscribe(equipment => {
        this.availableEquipment = equipment;
      });
  }
  
  // El usuario arrastra/dropea items en 4 slots
  onEquipmentSelected(type: 'armor' | 'weapon' | 'accessory' | 'relic', 
                      item: IEquipmentInstance) {
    this.selectedEquipment[type] = item;
  }
  
  // Botón "Iniciar Oleadas"
  startSurvivalSession() {
    const payload = {
      characterId: this.characterId,
      equipment: [
        this.selectedEquipment.armor || null,
        this.selectedEquipment.weapon || null,
        this.selectedEquipment.accessory || null,
        this.selectedEquipment.relic || null
      ]
    };
    
    // POST /api/survival/start
    this.survivalService.startSession(payload)
      .subscribe(session => {
        // Redirigir a combate
        this.router.navigate(['/survival/combat', session._id]);
      });
  }
}
```

### 3.2 Paso 2: Validación Backend (survival.routes.ts)

```typescript
// En POST /api/survival/start (ya implementado)
router.post('/start', 
  auth, 
  validationMiddleware(StartSurvivalSchema), 
  SurvivalController.startSession
);

// Schema Zod:
const StartSurvivalSchema = z.object({
  characterId: z.string().refine(isValidObjectId),
  equipment: z.array(
    z.object({
      _id: z.string(),
      tipo: z.enum(['armor', 'weapon', 'accessory', 'relic']),
      stats: z.object({
        healthBonus: z.number().optional(),
        damageBonus: z.number().optional(),
        // ...
      })
    }).nullable()
  ).length(4)  // Exactamente 4 slots
});
```

### 3.3 Paso 3: Cálculo de Bonificaciones (survival.service.ts)

```typescript
// En src/services/survival.service.ts

calculateEquipmentBonuses(equipment: (IEquipmentInstance | null)[]): {
  totalHealthBonus: number;
  totalDamageBonus: number;
  totalDefenseBonus: number;
  totalCriticalChance: number;
  totalResilienceBonus: number;
} {
  let totals = {
    totalHealthBonus: 0,
    totalDamageBonus: 0,
    totalDefenseBonus: 0,
    totalCriticalChance: 0,
    totalResilienceBonus: 0
  };
  
  for (const item of equipment) {
    if (!item) continue;
    
    // Acumular bonificaciones
    totals.totalHealthBonus += item.stats.healthBonus || 0;
    totals.totalDamageBonus += item.stats.damageBonus || 0;
    totals.totalDefenseBonus += item.stats.defenseBonus || 0;
    totals.totalCriticalChance += item.stats.criticalChance || 0;
    totals.totalResilienceBonus += item.stats.resilienceBonus || 0;
  }
  
  return totals;
}

// En startSession():
async startSession(userId: string, characterId: string, equipment: any[]) {
  // ... validaciones
  
  // Calcular bonificaciones
  const bonuses = this.calculateEquipmentBonuses(equipment);
  
  // Crear sesión con equipamiento
  const session = new SurvivalSession({
    userId,
    characterId,
    equipment,
    equipmentBonuses: bonuses,
    healthMax: character.stats.salud + bonuses.totalHealthBonus,
    healthCurrent: character.stats.salud + bonuses.totalHealthBonus,
    // ... más campos
  });
  
  return session.save();
}
```

### 3.4 Paso 4: Uso en Combate (Wave Battle)

```typescript
// En combate (survivor-combat.component.ts)

export class SurvivorCombatComponent {
  currentSession: ISurvivalSession;
  enemyStats: IEnemyStats;
  playerStats: IPlayerStats;
  
  ngOnInit() {
    this.loadSession();
    this.applyEquipmentBonuses();
  }
  
  applyEquipmentBonuses() {
    // Los bonuses ya están en currentSession.equipmentBonuses
    this.playerStats = {
      health: this.currentSession.healthCurrent,
      maxHealth: this.currentSession.healthMax,
      damage: this.calculateDamageWithEquipment(),
      defense: this.calculateDefenseWithEquipment(),
      criticalChance: this.calculateCriticalWithEquipment()
    };
  }
  
  calculateDamageWithEquipment(): number {
    // Daño base del personaje
    const baseDamage = this.currentSession.character.stats.ataque;
    
    // Bonificación del equipamiento
    const equipmentBonus = this.currentSession.equipmentBonuses.totalDamageBonus;
    
    return baseDamage * (1 + equipmentBonus / 100);
  }
  
  calculateDefenseWithEquipment(): number {
    const baseDefense = this.currentSession.character.stats.defensa;
    const equipmentBonus = this.currentSession.equipmentBonuses.totalDefenseBonus;
    
    return baseDefense * (1 + equipmentBonus / 100);
  }
  
  calculateCriticalWithEquipment(): number {
    const baseCrit = 5; // Base 5% crítico
    const equipmentBonus = this.currentSession.equipmentBonuses.totalCriticalChance;
    
    return Math.min(100, baseCrit + equipmentBonus);
  }
  
  // En cada ataque del jugador
  playerAttack() {
    const damage = this.calculateDamageWithEquipment();
    const isCritical = Math.random() * 100 < this.calculateCriticalWithEquipment();
    const finalDamage = isCritical ? damage * 1.5 : damage;
    
    // ... aplicar daño
  }
}
```

## 4. Endpoints Relacionados con Equipamiento

### 4.1 GET: Obtener Equipamiento del Personaje

```typescript
// GET /api/survival/character/:characterId/equipment

Response:
{
  "equipment": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "itemId": "507f1f77bcf86cd799439012",
      "name": "Armadura de Hierro",
      "tipo": "armor",
      "rareza": "raro",
      "stats": {
        "healthBonus": 30,
        "defenseBonus": 25
      },
      "level": 5,
      "enchantmentLevel": 2,
      "durability": 95
    },
    // ... más items
  ]
}
```

### 4.2 POST: Iniciar Sesión con Equipamiento

```typescript
// POST /api/survival/start

Request Body:
{
  "characterId": "507f1f77bcf86cd799439011",
  "equipment": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "tipo": "armor",
      "stats": { "healthBonus": 30 }
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "tipo": "weapon",
      "stats": { "damageBonus": 15 }
    },
    null,  // Sin accesorio
    {
      "_id": "507f1f77bcf86cd799439014",
      "tipo": "relic",
      "stats": { "criticalChance": 10 }
    }
  ]
}

Response:
{
  "sessionId": "507f1f77bcf86cd799439020",
  "characterId": "507f1f77bcf86cd799439011",
  "equipment": [ /* array completo */ ],
  "equipmentBonuses": {
    "totalHealthBonus": 30,
    "totalDamageBonus": 15,
    "totalCriticalChance": 10,
    "totalDefenseBonus": 0,
    "totalResilienceBonus": 0
  },
  "currentWave": 1,
  "healthMax": 130,      // 100 base + 30 bonus
  "healthCurrent": 130
}
```

## 5. Componentes Frontend Necesarios

### 5.1 Componente 1: Equipment Selector (Pre-Start)

```typescript
// survivor-equipment-selector.component.ts

@Component({
  selector: 'app-survivor-equipment-selector',
  template: `
    <div class="equipment-selector">
      <h2>Selecciona tu Equipamiento</h2>
      
      <div class="equipment-slots">
        <!-- Slot 1: Armor -->
        <div class="slot armor-slot" 
             (drop)="onDrop($event, 'armor')"
             (dragover)="onDragOver($event)">
          <img *ngIf="selectedEquipment['armor']" 
               [src]="getEquipmentImage(selectedEquipment['armor'])">
          <p>Armadura</p>
        </div>
        
        <!-- Slot 2: Weapon -->
        <div class="slot weapon-slot"
             (drop)="onDrop($event, 'weapon')"
             (dragover)="onDragOver($event)">
          <img *ngIf="selectedEquipment['weapon']" 
               [src]="getEquipmentImage(selectedEquipment['weapon'])">
          <p>Arma</p>
        </div>
        
        <!-- Slot 3: Accessory -->
        <div class="slot accessory-slot"
             (drop)="onDrop($event, 'accessory')"
             (dragover)="onDragOver($event)">
          <img *ngIf="selectedEquipment['accessory']" 
               [src]="getEquipmentImage(selectedEquipment['accessory'])">
          <p>Accesorio</p>
        </div>
        
        <!-- Slot 4: Relic -->
        <div class="slot relic-slot"
             (drop)="onDrop($event, 'relic')"
             (dragover)="onDragOver($event)">
          <img *ngIf="selectedEquipment['relic']" 
               [src]="getEquipmentImage(selectedEquipment['relic'])">
          <p>Reliquia</p>
        </div>
      </div>
      
      <!-- Inventario disponible -->
      <div class="inventory">
        <h3>Equipamiento Disponible</h3>
        <div class="items-grid">
          <div *ngFor="let item of availableEquipment"
               class="item-card"
               [class.selected]="isSelected(item)"
               draggable="true"
               (dragstart)="onDragStart($event, item)">
            <img [src]="getEquipmentImage(item)">
            <p>{{ item.name }}</p>
            <span class="rarity" [ngClass]="item.rareza">
              {{ item.rareza }}
            </span>
          </div>
        </div>
      </div>
      
      <button (click)="startSession()" 
              [disabled]="!isValidSelection()">
        Iniciar Oleadas
      </button>
    </div>
  `,
  styles: [`
    .equipment-slots {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 20px 0;
    }
    
    .slot {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      min-height: 150px;
      cursor: drop;
    }
    
    .inventory {
      margin-top: 30px;
    }
    
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px;
    }
    
    .item-card {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      cursor: grab;
      transition: transform 0.2s;
    }
    
    .item-card:hover {
      transform: scale(1.05);
    }
    
    .rarity {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
  `]
})
export class SurvivorEquipmentSelectorComponent {
  availableEquipment: IEquipmentInstance[] = [];
  selectedEquipment: {
    armor?: IEquipmentInstance;
    weapon?: IEquipmentInstance;
    accessory?: IEquipmentInstance;
    relic?: IEquipmentInstance;
  } = {};
  
  draggedItem: IEquipmentInstance | null = null;
  
  constructor(
    private survivalService: SurvivalService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadEquipment();
  }
  
  loadEquipment() {
    this.survivalService.getAvailableEquipment()
      .subscribe(equipment => {
        this.availableEquipment = equipment;
      });
  }
  
  onDragStart(event: DragEvent, item: IEquipmentInstance) {
    this.draggedItem = item;
    event.dataTransfer!.effectAllowed = 'copy';
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }
  
  onDrop(event: DragEvent, slotType: string) {
    event.preventDefault();
    
    if (this.draggedItem && this.draggedItem.tipo === slotType) {
      this.selectedEquipment[slotType as any] = this.draggedItem;
    }
    
    this.draggedItem = null;
  }
  
  isSelected(item: IEquipmentInstance): boolean {
    return Object.values(this.selectedEquipment).includes(item);
  }
  
  isValidSelection(): boolean {
    // Al menos 1 item debe estar seleccionado
    return Object.values(this.selectedEquipment).some(e => e !== undefined);
  }
  
  startSession() {
    const equipment = [
      this.selectedEquipment.armor || null,
      this.selectedEquipment.weapon || null,
      this.selectedEquipment.accessory || null,
      this.selectedEquipment.relic || null
    ];
    
    this.survivalService.startSession({
      characterId: this.characterId,
      equipment
    }).subscribe(session => {
      this.router.navigate(['/survival/combat', session._id]);
    });
  }
  
  getEquipmentImage(item: IEquipmentInstance): string {
    return `/assets/equipment/${item.tipo}/${item._id}.png`;
  }
}
```

### 5.2 Componente 2: Combat Display (En Batalla)

```typescript
// survivor-combat-display.component.ts

@Component({
  selector: 'app-survivor-combat-display',
  template: `
    <div class="combat-display">
      <!-- Player Stats con Equipment Bonuses -->
      <div class="player-panel">
        <h3>Tu Personaje</h3>
        <div class="stats">
          <div class="stat">
            <label>Vida:</label>
            <div class="health-bar">
              <div class="health-fill" 
                   [style.width.%]="(playerStats.health / playerStats.maxHealth) * 100">
              </div>
            </div>
            <span>{{ playerStats.health }} / {{ playerStats.maxHealth }}</span>
          </div>
          
          <div class="stat">
            <label>Daño:</label>
            <span>{{ playerStats.damage.toFixed(1) }}</span>
            <span class="bonus" 
                  *ngIf="equipmentBonuses.totalDamageBonus > 0">
              +{{ equipmentBonuses.totalDamageBonus }}%
            </span>
          </div>
          
          <div class="stat">
            <label>Defensa:</label>
            <span>{{ playerStats.defense.toFixed(1) }}</span>
            <span class="bonus"
                  *ngIf="equipmentBonuses.totalDefenseBonus > 0">
              +{{ equipmentBonuses.totalDefenseBonus }}%
            </span>
          </div>
          
          <div class="stat">
            <label>Crítico:</label>
            <span>{{ playerStats.criticalChance.toFixed(1) }}%</span>
            <span class="bonus"
                  *ngIf="equipmentBonuses.totalCriticalChance > 0">
              +{{ equipmentBonuses.totalCriticalChance }}%
            </span>
          </div>
        </div>
        
        <!-- Equipment equipped -->
        <div class="equipped-equipment">
          <h4>Equipamiento</h4>
          <div class="equipment-list">
            <div *ngFor="let item of currentEquipment"
                 class="equipment-item"
                 *ngIf="item">
              <img [src]="getEquipmentImage(item)">
              <p>{{ item.name }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Enemy Panel -->
      <div class="enemy-panel">
        <h3>Onda {{ currentWave }}</h3>
        <p class="enemy-name">{{ enemy.name }}</p>
        <div class="health-bar">
          <div class="health-fill"
               [style.width.%]="(enemy.health / enemy.maxHealth) * 100">
          </div>
        </div>
        <span>{{ enemy.health }} / {{ enemy.maxHealth }}</span>
      </div>
      
      <!-- Combat Log -->
      <div class="combat-log">
        <div *ngFor="let action of actionsLog"
             class="log-entry"
             [class.player]="action.type === 'attack'"
             [class.enemy]="action.type === 'enemy_attack'"
             [class.item]="action.type === 'item_use'">
          {{ action.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .equipped-equipment {
      margin-top: 20px;
      padding: 10px;
      background: rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    
    .equipment-list {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .equipment-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }
    
    .equipment-item img {
      width: 40px;
      height: 40px;
      border-radius: 4px;
    }
    
    .bonus {
      color: #4CAF50;
      font-weight: bold;
      font-size: 12px;
    }
  `]
})
export class SurvivorCombatDisplayComponent {
  @Input() currentSession: ISurvivalSession;
  @Input() currentWave: number;
  @Input() enemy: IEnemyStats;
  @Input() playerStats: IPlayerStats;
  @Input() actionsLog: IActionLog[];
  
  get equipmentBonuses() {
    return this.currentSession.equipmentBonuses;
  }
  
  get currentEquipment() {
    return this.currentSession.equipment.filter(e => e !== null);
  }
  
  getEquipmentImage(item: IEquipmentInstance): string {
    return `/assets/equipment/${item.tipo}/${item._id}.png`;
  }
}
```

## 6. Servicios Angular Necesarios

### 6.1 survival.service.ts - Métodos de Equipamiento

```typescript
// En src/app/services/survival.service.ts

export class SurvivalService {
  constructor(private http: HttpClient) {}
  
  // Obtener equipamiento disponible del personaje
  getAvailableEquipment(): Observable<IEquipmentInstance[]> {
    return this.http.get<IEquipmentInstance[]>(
      `/api/user-characters/${this.characterId}/equipment`
    );
  }
  
  // Iniciar sesión con equipamiento seleccionado
  startSession(data: {
    characterId: string;
    equipment: (IEquipmentInstance | null)[];
  }): Observable<ISurvivalSession> {
    return this.http.post<ISurvivalSession>(
      '/api/survival/start',
      data
    );
  }
  
  // Obtener bonificaciones de equipamiento (para debugging)
  getEquipmentBonuses(equipment: (IEquipmentInstance | null)[]): 
    Observable<IEquipmentBonuses> {
    return this.http.post<IEquipmentBonuses>(
      '/api/survival/equipment/bonuses',
      { equipment }
    );
  }
}
```

## 7. Tipos TypeScript Frontend

```typescript
// En src/app/models/survival.models.ts

export interface IEquipmentInstance {
  _id: string;
  itemId: string;
  name: string;
  tipo: 'armor' | 'weapon' | 'accessory' | 'relic';
  rareza: 'común' | 'raro' | 'épico' | 'legendario';
  stats: {
    healthBonus?: number;
    damageBonus?: number;
    defenseBonus?: number;
    criticalChance?: number;
    resilienceBonus?: number;
  };
  level: number;
  enchantmentLevel: number;
  durability: number;
}

export interface ISurvivalSession {
  _id: string;
  userId: string;
  characterId: string;
  equipment: (IEquipmentInstance | null)[];
  equipmentBonuses: IEquipmentBonuses;
  currentWave: number;
  currentPoints: number;
  healthMax: number;
  healthCurrent: number;
  state: 'active' | 'paused' | 'completed' | 'failed';
  createdAt: Date;
  startedAt: Date;
}

export interface IEquipmentBonuses {
  totalHealthBonus: number;
  totalDamageBonus: number;
  totalDefenseBonus: number;
  totalCriticalChance: number;
  totalResilienceBonus: number;
}

export interface IPlayerStats {
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  criticalChance: number;
}
```

## 8. Estilos CSS para Equipamiento

```css
/* survivor-equipment.styles.css */

.equipment-selector {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.equipment-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 20px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
}

.slot {
  border: 3px dashed rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  min-height: 150px;
  background: rgba(0, 0, 0, 0.2);
  cursor: drop;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.slot:hover {
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.3);
}

.slot img {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.slot p {
  color: white;
  font-weight: bold;
  margin: 0;
}

.inventory {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-top: 30px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.item-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  cursor: grab;
  transition: all 0.3s ease;
  background: white;
  text-align: center;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.item-card.selected {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.item-card img {
  width: 80px;
  height: 80px;
  margin-bottom: 8px;
  border-radius: 4px;
}

.rarity {
  display: block;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 5px;
  padding: 3px 5px;
  border-radius: 3px;
}

.rarity.común {
  color: #999;
  background: rgba(153, 153, 153, 0.1);
}

.rarity.raro {
  color: #2196F3;
  background: rgba(33, 150, 243, 0.1);
}

.rarity.épico {
  color: #9C27B0;
  background: rgba(156, 39, 176, 0.1);
}

.rarity.legendario {
  color: #FF9800;
  background: rgba(255, 152, 0, 0.1);
}

/* Combat Display Styles */

.combat-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.player-panel,
.enemy-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.health-bar {
  flex: 1;
  height: 24px;
  background: #ddd;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 10px;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.bonus {
  color: #4CAF50;
  font-weight: bold;
  margin-left: 10px;
}
```

## 9. Checklist de Integración

- [ ] Crear `IEquipmentInstance` interface en models
- [ ] Crear `SurvivorEquipmentSelectorComponent`
- [ ] Crear `SurvivorCombatDisplayComponent`
- [ ] Implementar métodos en `SurvivalService`
- [ ] Agregar equipamiento a rutas de survival
- [ ] Implementar drag-and-drop
- [ ] Agregar validación de tipos de items
- [ ] Conectar con WebSocket para actualizaciones
- [ ] Agregar sonidos/efectos visuales
- [ ] Pruebas de equipamiento en combate
- [ ] Ajustar balanceo de bonificaciones
- [ ] Agregar tooltips y ayuda

## 10. Próximos Pasos

1. **WebSocket Integration**: Emitir eventos cuando se equipa/desequipa
2. **Item Crafting**: Sistema para mejorar equipamiento
3. **Equipment Grinding**: Métodos para obtener mejor equipo
4. **Enchantments**: Sistema de encantamientos progresivos
5. **Set Bonuses**: Bonificaciones por usar sets completos

---

**Documento Creado**: 24 Nov 2025  
**Estado**: ✅ LISTO PARA IMPLEMENTACIÓN FRONTEND
