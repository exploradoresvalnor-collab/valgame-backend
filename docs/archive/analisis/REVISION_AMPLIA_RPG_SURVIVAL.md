# 🎮 REVISIÓN AMPLIA - SISTEMA DUAL: RPG + SURVIVAL

**Fecha**: 27 de Noviembre, 2025  
**Alcance**: Validación de 2 juegos, modelos MongoDB, y compatibilidad  
**Estado Fixes**: ✅ APLICADOS (3 fixes Survival compilados exitosamente)

---

## ✅ FIXES APLICADOS - CONFIRMADO

### 🔧 Survival Fixes Status
```
[✅] FIX #1: Equipment structure mapping (startSurvival)
[✅] FIX #2: Missing fields in endSurvival (removed sessionId, consumablesUsed)
[✅] FIX #3: Missing fields in reportDeath (removed sessionId, consumablesUsed)
[✅] Build: npm run build - SIN ERRORES
```

**Próximo**: Revisión completa de ambos sistemas + tests

---

## 🎮 SISTEMA 1: RPG PRINCIPAL (Gameplay Core)

### Flujo Principal del RPG

```
INICIO
  ↓
1. Registro/Login
  ├─ Email + Password (con verificación)
  ├─ JWT token generado
  └─ Recibe "Paquete Pionero" (items iniciales)
  ↓
2. Creación de Personaje (1-9)
  ├─ Elegir rango inicial (D-SSS)
  ├─ Elegir nombre
  ├─ Asignar stats base
  └─ Guardar en User.personajes[]
  ↓
3. Seleccionar Personaje Activo
  ├─ User.personajeActivoId = characterId
  ├─ Cargar equipamiento
  ├─ Cargar stats
  └─ Listo para jugar
  ↓
4. Gameplay RPG
  ├─ A. COMBATE (PvE)
  │   ├─ Dungeons (5 mazmorras progresivas)
  │   ├─ Ganar EXP/VAL/items
  │   └─ Actualizar stats
  │
  ├─ B. EQUIPAMIENTO
  │   ├─ Eufar items (cabeza/cuerpo/manos/pies)
  │   ├─ Mejorar stats temporalmente
  │   └─ Usar consumibles
  │
  ├─ C. EVOLUCIÓN
  │   ├─ Nivel 40 → Etapa 2
  │   ├─ Nivel 100 → Etapa 3
  │   ├─ Gastar VAL + EVO tokens
  │   └─ Aumentar rango
  │
  ├─ D. MARKETPLACE
  │   ├─ Listar items P2P
  │   ├─ Comprar/vender
  │   ├─ 5% tax a vendedor
  │   └─ Transacciones atómicas
  │
  ├─ E. MONETIZACIÓN
  │   ├─ Web2: Stripe (comprar VAL/boletos)
  │   └─ Web3: Blockchain (token de juego)
  │
  └─ F. SOCIAL
      ├─ Chat global (WebSocket)
      ├─ Teams (1-5 jugadores)
      └─ Invitaciones

5. Permadeath (Optional)
  └─ Personaje muere → no recuperable
```

### Modelos MongoDB - RPG (Validación)

#### User Model ✅
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  username: String (unique, required),
  passwordHash: String,
  
  // CAMPOS SURVIVAL (NUEVOS - VALIDAR COMPATIBILIDAD)
  survivalPoints: Number (default: 0),
  currentSurvivalSession: ObjectId (ref: 'SurvivalSession'),
  survivalStats: {
    totalRuns: Number,
    maxWave: Number,
    totalPoints: Number,
    averageWave: Number
  },
  
  // CAMPOS RPG EXISTENTES
  val: Number (default: 0),
  evo: Number (default: 0),
  boletos: Number (default: 0),
  energia: Number (default: 100),
  energiaMaxima: Number,
  invocaciones: Number,
  evoluciones: Number,
  
  // PERSONAJES (1-9)
  personajes: [{
    personajeId: String,
    rango: Enum(D,C,B,A,S,SS,SSS),
    nivel: Number,
    etapa: Number(1|2|3),
    progreso: Number,
    experiencia: Number,
    stats: {atk, vida, defensa},
    saludActual: Number,
    saludMaxima: Number,
    estado: Enum(saludable|herido),
    equipamiento: [ObjectId],  // Refs a Items
    activeBuffs: [{
      consumableId: ObjectId,
      effects: {},
      expiresAt: Date
    }]
  }],
  
  personajeActivoId: String,  // ID del personaje seleccionado
  limiteInventarioPersonajes: Number (default: 50),
  
  // INVENTARIOS
  inventarioEquipamiento: [ObjectId],  // Refs a Items
  inventarioConsumibles: [{
    consumableId: ObjectId,
    usos_restantes: Number
  }],
  limiteInventarioEquipamiento: Number (default: 20),
  limiteInventarioConsumibles: Number (default: 50),
  
  // PROGRESO DUNGEONS
  dungeon_progress: Map<String, {
    victorias: Number,
    derrotas: Number,
    nivel_actual: Number,
    puntos_acumulados: Number,
    puntos_requeridos_siguiente_nivel: Number,
    mejor_tiempo: Number,
    ultima_victoria: Date
  }>,
  dungeon_streak: Number,
  max_dungeon_streak: Number,
  dungeon_stats: {
    total_victorias: Number,
    total_derrotas: Number,
    mejor_racha: Number
  },
  
  // OTROS
  walletAddress: String (sparse, unique),
  receivedPioneerPackage: Boolean,
  tutorialCompleted: Boolean,
  settings: {...}
  
  timestamps: createdAt, updatedAt
}
```

**Status**: ✅ Compatible con Survival (campos nuevos NO entran en conflicto)

#### Personaje Model (Embedded) ✅
```javascript
{
  personajeId: String,
  rango: Enum(D|C|B|A|S|SS|SSS),
  nivel: Number (1-200),
  etapa: Number (1|2|3),
  experiencia: Number,
  stats: {
    atk: Number,
    vida: Number,
    defensa: Number
  },
  saludActual: Number,
  saludMaxima: Number,
  estado: Enum(saludable|herido),
  fechaHerido: Date,
  equipamiento: [ObjectId ref Item],
  activeBuffs: [...]
}
```

**Límite**: 50 personajes por usuario ✅  
**Selección**: Elegir 1-9 de esos 50 ✅

---

## 🏹 SISTEMA 2: SURVIVAL (Nuevo Modo)

### Flujo Survival

```
ACCESO A SURVIVAL
  ↓
1. Seleccionar Personaje RPG Activo
  ├─ Mostrar stats base
  ├─ Mostrar equipamiento
  └─ Listo para entrar a Survival
  ↓
2. Elegir Equipamiento (4 slots)
  ├─ Head (casco)
  ├─ Body (armadura)
  ├─ Hands (guantes)
  └─ Feet (botas)
  ↓
3. Elegir Consumibles (0-5)
  ├─ Heal potions
  ├─ Attack boosters
  └─ Defense boosters
  ↓
4. POST /api/survival/start
  └─ Crear SurvivalSession
  ↓
5. LOOP SURVIVAL
  ├─ Oleada 1: Luchar
  ├─ POST /api/survival/:sessionId/complete-wave
  ├─ Recoger drops
  ├─ POST /api/survival/:sessionId/pickup-drop
  ├─ Usar consumibles
  ├─ POST /api/survival/:sessionId/use-consumable
  └─ Continuar o morir
  ↓
6. FINAL
  ├─ Exitoso:
  │   └─ POST /api/survival/:sessionId/end
  │       ├─ Guardar en SurvivalRun
  │       ├─ Aplicar recompensas
  │       ├─ Actualizar User (survivalPoints)
  │       └─ Actualizar Leaderboard
  │
  └─ Muerte:
      └─ POST /api/survival/:sessionId/report-death
          ├─ Guardar con 0 recompensas
          └─ Sesión finaliza
```

### Modelos MongoDB - Survival

#### SurvivalSession ✅
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref User),
  characterId: ObjectId,
  state: Enum(active|completed|abandoned),
  
  equipment: {
    head: {itemId, rareza, bonusAtaque},
    body: {itemId, rareza, bonusDefensa},
    hands: {itemId, rareza, bonusDefensa},
    feet: {itemId, rareza, bonusVelocidad}
  },
  
  consumables: [{
    itemId: ObjectId,
    nombre: String,
    usos_restantes: Number,
    efecto: {tipo, valor}
  }],
  
  currentWave: Number,
  currentPoints: Number,
  totalPointsAccumulated: Number,
  enemiesDefeated: Number,
  healthCurrent: Number,
  healthMax: Number,
  
  multipliers: {
    waveMultiplier: Number,
    survivalBonus: Number,
    equipmentBonus: Number
  },
  
  dropsCollected: [{
    itemId: ObjectId,
    nombre: String,
    rareza: String,
    timestamp: Date
  }],
  
  actionsLog: [...],
  startedAt: Date,
  lastActionAt: Date,
  completedAt: Date
}
```

**Status**: ✅ Correctamente estructurado

#### SurvivalRun ✅ (DESPUÉS DE FIX #2,#3)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref User),
  characterId: ObjectId,
  
  finalWave: Number,
  finalPoints: Number,
  totalEnemiesDefeated: Number,
  
  itemsObtained: [{itemId, rareza, obtainedAtWave}],
  
  rewards: {
    expGained: Number,
    valGained: Number,
    pointsAvailable: Number
  },
  
  equipmentUsed: {
    head: {itemId, rareza},
    body: {itemId, rareza},
    hands: {itemId, rareza},
    feet: {itemId, rareza}
  },
  
  startedAt: Date,      // ✅ AGREGADO FIX #2,#3
  completedAt: Date,
  duration: Number (ms),
  
  milestoneDetails: [...],
  scenarioSlug: String
}
```

**Status**: ✅ Ahora correcto (sin sessionId, consumablesUsed)

#### SurvivalLeaderboard ✅
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref User),
  username: String,
  characterName: String,
  totalRuns: Number,
  maxWave: Number,
  totalPoints: Number,
  topRunId: ObjectId (ref SurvivalRun),
  pointsAvailable: Number,
  rankingPosition: Number
}
```

**Status**: ✅ Correcto

---

## 🔀 COMPATIBILIDAD ENTRE SISTEMAS

### User Model - Análisis de Campos ✅

**CAMPOS COMPARTIDOS (SIN CONFLICTO)**:
```
val           ✅ Compartido (ambos usan)
evo           ✅ Compartido (ambos usan)
boletos       ✅ Compartido (ambos usan)
personajes[]  ✅ Compartido (Survival usa personajeActivoId)
```

**CAMPOS SURVIVAL (NUEVOS)**:
```
survivalPoints         ✅ Solo Survival
currentSurvivalSession ✅ Solo Survival (ref a SurvivalSession)
survivalStats          ✅ Solo Survival
```

**ANÁLISIS**: ✅ **PERFECTAMENTE COMPATIBLE**
- No hay conflictos de nombres
- Survival agrega campos nuevos sin tocar RPG
- Ambos pueden funcionar simultáneamente

---

## 📊 COBERTURA COMPLETA DE FUNCIONALIDADES

### RPG (Juego Principal)
| Sistema | Status | Endpoints |
|---------|--------|-----------|
| Auth | ✅ | 8 endpoints |
| Personajes | ✅ | 4 endpoints |
| Equipamiento | ✅ | 5 endpoints |
| Consumibles | ✅ | 3 endpoints |
| Dungeons | ✅ | 5 endpoints |
| Marketplace | ✅ | 8 endpoints |
| Compras/Pagos | ✅ | 4 endpoints |
| Rankings | ✅ | 3 endpoints |
| Chat | ✅ | 3 endpoints |
| Teams | ✅ | 6 endpoints |
| Settings | ✅ | 4 endpoints |
| **TOTAL RPG** | **✅** | **53 endpoints** |

### Survival (Juego Nuevo)
| Sistema | Status | Endpoints |
|---------|--------|-----------|
| Sesiones | ⚠️→✅ | Start (FIX #1) |
| Oleadas | ✅ | 1 endpoint |
| Consumibles | ✅ | 1 endpoint |
| Drops | ✅ | 1 endpoint |
| Finalización | ⚠️→✅ | End (FIX #2), Death (FIX #3) |
| Canje Puntos | ✅ | 3 endpoints |
| Leaderboard | ✅ | 1 endpoint |
| Estadísticas | ✅ | 1 endpoint |
| Abandono | ✅ | 1 endpoint |
| **TOTAL SURVIVAL** | **✅** | **12 endpoints** |

**SISTEMA COMPLETO: 65 endpoints ✅**

---

## 🧪 PLAN DE TESTING INTEGRAL

### Fase 1: Unit Tests (Servicios Críticos)

#### 1.1 RPG Services
```bash
# Character service
- getLevelRequirements()
- calculateStatIncrease()
- evolveCharacter()

# Marketplace service
- listItem()
- buyItem() [transacción atómica]
- cancelListing()

# Payment service
- initiateStripePurchase()
- initiateBlockchainPurchase()
- handleWebhook()
```

#### 1.2 Survival Services (POST-FIX)
```bash
# Survival service
✅ startSurvival() [FIX #1 aplicado]
✅ endSurvival() [FIX #2 aplicado]
✅ reportDeath() [FIX #3 aplicado]
- completeWave()
- useConsumable()
- pickupDrop()

# Milestones service
- applyForRun()
```

### Fase 2: E2E Tests (Flujos Completos)

#### 2.1 RPG E2E
```bash
1. Complete User Onboarding
   Register → Email Verify → Get Pioneer Package
   
2. Character Creation & Progression
   Create Char 1-5 → Select Active → Gain EXP → Level Up
   
3. Evolution Flow
   Level 40 → Stage 2 → Spend VAL/EVO → Verify stats increase
   
4. Dungeon Progression
   Dungeon 1 → Win → Gain rewards → Unlock Dungeon 2
   
5. Equipment & Consumption
   Equip items → Use consumable → Verify stat changes
   
6. Marketplace Full Flow
   List item → Buyer searches → Buy → Verify ownership transfer
   
7. Payment Integration
   Initiate Stripe → Process → Verify VAL added
```

#### 2.2 Survival E2E (POST-FIX)
```bash
1. Survival Session Start ✅
   Select character → Choose equipment → Choose consumables
   → POST /start → Verify session created
   
2. Wave Progression
   Complete wave 1 → Gain points → Enemies defeated +
   → Complete wave 2 → Verify multipliers
   
3. Item Drops & Collection
   Pickup drop type:equipment → Add to inventory
   → Pickup drop type:points → Increase totalPoints
   
4. Consumable Usage
   Use consumable → Verify usos_restantes decreases
   → Verify effect applied (heal/damage/boost)
   
5. Session Completion ✅
   Wave 10 reached → POST /end
   → Verify SurvivalRun created (sin sessionId/consumablesUsed)
   → Verify User.survivalPoints updated
   → Verify Leaderboard updated
   
6. Death Handling ✅
   Wave 5 → POST /report-death
   → Verify run saved with 0 rewards
   → Verify session marked completed
   
7. Points Exchange
   200+ survival points → Exchange for EXP
   → Verify character.experiencia increased
   → Verify survivalPoints decreased
```

### Fase 3: Integration Tests (Ambos Sistemas)

#### 3.1 Character Selection & Usage
```bash
TEST: User with 9 characters
- GET /api/user-characters
  ├─ Should return all 9
  ├─ Each should have rango, nivel, etapa
  └─ Verify personajeActivoId set correctly

- POST /api/characters/:characterId/set-active
  ├─ Switch to different character
  ├─ RPG should use new character
  └─ Survival should use new character
```

#### 3.2 Cross-System Resource Usage
```bash
TEST: VAL usage across systems
- Player starts with 1000 VAL
- RPG Evolution costs 500 VAL
  → User.val = 500 ✅
- Survival rewards 100 VAL
  → User.val = 600 ✅
- Marketplace purchase costs 200 VAL
  → User.val = 400 ✅
- Stripe purchase adds 500 VAL
  → User.val = 900 ✅
```

#### 3.3 Item Sharing
```bash
TEST: Items used in both systems
- Player has "Iron Helmet" in inventory
- Equip in RPG (slot 1)
  → Can't use in Survival (locked)
- Unequip from RPG
  → Can use in Survival ✅
- Use in Survival (complete)
  → Item stays in inventory ✅
```

---

## 🐛 CHECKLIST DE VALIDACIÓN

### Pre-Testing
- [x] Fixes aplicados (3/3)
- [x] Build exitoso
- [ ] MongoDB con datos de prueba
- [ ] JWT secret configurado
- [ ] API_PORT disponible

### Testing Execution
- [ ] Unit tests - Servicios RPG
- [ ] Unit tests - Servicios Survival
- [ ] E2E - Flujo RPG completo
- [ ] E2E - Flujo Survival completo
- [ ] Integration - Character selection (1-9)
- [ ] Integration - Resource sharing (VAL)
- [ ] Integration - Item compartidos

### Post-Testing
- [ ] Coverage > 80%
- [ ] Todos los endpoints respondent
- [ ] Leaderboards actualizados correctamente
- [ ] No race conditions en transacciones
- [ ] WebSocket real-time funciona

---

## 📋 COMANDOS DE EJECUCIÓN

### Setup & Seed
```bash
# Inicializar BD
npm run init-db

# Popular con datos
npm run seed

# Crear índices
npm run create-indexes

# Verificar GameSettings
npm run verify:game-settings
```

### Development
```bash
# Iniciar servidor
npm run dev

# En otra terminal - Tests
npm run test:unit
npm run test:e2e
npm run test:master
```

### Validation
```bash
# Compilación
npm run build

# Linting
npm run lint

# Full validation
npm run validate
```

---

## 🎯 PRÓXIMOS PASOS

### Inmediato (YA HECHO)
✅ Aplicar 3 fixes Survival  
✅ Compilación exitosa  

### Corto Plazo (Este session)
- [ ] Seed BD con usuarios + personajes
- [ ] Ejecutar unit tests
- [ ] Ejecutar E2E tests
- [ ] Validar selección de personajes (1-9)
- [ ] Validar flujo Survival completo

### Mediano Plazo
- [ ] Agregar coverage tests
- [ ] Performance testing
- [ ] Stress testing (concurrencia)
- [ ] Producción deployment

---

**Estado Actual**: ✅ Sistema dual listo para testing  
**Próximo**: Ejecutar suite de tests completa

