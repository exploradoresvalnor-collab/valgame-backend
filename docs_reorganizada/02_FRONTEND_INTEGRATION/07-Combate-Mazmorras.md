# ⚔️ Combate y Mazmorras - Guía Completa

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Selección de Mazmorras, Sistema de Combate, Recompensas, Victoria/Derrota

---

## 📋 Tabla de Contenidos

1. [Arquitectura de Combate](#arquitectura-de-combate)
2. [Selección de Mazmorras](#selección-de-mazmorras)
3. [Sistema de Combate](#sistema-de-combate)
4. [Pantalla de Combate](#pantalla-de-combate)
5. [Sistema de Recompensas](#sistema-de-recompensas)
6. [Victoria y Derrota](#victoria-y-derrota)
7. [Servicios](#servicios)
8. [Endpoints Backend](#endpoints-backend)
9. [Manejo de Errores](#manejo-de-errores)

---

## 🏗️ Arquitectura de Combate

### Estructura de Datos

```typescript
// Mazmorra disponible
interface Dungeon {
  id: string;
  nombre: string;
  descripcion: string;
  nivelRecomendado: number;
  dificultad: 'fácil' | 'normal' | 'difícil' | 'épico' | 'legendario';
  icono: string;
  background: string;
  
  // Enemigos
  enemigos: Enemy[];
  
  // Recompensas base
  recompensas: {
    exp: number;
    val: number;
    boletosChance?: number;    // % de chance de boletazo
    evoChance?: number;         // % de chance de EVO token
    itemDropRate?: number;      // % de chance de item drop
    itemsDropibles?: string[];  // IDs de items posibles
  };
  
  // Restricciones
  intentosDisponibles?: number;
  tiempoLimite?: number;              // segundos
  requisitoMinimo?: {
    nivel: number;
    experiencia: number;
  };
  
  // Metadata
  bandosDesbloqueables?: string[];    // Bandos que se desbloquean al completar
  logrosAsociados?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Enemigo en la mazmorra
interface Enemy {
  id: string;
  nombre: string;
  nivel: number;
  vida: number;
  ataque: number;
  defensa: number;
  velocidad: number;
  habilidades: Ability[];
  tesoroGuardado?: {
    tipo: 'item' | 'val' | 'boletazo' | 'evo';
    cantidad: number;
    chanceDrop: number;    // % 0-100
  };
}

// Habilidad de combate
interface Ability {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'ataque' | 'defensa' | 'curación' | 'buff' | 'debuff';
  poder: number;
  costo_energia: number;
  porcentajeCritico?: number;
  efecto?: string;
  tiempoRecuperacion?: number;  // turno
}

// Sesión de combate activa
interface CombatSession {
  id: string;
  usuarioId: string;
  characterId: string;
  dungeonId: string;
  estadoCombate: 'activo' | 'pausado' | 'finalizado' | 'victoria' | 'derrota';
  
  // Stats del personaje
  saludActual: number;
  energiaActual: number;
  
  // Stats del enemigo actual
  enemigoActual: Enemy;
  enemigoSaludActual: number;
  
  // Progreso
  turno: number;
  enemigoIndex: number;
  totalEnemigos: number;
  enemigosDerotados: number;
  
  // Recompensas recolectadas durante combate
  recompensasIntermedia: {
    exp: number;
    val: number;
    items: string[];
    boletazos: number;
    evo: number;
  };
  
  // Timestamps
  empezadoEn: Date;
  ultimaAccionEn?: Date;
  terminadoEn?: Date;
  duracionSegundos?: number;
}

// Resultado de combate (RECOMPENSAS FINALES)
interface CombatResult {
  id: string;
  characterId: string;
  dungeonId: string;
  resultado: 'victoria' | 'derrota';
  enemigosDerotados: number;
  totalEnemigos: number;
  
  // RECOMPENSAS (CRITICAL)
  recompensas: {
    expGanada: number;
    expMultiplicador: number;        // Nivel, dificultad, etc
    expTotal: number;
    
    valGanado: number;
    valMultiplicador: number;
    valTotal: number;
    
    boletazosObtuve: number;
    evoObtuve: number;
    
    itemsObtuve: {
      id: string;
      nombre: string;
      rareza: string;
      chanceDrop: number;
    }[];
    
    bonusVictoria?: {
      descripcion: string;
      valor: number;
      tipo: 'exp' | 'val' | 'item';
    };
    
    multiplicadorTiempo?: number;    // Completado rápido
  };
  
  // Estadísticas
  estadisticas: {
    turnosUtilizados: number;
    golpesAcertados: number;
    golpesRecibidos: number;
    criticosGenerados: number;
    habilidadesUsadas: string[];
    duracionSegundos: number;
  };
  
  // Timestamps
  createdAt: Date;
}
```

---

## 🏛️ Selección de Mazmorras

### 1.1 DungeonSelectComponent - TypeScript

```typescript
// dungeon-select.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DungeonService } from '../../services/dungeon.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dungeon-select',
  templateUrl: './dungeon-select.component.html',
  styleUrls: ['./dungeon-select.component.scss']
})
export class DungeonSelectComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  dungeons$!: Observable<any[]>;
  userLevel$!: Observable<number>;
  selectedDifficulty$ = new BehaviorSubject<string>('todas');

  difficultyLevels = [
    { id: 'todas', label: '📜 Todas', icon: '📜' },
    { id: 'fácil', label: '🟢 Fácil', icon: '🟢' },
    { id: 'normal', label: '🟡 Normal', icon: '🟡' },
    { id: 'difícil', label: '🔴 Difícil', icon: '🔴' },
    { id: 'épico', label: '⚫ Épico', icon: '⚫' },
    { id: 'legendario', label: '🟣 Legendario', icon: '🟣' }
  ];

  constructor(
    private dungeonService: DungeonService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDungeons();
  }

  private loadDungeons(): void {
    // Obtener nivel del usuario
    this.userLevel$ = this.authService.getCurrentUser().pipe(
      map(user => user.level)
    );

    // Obtener mazmorras
    this.dungeons$ = this.dungeonService.getAllDungeons().pipe(
      map(dungeons => {
        const difficulty = this.selectedDifficulty$.value;
        if (difficulty === 'todas') {
          return dungeons;
        }
        return dungeons.filter(d => d.dificultad === difficulty);
      })
    );

    this.loading$.next(false);
  }

  canEnterDungeon(dungeon: any, userLevel: number): boolean {
    return userLevel >= (dungeon.requisitoMinimo?.nivel || 1);
  }

  selectDungeon(dungeon: any): void {
    this.router.navigate(['/dungeon', dungeon.id]);
  }

  getDifficultyColor(dificultad: string): string {
    const colors: { [key: string]: string } = {
      'fácil': '#4ade80',
      'normal': '#fbbf24',
      'difícil': '#ef4444',
      'épico': '#8b5cf6',
      'legendario': '#ec4899'
    };
    return colors[dificultad] || '#6b7280';
  }

  getDifficultyIcon(dificultad: string): string {
    const icons: { [key: string]: string } = {
      'fácil': '🟢',
      'normal': '🟡',
      'difícil': '🔴',
      'épico': '⚫',
      'legendario': '🟣'
    };
    return icons[dificultad] || '❓';
  }

  trackByDungeonId(index: number, dungeon: any): string {
    return dungeon.id;
  }
}
```

### 1.2 DungeonSelectComponent - HTML Template

```html
<!-- dungeon-select.component.html -->
<div class="dungeon-select-container">
  
  <!-- HEADER -->
  <div class="select-header">
    <h1>🏛️ Selecciona una Mazmorra</h1>
    <p>Afronta desafíos y obtén recompensas épicas</p>
  </div>

  <!-- NIVEL DEL USUARIO -->
  <div class="user-level" *ngIf="userLevel$ | async as level">
    <p>📍 Tu nivel: <strong>{{ level }}</strong></p>
  </div>

  <!-- FILTRO DE DIFICULTAD -->
  <div class="difficulty-filter">
    <button
      *ngFor="let diff of difficultyLevels"
      class="difficulty-button"
      [class.active]="(selectedDifficulty$ | async) === diff.id"
      (click)="selectedDifficulty$.next(diff.id)"
    >
      {{ diff.icon }} {{ diff.label }}
    </button>
  </div>

  <!-- LOADING -->
  <div *ngIf="loading$ | async" class="loading-section">
    <div class="spinner"></div>
    <p>Cargando mazmorras...</p>
  </div>

  <!-- LISTA DE MAZMORRAS -->
  <div class="dungeons-grid" *ngIf="!(loading$ | async) && (dungeons$ | async) as dungeons">
    <ng-container *ngIf="dungeons.length > 0; else noDungeons">
      <div
        *ngFor="let dungeon of dungeons; trackBy: trackByDungeonId"
        class="dungeon-card"
        [style.border-color]="getDifficultyColor(dungeon.dificultad)"
        (click)="selectDungeon(dungeon)"
      >
        <!-- FONDO -->
        <div class="dungeon-background">
          <img [src]="dungeon.background" [alt]="dungeon.nombre" />
          <div class="dungeon-overlay"></div>
        </div>

        <!-- INFO -->
        <div class="dungeon-info">
          <div class="dungeon-header">
            <img [src]="dungeon.icono" [alt]="dungeon.nombre" class="dungeon-icon" />
            <h3>{{ dungeon.nombre }}</h3>
          </div>

          <p class="description">{{ dungeon.descripcion }}</p>

          <!-- METADATA -->
          <div class="dungeon-meta">
            <span class="difficulty" [style.color]="getDifficultyColor(dungeon.dificultad)">
              {{ getDifficultyIcon(dungeon.dificultad) }} {{ dungeon.dificultad | titlecase }}
            </span>
            <span class="level">📍 Nivel {{ dungeon.nivelRecomendado }}</span>
            <span class="enemies">🗡️ {{ dungeon.enemigos?.length || 0 }} Enemigos</span>
          </div>

          <!-- RECOMPENSAS PREVIEW -->
          <div class="rewards-preview">
            <span>⭐ {{ dungeon.recompensas.exp }} EXP</span>
            <span>💰 {{ dungeon.recompensas.val }} VAL</span>
            <span *ngIf="dungeon.recompensas.boletosChance">
              🎫 {{ dungeon.recompensas.boletosChance }}% Boleto
            </span>
            <span *ngIf="dungeon.recompensas.itemDropRate">
              ⚔️ {{ dungeon.recompensas.itemDropRate }}% Item
            </span>
          </div>

          <!-- BOTÓN -->
          <button 
            class="btn-primary btn-block"
            [disabled]="!(userLevel$ | async) || !canEnterDungeon(dungeon, userLevel$ | async)"
          >
            ⚔️ Entrar
          </button>
        </div>
      </div>
    </ng-container>

    <ng-template #noDungeons>
      <p class="no-dungeons">📭 No hay mazmorras disponibles</p>
    </ng-template>
  </div>

</div>
```

---

## ⚔️ Sistema de Combate

### 2.1 CombatComponent - TypeScript

```typescript
// combat.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, interval } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { DungeonService } from '../../services/dungeon.service';

interface CombatState {
  fase: 'preparacion' | 'combatiendo' | 'victoria' | 'derrota';
  turno: number;
  enemigoIndex: number;
}

@Component({
  selector: 'app-combat',
  templateUrl: './combat.component.html',
  styleUrls: ['./combat.component.scss']
})
export class CombatComponent implements OnInit, OnDestroy {
  dungeonId: string = '';
  characterId: string = '';
  
  dungeon$!: Observable<any>;
  combatSession$!: Observable<any>;
  loading$ = new BehaviorSubject<boolean>(true);

  state: CombatState = {
    fase: 'preparacion',
    turno: 0,
    enemigoIndex: 0
  };

  // Estado del personaje
  characterHealth = 100;
  characterMaxHealth = 100;
  characterEnergy = 100;
  characterMaxEnergy = 100;

  // Estado del enemigo
  enemigoHealth = 100;
  enemigoMaxHealth = 100;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dungeonService: DungeonService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.dungeonId = params['dungeonId'];
      this.characterId = params['characterId'];
      this.initiateCombat();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initiateCombat(): void {
    this.dungeon$ = this.dungeonService.getDungeonDetails(this.dungeonId);
    this.combatSession$ = this.dungeonService.startCombat(this.dungeonId, this.characterId);

    this.combatSession$.subscribe(session => {
      this.characterHealth = session.saludActual;
      this.enemigoHealth = session.enemigoActual.vida;
      this.enemigoMaxHealth = session.enemigoActual.vida;
      this.loading$.next(false);
      this.state.fase = 'combatiendo';
    });
  }

  // Acciones del combate
  usarHabilidad(habilidad: any): void {
    if (this.characterEnergy < habilidad.costo_energia) {
      alert('No tienes suficiente energía');
      return;
    }

    this.dungeonService.performAction(
      this.dungeonId,
      'habilidad',
      { habilidadId: habilidad.id }
    ).subscribe({
      next: (result) => {
        this.updateCombatState(result);
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }

  atacar(): void {
    this.dungeonService.performAction(
      this.dungeonId,
      'ataque',
      {}
    ).subscribe({
      next: (result) => {
        this.updateCombatState(result);
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }

  defenderme(): void {
    this.dungeonService.performAction(
      this.dungeonId,
      'defensa',
      {}
    ).subscribe({
      next: (result) => {
        this.updateCombatState(result);
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }

  usarConsumible(consumibleId: string): void {
    this.dungeonService.performAction(
      this.dungeonId,
      'consumible',
      { consumibleId }
    ).subscribe({
      next: (result) => {
        this.updateCombatState(result);
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }

  rendirse(): void {
    if (confirm('¿Abandonar el combate?')) {
      this.dungeonService.abandonCombat(this.dungeonId).subscribe({
        next: () => {
          this.router.navigate(['/dungeon']);
        },
        error: (error) => {
          alert('Error: ' + error.message);
        }
      });
    }
  }

  private updateCombatState(result: any): void {
    this.characterHealth = result.characterHealth;
    this.characterEnergy = result.characterEnergy;
    this.enemigoHealth = result.enemyHealth;
    this.state.turno++;

    if (result.enemyDefeated) {
      this.state.enemigoIndex++;
      if (this.state.enemigoIndex >= result.totalEnemies) {
        this.state.fase = 'victoria';
      }
    }

    if (result.characterDefeated) {
      this.state.fase = 'derrota';
    }
  }

  getHealthPercentage(current: number, max: number): number {
    return Math.round((current / max) * 100);
  }

  trackByAbilityId(index: number, ability: any): string {
    return ability.id;
  }
}
```

### 2.2 CombatComponent - HTML Template

```html
<!-- combat.component.html -->
<div class="combat-container">
  
  <!-- HEADER DE COMBATE -->
  <div class="combat-header">
    <div class="header-info">
      <h2>⚔️ En Combate</h2>
      <p class="turn">Turno {{ state.turno }}</p>
    </div>
  </div>

  <!-- ARENA DE COMBATE -->
  <div class="combat-arena">
    <!-- PERSONAJE -->
    <div class="character-side">
      <div class="character-visual">
        <img src="character-icon.png" alt="Character" />
      </div>
      <div class="character-stats">
        <p class="name">Tu Personaje</p>
        
        <!-- Vida -->
        <div class="stat-bar">
          <label>❤️ Vida</label>
          <div class="bar-container">
            <div class="bar-fill" [style.width]="getHealthPercentage(characterHealth, characterMaxHealth) + '%'"></div>
          </div>
          <span class="stat-value">{{ characterHealth }}/{{ characterMaxHealth }}</span>
        </div>

        <!-- Energía -->
        <div class="stat-bar">
          <label>⚡ Energía</label>
          <div class="bar-container">
            <div class="bar-fill energy" [style.width]="getHealthPercentage(characterEnergy, characterMaxEnergy) + '%'"></div>
          </div>
          <span class="stat-value">{{ characterEnergy }}/{{ characterMaxEnergy }}</span>
        </div>
      </div>
    </div>

    <!-- ENEMIGO -->
    <div class="enemy-side">
      <div class="enemy-visual">
        <img [src]="'enemy-icon.png'" alt="Enemy" />
      </div>
      <div class="enemy-stats">
        <p class="name">Enemigo {{ state.enemigoIndex + 1 }}</p>
        
        <!-- Vida del enemigo -->
        <div class="stat-bar">
          <label>❤️ Vida</label>
          <div class="bar-container">
            <div class="bar-fill enemy" [style.width]="getHealthPercentage(enemigoHealth, enemigoMaxHealth) + '%'"></div>
          </div>
          <span class="stat-value">{{ enemigoHealth }}/{{ enemigoMaxHealth }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ACCIONES DE COMBATE -->
  <div class="combat-actions">
    <button class="btn-action attack" (click)="atacar()">
      ⚔️ Atacar
    </button>
    <button class="btn-action defend" (click)="defenderme()">
      🛡️ Defender
    </button>
    <button class="btn-action skill" (click)="usarHabilidad(selectedAbility)">
      ✨ Habilidad
    </button>
    <button class="btn-action item" (click)="usarConsumible(selectedItem)">
      🧪 Consumible
    </button>
    <button class="btn-action flee" (click)="rendirse()">
      🏃 Huir
    </button>
  </div>

  <!-- LOG DE COMBATE -->
  <div class="combat-log">
    <div class="log-entry">Tu atacaste por 15 de daño</div>
    <div class="log-entry enemy">Enemigo te atacó por 8 de daño</div>
    <div class="log-entry critical">¡Golpe Crítico!</div>
  </div>

</div>
```

---

## 💎 Sistema de Recompensas

### Asignación de Recompensas (Backend - CRÍTICO)

```typescript
// PSEUDOCÓDIGO - BACKEND: dungeon.controller.ts

async completarMazmorra(characterId: string, dungeonId: string) {
  // 1. Validar que existe la sesión de combate y está completa
  const combatSession = await CombatSession.findOne({
    characterId,
    dungeonId,
    estadoCombate: { $in: ['victoria', 'derrota'] }
  });

  if (!combatSession) {
    throw new Error('Sesión de combate no encontrada');
  }

  // 2. Obtener plantilla de mazmorra y personaje
  const dungeon = await Dungeon.findById(dungeonId);
  const character = await Character.findById(characterId);
  const user = await User.findById(character.usuarioId);

  // 3. CALCULAR RECOMPENSAS
  const resultado = combatSession.estadoCombate === 'victoria' ? 'victoria' : 'derrota';

  let recompensas: any = {
    expGanada: 0,
    valGanado: 0,
    boletazosObtuve: 0,
    evoObtuve: 0,
    itemsObtuve: [],
    bonusVictoria: null,
    multiplicadorTiempo: 1
  };

  // SOLO SI VICTORIA
  if (resultado === 'victoria') {
    // A) EXPERIENCIA
    const expBase = dungeon.recompensas.exp;
    const multiplicadorDificultad = getMultiplicadorDificultad(dungeon.dificultad);
    const multiplicadorNivel = getMultiplicadorNivel(character.nivel, dungeon.nivelRecomendado);
    
    recompensas.expGanada = expBase;
    recompensas.expMultiplicador = multiplicadorDificultad * multiplicadorNivel;
    recompensas.expTotal = Math.floor(expBase * recompensas.expMultiplicador);

    // B) VAL
    const valBase = dungeon.recompensas.val;
    recompensas.valGanado = valBase;
    recompensas.valMultiplicador = multiplicadorDificultad;
    recompensas.valTotal = Math.floor(valBase * recompensas.valMultiplicador);

    // C) BOLETAZOS (chance)
    if (dungeon.recompensas.boletosChance) {
      const chanceBoletazo = dungeon.recompensas.boletosChance;
      if (Math.random() * 100 < chanceBoletazo) {
        recompensas.boletazosObtuve = 1;
      }
    }

    // D) EVO TOKENS (chance)
    if (dungeon.recompensas.evoChance) {
      const chanceEvo = dungeon.recompensas.evoChance;
      if (Math.random() * 100 < chanceEvo) {
        recompensas.evoObtuve = 1;
      }
    }

    // E) ITEMS (drop chance por enemigo derrotado)
    if (dungeon.recompensas.itemDropRate && dungeon.recompensas.itemsDropibles?.length > 0) {
      for (let i = 0; i < combatSession.enemigosDerotados; i++) {
        if (Math.random() * 100 < dungeon.recompensas.itemDropRate) {
          const itemAleatorio = dungeon.recompensas.itemsDropibles[
            Math.floor(Math.random() * dungeon.recompensas.itemsDropibles.length)
          ];
          recompensas.itemsObtuve.push(itemAleatorio);
        }
      }
    }

    // F) BONUS POR VELOCIDAD
    const duracionSegundos = combatSession.duracionSegundos;
    const tiempoRecomendado = dungeon.recompensas.tiempoLimite || 300; // 5 min default
    if (duracionSegundos < tiempoRecomendado * 0.8) {
      recompensas.bonusVictoria = {
        descripcion: 'Bonus por completar rápido',
        valor: Math.floor(recompensas.valTotal * 0.1),
        tipo: 'val'
      };
      recompensas.valTotal += recompensas.bonusVictoria.valor;
    }
  }

  // DERROTA: Recompensas menores
  if (resultado === 'derrota') {
    // 50% de EXP
    const expBase = dungeon.recompensas.exp;
    recompensas.expTotal = Math.floor(expBase * 0.5);
    
    // 10% de VAL
    const valBase = dungeon.recompensas.val;
    recompensas.valTotal = Math.floor(valBase * 0.1);
  }

  // 4. INICIAR TRANSACCIÓN ATÓMICA
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 5. ASIGNAR EXPERIENCIA
    if (recompensas.expTotal > 0) {
      character.experiencia += recompensas.expTotal;
      
      // Verificar si sube de nivel
      const nivelAnterior = character.nivel;
      const nuevoNivel = calcularNivel(character.experiencia);
      
      if (nuevoNivel > nivelAnterior) {
        character.nivel = nuevoNivel;
        
        // Incrementar stats por nivel
        character.saludMaxima += 10;
        character.ataque += 5;
        character.defensa += 3;
        
        // Registrar en LevelHistory
        await LevelHistory.create([{
          characterId,
          nivelAnterior,
          nivelNuevo: nuevoNivel,
          experiencia: character.experiencia,
          timestamp: new Date()
        }], { session });
      }
    }

    // 6. ASIGNAR VAL
    if (recompensas.valTotal > 0) {
      user.valBalance += recompensas.valTotal;
    }

    // 7. ASIGNAR BOLETAZOS
    if (recompensas.boletazosObtuve > 0) {
      user.boletosBalance += recompensas.boletazosObtuve;
    }

    // 8. ASIGNAR EVO TOKENS
    if (recompensas.evoObtuve > 0) {
      user.evoBalance += recompensas.evoObtuve;
    }

    // 9. ASIGNAR ITEMS
    for (const itemId of recompensas.itemsObtuve) {
      const newItem = new UserItem({
        usuarioId: user._id,
        itemId,
        procedenciaMarketplace: false,
        procedenciaDesde: 'dungeon_drop',
        obtuvoDe: dungeonId,
        compradoEn: new Date()
      });
      await newItem.save({ session });
    }

    // 10. GUARDAR CAMBIOS
    await character.save({ session });
    await user.save({ session });

    // 11. CREAR RESULTADO DE COMBATE
    const combatResult = new CombatResult({
      characterId,
      dungeonId,
      resultado,
      enemigosDerotados: combatSession.enemigosDerotados,
      totalEnemigos: combatSession.totalEnemigos,
      recompensas,
      estadisticas: combatSession.estadisticas,
      createdAt: new Date()
    });
    await combatResult.save({ session });

    // 12. REGISTRAR EN ACTIVIDAD
    await Activity.create([{
      usuarioId: user._id,
      tipo: resultado === 'victoria' ? 'dungeon_victory' : 'dungeon_defeat',
      descripcion: `${resultado === 'victoria' ? 'Completó' : 'Falló en'} ${dungeon.nombre}`,
      detalles: {
        dungeonId,
        recompensas,
        combatResultId: combatResult._id
      }
    }], { session });

    // 13. COMMIT TRANSACCIÓN
    await session.commitTransaction();

    return {
      ok: true,
      resultado,
      recompensas,
      nuevoNivel: character.nivel,
      nuevoBalance: user.valBalance,
      message: resultado === 'victoria' 
        ? `¡Victoria! Ganaste ${recompensas.expTotal} EXP y ${recompensas.valTotal} VAL`
        : `Derrota. Recibiste ${recompensas.expTotal} EXP y ${recompensas.valTotal} VAL`
    };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## 🎊 Victoria y Derrota

### 3.1 ResultComponent - TypeScript

```typescript
// result.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { DungeonService } from '../../services/dungeon.service';

@Component({
  selector: 'app-combat-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  combatResultId: string = '';
  result$!: Observable<any>;
  loading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dungeonService: DungeonService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.combatResultId = params['resultId'];
      this.loadResult();
    });
  }

  private loadResult(): void {
    this.result$ = this.dungeonService.getCombatResult(this.combatResultId);
    this.result$.subscribe(() => this.loading$.next(false));
  }

  goToDungeons(): void {
    this.router.navigate(['/dungeon']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
```

### 3.2 ResultComponent - HTML Template

```html
<!-- result.component.html -->
<div class="result-container">
  
  <div *ngIf="result$ | async as result">
    
    <!-- VICTORIA -->
    <ng-container *ngIf="result.resultado === 'victoria'">
      <div class="result-section victory">
        <div class="result-icon">🎉</div>
        <h1>¡VICTORIA!</h1>
        <p class="subtitle">Completaste la mazmorra</p>

        <!-- RECOMPENSAS -->
        <div class="rewards-display">
          <h2>📊 Recompensas Obtenidas</h2>

          <!-- EXP -->
          <div class="reward-item exp">
            <span class="icon">⭐</span>
            <div class="details">
              <p>Experiencia</p>
              <strong>{{ result.recompensas.expTotal | number }} EXP</strong>
              <span class="multiplier" *ngIf="result.recompensas.expMultiplicador > 1">
                x{{ result.recompensas.expMultiplicador.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- VAL -->
          <div class="reward-item val">
            <span class="icon">💰</span>
            <div class="details">
              <p>VAL Ganado</p>
              <strong>{{ result.recompensas.valTotal | number }} VAL</strong>
              <span class="multiplier" *ngIf="result.recompensas.valMultiplicador > 1">
                x{{ result.recompensas.valMultiplicador.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- BOLETAZOS -->
          <div class="reward-item boletos" *ngIf="result.recompensas.boletazosObtuve > 0">
            <span class="icon">🎫</span>
            <div class="details">
              <p>Boletos Obtenidos</p>
              <strong>{{ result.recompensas.boletazosObtuve }}</strong>
            </div>
          </div>

          <!-- EVO TOKENS -->
          <div class="reward-item evo" *ngIf="result.recompensas.evoObtuve > 0">
            <span class="icon">⚡</span>
            <div class="details">
              <p>EVO Tokens</p>
              <strong>{{ result.recompensas.evoObtuve }}</strong>
            </div>
          </div>

          <!-- ITEMS -->
          <div class="reward-item items" *ngIf="result.recompensas.itemsObtuve.length > 0">
            <span class="icon">⚔️</span>
            <div class="details">
              <p>Items Obtenidos</p>
              <div class="items-list">
                <span *ngFor="let item of result.recompensas.itemsObtuve" class="item-badge">
                  {{ item.nombre }}
                </span>
              </div>
            </div>
          </div>

          <!-- BONUS -->
          <div class="reward-item bonus" *ngIf="result.recompensas.bonusVictoria">
            <span class="icon">🏆</span>
            <div class="details">
              <p>{{ result.recompensas.bonusVictoria.descripcion }}</p>
              <strong>+{{ result.recompensas.bonusVictoria.valor }}</strong>
            </div>
          </div>
        </div>

        <!-- ESTADÍSTICAS -->
        <div class="statistics">
          <h3>📈 Estadísticas</h3>
          <div class="stat-row">
            <span>Turno utilizados:</span>
            <strong>{{ result.estadisticas.turnosUtilizados }}</strong>
          </div>
          <div class="stat-row">
            <span>Duración:</span>
            <strong>{{ result.estadisticas.duracionSegundos }}s</strong>
          </div>
          <div class="stat-row">
            <span>Golpes acertados:</span>
            <strong>{{ result.estadisticas.golpesAcertados }}</strong>
          </div>
          <div class="stat-row">
            <span>Críticos:</span>
            <strong>{{ result.estadisticas.criticosGenerados }}</strong>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- DERROTA -->
    <ng-container *ngIf="result.resultado === 'derrota'">
      <div class="result-section defeat">
        <div class="result-icon">💀</div>
        <h1>DERROTA</h1>
        <p class="subtitle">Tu personaje fue derrotado</p>

        <!-- RECOMPENSAS MENORES -->
        <div class="rewards-display">
          <h2>💔 Recompensa de Consolación</h2>
          <div class="reward-item">
            <span class="icon">⭐</span>
            <strong>{{ result.recompensas.expTotal | number }} EXP (50%)</strong>
          </div>
          <div class="reward-item">
            <span class="icon">💰</span>
            <strong>{{ result.recompensas.valTotal | number }} VAL (10%)</strong>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ACCIONES -->
    <div class="result-actions">
      <button class="btn-primary" (click)="goToDungeons()">
        🏛️ Volver a Mazmorras
      </button>
      <button class="btn-secondary" (click)="goToDashboard()">
        🏠 Ir al Dashboard
      </button>
    </div>

  </div>

</div>
```

---

## 🛠️ Servicios

### DungeonService Completo

```typescript
// dungeon.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DungeonService {
  private apiUrl = `${environment.apiUrl}/api/dungeons`;

  constructor(private http: HttpClient) {}

  // Obtener todas las mazmorras
  getAllDungeons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, {
      withCredentials: true
    });
  }

  // Obtener detalles de mazmorra
  getDungeonDetails(dungeonId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${dungeonId}`, {
      withCredentials: true
    });
  }

  // Iniciar combate
  startCombat(dungeonId: string, characterId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${dungeonId}/start-combat`, {
      characterId
    }, {
      withCredentials: true
    });
  }

  // Realizar acción en combate
  performAction(dungeonId: string, accion: string, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${dungeonId}/action`, {
      accion,
      ...datos
    }, {
      withCredentials: true
    });
  }

  // Abandonar combate
  abandonCombat(dungeonId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${dungeonId}/abandon`, {}, {
      withCredentials: true
    });
  }

  // Obtener resultado de combate
  getCombatResult(resultId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/results/${resultId}`, {
      withCredentials: true
    });
  }

  // Obtener historial de combates
  getCombatHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`, {
      withCredentials: true
    });
  }

  // Obtener estadísticas de mazmorras
  getDungeonStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, {
      withCredentials: true
    });
  }
}
```

---

## 📡 Endpoints Backend

### POST /api/dungeons/:dungeonId/start-combat

```
POST /api/dungeons/507f1f77bcf86cd799439040/start-combat
Authorization: Bearer <token>
Content-Type: application/json

{
  "characterId": "507f1f77bcf86cd799439012"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "combatSession": {
    "id": "combat_session_001",
    "dungeonId": "507f1f77bcf86cd799439040",
    "characterId": "507f1f77bcf86cd799439012",
    "saludActual": 150,
    "saludMaxima": 150,
    "energiaActual": 100,
    "enemigoActual": {
      "id": "enemy_001",
      "nombre": "Goblin",
      "nivel": 10,
      "vida": 45,
      "ataque": 15
    },
    "turno": 0,
    "enemigoIndex": 0
  }
}
```

### POST /api/dungeons/:dungeonId/action

```
POST /api/dungeons/507f1f77bcf86cd799439040/action
Authorization: Bearer <token>
Content-Type: application/json

{
  "accion": "ataque"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "result": {
    "damage": 25,
    "isCritical": false,
    "characterHealth": 148,
    "enemyHealth": 20,
    "characterEnergy": 85,
    "enemyDefeated": false
  }
}
```

### POST /api/dungeons/:dungeonId/complete

```
POST /api/dungeons/507f1f77bcf86cd799439040/complete
Authorization: Bearer <token>
```

**Respuesta (200) - RECOMPENSAS ASIGNADAS:**
```json
{
  "ok": true,
  "resultado": "victoria",
  "recompensas": {
    "expTotal": 1250,
    "valTotal": 850,
    "boletazosObtuve": 1,
    "evoObtuve": 0,
    "itemsObtuve": [
      {
        "id": "item_drop_001",
        "nombre": "Espada de Goblin",
        "rareza": "raro"
      }
    ],
    "bonusVictoria": null
  },
  "nuevoNivel": 16,
  "message": "¡Victoria! Ganaste 1250 EXP y 850 VAL"
}
```

---

## 📊 Manejo de Errores

| Escenario | Código | Mensaje |
|-----------|--------|---------|
| Personaje derrotado | 400 | Tu personaje está debilitado |
| Nivel insuficiente | 403 | No cumples requisitos de nivel |
| Sesión expirada | 400 | La sesión de combate expiró |
| Sin energía | 400 | No tienes suficiente energía |
| Sin autenticación | 401 | No autorizado |
| Error servidor | 500 | Error interno |

---

## 📚 Próximos Documentos

- **08-Rankings-Leaderboards.md** - Rankings y estadísticas
- **09-Servicios-Core.md** - Referencia de servicios

---

**¿Preguntas o cambios?**  
Contacta al equipo de desarrollo de Valgame.
