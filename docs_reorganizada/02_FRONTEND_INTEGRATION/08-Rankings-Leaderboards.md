# 🏆 Rankings y Leaderboards - Guía Completa

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Leaderboards globales, Rankings por categoría, Temporadas, Recompensas de temporada

---

## 📋 Tabla de Contenidos

1. [Arquitectura de Rankings](#arquitectura-de-rankings)
2. [Leaderboards Globales](#leaderboards-globales)
3. [Rankings por Categoría](#rankings-por-categoría)
4. [Sistema de Temporadas](#sistema-de-temporadas)
5. [Recompensas de Temporada](#recompensas-de-temporada)
6. [Servicios](#servicios)
7. [Endpoints Backend](#endpoints-backend)
8. [Manejo de Errores](#manejo-de-errores)

---

## 🏗️ Arquitectura de Rankings

### Estructura de Datos

```typescript
// Leaderboard global
interface LeaderboardEntry {
  id: string;
  usuarioId: string;
  personajeId: string;
  username: string;
  avatar: string;
  
  // Ranking actual
  posicion: number;
  puntosRanking: number;
  
  // Estadísticas
  nivel: number;
  experiencia: number;
  victoriasCombate: number;
  derrotasCombate: number;
  winrate: number;             // Porcentaje
  
  // Riqueza
  valBalance: number;
  boletosBalance: number;
  evoBalance: number;
  
  // Marketplace
  itemsVendidos: number;
  montoTotalVendido: number;
  
  // Timestamps
  ultimaActualizacion: Date;
  estadoCombate: 'en_combate' | 'disponible' | 'offline';
}

// Categoría de ranking
interface RankingCategory {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  criterio: 'nivel' | 'victorias' | 'winrate' | 'riqueza' | 'actividad' | 'marketplace';
  orden: 'asc' | 'desc';
  
  // Top de temporada
  topDezactual: LeaderboardEntry[];
  topDezAnterior?: LeaderboardEntry[];
  
  // Metadata
  actualizadoEn: Date;
}

// Temporada
interface GameSeason {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
  icono: string;
  
  // Período
  fechaInicio: Date;
  fechaFin: Date;
  duracionDias: number;
  
  // Estado
  estado: 'proxima' | 'activa' | 'finalizada' | 'pausada';
  diasRestantes?: number;
  
  // Recompensas por rango
  recompensasPorRango: {
    rango: number;                    // 1-10, 11-50, etc
    nombre: string;                   // "Top 10", "11-50", etc
    val: number;
    boletazos: number;
    items: string[];
    logros: string[];
  }[];
  
  // Metadata
  restricciones?: {
    nivelMinimo?: number;
    experienciaMinima?: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Resultado de temporada (Snapshot)
interface SeasonResult {
  id: string;
  seasonId: string;
  posicion: number;
  usuarioId: string;
  personajeId: string;
  username: string;
  
  // Estadísticas finales
  puntosRanking: number;
  nivel: number;
  victorias: number;
  derrotas: number;
  
  // Recompensas asignadas
  recompensas: {
    val: number;
    boletazos: number;
    items: string[];
    logros: string[];
  };
  
  // Timestamps
  createdAt: Date;
  asignadoEn?: Date;
}

// Progreso de usuario en temporada
interface UserSeasonProgress {
  id: string;
  usuarioId: string;
  seasonId: string;
  
  // Puntos acumulados
  puntosRanking: number;
  nivelAlcanzado: number;
  
  // Hitos logrados
  milestones: {
    tipo: 'victoria_10' | 'nivel_30' | 'riqueza_1000' | 'marketplace_100';
    completadoEn: Date;
    recompensas?: any;
  }[];
  
  // Actividad
  ultimoGolpeEn: Date;
  streakVictorias: number;
  streakVictoriasMaximo: number;
  
  // Datos generales
  rango?: 'bronce' | 'plata' | 'oro' | 'platino' | 'diamante' | 'leyenda';
}
```

---

## 📊 Leaderboards Globales

### 1.1 LeaderboardComponent - TypeScript

```typescript
// leaderboard.component.ts
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RankingService } from '../../services/ranking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  
  // Categorías disponibles
  categories$ = new BehaviorSubject<any[]>([
    { id: 'nivel', label: '📈 Por Nivel', icon: '📈' },
    { id: 'victorias', label: '⚔️ Más Victorias', icon: '⚔️' },
    { id: 'winrate', label: '🎯 Mejor Winrate', icon: '🎯' },
    { id: 'riqueza', label: '💰 Más Ricos', icon: '💰' },
    { id: 'actividad', label: '🔥 Más Activos', icon: '🔥' },
    { id: 'marketplace', label: '🛍️ Mercader@s', icon: '🛍️' }
  ]);

  selectedCategory$ = new BehaviorSubject<string>('nivel');
  currentUser$!: Observable<any>;
  leaderboard$!: Observable<any[]>;
  userPosition$!: Observable<any>;
  
  pageSize = 50;
  currentPage$ = new BehaviorSubject<number>(1);

  constructor(
    private rankingService: RankingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.getCurrentUser();

    // Cargar leaderboard basado en categoría seleccionada
    this.leaderboard$ = combineLatest([
      this.selectedCategory$,
      this.currentPage$
    ]).pipe(
      map(([category, page]) => ({
        category,
        page: page - 1
      })),
      map(params => this.rankingService.getLeaderboard(
        params.category,
        params.page * this.pageSize,
        this.pageSize
      )),
      startWith([])
    );

    // Obtener posición del usuario
    this.userPosition$ = this.currentUser$.pipe(
      map(user => this.rankingService.getUserRankingPosition(user._id))
    );

    this.loading$.next(false);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory$.next(categoryId);
    this.currentPage$.next(1);
  }

  nextPage(): void {
    this.currentPage$.next(this.currentPage$.value + 1);
  }

  previousPage(): void {
    if (this.currentPage$.value > 1) {
      this.currentPage$.next(this.currentPage$.value - 1);
    }
  }

  getRankColor(posicion: number): string {
    if (posicion === 1) return '#fbbf24';      // Oro
    if (posicion === 2) return '#a8a29e';      // Plata
    if (posicion === 3) return '#f59e0b';      // Bronce
    return '#6b7280';                          // Gris
  }

  getRankMedal(posicion: number): string {
    if (posicion === 1) return '🥇';
    if (posicion === 2) return '🥈';
    if (posicion === 3) return '🥉';
    return '📍';
  }

  trackByUserId(index: number, entry: any): string {
    return entry.usuarioId;
  }
}
```

### 1.2 LeaderboardComponent - HTML Template

```html
<!-- leaderboard.component.html -->
<div class="leaderboard-container">
  
  <!-- HEADER -->
  <div class="leaderboard-header">
    <h1>🏆 Rankings Globales</h1>
    <p>Demuestra tu dominio en Valgame</p>
  </div>

  <!-- SELECTOR DE CATEGORÍA -->
  <div class="category-selector">
    <button
      *ngFor="let category of (categories$ | async)"
      class="category-button"
      [class.active]="(selectedCategory$ | async) === category.id"
      (click)="selectCategory(category.id)"
    >
      {{ category.icon }} {{ category.label }}
    </button>
  </div>

  <!-- POSICIÓN DEL USUARIO -->
  <div class="user-position-card" *ngIf="userPosition$ | async as position">
    <div class="position-info">
      <span class="medal">{{ getRankMedal(position.posicion) }}</span>
      <div class="details">
        <p class="label">Tu Posición</p>
        <p class="position">#{{ position.posicion }}</p>
      </div>
      <div class="stats">
        <span class="stat">📊 {{ position.puntosRanking }} pts</span>
      </div>
    </div>
  </div>

  <!-- LEADERBOARD TABLA -->
  <div class="leaderboard-table">
    <div class="table-header">
      <div class="col-position">Posición</div>
      <div class="col-player">Jugador</div>
      <div class="col-level">Nivel</div>
      <div class="col-stats">Estadísticas</div>
      <div class="col-score">Puntos</div>
    </div>

    <!-- LOADING -->
    <div *ngIf="loading$ | async" class="loading-section">
      <div class="spinner"></div>
      <p>Cargando rankings...</p>
    </div>

    <!-- ENTRADAS -->
    <ng-container *ngIf="!(loading$ | async) && (leaderboard$ | async) as entries">
      <ng-container *ngIf="entries.length > 0; else noEntries">
        <div
          *ngFor="let entry of entries; trackBy: trackByUserId"
          class="table-row"
          [class.top-3]="entry.posicion <= 3"
        >
          <!-- POSICIÓN -->
          <div class="col-position">
            <span class="medal">{{ getRankMedal(entry.posicion) }}</span>
            <span class="rank">#{{ entry.posicion }}</span>
          </div>

          <!-- JUGADOR -->
          <div class="col-player">
            <img [src]="entry.avatar" [alt]="entry.username" class="avatar" />
            <span class="username">{{ entry.username }}</span>
          </div>

          <!-- NIVEL -->
          <div class="col-level">
            <span class="level-badge">{{ entry.nivel }}</span>
          </div>

          <!-- ESTADÍSTICAS -->
          <div class="col-stats">
            <span class="stat">{{ entry.victoriasCombate }}W</span>
            <span class="stat">{{ entry.derrotasCombate }}L</span>
            <span class="stat winrate">{{ entry.winrate.toFixed(1) }}%</span>
          </div>

          <!-- PUNTOS -->
          <div class="col-score">
            <strong>{{ entry.puntosRanking | number }}</strong>
          </div>
        </div>
      </ng-container>

      <ng-template #noEntries>
        <p class="no-entries">📭 No hay entradas en este ranking</p>
      </ng-template>
    </ng-container>
  </div>

  <!-- PAGINACIÓN -->
  <div class="pagination">
    <button 
      class="btn-nav"
      (click)="previousPage()"
      [disabled]="(currentPage$ | async) === 1"
    >
      ← Anterior
    </button>
    <span class="page-info">Página {{ currentPage$ | async }}</span>
    <button class="btn-nav" (click)="nextPage()">
      Siguiente →
    </button>
  </div>

</div>
```

---

## 🎯 Rankings por Categoría

### 2.1 CategoryDetailComponent - TypeScript

```typescript
// category-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RankingService } from '../../services/ranking.service';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit {
  categoryId: string = '';
  category$!: Observable<any>;
  topEntries$!: Observable<any[]>;
  loading$ = new BehaviorSubject<boolean>(true);

  categoryInfo: { [key: string]: any } = {
    'nivel': {
      title: '📈 Rankings por Nivel',
      description: 'Los personajes con mayor nivel',
      criteria: 'Experiencia acumulada'
    },
    'victorias': {
      title: '⚔️ Más Victorias',
      description: 'Los guerreros más victoriosos',
      criteria: 'Batallas ganadas'
    },
    'winrate': {
      title: '🎯 Mejor Winrate',
      description: 'Los combatientes más consistentes',
      criteria: 'Porcentaje de victorias (min 10 combates)'
    },
    'riqueza': {
      title: '💰 Más Ricos',
      description: 'Los jugadores más acaudalados',
      criteria: 'VAL + Boletazos + Items'
    },
    'actividad': {
      title: '🔥 Más Activos',
      description: 'Los exploradores más dedicados',
      criteria: 'Combates en últimos 7 días'
    },
    'marketplace': {
      title: '🛍️ Mercaderes Destacados',
      description: 'Los traders más exitosos',
      criteria: 'Moneda total vendida'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rankingService: RankingService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = params['categoryId'];
      this.loadCategoryDetails();
    });
  }

  private loadCategoryDetails(): void {
    this.category$ = this.rankingService.getCategoryDetails(this.categoryId);
    this.topEntries$ = this.rankingService.getTopEntries(this.categoryId, 100).pipe(
      map(entries => entries.slice(0, 100)),
      map(() => this.loading$.next(false), () => this.loading$.next(false))
    );
  }

  getCategoryInfo(categoryId: string): any {
    return this.categoryInfo[categoryId] || {
      title: 'Ranking',
      description: 'Categoría de ranking',
      criteria: 'Criterio desconocido'
    };
  }

  goBack(): void {
    this.router.navigate(['/rankings']);
  }

  trackByUserId(index: number, entry: any): string {
    return entry.usuarioId;
  }
}
```

### 2.2 CategoryDetailComponent - HTML Template

```html
<!-- category-detail.component.html -->
<div class="category-detail-container">
  
  <!-- HEADER -->
  <button class="btn-back" (click)="goBack()">← Volver</button>
  
  <div class="category-header">
    <h1>{{ (categoryInfo[categoryId]?.title) }}</h1>
    <p class="description">{{ categoryInfo[categoryId]?.description }}</p>
    <p class="criteria">📊 {{ categoryInfo[categoryId]?.criteria }}</p>
  </div>

  <!-- LOADING -->
  <div *ngIf="loading$ | async" class="loading-section">
    <div class="spinner"></div>
    <p>Cargando ranking...</p>
  </div>

  <!-- TOP 100 -->
  <div class="top-entries" *ngIf="!(loading$ | async) && (topEntries$ | async) as entries">
    <ng-container *ngIf="entries.length > 0; else noEntries">
      <div *ngFor="let entry of entries; let i = index" class="entry-card" [class.medal]="i < 3">
        <div class="entry-rank">
          <span *ngIf="i === 0" class="medal">🥇</span>
          <span *ngIf="i === 1" class="medal">🥈</span>
          <span *ngIf="i === 2" class="medal">🥉</span>
          <span *ngIf="i > 2" class="rank">#{{ i + 1 }}</span>
        </div>

        <div class="entry-info">
          <img [src]="entry.avatar" [alt]="entry.username" class="avatar" />
          <div>
            <p class="username">{{ entry.username }}</p>
            <p class="level">Nivel {{ entry.nivel }}</p>
          </div>
        </div>

        <div class="entry-value">
          <strong>{{ entry.puntosRanking | number }}</strong>
        </div>
      </div>
    </ng-container>

    <ng-template #noEntries>
      <p class="no-entries">📭 No hay entradas</p>
    </ng-template>
  </div>

</div>
```

---

## 🗓️ Sistema de Temporadas

### 3.1 SeasonComponent - TypeScript

```typescript
// season.component.ts
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SeasonService } from '../../services/season.service';

@Component({
  selector: 'app-season',
  templateUrl: './season.component.html',
  styleUrls: ['./season.component.scss']
})
export class SeasonComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  
  currentSeason$!: Observable<any>;
  nextSeason$!: Observable<any>;
  seasonHistory$!: Observable<any[]>;
  
  timeRemaining$!: Observable<string>;

  constructor(private seasonService: SeasonService) {}

  ngOnInit(): void {
    this.currentSeason$ = this.seasonService.getCurrentSeason();
    this.nextSeason$ = this.seasonService.getNextSeason();
    this.seasonHistory$ = this.seasonService.getSeasonHistory(5);

    // Actualizar tiempo restante cada segundo
    this.timeRemaining$ = interval(1000).pipe(
      startWith(0),
      map(() => this.calculateTimeRemaining())
    );

    this.loading$.next(false);
  }

  private calculateTimeRemaining(): string {
    // Obtener fecha de fin de temporada actual
    // Calcular diferencia
    // Retornar formato "X días, Y horas, Z minutos"
    return 'Calculando...';
  }

  getSeasonStatus(estado: string): string {
    const statuses: { [key: string]: string } = {
      'proxima': '⏳ Próxima',
      'activa': '🟢 Activa',
      'finalizada': '✅ Finalizada',
      'pausada': '⏸️ Pausada'
    };
    return statuses[estado] || estado;
  }
}
```

### 3.2 SeasonComponent - HTML Template

```html
<!-- season.component.html -->
<div class="season-container">
  
  <!-- TEMPORADA ACTUAL -->
  <div class="season-card current" *ngIf="currentSeason$ | async as season">
    <div class="season-badge">{{ getSeasonStatus(season.estado) }}</div>
    
    <div class="season-info">
      <img [src]="season.icono" [alt]="season.nombre" class="season-icon" />
      <h2>{{ season.nombre }}</h2>
      <p class="description">{{ season.descripcion }}</p>
    </div>

    <!-- TIEMPO RESTANTE -->
    <div class="time-remaining">
      <p class="label">⏱️ Tiempo Restante</p>
      <p class="value">{{ timeRemaining$ | async }}</p>
    </div>

    <!-- INFORMACIÓN -->
    <div class="season-details">
      <div class="detail-item">
        <span class="label">Número de Temporada</span>
        <span class="value">{{ season.numero }}</span>
      </div>
      <div class="detail-item">
        <span class="label">Inicio</span>
        <span class="value">{{ season.fechaInicio | date: 'dd/MM/yyyy' }}</span>
      </div>
      <div class="detail-item">
        <span class="label">Final</span>
        <span class="value">{{ season.fechaFin | date: 'dd/MM/yyyy' }}</span>
      </div>
      <div class="detail-item">
        <span class="label">Duración</span>
        <span class="value">{{ season.duracionDias }} días</span>
      </div>
    </div>

    <!-- BOTÓN -->
    <button class="btn-primary btn-block">
      🏆 Ver Ranking de Temporada
    </button>
  </div>

  <!-- PRÓXIMA TEMPORADA -->
  <div class="season-card next" *ngIf="nextSeason$ | async as season">
    <div class="season-badge">{{ getSeasonStatus(season.estado) }}</div>
    
    <div class="season-info">
      <img [src]="season.icono" [alt]="season.nombre" class="season-icon" />
      <h3>Próxima: {{ season.nombre }}</h3>
      <p class="description">{{ season.descripcion }}</p>
    </div>

    <!-- INICIO -->
    <div class="start-info">
      <p class="label">📅 Comienza el</p>
      <p class="value">{{ season.fechaInicio | date: 'dd/MM/yyyy HH:mm' }}</p>
    </div>
  </div>

  <!-- HISTORIAL DE TEMPORADAS -->
  <div class="season-history">
    <h3>📜 Historial de Temporadas</h3>
    
    <div class="history-list">
      <div *ngFor="let season of (seasonHistory$ | async)" class="history-item">
        <img [src]="season.icono" [alt]="season.nombre" class="icon" />
        <div class="info">
          <p class="name">Temporada {{ season.numero }}: {{ season.nombre }}</p>
          <p class="dates">{{ season.fechaInicio | date: 'dd/MM' }} - {{ season.fechaFin | date: 'dd/MM/yyyy' }}</p>
        </div>
        <button class="btn-small">Ver Resultados</button>
      </div>
    </div>
  </div>

</div>
```

---

## 🎁 Recompensas de Temporada

### Asignación de Recompensas (Backend - CRÍTICO)

```typescript
// PSEUDOCÓDIGO - BACKEND: season.controller.ts

async distribuirRecompensasTemporada(seasonId: string) {
  // 1. Validar que la temporada está finalizada
  const season = await GameSeason.findById(seasonId);
  
  if (season.estado !== 'finalizada') {
    throw new Error('La temporada no ha finalizado');
  }

  // 2. Obtener TOP 1000 jugadores
  const topPlayers = await LeaderboardEntry.find({
    // Filtrar por temporada activa durante season.fechaInicio - season.fechaFin
  }).sort({ puntosRanking: -1 }).limit(1000);

  if (topPlayers.length === 0) {
    throw new Error('No hay jugadores para recompensar');
  }

  // 3. INICIAR TRANSACCIÓN ATÓMICA
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const recompensasAsignadas: any[] = [];

    // 4. ITERAR SOBRE CADA POSICIÓN
    for (let i = 0; i < topPlayers.length; i++) {
      const position = i + 1;
      const player = topPlayers[i];

      // 5. DETERMINAR RANGO DE RECOMPENSA
      const recompensaConfig = determinarRecompensasPorRango(position, season);

      // 6. OBTENER USUARIO
      const user = await User.findById(player.usuarioId);
      
      if (!user) {
        console.warn(`Usuario no encontrado: ${player.usuarioId}`);
        continue;
      }

      // 7. ASIGNAR VAL
      if (recompensaConfig.val > 0) {
        user.valBalance += recompensaConfig.val;
      }

      // 8. ASIGNAR BOLETAZOS
      if (recompensaConfig.boletazos > 0) {
        user.boletosBalance += recompensaConfig.boletazos;
      }

      // 9. ASIGNAR ITEMS
      if (recompensaConfig.items && recompensaConfig.items.length > 0) {
        for (const itemId of recompensaConfig.items) {
          const newItem = new UserItem({
            usuarioId: user._id,
            itemId,
            procedenciaDesde: 'season_reward',
            obtuvoDe: seasonId,
            compradoEn: new Date()
          });
          await newItem.save({ session });
        }
      }

      // 10. ASIGNAR LOGROS
      if (recompensaConfig.logros && recompensaConfig.logros.length > 0) {
        for (const logro of recompensaConfig.logros) {
          if (!user.logrosObtenidos) {
            user.logrosObtenidos = [];
          }
          user.logrosObtenidos.push({
            id: logro,
            obtuvoDe: 'season_reward',
            obtuvoPor: seasonId,
            obtuvoen: new Date()
          });
        }
      }

      // 11. GUARDAR USUARIO
      await user.save({ session });

      // 12. CREAR REGISTRO ATOMICO
      const seasonResult = new SeasonResult({
        seasonId,
        posicion: position,
        usuarioId: player.usuarioId,
        personajeId: player.personajeId,
        username: player.username,
        puntosRanking: player.puntosRanking,
        nivel: player.nivel,
        victorias: player.victoriasCombate,
        derrotas: player.derrotasCombate,
        recompensas: recompensaConfig,
        createdAt: new Date(),
        asignadoEn: new Date()
      });
      await seasonResult.save({ session });

      // 13. CREAR ACTIVIDAD
      await Activity.create([{
        usuarioId: user._id,
        tipo: 'season_reward',
        descripcion: `Recompensas de temporada ${season.numero} - Posición #${position}`,
        detalles: {
          seasonId,
          posicion: position,
          recompensas: recompensaConfig
        }
      }], { session });

      recompensasAsignadas.push({
        usuarioId: player.usuarioId,
        posicion,
        recompensas: recompensaConfig
      });
    }

    // 14. ACTUALIZAR ESTADO DE TEMPORADA
    season.estado = 'finalizada';
    season.recompensasDistribuidas = true;
    season.fechaDistribucion = new Date();
    await season.save({ session });

    // 15. COMMIT TRANSACCIÓN
    await session.commitTransaction();

    return {
      ok: true,
      seasonId,
      totalRecompensadas: recompensasAsignadas.length,
      recompensasAsignadas,
      message: `Se distribuyeron recompensas a ${recompensasAsignadas.length} jugadores`
    };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// Función auxiliar para determinar recompensas
function determinarRecompensasPorRango(posicion: number, season: GameSeason): any {
  // Top 10: Máximo
  if (posicion <= 10) {
    return {
      val: 10000,
      boletazos: 50,
      items: ['season_trophy_gold', 'legendary_item_001'],
      logros: ['top_10_season']
    };
  }
  
  // Top 50
  if (posicion <= 50) {
    return {
      val: 5000,
      boletazos: 25,
      items: ['season_trophy_silver', 'rare_item_001'],
      logros: ['top_50_season']
    };
  }
  
  // Top 100
  if (posicion <= 100) {
    return {
      val: 2500,
      boletazos: 10,
      items: ['season_trophy_bronze'],
      logros: ['top_100_season']
    };
  }
  
  // Top 500
  if (posicion <= 500) {
    return {
      val: 1000,
      boletazos: 5,
      items: [],
      logros: ['top_500_season']
    };
  }
  
  // Top 1000
  return {
    val: 500,
    boletazos: 2,
    items: [],
    logros: ['participated_season']
  };
}
```

---

## 🛠️ Servicios

### RankingService Completo

```typescript
// ranking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private apiUrl = `${environment.apiUrl}/api/rankings`;

  constructor(private http: HttpClient) {}

  // Obtener leaderboard completo
  getLeaderboard(categoryId: string, offset: number = 0, limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/leaderboard/${categoryId}?offset=${offset}&limit=${limit}`,
      { withCredentials: true }
    );
  }

  // Obtener posición del usuario
  getUserRankingPosition(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-position/${userId}`, {
      withCredentials: true
    });
  }

  // Obtener detalles de categoría
  getCategoryDetails(categoryId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/category/${categoryId}`, {
      withCredentials: true
    });
  }

  // Obtener top entradas de categoría
  getTopEntries(categoryId: string, limit: number = 100): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/category/${categoryId}/top?limit=${limit}`,
      { withCredentials: true }
    );
  }

  // Obtener estadísticas del jugador
  getPlayerStats(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/${userId}`, {
      withCredentials: true
    });
  }

  // Obtener historial de combates
  getCombatHistory(userId: string, limit: number = 20): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/history/${userId}?limit=${limit}`,
      { withCredentials: true }
    );
  }
}

### SeasonService Completo

export class SeasonService {
  private apiUrl = `${environment.apiUrl}/api/seasons`;

  constructor(private http: HttpClient) {}

  // Obtener temporada actual
  getCurrentSeason(): Observable<any> {
    return this.http.get(`${this.apiUrl}/current`, {
      withCredentials: true
    });
  }

  // Obtener próxima temporada
  getNextSeason(): Observable<any> {
    return this.http.get(`${this.apiUrl}/next`, {
      withCredentials: true
    });
  }

  // Obtener historial de temporadas
  getSeasonHistory(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/history?limit=${limit}`,
      { withCredentials: true }
    );
  }

  // Obtener ranking de temporada
  getSeasonRanking(seasonId: string, limit: number = 100): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/${seasonId}/ranking?limit=${limit}`,
      { withCredentials: true }
    );
  }

  // Obtener recompensas de temporada para usuario
  getUserSeasonRewards(seasonId: string, userId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${seasonId}/rewards/${userId}`,
      { withCredentials: true }
    );
  }

  // Obtener progreso en temporada actual
  getCurrentSeasonProgress(): Observable<any> {
    return this.http.get(`${this.apiUrl}/progress/current`, {
      withCredentials: true
    });
  }
}
```

---

## 📡 Endpoints Backend

### GET /api/rankings/leaderboard/:categoryId

```
GET /api/rankings/leaderboard/nivel?offset=0&limit=50
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "leaderboard": [
    {
      "posicion": 1,
      "usuarioId": "507f1f77bcf86cd799439010",
      "username": "CombatanteMaestro",
      "avatar": "https://...",
      "nivel": 100,
      "experiencia": 500000,
      "victoriasCombate": 250,
      "derrotasCombate": 15,
      "winrate": 94.3,
      "puntosRanking": 2500,
      "ultimaActualizacion": "2025-11-24T10:30:00Z"
    }
  ]
}
```

### GET /api/seasons/current

```
GET /api/seasons/current
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "season": {
    "id": "season_001",
    "numero": 5,
    "nombre": "Temporada del Invierno",
    "descripcion": "La temporada más desafiante del año",
    "estado": "activa",
    "fechaInicio": "2025-11-01T00:00:00Z",
    "fechaFin": "2025-12-01T00:00:00Z",
    "duracionDias": 30,
    "diasRestantes": 7,
    "recompensasPorRango": [
      {
        "rango": "1-10",
        "nombre": "Top 10",
        "val": 10000,
        "boletazos": 50,
        "items": ["trophy_gold"]
      }
    ]
  }
}
```

### POST /api/seasons/:seasonId/distribute-rewards

```
POST /api/seasons/season_001/distribute-rewards
Authorization: Bearer <token>
Content-Type: application/json

{}
```

**Respuesta (200) - RECOMPENSAS DISTRIBUIDAS:**
```json
{
  "ok": true,
  "seasonId": "season_001",
  "totalRecompensadas": 250,
  "recompensasAsignadas": [
    {
      "usuarioId": "507f1f77bcf86cd799439010",
      "posicion": 1,
      "recompensas": {
        "val": 10000,
        "boletazos": 50,
        "items": ["trophy_gold", "legendary_item"],
        "logros": ["top_10_season"]
      }
    }
  ],
  "message": "Se distribuyeron recompensas a 250 jugadores"
}
```

---

## 📊 Manejo de Errores

| Escenario | Código | Mensaje |
|-----------|--------|---------|
| Categoría inválida | 400 | Categoría de ranking no válida |
| Temporada no existe | 404 | Temporada no encontrada |
| Temporada aún activa | 400 | La temporada aún está activa |
| Sin datos | 204 | No hay datos disponibles |
| Acceso denegado | 403 | No autorizado para esta acción |
| Error servidor | 500 | Error interno del servidor |

---

## 📚 Próximos Documentos

- **09-Servicios-Core.md** - Referencia completa de todos los servicios
- **10-Configuracion-Setup.md** - Setup, módulos, interceptores

---

**¿Preguntas o cambios?**  
Contacta al equipo de desarrollo de Valgame.
