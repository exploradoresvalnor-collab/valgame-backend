# 👤 Perfil y Dashboard - Guía Completa

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Dashboard, Perfil Usuario, Edición de Datos, Estadísticas

---

## 📋 Tabla de Contenidos

1. [Flujo General](#flujo-general)
2. [Dashboard Principal](#dashboard-principal)
3. [Perfil de Usuario](#perfil-de-usuario)
4. [Edición de Perfil](#edición-de-perfil)
5. [Servicios Requeridos](#servicios-requeridos)
6. [Endpoints Backend](#endpoints-backend)
7. [Manejo de Errores](#manejo-de-errores)

---

## 🔄 Flujo General

```
┌─────────────────────────────────┐
│ Usuario Inicia Sesión           │
│ (Documento 01)                  │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│ Accede a DASHBOARD              │
│ - Mi Progreso                   │
│ - Últimas Actividades           │
│ - Personajes (Overview)         │
│ - Recursos (VAL, Boletos, EVO)  │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│ Hace clic en PERFIL             │
│ Ver datos + estadísticas        │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│ Editar Perfil                   │
│ - Username                      │
│ - Avatar/Foto                   │
│ - Email                         │
│ - Preferencias (idioma, etc)    │
└─────────────────────────────────┘
```

---

## 🏠 Dashboard Principal

### 1.1 DashboardComponent - TypeScript

```typescript
// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, tap, finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { InventoryService } from '../../services/inventory.service';

interface UserStats {
  username: string;
  email: string;
  level: number;
  totalEXP: number;
  valBalance: number;
  boletosBalance: number;
  evoBalance: number;
  totalCharacters: number;
  createdAt: Date;
  lastLogin: Date;
}

interface DashboardData {
  userStats: UserStats;
  characters: any[];
  recentActivity: any[];
  inventoryCount: {
    equipment: number;
    consumables: number;
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  error$ = new BehaviorSubject<string | null>(null);
  dashboardData$!: Observable<DashboardData>;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading$.next(true);
    this.error$.next(null);

    // Combinar múltiples observables
    this.dashboardData$ = combineLatest([
      this.userService.getUserStats(),
      this.userService.getUserCharacters(),
      this.userService.getRecentActivity(),
      this.inventoryService.getInventoryCounts()
    ]).pipe(
      map(([userStats, characters, recentActivity, inventoryCount]) => ({
        userStats,
        characters: characters.slice(0, 3), // Solo 3 primeros
        recentActivity: recentActivity.slice(0, 5), // Solo 5 últimos
        inventoryCount
      })),
      tap(() => {
        this.loading$.next(false);
      }),
      finalize(() => {
        if (this.loading$.value === true) {
          this.loading$.next(false);
        }
      })
    );
  }

  onRefresh(): void {
    this.loadDashboard();
  }

  getProgressPercentage(current: number, next: number): number {
    if (next <= 0) return 0;
    return Math.round((current / next) * 100);
  }

  navigateToCharacters(): void {
    // Navegar a personajes
  }

  navigateToInventory(): void {
    // Navegar a inventario
  }

  trackByCharacterId(index: number, item: any): string {
    return item.id;
  }

  trackByActivityId(index: number, item: any): string {
    return item.id;
  }
}
```

### 1.2 DashboardComponent - HTML Template

```html
<!-- dashboard.component.html -->
<div class="dashboard-container">
  
  <!-- HEADER -->
  <div class="dashboard-header">
    <h1>🎮 Dashboard</h1>
    <button class="btn-refresh" (click)="onRefresh()" title="Actualizar">
      🔄 Actualizar
    </button>
  </div>

  <!-- LOADING -->
  <ng-container *ngIf="loading$ | async">
    <div class="loading-section">
      <div class="spinner"></div>
      <p>Cargando tu dashboard...</p>
    </div>
  </ng-container>

  <!-- CONTENIDO PRINCIPAL -->
  <ng-container *ngIf="!(loading$ | async) && (dashboardData$ | async) as data">
    
    <!-- BIENVENIDA + ESTADÍSTICAS RÁPIDAS -->
    <section class="welcome-section">
      <div class="welcome-card">
        <h2>¡Bienvenido, {{ data.userStats.username }}! 👋</h2>
        <p class="subtitle">Último acceso: {{ data.userStats.lastLogin | date:'short' }}</p>
      </div>

      <!-- TARJETAS DE RECURSOS -->
      <div class="resources-grid">
        <!-- VAL -->
        <div class="resource-card val">
          <div class="resource-icon">💰</div>
          <div class="resource-info">
            <p class="resource-label">VAL (Moneda)</p>
            <p class="resource-value">{{ data.userStats.valBalance | number }}</p>
          </div>
          <button class="btn-small">+Comprar</button>
        </div>

        <!-- BOLETOS -->
        <div class="resource-card boletos">
          <div class="resource-icon">🎫</div>
          <div class="resource-info">
            <p class="resource-label">Boletos</p>
            <p class="resource-value">{{ data.userStats.boletosBalance }}</p>
          </div>
          <button class="btn-small">Usar</button>
        </div>

        <!-- EVO TOKENS -->
        <div class="resource-card evo">
          <div class="resource-icon">⚡</div>
          <div class="resource-info">
            <p class="resource-label">EVO Tokens</p>
            <p class="resource-value">{{ data.userStats.evoBalance }}</p>
          </div>
          <button class="btn-small">Ver</button>
        </div>
      </div>
    </section>

    <!-- PROGRESO DE NIVEL -->
    <section class="progress-section">
      <h3>📊 Mi Progreso</h3>
      <div class="progress-card">
        <div class="level-info">
          <span class="level-badge">Nivel {{ data.userStats.level }}</span>
          <p class="exp-text">
            {{ data.userStats.totalEXP | number }} / {{ (data.userStats.totalEXP * 1.5) | number }} EXP
          </p>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            [style.width]="getProgressPercentage(data.userStats.totalEXP, data.userStats.totalEXP * 1.5) + '%'"
          ></div>
        </div>
        <p class="progress-text">
          {{ getProgressPercentage(data.userStats.totalEXP, data.userStats.totalEXP * 1.5) }}% hasta siguiente nivel
        </p>
      </div>
    </section>

    <!-- PERSONAJES RECIENTES -->
    <section class="characters-section">
      <div class="section-header">
        <h3>🗡️ Mis Personajes</h3>
        <p class="count">{{ data.userStats.totalCharacters }} personajes</p>
        <button class="btn-text" (click)="navigateToCharacters()">Ver todos →</button>
      </div>

      <div class="characters-grid">
        <div 
          *ngFor="let char of data.characters; trackBy: trackByCharacterId"
          class="character-card"
        >
          <div class="character-avatar">
            <img [src]="char.avatarUrl" [alt]="char.name" />
            <span class="level-badge">{{ char.nivel }}</span>
          </div>
          <div class="character-info">
            <h4>{{ char.name }}</h4>
            <p class="class-name">{{ char.clase }}</p>
            <p class="stats">❤️ {{ char.saludActual }} / {{ char.saludMax }}</p>
            <p class="stats">⚔️ ATK: {{ char.ataque }}</p>
            <p class="stats">🛡️ DEF: {{ char.defensa }}</p>
          </div>
          <button class="btn-play">Jugar →</button>
        </div>
      </div>
    </section>

    <!-- INVENTARIO RÁPIDO -->
    <section class="inventory-section">
      <div class="section-header">
        <h3>🎒 Inventario</h3>
        <button class="btn-text" (click)="navigateToInventory()">Ver completo →</button>
      </div>

      <div class="inventory-summary">
        <div class="inventory-item">
          <span class="item-icon">⚔️</span>
          <span class="item-label">Equipamiento</span>
          <span class="item-count">{{ data.inventoryCount.equipment }}</span>
        </div>
        <div class="inventory-item">
          <span class="item-icon">🧪</span>
          <span class="item-label">Consumibles</span>
          <span class="item-count">{{ data.inventoryCount.consumables }}</span>
        </div>
      </div>
    </section>

    <!-- ACTIVIDAD RECIENTE -->
    <section class="activity-section">
      <h3>📜 Actividad Reciente</h3>
      
      <div class="activity-list">
        <div 
          *ngFor="let activity of data.recentActivity; trackBy: trackByActivityId"
          class="activity-item"
          [class]="'activity-' + activity.type"
        >
          <span class="activity-icon">{{ getActivityIcon(activity.type) }}</span>
          <div class="activity-details">
            <p class="activity-title">{{ activity.title }}</p>
            <p class="activity-time">{{ activity.createdAt | date:'short' }}</p>
          </div>
          <span class="activity-badge">{{ activity.value }}</span>
        </div>
      </div>

      <button class="btn-secondary btn-block mt-3">Ver Historial Completo →</button>
    </section>

  </ng-container>

  <!-- ERROR -->
  <ng-container *ngIf="error$ | async as error">
    <div class="error-section">
      <div class="error-icon">❌</div>
      <p>{{ error }}</p>
      <button class="btn-primary" (click)="onRefresh()">🔄 Reintentar</button>
    </div>
  </ng-container>

</div>
```

---

## 👤 Perfil de Usuario

### 2.1 ProfileComponent - TypeScript

```typescript
// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from '../../services/user.service';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  joinedDate: Date;
  level: number;
  totalGamesPlayed: number;
  totalWins: number;
  totalDefeats: number;
  horasJugadas: number;
  personajesFavorito: string;
  logrosDesbloqueados: string[];
  estadisticas: {
    experienciaTotal: number;
    valarGanado: number;
    boletosUsados: number;
    itemsObtenidos: number;
  };
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  userProfile$!: Observable<UserProfile>;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userProfile$ = this.userService.getUserProfile();
    this.userProfile$.subscribe(() => {
      this.loading$.next(false);
    });
  }

  getWinRate(wins: number, total: number): number {
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  }

  navigateToEdit(): void {
    // Navegar a edición
  }

  copyUserId(id: string): void {
    navigator.clipboard.writeText(id).then(() => {
      alert('ID copiado al portapapeles');
    });
  }

  downloadProfileData(): void {
    // Descargar datos del perfil en JSON
  }
}
```

### 2.2 ProfileComponent - HTML Template

```html
<!-- profile.component.html -->
<div class="profile-container">
  
  <!-- HEADER -->
  <div class="profile-header">
    <h1>👤 Mi Perfil</h1>
    <button class="btn-edit" (click)="navigateToEdit()">✏️ Editar Perfil</button>
  </div>

  <!-- LOADING -->
  <ng-container *ngIf="loading$ | async">
    <div class="loading-section">
      <div class="spinner"></div>
      <p>Cargando perfil...</p>
    </div>
  </ng-container>

  <!-- CONTENIDO -->
  <ng-container *ngIf="!(loading$ | async) && (userProfile$ | async) as profile">
    
    <!-- TARJETA DE PERFIL -->
    <section class="profile-card">
      <div class="profile-header-section">
        <div class="avatar-section">
          <img [src]="profile.avatar" [alt]="profile.username" class="avatar-large" />
          <div class="profile-badge">
            <span class="level-badge">{{ profile.level }}</span>
          </div>
        </div>

        <div class="profile-info">
          <h2>{{ profile.username }}</h2>
          <p class="email">{{ profile.email }}</p>
          <p class="bio">{{ profile.bio }}</p>
          <p class="join-date">Se unió: {{ profile.joinedDate | date:'mediumDate' }}</p>
        </div>
      </div>

      <!-- ESTADÍSTICAS GENERALES -->
      <div class="stats-grid">
        <div class="stat-item">
          <p class="stat-label">Nivel</p>
          <p class="stat-value">{{ profile.level }}</p>
        </div>
        <div class="stat-item">
          <p class="stat-label">Partidas Jugadas</p>
          <p class="stat-value">{{ profile.totalGamesPlayed }}</p>
        </div>
        <div class="stat-item">
          <p class="stat-label">Victorias</p>
          <p class="stat-value" style="color: #4ade80;">{{ profile.totalWins }}</p>
        </div>
        <div class="stat-item">
          <p class="stat-label">Derrotas</p>
          <p class="stat-value" style="color: #ef4444;">{{ profile.totalDefeats }}</p>
        </div>
        <div class="stat-item">
          <p class="stat-label">Win Rate</p>
          <p class="stat-value">{{ getWinRate(profile.totalWins, profile.totalGamesPlayed) }}%</p>
        </div>
        <div class="stat-item">
          <p class="stat-label">Horas Jugadas</p>
          <p class="stat-value">{{ profile.horasJugadas }}</p>
        </div>
      </div>
    </section>

    <!-- ESTADÍSTICAS DE RECURSOS -->
    <section class="resources-section">
      <h3>💎 Estadísticas de Recursos</h3>
      
      <div class="resources-cards">
        <div class="resource-card">
          <span class="resource-icon">💰</span>
          <div class="resource-detail">
            <p class="resource-label">VAL Ganado Total</p>
            <p class="resource-value">{{ profile.estadisticas.valarGanado | number }}</p>
          </div>
        </div>

        <div class="resource-card">
          <span class="resource-icon">🎫</span>
          <div class="resource-detail">
            <p class="resource-label">Boletos Usados</p>
            <p class="resource-value">{{ profile.estadisticas.boletosUsados }}</p>
          </div>
        </div>

        <div class="resource-card">
          <span class="resource-icon">📦</span>
          <div class="resource-detail">
            <p class="resource-label">Items Obtenidos</p>
            <p class="resource-value">{{ profile.estadisticas.itemsObtenidos }}</p>
          </div>
        </div>

        <div class="resource-card">
          <span class="resource-icon">⭐</span>
          <div class="resource-detail">
            <p class="resource-label">Experiencia Total</p>
            <p class="resource-value">{{ profile.estadisticas.experienciaTotal | number }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- LOGROS -->
    <section class="achievements-section">
      <h3>🏆 Logros Desbloqueados ({{ profile.logrosDesbloqueados.length }})</h3>
      
      <div class="achievements-grid">
        <div 
          *ngFor="let logro of profile.logrosDesbloqueados"
          class="achievement-badge"
          [title]="logro"
        >
          <span>{{ getAchievementIcon(logro) }}</span>
          <p>{{ logro }}</p>
        </div>
      </div>

      <button class="btn-secondary btn-block">Ver Todos los Logros →</button>
    </section>

    <!-- DATOS DE LA CUENTA -->
    <section class="account-section">
      <h3>🔐 Información de la Cuenta</h3>
      
      <div class="account-details">
        <div class="detail-row">
          <span class="label">ID de Usuario:</span>
          <div class="value-with-copy">
            <code>{{ profile.id }}</code>
            <button class="btn-copy" (click)="copyUserId(profile.id)" title="Copiar">📋</button>
          </div>
        </div>
        <div class="detail-row">
          <span class="label">Email:</span>
          <span class="value">{{ profile.email }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Se unió:</span>
          <span class="value">{{ profile.joinedDate | date:'mediumDate' }}</span>
        </div>
      </div>
    </section>

    <!-- ACCIONES -->
    <section class="actions-section">
      <div class="action-buttons">
        <button class="btn-secondary">
          📥 Descargar Mis Datos
        </button>
        <button class="btn-secondary">
          🔄 Cambiar Contraseña
        </button>
        <button class="btn-secondary">
          🔐 Configuración de Privacidad
        </button>
      </div>
    </section>

  </ng-container>

</div>
```

---

## ✏️ Edición de Perfil

### 3.1 EditProfileComponent - TypeScript

```typescript
// edit-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../services/user.service';

interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  language?: string;
  theme?: string;
  notificationsEnabled?: boolean;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  form!: FormGroup;
  loading$ = new BehaviorSubject<boolean>(false);
  submitted = false;
  successMessage = '';
  previewAvatar = '';

  // Opciones disponibles
  languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' }
  ];

  themes = [
    { code: 'light', label: 'Claro' },
    { code: 'dark', label: 'Oscuro' },
    { code: 'auto', label: 'Auto' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCurrentProfile();
  }

  private initializeForm(): void {
    this.form = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9_-]+$/)
        ]
      ],
      bio: [
        '',
        [Validators.maxLength(200)]
      ],
      email: [
        '',
        [Validators.required, Validators.email]
      ],
      avatar: [''],
      language: ['es'],
      theme: ['auto'],
      notificationsEnabled: [true]
    });
  }

  private loadCurrentProfile(): void {
    this.userService.getUserProfile().subscribe(profile => {
      this.form.patchValue({
        username: profile.username,
        bio: profile.bio,
        email: profile.email,
        avatar: profile.avatar,
        language: profile.language || 'es',
        theme: profile.theme || 'auto',
        notificationsEnabled: profile.notificationsEnabled !== false
      });
      this.previewAvatar = profile.avatar;
    });
  }

  get f() {
    return this.form.controls;
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewAvatar = e.target.result;
        this.form.patchValue({ avatar: file });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading$.next(true);
    const updateData: UpdateProfileData = this.form.value;

    this.userService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.loading$.next(false);
        this.successMessage = '✅ Perfil actualizado correctamente';
        
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (error) => {
        this.loading$.next(false);
        alert('Error al actualizar perfil: ' + error.message);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }

  resetForm(): void {
    this.submitted = false;
    this.loadCurrentProfile();
  }
}
```

### 3.2 EditProfileComponent - HTML Template

```html
<!-- edit-profile.component.html -->
<div class="edit-profile-container">
  
  <!-- HEADER -->
  <div class="edit-profile-header">
    <h1>✏️ Editar Perfil</h1>
  </div>

  <!-- FORMULARIO -->
  <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="edit-profile-form">
    
    <!-- AVATAR -->
    <section class="form-section">
      <h3>🖼️ Avatar</h3>
      
      <div class="avatar-upload">
        <div class="avatar-preview">
          <img [src]="previewAvatar" [alt]="form.get('username')?.value" />
        </div>

        <div class="avatar-upload-input">
          <input
            type="file"
            id="avatar"
            accept="image/*"
            (change)="onAvatarSelected($event)"
            class="file-input"
          />
          <label for="avatar" class="btn-secondary">
            📤 Cargar Avatar
          </label>
          <p class="file-info">JPG, PNG o GIF. Máximo 5MB.</p>
        </div>
      </div>
    </section>

    <!-- USERNAME -->
    <section class="form-section">
      <div class="form-group">
        <label for="username">Nombre de Usuario</label>
        <input
          id="username"
          type="text"
          formControlName="username"
          class="form-control"
          [class.is-invalid]="submitted && f['username'].errors"
          placeholder="tu_nombre_usuario"
        />
        <small class="form-text">3-20 caracteres. Solo letras, números, guiones y guiones bajos.</small>
        <div *ngIf="submitted && f['username'].errors" class="error-text">
          <span *ngIf="f['username'].errors['required']">Username es requerido</span>
          <span *ngIf="f['username'].errors['minlength']">Mínimo 3 caracteres</span>
          <span *ngIf="f['username'].errors['maxlength']">Máximo 20 caracteres</span>
          <span *ngIf="f['username'].errors['pattern']">Solo letras, números, -, _</span>
        </div>
      </div>
    </section>

    <!-- EMAIL -->
    <section class="form-section">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          class="form-control"
          [class.is-invalid]="submitted && f['email'].errors"
          placeholder="tu@email.com"
        />
        <small class="form-text">Tu email de recuperación de cuenta</small>
        <div *ngIf="submitted && f['email'].errors" class="error-text">
          <span *ngIf="f['email'].errors['required']">Email es requerido</span>
          <span *ngIf="f['email'].errors['email']">Email inválido</span>
        </div>
      </div>
    </section>

    <!-- BIO -->
    <section class="form-section">
      <div class="form-group">
        <label for="bio">Bio/Descripción</label>
        <textarea
          id="bio"
          formControlName="bio"
          class="form-control textarea"
          [class.is-invalid]="submitted && f['bio'].errors"
          placeholder="Cuéntanos sobre ti..."
          maxlength="200"
          rows="3"
        ></textarea>
        <small class="form-text">
          {{ form.get('bio')?.value?.length || 0 }}/200 caracteres
        </small>
      </div>
    </section>

    <!-- PREFERENCIAS -->
    <section class="form-section">
      <h3>⚙️ Preferencias</h3>

      <!-- Idioma -->
      <div class="form-group">
        <label for="language">Idioma</label>
        <select
          id="language"
          formControlName="language"
          class="form-control"
        >
          <option *ngFor="let lang of languages" [value]="lang.code">
            {{ lang.label }}
          </option>
        </select>
      </div>

      <!-- Tema -->
      <div class="form-group">
        <label for="theme">Tema</label>
        <select
          id="theme"
          formControlName="theme"
          class="form-control"
        >
          <option *ngFor="let t of themes" [value]="t.code">
            {{ t.label }}
          </option>
        </select>
      </div>

      <!-- Notificaciones -->
      <div class="form-group checkbox-group">
        <input
          id="notifications"
          type="checkbox"
          formControlName="notificationsEnabled"
          class="checkbox-input"
        />
        <label for="notifications">Habilitar notificaciones por email</label>
      </div>
    </section>

    <!-- BOTONES -->
    <div class="form-actions">
      <button
        type="submit"
        class="btn btn-primary"
        [disabled]="loading$ | async"
      >
        <ng-container *ngIf="!(loading$ | async)">💾 Guardar Cambios</ng-container>
        <ng-container *ngIf="loading$ | async">
          <span class="spinner-border spinner-border-sm"></span> Guardando...
        </ng-container>
      </button>

      <button
        type="button"
        class="btn btn-outline"
        (click)="onCancel()"
      >
        ❌ Cancelar
      </button>

      <button
        type="button"
        class="btn btn-secondary"
        (click)="resetForm()"
      >
        🔄 Revertir
      </button>
    </div>

    <!-- MENSAJE DE ÉXITO -->
    <div *ngIf="successMessage" class="success-message">
      {{ successMessage }}
    </div>

  </form>

</div>
```

---

## 🛠️ Servicios Requeridos

### UserService Completo

```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  // Obtener estadísticas del usuario
  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, {
      withCredentials: true
    });
  }

  // Obtener personajes del usuario
  getUserCharacters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/characters`, {
      withCredentials: true
    });
  }

  // Obtener actividad reciente
  getRecentActivity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activity/recent`, {
      withCredentials: true
    });
  }

  // Obtener perfil completo del usuario
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, {
      withCredentials: true
    });
  }

  // Actualizar perfil del usuario
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, {
      withCredentials: true
    });
  }

  // Cambiar contraseña
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }, {
      withCredentials: true
    });
  }

  // Habilitar 2FA
  enable2FA(): Observable<any> {
    return this.http.post(`${this.apiUrl}/2fa/enable`, {}, {
      withCredentials: true
    });
  }

  // Descargar datos del usuario
  downloadUserData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/export`, {
      withCredentials: true,
      responseType: 'blob'
    });
  }

  // Eliminar cuenta
  deleteAccount(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { password }, {
      withCredentials: true
    });
  }
}
```

### InventoryService

```typescript
// inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/api/inventory`;

  constructor(private http: HttpClient) {}

  // Obtener conteo de inventario
  getInventoryCounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/counts`, {
      withCredentials: true
    });
  }

  // Obtener todos los items
  getAllItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, {
      withCredentials: true
    });
  }

  // Obtener equipamiento
  getEquipment(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipment`, {
      withCredentials: true
    });
  }

  // Obtener consumibles
  getConsumables(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/consumables`, {
      withCredentials: true
    });
  }

  // Usar consumible
  useConsumable(itemId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/consumables/${itemId}/use`, {}, {
      withCredentials: true
    });
  }

  // Vender item
  sellItem(itemId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/items/${itemId}/sell`, {}, {
      withCredentials: true
    });
  }
}
```

---

## 📡 Endpoints Backend

### GET /api/users/stats

```
GET /api/users/stats
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "username": "HeroPlayer",
    "email": "hero@valgame.com",
    "level": 15,
    "totalEXP": 45000,
    "valBalance": 2500,
    "boletosBalance": 8,
    "evoBalance": 2,
    "totalCharacters": 3,
    "createdAt": "2025-01-15T10:00:00Z",
    "lastLogin": "2025-11-24T14:30:00Z"
  }
}
```

### GET /api/users/profile

```
GET /api/users/profile
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "HeroPlayer",
    "email": "hero@valgame.com",
    "avatar": "https://cdn.valgame.com/avatars/507f1f77bcf86cd799439011.jpg",
    "bio": "RPG Enthusiast | Streamer",
    "joinedDate": "2025-01-15T10:00:00Z",
    "level": 15,
    "totalGamesPlayed": 156,
    "totalWins": 98,
    "totalDefeats": 58,
    "horasJugadas": 234.5,
    "personajeFavorito": "Dragon Slayer",
    "logrosDesbloqueados": [
      "Primera Victoria",
      "Cazador de Dragones",
      "Millonario en VAL"
    ],
    "estadisticas": {
      "experienciaTotal": 450000,
      "valarGanado": 125000,
      "boletosUsados": 45,
      "itemsObtenidos": 267
    }
  }
}
```

### PUT /api/users/profile

```
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "NewHeroName",
  "bio": "Updated bio",
  "email": "newemail@valgame.com",
  "language": "es",
  "theme": "dark",
  "notificationsEnabled": true
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "message": "Perfil actualizado correctamente",
  "data": {
    "username": "NewHeroName",
    "bio": "Updated bio",
    "email": "newemail@valgame.com"
  }
}
```

### GET /api/users/characters

```
GET /api/users/characters
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Dragon Slayer",
      "clase": "Guerrero",
      "nivel": 25,
      "saludActual": 150,
      "saludMax": 180,
      "ataque": 75,
      "defensa": 50,
      "avatarUrl": "https://cdn.valgame.com/characters/507f1f77bcf86cd799439012.jpg"
    }
  ]
}
```

### GET /api/users/activity/recent

```
GET /api/users/activity/recent
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "type": "level_up",
      "title": "Subiste a nivel 26",
      "value": "+5000 EXP",
      "createdAt": "2025-11-24T12:00:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "type": "item_obtained",
      "title": "Obtuviste: Espada Legendaria",
      "value": "Raro",
      "createdAt": "2025-11-24T10:30:00Z"
    }
  ]
}
```

### GET /api/inventory/counts

```
GET /api/inventory/counts
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "equipment": 12,
    "consumables": 45
  }
}
```

---

## 📊 Manejo de Errores

| Escenario | Código HTTP | Mensaje | Acción |
|-----------|-------------|---------|--------|
| Sin autenticación | 401 | No autorizado | Redirigir a login |
| Perfil no encontrado | 404 | Perfil no existe | Mostrar error |
| Email duplicado | 409 | Email ya en uso | Mostrar error |
| Nombre de usuario duplicado | 409 | Username ya en uso | Mostrar error |
| Datos inválidos | 400 | Validación fallida | Mostrar errores de form |
| Rate limit | 429 | Demasiadas solicitudes | Mostrar cooldown |
| Error servidor | 500 | Error interno | Reintentar después |

---

## 🔄 Flujo Completo de Autenticación

```
Documento 01 (Login)
     ↓
Documento 03 (Dashboard)
     ↓
Documento 03 (Perfil)
     ↓
Documento 03 (Editar Perfil)
     ↓
Documento 02 (Cambiar Contraseña)
```

---

## 📚 Próximos Documentos

- **04-Inventario-Equipamiento.md** - Gestión de items y equipamiento
- **05-Tienda-Paquetes.md** - Compra de paquetes y recompensas
- **06-Marketplace-P2P.md** - Comercio entre jugadores

---

**¿Preguntas o cambios?**  
Contacta al equipo de desarrollo de Valgame.
