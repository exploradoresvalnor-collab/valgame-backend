# 🎮 Flujo Integrado: Selección de Personaje y Equipamiento

**Versión**: 2.0  
**Fecha**: 24 de Noviembre 2025  
**Módulos**: Personajes, Equipamiento, RPG, Survival  
**Estado**: ✅ Especificación Completa

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Flujo Principal de Selección](#flujo-principal-de-selección)
3. [Pantalla Dashboard](#pantalla-dashboard)
4. [Selección de Personaje](#selección-de-personaje)
5. [Selección de Equipamiento](#selección-de-equipamiento)
6. [Integración RPG vs Survival](#integración-rpg-vs-survival)
7. [Servicios Angular](#servicios-angular)
8. [Endpoints Backend](#endpoints-backend)
9. [Ejemplo Práctico](#ejemplo-práctico)

---

## 🎯 Visión General

El sistema funcionará con **UN ÚNICO SELECTOR INTEGRADO** que permite:

```
Usuario Logueado
    ↓
DASHBOARD (Panel Principal)
    ├─→ Mostrar todos los personajes del usuario
    ├─→ Mostrar equipamiento disponible
    └─→ Botones para iniciar RPG o Survival
         ↓
    Selecciona Personaje A
         ↓
    Selecciona Equipamiento (mismos 4 slots)
         ↓
    Elige modo:
         ├─→ RPG Mazmorras (mismo equip)
         └─→ Survival Oleadas (mismo equip)
         ↓
    Sesión Activa (RPG o Survival)
```

### Punto Clave:
- **Un solo equipamiento** por personaje se usa en ambos modos
- Cuando elige **Survival**, automáticamente usa el personaje principal
- El equipamiento seleccionado persiste entre cambios de modo

---

## 🎪 Flujo Principal de Selección

### Fase 1: Usuario Accede a Dashboard

```
1. Usuario logueado → Dashboard
2. Sistema carga:
   - Todos los personajes del usuario
   - Equipamiento total disponible
   - Sesiones activas (RPG/Survival)
   - Historial reciente
```

### Fase 2: Selecciona Personaje

```
GET /api/user-characters
Response:
{
  "personajes": [
    {
      "_id": "char001",
      "nombre": "Guerrero",
      "nivel": 45,
      "rango": 3,
      "stats": { salud: 150, ataque: 80, defensa: 60 },
      "experiencia": 45000
    },
    {
      "_id": "char002",
      "nombre": "Mago",
      "nivel": 32,
      "rango": 2,
      "stats": { salud: 90, ataque: 120, defensa: 30 }
    }
  ]
}
```

### Fase 3: Selecciona Equipamiento

```
GET /api/user-characters/{characterId}/equipment
Response:
{
  "equipment": [
    // 4 slots + items disponibles en inventario
  ]
}
```

### Fase 4: Elige Modo

```
Usuario elige:
├─→ "Ir al RPG Mazmorras"
│    POST /api/combat/start
│    Body: {
│      characterId: "char001",
│      equipment: [armor, weapon, accessory, relic]
│    }
│
└─→ "Ir a Survival Oleadas"
     POST /api/survival/start
     Body: {
       characterId: "char001",
       equipment: [armor, weapon, accessory, relic]
     }
```

---

## 🎮 Pantalla Dashboard

### Componente: `dashboard.component.ts`

```typescript
// src/app/components/dashboard/dashboard.component.ts

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  // Datos principales
  personajes: IPersonaje[] = [];
  equipamientoDisponible: IEquipmentInstance[] = [];
  sesionActiva: ISesionActiva | null = null;
  
  // Selección actual
  personajeSeleccionado: IPersonaje | null = null;
  equipamientoSeleccionado: {
    armor?: IEquipmentInstance;
    weapon?: IEquipmentInstance;
    accessory?: IEquipmentInstance;
    relic?: IEquipmentInstance;
  } = {};
  
  // UI State
  mostrandoSelectorEquipamiento = false;
  modoSeleccionado: 'rpg' | 'survival' | null = null;
  
  constructor(
    private characterService: CharacterService,
    private survivalService: SurvivalService,
    private combatService: CombatService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.cargarDatos();
  }
  
  /**
   * 1. Cargar todos los datos iniciales
   */
  cargarDatos() {
    // Cargar personajes del usuario
    this.characterService.getMyCharacters().subscribe(
      personajes => {
        this.personajes = personajes;
        
        // Si hay sesión activa, mostrarla
        this.verificarSesionesActivas();
      }
    );
    
    // Cargar equipamiento disponible
    this.characterService.getAvailableEquipment().subscribe(
      equipo => {
        this.equipamientoDisponible = equipo;
      }
    );
  }
  
  /**
   * 2. Verificar si hay sesiones activas
   */
  verificarSesionesActivas() {
    // Verificar si tiene sesión de RPG activa
    this.combatService.getActiveCombatSession().subscribe(
      sesion => {
        if (sesion) {
          this.sesionActiva = {
            tipo: 'rpg',
            datos: sesion
          };
        }
      },
      error => {} // No hay sesión activa
    );
    
    // Verificar si tiene sesión de Survival activa
    this.survivalService.getActiveSession().subscribe(
      sesion => {
        if (sesion) {
          this.sesionActiva = {
            tipo: 'survival',
            datos: sesion
          };
        }
      },
      error => {} // No hay sesión activa
    );
  }
  
  /**
   * 3. Seleccionar personaje
   */
  seleccionarPersonaje(personaje: IPersonaje) {
    this.personajeSeleccionado = personaje;
    this.mostrandoSelectorEquipamiento = true;
    this.modoSeleccionado = null; // Reset modo
    
    // Cargar equipamiento de este personaje
    this.caracterEquipo();
  }
  
  /**
   * 4. Cargar equipamiento del personaje
   */
  caracterEquipo() {
    if (!this.personajeSeleccionado) return;
    
    this.characterService
      .getCharacterEquipment(this.personajeSeleccionado._id)
      .subscribe(equipment => {
        // Los primeros 4 items están equipados
        this.equipamientoSeleccionado = {
          armor: equipment[0] || undefined,
          weapon: equipment[1] || undefined,
          accessory: equipment[2] || undefined,
          relic: equipment[3] || undefined
        };
      });
  }
  
  /**
   * 5. Seleccionar equipo en selector
   */
  seleccionarEquipamiento(
    tipo: 'armor' | 'weapon' | 'accessory' | 'relic',
    item: IEquipmentInstance
  ) {
    this.equipamientoSeleccionado[tipo] = item;
  }
  
  /**
   * 6. Iniciar RPG Mazmorras
   */
  iniciarRPG() {
    if (!this.personajeSeleccionado) return;
    
    const equipment = [
      this.equipamientoSeleccionado.armor || null,
      this.equipamientoSeleccionado.weapon || null,
      this.equipamientoSeleccionado.accessory || null,
      this.equipamientoSeleccionado.relic || null
    ];
    
    // POST /api/combat/start
    this.combatService.startCombat({
      characterId: this.personajeSeleccionado._id,
      equipment
    }).subscribe(
      sesion => {
        // Redirigir a selección de mazmorra
        this.router.navigate(['/combat/dungeons', sesion._id]);
      },
      error => {
        console.error('Error iniciando RPG', error);
      }
    );
  }
  
  /**
   * 7. Iniciar Survival Oleadas
   */
  iniciarSurvival() {
    if (!this.personajeSeleccionado) return;
    
    const equipment = [
      this.equipamientoSeleccionado.armor || null,
      this.equipamientoSeleccionado.weapon || null,
      this.equipamientoSeleccionado.accessory || null,
      this.equipamientoSeleccionado.relic || null
    ];
    
    // POST /api/survival/start
    this.survivalService.startSession({
      characterId: this.personajeSeleccionado._id,
      equipment
    }).subscribe(
      sesion => {
        // Redirigir a combat
        this.router.navigate(['/survival/combat', sesion._id]);
      },
      error => {
        console.error('Error iniciando Survival', error);
      }
    );
  }
  
  /**
   * 8. Reanudar sesión activa
   */
  reanudaSesion() {
    if (!this.sesionActiva) return;
    
    if (this.sesionActiva.tipo === 'rpg') {
      this.router.navigate([
        '/combat/battle',
        this.sesionActiva.datos._id
      ]);
    } else {
      this.router.navigate([
        '/survival/combat',
        this.sesionActiva.datos._id
      ]);
    }
  }
}
```

### Template HTML: `dashboard.component.html`

```html
<div class="dashboard-container">
  <!-- Sesión Activa (si existe) -->
  <div *ngIf="sesionActiva" class="active-session-banner">
    <h3>
      {{ sesionActiva.tipo === 'rpg' ? '⚔️ Sesión RPG Activa' : '🏹 Oleadas Activas' }}
    </h3>
    <p>Wave: {{ sesionActiva.datos.wave || sesionActiva.datos.currentWave }}</p>
    <button (click)="reanudaSesion()" class="btn-resume">
      Reanudar
    </button>
  </div>

  <!-- Selector de Personaje -->
  <div class="section personajes-section">
    <h2>📚 Tus Personajes</h2>
    
    <div class="personajes-grid">
      <div 
        *ngFor="let perso of personajes"
        class="personaje-card"
        [class.selected]="personajeSeleccionado?._id === perso._id"
        (click)="seleccionarPersonaje(perso)">
        
        <div class="personaje-header">
          <h3>{{ perso.nombre }}</h3>
          <span class="nivel">Lvl {{ perso.nivel }}</span>
        </div>
        
        <div class="personaje-stats">
          <p>❤️ {{ perso.stats.salud }}</p>
          <p>⚔️ {{ perso.stats.ataque }}</p>
          <p>🛡️ {{ perso.stats.defensa }}</p>
        </div>
        
        <div class="personaje-progress">
          <div class="exp-bar">
            <div 
              class="exp-fill"
              [style.width.%]="(perso.experiencia % 1000) / 10">
            </div>
          </div>
          <small>EXP: {{ perso.experiencia }}</small>
        </div>
      </div>
    </div>
  </div>

  <!-- Selector de Equipamiento (cuando hay personaje seleccionado) -->
  <div 
    *ngIf="mostrandoSelectorEquipamiento && personajeSeleccionado"
    class="section equipamiento-section">
    
    <h2>🎒 Equipa a {{ personajeSeleccionado.nombre }}</h2>
    
    <!-- 4 Slots de Equipamiento -->
    <div class="equipment-slots">
      <!-- Armor -->
      <div class="slot armor">
        <h4>🛡️ Armadura</h4>
        <div class="slot-content">
          <img 
            *ngIf="equipamientoSeleccionado.armor"
            [src]="getEquipmentImage(equipamientoSeleccionado.armor)">
          <p *ngIf="!equipamientoSeleccionado.armor" class="placeholder">
            Sin armadura
          </p>
        </div>
      </div>

      <!-- Weapon -->
      <div class="slot weapon">
        <h4>⚔️ Arma</h4>
        <div class="slot-content">
          <img 
            *ngIf="equipamientoSeleccionado.weapon"
            [src]="getEquipmentImage(equipamientoSeleccionado.weapon)">
          <p *ngIf="!equipamientoSeleccionado.weapon" class="placeholder">
            Sin arma
          </p>
        </div>
      </div>

      <!-- Accessory -->
      <div class="slot accessory">
        <h4>✨ Accesorio</h4>
        <div class="slot-content">
          <img 
            *ngIf="equipamientoSeleccionado.accessory"
            [src]="getEquipmentImage(equipamientoSeleccionado.accessory)">
          <p *ngIf="!equipamientoSeleccionado.accessory" class="placeholder">
            Sin accesorio
          </p>
        </div>
      </div>

      <!-- Relic -->
      <div class="slot relic">
        <h4>🔮 Reliquia</h4>
        <div class="slot-content">
          <img 
            *ngIf="equipamientoSeleccionado.relic"
            [src]="getEquipmentImage(equipamientoSeleccionado.relic)">
          <p *ngIf="!equipamientoSeleccionado.relic" class="placeholder">
            Sin reliquia
          </p>
        </div>
      </div>
    </div>

    <!-- Inventario para seleccionar items -->
    <div class="inventory">
      <h3>Inventario Disponible</h3>
      <div class="items-grid">
        <div 
          *ngFor="let item of equipamientoDisponible"
          class="item-card"
          (click)="seleccionarEquipamiento(item.tipo, item)">
          
          <img [src]="getEquipmentImage(item)">
          <p class="name">{{ item.name }}</p>
          <span class="type">{{ item.tipo }}</span>
          <span class="rarity" [ngClass]="item.rareza">{{ item.rareza }}</span>
        </div>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="action-buttons">
      <button 
        (click)="iniciarRPG()"
        class="btn btn-rpg">
        ⚔️ Ir al RPG Mazmorras
      </button>
      
      <button 
        (click)="iniciarSurvival()"
        class="btn btn-survival">
        🏹 Ir a Survival Oleadas
      </button>
    </div>
  </div>
</div>
```

---

## 🎯 Selección de Personaje

### Datos que se envían

```typescript
interface SelectCharacterPayload {
  characterId: string;
  name: string;
  nivel: number;
  stats: {
    salud: number;
    ataque: number;
    defensa: number;
  };
}
```

### Storage en Frontend

```typescript
// En sessionStorage/localStorage
sessionStorage.setItem('selectedCharacter', JSON.stringify({
  _id: 'char001',
  nombre: 'Guerrero',
  nivel: 45,
  selectedAt: new Date()
}));
```

---

## 🛠️ Selección de Equipamiento

### Estructura que se envía a backend

```typescript
interface EquipmentSelection {
  characterId: string;
  equipment: [
    IEquipmentInstance | null,  // armor slot
    IEquipmentInstance | null,  // weapon slot
    IEquipmentInstance | null,  // accessory slot
    IEquipmentInstance | null   // relic slot
  ];
  selectedAt: Date;
}
```

### Se calcula inmediatamente

```typescript
// En frontend
calculateBonuses() {
  let bonuses = {
    totalHealth: 0,
    totalDamage: 0,
    totalDefense: 0,
    totalCritical: 0
  };
  
  for (const item of this.equipamientoSeleccionado) {
    if (!item) continue;
    bonuses.totalHealth += item.stats.healthBonus || 0;
    bonuses.totalDamage += item.stats.damageBonus || 0;
    // ...
  }
  
  return bonuses;
}
```

---

## 🎮 Integración RPG vs Survival

### Punto Clave: Mismo Equipamiento

```
┌─────────────────────────────────────────┐
│ Dashboard Component                     │
│ - Personaje seleccionado: Guerrero     │
│ - Equipamiento seleccionado: [4 items] │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ↓                   ↓
   RPG Mazmorras      Survival Oleadas
   POST /combat/start  POST /survival/start
   {                  {
     characterId,       characterId,
     equipment: [4]     equipment: [4]
   }                  }
        ↓                   ↓
   CombatSession      SurvivalSession
   - mismos stats     - mismos stats
   - mismas bonuses   - mismas bonuses
```

### Diferencias

**RPG Mazmorras**:
- ✅ Puedes cambiar personaje entre mazmorras
- ✅ Seleccionar mazmorra específica
- ✅ Sistema de turnos

**Survival Oleadas**:
- ✅ **Un solo personaje por sesión** (el seleccionado)
- ✅ Ondas infinitas/progresivas
- ✅ Sistema en tiempo real

### Lógica en Backend

```typescript
// En survival.routes.ts - POST /api/survival/start

router.post('/start', auth, async (req, res) => {
  const { characterId, equipment } = req.body;
  const userId = req.user.userId;
  
  // Validar que el personaje pertenece al usuario
  const character = await Character.findById(characterId);
  if (character.userId !== userId) {
    return res.status(403).json({ error: 'No tienes este personaje' });
  }
  
  // Crear sesión con ese personaje + equipamiento
  const session = await SurvivalService.startSession(
    userId,
    characterId,
    equipment
  );
  
  res.json(session);
});

// En combat.routes.ts - POST /api/combat/start

router.post('/start', auth, async (req, res) => {
  const { characterId, equipment } = req.body;
  const userId = req.user.userId;
  
  // Validar personaje
  const character = await Character.findById(characterId);
  if (character.userId !== userId) {
    return res.status(403).json({ error: 'No tienes este personaje' });
  }
  
  // Crear sesión de combate
  const session = await CombatService.startCombat(
    userId,
    characterId,
    equipment
  );
  
  res.json(session);
});
```

---

## 🔧 Servicios Angular

### character.service.ts

```typescript
export class CharacterService {
  constructor(private http: HttpClient) {}
  
  // 1. Obtener todos los personajes del usuario
  getMyCharacters(): Observable<IPersonaje[]> {
    return this.http.get<IPersonaje[]>('/api/user-characters');
  }
  
  // 2. Obtener equipamiento disponible
  getAvailableEquipment(): Observable<IEquipmentInstance[]> {
    return this.http.get<IEquipmentInstance[]>(
      '/api/user-characters/equipment'
    );
  }
  
  // 3. Obtener equipamiento de un personaje
  getCharacterEquipment(characterId: string): Observable<IEquipmentInstance[]> {
    return this.http.get<IEquipmentInstance[]>(
      `/api/user-characters/${characterId}/equipment`
    );
  }
}
```

### combat.service.ts

```typescript
export class CombatService {
  constructor(private http: HttpClient) {}
  
  // Iniciar sesión de RPG
  startCombat(data: {
    characterId: string;
    equipment: (IEquipmentInstance | null)[];
  }): Observable<ICombatSession> {
    return this.http.post<ICombatSession>(
      '/api/combat/start',
      data
    );
  }
  
  // Obtener sesión activa
  getActiveCombatSession(): Observable<ICombatSession> {
    return this.http.get<ICombatSession>(
      '/api/combat/active'
    );
  }
}
```

### survival.service.ts

```typescript
export class SurvivalService {
  constructor(private http: HttpClient) {}
  
  // Iniciar sesión de Survival
  startSession(data: {
    characterId: string;
    equipment: (IEquipmentInstance | null)[];
  }): Observable<ISurvivalSession> {
    return this.http.post<ISurvivalSession>(
      '/api/survival/start',
      data
    );
  }
  
  // Obtener sesión activa
  getActiveSession(): Observable<ISurvivalSession> {
    return this.http.get<ISurvivalSession>(
      '/api/survival/session/active'
    );
  }
}
```

---

## 📡 Endpoints Backend Requeridos

### GET: Obtener Personajes

```
GET /api/user-characters
Auth: JWT

Response:
{
  "personajes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Guerrero",
      "nivel": 45,
      "rango": 3,
      "etapa": 2,
      "stats": {
        "salud": 150,
        "ataque": 80,
        "defensa": 60,
        "velocidad": 40
      },
      "experiencia": 45000,
      "survivalPoints": 5000,
      "inventarioEquipamiento": [...]
    },
    ...
  ]
}
```

### GET: Equipamiento Disponible

```
GET /api/user-characters/{characterId}/equipment
Auth: JWT

Response:
{
  "equipment": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Armadura de Hierro",
      "tipo": "armor",
      "rareza": "raro",
      "stats": {
        "healthBonus": 30,
        "defenseBonus": 25
      },
      "level": 5,
      "durability": 95
    },
    ...
  ]
}
```

### POST: Iniciar Combat (RPG)

```
POST /api/combat/start
Auth: JWT

Body:
{
  "characterId": "507f1f77bcf86cd799439011",
  "equipment": [
    { "_id": "...", "tipo": "armor", ... },
    { "_id": "...", "tipo": "weapon", ... },
    null,
    { "_id": "...", "tipo": "relic", ... }
  ]
}

Response:
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439000",
  "characterId": "507f1f77bcf86cd799439011",
  "equipment": [...],
  "state": "active",
  "createdAt": "2025-11-24T14:00:00Z"
}
```

### POST: Iniciar Survival

```
POST /api/survival/start
Auth: JWT

Body:
{
  "characterId": "507f1f77bcf86cd799439011",
  "equipment": [
    { "_id": "...", "tipo": "armor", ... },
    { "_id": "...", "tipo": "weapon", ... },
    { "_id": "...", "tipo": "accessory", ... },
    { "_id": "...", "tipo": "relic", ... }
  ]
}

Response:
{
  "_id": "507f1f77bcf86cd799439021",
  "userId": "507f1f77bcf86cd799439000",
  "characterId": "507f1f77bcf86cd799439011",
  "equipment": [...],
  "equipmentBonuses": {
    "totalHealthBonus": 30,
    "totalDamageBonus": 50,
    "totalDefenseBonus": 25,
    "totalCriticalChance": 15,
    "totalResilienceBonus": 0
  },
  "currentWave": 1,
  "currentPoints": 0,
  "healthMax": 180,
  "healthCurrent": 180,
  "state": "active",
  "createdAt": "2025-11-24T14:00:00Z"
}
```

---

## 💡 Ejemplo Práctico

### Escenario: María inicia sesión

```
1. María abre la app
   → Dashboard carga automáticamente

2. Muestra:
   - Personajes: [Guerrero Lvl 45, Mago Lvl 32, Arquero Lvl 28]
   - Equipamiento disponible: 24 items en inventario
   - Sin sesión activa

3. María hace click en "Guerrero"
   → Se selecciona el Guerrero
   → Se carga su equipamiento: [Armadura Épica, Espada Legendaria, Anillo Raro, null]
   → Se muestra selector de equipamiento

4. María ve los 4 slots equipados
   → Decide cambiar: reemplaza la Espada por otra mejor
   → Ahora tiene: [Armadura Épica, Espada ULTRA, Anillo Raro, null]

5. María hace click en "Ir a Survival Oleadas"
   → POST /api/survival/start
   → Backend crea SurvivalSession con:
      - userId: maría_id
      - characterId: guerrero_id
      - equipment: [Armadura, Espada ULTRA, Anillo, null]
   → Calcula bonificaciones
   → Retorna sesión

6. María entra a combate
   → Ve su personaje con stats mejorados
   → Comienza Wave 1

7. María juega 5 ondas exitosas
   → Gana experiencia, items, survival points

8. María abandona sesión
   → Su progreso se guarda

9. María vuelve al Dashboard
   → Ve opción "Reanudar Oleadas" en el banner superior
   → O puede seleccionar otro personaje (Mago)
   → Si selecciona Mago, la sesión anterior se pausa
   → El Mago aparece con su equipamiento diferente
```

---

## 📋 Checklist de Implementación

- [ ] Componente Dashboard creado
- [ ] Cargar personajes en ngOnInit
- [ ] Selector de personaje visual
- [ ] Cargar equipamiento del personaje
- [ ] Mostrar 4 slots de equipamiento
- [ ] Drag-drop o click para seleccionar items
- [ ] Mostrar bonificaciones calculadas
- [ ] Botón "Ir a RPG" funcional
- [ ] Botón "Ir a Survival" funcional
- [ ] Verificar sesiones activas al cargar
- [ ] Mostrar banner de reanudar si hay sesión
- [ ] Manejo de errores
- [ ] Responsive design

---

## 🎯 Conclusión

El sistema funciona así:

**1 Dashboard → 1 Selección de Personaje → 1 Selección de Equipamiento → 2 Modos (RPG o Survival)**

- El equipamiento es **idéntico** para ambos modos
- Se elige **una sola vez** en el dashboard
- El mismo equipo funciona en ambos juegos
- Los stats se aplican automáticamente al iniciar sesión

**Ventajas**:
✅ Experiencia de usuario fluida  
✅ Sin duplicación de selección  
✅ Equipamiento consistente  
✅ Fácil cambio entre modos  

**Próximos pasos**:
→ Implementar componente Dashboard  
→ Conectar endpoints  
→ Agregar animaciones  
→ WebSocket para actualizaciones  

---

**Documento creado**: 24 Nov 2025  
**Estado**: ✅ LISTO PARA IMPLEMENTACIÓN
