# 🎮 GUÍA COMPLETA: SURVIVAL - NUEVO MODO DE JUEGO

**Estado**: ✅ IMPLEMENTADO Y FUNCIONAL (v2.0)  
**Fecha**: 27 de Noviembre, 2025  
**Para**: Desarrolladores Frontend

---

## 📌 RESUMEN EJECUTIVO

**Survival** es un nuevo modo de juego en Valgame donde:
- El jugador selecciona **1 personaje** (del equipo de 1-9)
- Entra en sesiones de **oleadas (waves)** contra enemigos
- Gana **puntos** que se canjejan por EXP, VAL, Items
- Todo se **integra con RPG** (recursos compartidos)
- Hay **leaderboard global** de mejores players

### ✨ Características Principales
- ✅ Sesiones independientes (sin consumir energía del RPG)
- ✅ Equipamiento automático (usa el del personaje seleccionado)
- ✅ Oleadas progresivas con dificultad escalada
- ✅ Canje de puntos por recompensas
- ✅ Historial de sesiones
- ✅ Ranking global en tiempo real

---

## 🎯 FLUJO DE USUARIO - SURVIVAL

### PANTALLA 1: Seleccionar Personaje (COMPARTIDA CON RPG)

```
┌─────────────────────────────────────┐
│    MIS PERSONAJES (1-9 disponibles) │
├─────────────────────────────────────┤
│ ☑ [Héroe Principal]   Nivel 35      │
│ ☐ Mago Oscuro         Nivel 28      │
│ ☐ Paladín             Nivel 32      │
│ ☐ ...                               │
│                                     │
│     [JUGAR RPG] [ENTRAR SURVIVAL]   │
└─────────────────────────────────────┘
```

**Lógica**:
```typescript
// 1. GET /api/users/me
// Obtener usuario con personajes
interface User {
  personajes: Character[]; // Array de 1-50 personajes
  personajeActivoId: string; // Personaje seleccionado
}

// 2. Mostrar lista de personajes
// 3. Cuando usuario elige uno:
//    - POST /api/users/characters/:characterId/set-active
//    - user.personajeActivoId = characterId

// 4. Si hace click en "ENTRAR SURVIVAL":
//    - Validar que personaje tiene 4 items equipados
//    - Si NO → mostrar: "Equipa 4 items en RPG primero"
//    - Si SÍ → ir a PANTALLA 2
```

---

### PANTALLA 2: Pre-Sesión (PREPARAR SURVIVAL)

```
┌──────────────────────────────────────────┐
│       PREPARAR SESIÓN DE SURVIVAL        │
├──────────────────────────────────────────┤
│                                          │
│  Personaje: Héroe Principal (Nivel 35)   │
│                                          │
│  ⚔️ EQUIPAMIENTO ACTUAL (Automático)     │
│  ├─ Cabeza:    Casco de Hierro (+2 ATQ) │
│  ├─ Cuerpo:    Peto de Acero (+3 DEF)   │
│  ├─ Manos:     Guantes Reforzados        │
│  └─ Pies:      Botas de Cuero            │
│                                          │
│  💊 CONSUMIBLES (0-5, OPCIONAL)          │
│  ├─ ☑ Poción de Vida x3                 │
│  ├─ ☑ Bebida Mágica x2                  │
│  └─ ☐ (vacío)                           │
│                                          │
│        [CANCELAR]  [INICIAR SURVIVAL]   │
└──────────────────────────────────────────┘
```

**Lógica**:
```typescript
// 1. GET /api/users/me
// Leer personaje activo

const activeCharacter = user.personajes.id(user.personajeActivoId);

// 2. Validar equipamiento
if (!activeCharacter.equipamiento || activeCharacter.equipamiento.length !== 4) {
  showError("Equipa 4 items en RPG primero");
  return;
}

// 3. Mostrar equipamiento + opción de consumibles

// 4. Cuando hace click en "INICIAR SURVIVAL":
const response = await fetch('/api/survival/start', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    characterId: user.personajeActivoId
    // ✅ NO enviamos equipmentIds (se toman automáticamente)
    // ✅ NO enviamos consumableIds (opcional, por defecto vacío)
  })
});

// 5. Backend automáticamente:
//    - Lee character.equipamiento (4 items del RPG)
//    - Convierte a slots: {head, body, hands, feet}
//    - Crea SurvivalSession
//    - Devuelve sessionId
```

---

### PANTALLA 3: En Combate (GAMING)

```
┌──────────────────────────────────────────┐
│        SURVIVAL - OLEADA 3/5             │
├──────────────────────────────────────────┤
│                                          │
│  🏥 Vida: ████████░░ (85/100)            │
│  ⭐ Puntos: 450 (+25 por enemigo)        │
│                                          │
│  👹 Enemigos: 3 Goblins vivos            │
│                                          │
│            [ATACAR]  [USAR CONSUMIBLE]   │
│                                          │
│  📊 Estadísticas Oleada                  │
│  ├─ Enemigos derrotados: 7               │
│  ├─ Daño infligido: 250                  │
│  └─ Tiempo: 4:32                         │
└──────────────────────────────────────────┘
```

**Lógica**:
```typescript
// 1. POST /api/survival/:sessionId/complete-wave
const response = await fetch(`/api/survival/${sessionId}/complete-wave`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    waveNumber: 3,
    enemiesDefeated: 3,
    damageDealt: 250,
    consumablesUsed: [] // Array de IDs si se usaron
  })
});

// 2. Backend devuelve:
// - currentWave: 4
// - currentPoints: 450
// - caracterStats actualizados

// 3. Mostrar progreso + opción de continuar o abandonar
```

---

### PANTALLA 4: Finalización (RESULTADO)

#### Opción A: Completar Exitosamente

```
┌──────────────────────────────────────────┐
│        🎉 SESIÓN COMPLETADA 🎉          │
├──────────────────────────────────────────┤
│                                          │
│  Oleadas Completadas: 5/5 ✅            │
│  Puntos Totales: 1250                    │
│  Tiempo: 12:45                           │
│                                          │
│  💎 RECOMPENSAS INMEDIATAS               │
│  ├─ +250 EXP                            │
│  ├─ +150 VAL                            │
│  └─ +50 Survival Points                 │
│                                          │
│       [IR AL MENÚ]  [JUGAR OTRA]        │
└──────────────────────────────────────────┘
```

**Lógica**:
```typescript
// 1. POST /api/survival/:sessionId/end
const response = await fetch(`/api/survival/${sessionId}/end`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    finalWave: 5,
    totalEnemiesDefeated: 18,
    totalPoints: 1250,
    duration: 765 // segundos
  })
});

// 2. Backend:
//    - Crea SurvivalRun (historial)
//    - Calcula recompensas
//    - Actualiza User.survivalPoints
//    - Actualiza leaderboard
//    - Devuelve rewards

// 3. Frontend muestra recompensas y actualiza UI
```

#### Opción B: Fallar/Abandonar

```
┌──────────────────────────────────────────┐
│       ☠️ SESIÓN TERMINADA ☠️             │
├──────────────────────────────────────────┤
│                                          │
│  Oleadas Alcanzadas: 2/5                 │
│  Puntos Obtenidos: 350                   │
│  Tiempo: 4:30                            │
│                                          │
│  ❌ No hay recompensas de EXP/VAL        │
│  ✅ Los puntos se guardan (350)          │
│                                          │
│       [REINTENTAR]  [IR AL MENÚ]        │
└──────────────────────────────────────────┘
```

**Lógica**:
```typescript
// 1. POST /api/survival/:sessionId/report-death
const response = await fetch(`/api/survival/${sessionId}/report-death`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    finalWave: 2,
    totalEnemiesDefeated: 8,
    totalPoints: 350,
    duration: 270
  })
});

// 2. Backend:
//    - Crea SurvivalRun (marcada como fallida)
//    - Guarda puntos (sin recompensas)
//    - Actualiza User.survivalPoints
//    - NO agrega a leaderboard (solo sesiones exitosas)
```

---

### PANTALLA 5: Canje de Puntos

```
┌──────────────────────────────────────────┐
│     CANJE DE PUNTOS DE SURVIVAL          │
├──────────────────────────────────────────┤
│                                          │
│  Puntos Disponibles: 2,450 ⭐            │
│                                          │
│  📊 OPCIÓN 1: Ganar EXP                 │
│  Ingresa puntos (50-500):  [   100   ]   │
│  Obtendrás: +100 EXP (1:1)              │
│  [CANJEAR EXP]                          │
│                                          │
│  💰 OPCIÓN 2: Ganar VAL                 │
│  Ingresa puntos (100-1000): [  200   ]   │
│  Obtendrás: +100 VAL (0.5:1)            │
│  [CANJEAR VAL]                          │
│                                          │
│  🎁 OPCIÓN 3: Items Aleatorios          │
│  Puntos necesarios: 150 por item         │
│  Cantidad: [1] [2] [3] [4] [5]          │
│  [CANJEAR ITEMS]                        │
│                                          │
│  Puntos que usarás: 350 (total: 2450)   │
└──────────────────────────────────────────┘
```

**Lógica**:
```typescript
// 1. GET /api/survival/my-stats
// Ver puntos disponibles

// 2. POST /api/survival/exchange-points/exp
const expResponse = await fetch('/api/survival/exchange-points/exp', {
  method: 'POST',
  body: JSON.stringify({ points: 100 })
});
// Backend: 100 puntos → +100 EXP al personaje

// 3. POST /api/survival/exchange-points/val
const valResponse = await fetch('/api/survival/exchange-points/val', {
  method: 'POST',
  body: JSON.stringify({ points: 200 })
});
// Backend: 200 puntos → +100 VAL al usuario

// 4. POST /api/survival/exchange-points/items
const itemsResponse = await fetch('/api/survival/exchange-points/items', {
  method: 'POST',
  body: JSON.stringify({ quantity: 2 })
});
// Backend: 300 puntos (150 × 2) → 2 items aleatorios
```

---

### PANTALLA 6: Leaderboard

```
┌──────────────────────────────────────────┐
│      🏆 RANKING SURVIVAL GLOBAL 🏆      │
├──────────────────────────────────────────┤
│                                          │
│ 🥇 1. DarkMage (Lv45)         3,450 pts  │
│ 🥈 2. IceQueen (Lv42)         3,200 pts  │
│ 🥉 3. FireKnight (Lv40)       2,890 pts  │
│    4. Your Character (Lv35)   1,250 pts  │ ← TÚ
│    5. ThunderGod (Lv44)       2,150 pts  │
│    6. ShadowAssassin (Lv38)   2,000 pts  │
│                                          │
│  Tu Posición: #4 de 1,234 jugadores     │
│  Puntos: 1,250                          │
│  Sesiones Completadas: 5                │
│                                          │
│       [VER DETALLES]  [ATRÁS]          │
└──────────────────────────────────────────┘
```

**Lógica**:
```typescript
// GET /api/survival/leaderboard?limit=10&skip=0
const leaderboard = await fetch('/api/survival/leaderboard?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Respuesta:
interface LeaderboardEntry {
  rank: number;
  userId: string;
  characterName: string;
  characterLevel: number;
  totalPoints: number;
  maxWave: number;
  sessionsCompleted: number;
}
```

---

## 🔌 ENDPOINTS SURVIVAL - REFERENCIA COMPLETA

### 1. Iniciar Sesión

```http
POST /api/survival/start
Authorization: Bearer <token>

{
  "characterId": "643abc123def456",
  "equipmentIds": undefined,      // ✅ OPCIONAL - si no, usa del personaje
  "consumableIds": undefined      // ✅ OPCIONAL - si no, vacío
}

Response: {
  sessionId: "644def456abc789",
  userId: "643abc123",
  characterId: "643abc123def456",
  equipment: {
    head: { itemId: "item1", rareza: "común" },
    body: { itemId: "item2", rareza: "raro" },
    hands: { itemId: "item3", rareza: "común" },
    feet: { itemId: "item4", rareza: "épico" }
  },
  currentWave: 0,
  currentPoints: 0,
  status: "active"
}
```

### 2. Completar Oleada

```http
POST /api/survival/:sessionId/complete-wave
Authorization: Bearer <token>

{
  "waveNumber": 1,
  "enemiesDefeated": 5,
  "damageDealt": 250,
  "consumablesUsed": []
}

Response: {
  currentWave: 2,
  currentPoints: 250,
  sessionStatus: "active",
  message: "Wave completed successfully"
}
```

### 3. Usar Consumible

```http
POST /api/survival/:sessionId/use-consumible
Authorization: Bearer <token>

{
  "consumibleId": "item123"
}

Response: {
  message: "Consumible used successfully",
  characterHP: 95,
  consumablesRemaining: 2
}
```

### 4. Recoger Drop

```http
POST /api/survival/:sessionId/pickup-drop
Authorization: Bearer <token>

{
  "itemId": "item456",
  "itemType": "equipment",
  "itemValue": 0
}

Response: {
  message: "Item picked up",
  currentPoints: 350,
  inventory: [...]
}
```

### 5. Finalizar Exitosamente

```http
POST /api/survival/:sessionId/end
Authorization: Bearer <token>

{
  "finalWave": 5,
  "totalEnemiesDefeated": 18,
  "totalPoints": 1250,
  "duration": 765
}

Response: {
  message: "Session completed successfully",
  rewards: {
    exp: 250,
    val: 150,
    survivalPoints: 50
  },
  leaderboardUpdate: { rank: 4, totalPoints: 1250 }
}
```

### 6. Reportar Muerte

```http
POST /api/survival/:sessionId/report-death
Authorization: Bearer <token>

{
  "finalWave": 2,
  "totalEnemiesDefeated": 8,
  "totalPoints": 350,
  "duration": 270
}

Response: {
  message: "Session ended",
  rewards: { survivalPoints: 0 },
  sessionStatus: "failed"
}
```

### 7. Canjear Puntos por EXP

```http
POST /api/survival/exchange-points/exp
Authorization: Bearer <token>

{
  "points": 100
}

Response: {
  message: "Exchanged 100 points for 100 EXP",
  expGained: 100,
  pointsRemaining: 1150,
  characterLevel: 36
}
```

### 8. Canjear Puntos por VAL

```http
POST /api/survival/exchange-points/val
Authorization: Bearer <token>

{
  "points": 200
}

Response: {
  message: "Exchanged 200 points for 100 VAL",
  valGained: 100,
  pointsRemaining: 950,
  userBalance: 450
}
```

### 9. Canjear Puntos por Items

```http
POST /api/survival/exchange-points/items
Authorization: Bearer <token>

{
  "quantity": 2
}

Response: {
  message: "Exchanged 300 points for 2 items",
  itemsGained: [
    { itemId: "new_item1", nombre: "Espada de Fuego" },
    { itemId: "new_item2", nombre: "Poción Mayor" }
  ],
  pointsRemaining: 650
}
```

### 10. Ver Leaderboard

```http
GET /api/survival/leaderboard?limit=10&skip=0
Authorization: Bearer <token>

Response: [
  {
    rank: 1,
    userId: "user1",
    characterName: "DarkMage",
    characterLevel: 45,
    totalPoints: 3450,
    maxWave: 15,
    sessionsCompleted: 12
  },
  // ... más entries
]
```

### 11. Ver Mis Estadísticas

```http
GET /api/survival/my-stats
Authorization: Bearer <token>

Response: {
  totalRuns: 5,
  successfulRuns: 3,
  maxWave: 5,
  totalPoints: 1250,
  survivalPoints: 950,
  averageWave: 3.2,
  leaderboardRank: 4
}
```

### 12. Abandonar Sesión

```http
POST /api/survival/:sessionId/abandon
Authorization: Bearer <token>

Response: {
  message: "Session abandoned",
  sessionStatus: "abandoned",
  pointsSaved: 350
}
```

---

## 🎨 MODELOS TYPESCRIPT - SURVIVAL

```typescript
// ===== SESIÓN ACTIVA =====
interface SurvivalSession {
  _id?: ObjectId;
  userId: ObjectId;
  characterId: ObjectId;
  equipment: {
    head?: { itemId: ObjectId; rareza: string; bonusAtaque?: number };
    body?: { itemId: ObjectId; rareza: string; bonusDefensa?: number };
    hands?: { itemId: ObjectId; rareza: string; bonusDefensa?: number };
    feet?: { itemId: ObjectId; rareza: string; bonusVelocidad?: number };
  };
  consumables: Array<{
    itemId: ObjectId;
    nombre: string;
    usos_restantes: number;
    efecto: { tipo: 'heal' | 'buff'; valor: number };
  }>;
  currentWave: number;
  currentPoints: number;
  status: 'active' | 'completed' | 'abandoned' | 'failed';
  startedAt: Date;
  updatedAt: Date;
}

// ===== HISTORIAL DE SESIÓN =====
interface SurvivalRun {
  _id?: ObjectId;
  userId: ObjectId;
  characterId: ObjectId;
  finalWave: number;
  totalEnemiesDefeated: number;
  totalPoints: number;
  equipmentUsed: { head: ObjectId; body: ObjectId; hands: ObjectId; feet: ObjectId };
  startedAt: Date;
  completedAt: Date;
  duration: number; // en segundos
  status: 'completed' | 'failed' | 'abandoned';
  rewardsGiven: {
    exp: number;
    val: number;
    survivalPoints: number;
  };
}

// ===== RANKING GLOBAL =====
interface SurvivalLeaderboard {
  _id?: ObjectId;
  userId: ObjectId;
  characterName: string;
  characterLevel: number;
  totalPoints: number;
  maxWave: number;
  sessionsCompleted: number;
  lastUpdated: Date;
  rank?: number;
}

// ===== ESTADÍSTICAS DE USUARIO =====
interface SurvivalStats {
  userId: ObjectId;
  totalRuns: number;
  successfulRuns: number;
  maxWave: number;
  totalPoints: number;
  averageWave: number;
  lastRunDate: Date;
}
```

---

## 💾 CAMPOS NUEVOS EN USER (MongoDB)

```typescript
interface IUser {
  // ... campos RPG existentes ...
  
  // ===== SURVIVAL =====
  survivalPoints: number;              // Puntos acumulados para canje
  currentSurvivalSession?: ObjectId;   // Referencia a sesión activa (si existe)
  survivalStats: {
    totalRuns: number;
    maxWave: number;
    totalPoints: number;
    averageWave: number;
  };
}
```

---

## 🔄 FLUJO DE INTEGRACIÓN: RPG ↔ SURVIVAL

### Paso 1: Equipamiento Compartido
```
RPG:
  personaje.equipamiento = [item1, item2, item3, item4]
  
Survival:
  session.equipment = {
    head: { itemId: item1 },
    body: { itemId: item2 },
    hands: { itemId: item3 },
    feet: { itemId: item4 }
  }
  
✅ MISMO EQUIPO, diferente estructura
```

### Paso 2: Recursos Compartidos
```
Usuario = {
  val: 500,
  evo: 100,
  survivalPoints: 250
}

Flujo:
1. Juega RPG → gasta VAL en evolución → val: 450
2. Juega Survival → gana 50 puntos → survivalPoints: 300
3. Canjea puntos por VAL → val: 475, survivalPoints: 200

✅ Mismo User, múltiples fuentes de recursos
```

### Paso 3: Personaje Único
```
User.personajeActivoId = "char123"

RPG:
  POST /api/dungeon/start { characterId: "char123" }
  
Survival:
  POST /api/survival/start { characterId: "char123" }
  
✅ Un personaje, dos contextos de juego
```

---

## 📱 IMPLEMENTACIÓN EN FRONTEND

### Setup Básico

```typescript
// services/survival.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SurvivalService {
  constructor(private http: HttpClient) {}

  // 1. Iniciar sesión
  startSurvival(characterId: string): Observable<any> {
    return this.http.post('/api/survival/start', {
      characterId
      // equipmentIds se toman automáticamente del personaje
    });
  }

  // 2. Completar oleada
  completeWave(sessionId: string, data: any): Observable<any> {
    return this.http.post(`/api/survival/${sessionId}/complete-wave`, data);
  }

  // 3. Finalizar sesión
  endSurvival(sessionId: string, data: any): Observable<any> {
    return this.http.post(`/api/survival/${sessionId}/end`, data);
  }

  // 4. Ver leaderboard
  getLeaderboard(limit: number = 10): Observable<any[]> {
    return this.http.get(`/api/survival/leaderboard?limit=${limit}`);
  }

  // 5. Ver mis stats
  getMyStats(): Observable<any> {
    return this.http.get('/api/survival/my-stats');
  }

  // 6. Canjear puntos
  exchangePoints(type: 'exp' | 'val' | 'items', data: any): Observable<any> {
    return this.http.post(`/api/survival/exchange-points/${type}`, data);
  }
}
```

### Componente Principal

```typescript
// components/survival/survival.component.ts
import { Component, OnInit } from '@angular/core';
import { SurvivalService } from '../../services/survival.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-survival',
  template: `
    <div class="survival-container">
      <!-- Paso 1: Seleccionar personaje -->
      <ng-container *ngIf="!sessionStarted">
        <h2>Selecciona Personaje para Survival</h2>
        <div *ngFor="let char of characters">
          <button (click)="selectCharacter(char._id)">
            {{ char.personajeId }} (Nv {{ char.nivel }})
          </button>
        </div>
      </ng-container>

      <!-- Paso 2: En combate -->
      <ng-container *ngIf="sessionStarted && !sessionEnded">
        <h2>OLEADA {{ currentWave }}</h2>
        <p>Puntos: {{ currentPoints }}</p>
        <button (click)="completeWave()">Completar Onda</button>
        <button (click)="abandonSession()">Abandonar</button>
      </ng-container>

      <!-- Paso 3: Resultado -->
      <ng-container *ngIf="sessionEnded">
        <h2>Sesión Finalizada</h2>
        <p>Oleadas: {{ finalWave }}/5</p>
        <p>Puntos: {{ totalPoints }}</p>
        <button (click)="startNew()">Jugar Otra</button>
      </ng-container>
    </div>
  `
})
export class SurvivalComponent implements OnInit {
  characters: any[] = [];
  sessionStarted = false;
  sessionEnded = false;
  currentWave = 0;
  currentPoints = 0;
  finalWave = 0;
  totalPoints = 0;
  sessionId: string = '';

  constructor(
    private survivalService: SurvivalService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      this.characters = user.personajes;
    });
  }

  selectCharacter(characterId: string) {
    this.survivalService.startSurvival(characterId).subscribe(
      (session) => {
        this.sessionId = session.sessionId;
        this.sessionStarted = true;
        this.currentWave = 0;
        this.currentPoints = 0;
      },
      (error) => {
        alert('Error: ' + error.error.error);
      }
    );
  }

  completeWave() {
    this.currentWave++;
    this.currentPoints += 250; // Ejemplo
    
    if (this.currentWave >= 5) {
      this.finalizeSurvival('success');
    }
  }

  finalizeSurvival(status: 'success' | 'failed') {
    const data = {
      finalWave: this.currentWave,
      totalEnemiesDefeated: this.currentWave * 3,
      totalPoints: this.currentPoints,
      duration: 600
    };

    const endpoint = status === 'success' 
      ? 'end' 
      : 'report-death';

    this.survivalService.endSurvival(this.sessionId, data).subscribe(
      (result) => {
        this.sessionEnded = true;
        this.finalWave = this.currentWave;
        this.totalPoints = this.currentPoints;
      }
    );
  }

  abandonSession() {
    this.finalizeSurvival('failed');
  }

  startNew() {
    this.sessionStarted = false;
    this.sessionEnded = false;
    this.currentWave = 0;
    this.currentPoints = 0;
  }
}
```

---

## ✅ CHECKLIST IMPLEMENTACIÓN

### BACKEND (YA HECHO ✅)
- [x] Modelos MongoDB (Session, Run, Leaderboard, Stats)
- [x] Service SurvivalService (12 métodos)
- [x] Routes (12 endpoints)
- [x] Validaciones Zod
- [x] Equipamiento automático
- [x] Canje de puntos
- [x] Leaderboard

### FRONTEND (NECESITAS HACER)
- [ ] Componente de selección de personaje
- [ ] Componente de preparación de sesión
- [ ] Componente de combate (UI)
- [ ] Componente de resultados
- [ ] Componente de canje de puntos
- [ ] Componente de leaderboard
- [ ] Servicio SurvivalService
- [ ] Integración con autenticación
- [ ] Guardado de progreso en localStorage
- [ ] Animaciones/efectos visuales

---

## 🐛 TROUBLESHOOTING

### Error: "Character must have exactly 4 equipped items"
```
Causa: El personaje no tiene 4 items equipados en RPG
Solución: Ve a RPG → Inventario → Equipa 4 items (cabeza, cuerpo, manos, pies)
```

### Error: "Session not found"
```
Causa: La sesión expiró o el ID es incorrecto
Solución: Inicia una sesión nueva con POST /api/survival/start
```

### No puedo canjear puntos
```
Causa: Puntos insuficientes o cantidad inválida
Verificar: GET /api/survival/my-stats → survivalPoints
Requerimientos:
  - EXP: Mínimo 50 puntos
  - VAL: Mínimo 100 puntos
  - Items: Mínimo 150 puntos por item
```

---

## 📚 REFERENCIAS

- **API Completa**: `/FRONTEND_STARTER_KIT/00_BACKEND_API_REFERENCE.md`
- **Autenticación**: `/FRONTEND_STARTER_KIT/15_GUIA_COMPLETA_AUTENTICACION_SESIONES.md`
- **Equipamiento RPG**: `/FRONTEND_STARTER_KIT/16_GUIA_EQUIPAMIENTO_PERSONAJES.md`
- **Análisis Técnico**: `/ANALISIS_EQUIPAMIENTO_RPG_VS_SURVIVAL.md`
- **Estado Final**: `/ESTADO_FINAL_PROYECTO.md`

---

**ÚLTIMA ACTUALIZACIÓN**: 27 de Noviembre, 2025  
**ESTADO**: ✅ Listo para implementación en Frontend
