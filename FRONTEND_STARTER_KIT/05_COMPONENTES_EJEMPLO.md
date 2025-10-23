# 🎨 COMPONENTES DE EJEMPLO - COPIAR Y PEGAR

## 📁 Ubicación
Crear estos archivos en: `src/app/shared/components/`

---

## 1️⃣ Character Card Component

### character-card.component.ts
```typescript
// src/app/shared/components/character-card/character-card.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Character } from '@models/character.model';

@Component({
  selector: 'app-character-card',
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent {
  @Input() character!: Character;
  @Output() cardClick = new EventEmitter<Character>();

  getRarityClass(): string {
    const rarityMap: Record<string, string> = {
      'D': 'bg-gray-400',
      'C': 'bg-green-400',
      'B': 'bg-blue-400',
      'A': 'bg-purple-400',
      'S': 'bg-orange-400',
      'SS': 'bg-red-400',
      'SSS': 'bg-yellow-400'
    };
    return rarityMap[this.character.rango] || 'bg-gray-400';
  }

  getHealthPercentage(): number {
    return (this.character.saludActual / this.character.saludMaxima) * 100;
  }

  getHealthColor(): string {
    const percentage = this.getHealthPercentage();
    if (percentage > 70) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  onClick(): void {
    this.cardClick.emit(this.character);
  }
}
```

### character-card.component.html
```html
<!-- src/app/shared/components/character-card/character-card.component.html -->

<div class="character-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
     (click)="onClick()">
  
  <!-- Header con rango -->
  <div class="card-header p-2 text-white text-center font-bold" [ngClass]="getRarityClass()">
    Rango {{ character.rango }}
  </div>

  <!-- Imagen del personaje -->
  <div class="card-image bg-gray-200 h-48 flex items-center justify-center">
    <span class="text-6xl">🎮</span>
  </div>

  <!-- Información del personaje -->
  <div class="card-body p-4">
    <h3 class="text-xl font-bold mb-2 truncate">{{ character.personajeId }}</h3>
    
    <!-- Nivel y Etapa -->
    <div class="flex justify-between mb-2 text-sm text-gray-600">
      <span>Nivel {{ character.nivel }}</span>
      <span>Etapa {{ character.etapa }}</span>
    </div>

    <!-- Barra de salud -->
    <div class="mb-3">
      <div class="flex justify-between text-xs mb-1">
        <span class="font-semibold">Salud</span>
        <span>{{ character.saludActual }}/{{ character.saludMaxima }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all"
          [ngClass]="getHealthColor()"
          [style.width.%]="getHealthPercentage()">
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-2 text-center text-sm">
      <div class="bg-red-100 rounded p-2">
        <div class="font-bold text-red-700">{{ character.stats.atk }}</div>
        <div class="text-xs text-gray-600">ATK</div>
      </div>
      <div class="bg-blue-100 rounded p-2">
        <div class="font-bold text-blue-700">{{ character.stats.defensa }}</div>
        <div class="text-xs text-gray-600">DEF</div>
      </div>
      <div class="bg-green-100 rounded p-2">
        <div class="font-bold text-green-700">{{ character.stats.vida }}</div>
        <div class="text-xs text-gray-600">HP</div>
      </div>
    </div>

    <!-- Estado -->
    <div class="mt-3">
      <span 
        class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
        [ngClass]="{
          'bg-green-200 text-green-800': character.estado === 'saludable',
          'bg-red-200 text-red-800': character.estado === 'herido'
        }">
        {{ character.estado === 'saludable' ? '✓ Saludable' : '⚠ Herido' }}
      </span>
    </div>

    <!-- Buffs activos -->
    <div *ngIf="character.activeBuffs && character.activeBuffs.length > 0" class="mt-2">
      <div class="text-xs text-gray-600 mb-1">Buffs activos:</div>
      <div class="flex flex-wrap gap-1">
        <span *ngFor="let buff of character.activeBuffs" 
              class="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
          ⚡ Buff
        </span>
      </div>
    </div>
  </div>
</div>
```

### character-card.component.scss
```scss
// src/app/shared/components/character-card/character-card.component.scss

.character-card {
  max-width: 300px;
  
  &:hover {
    transform: translateY(-4px);
    transition: transform 0.2s ease-in-out;
  }
}

.card-image {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## 2️⃣ Loading Spinner Component

### loading-spinner.component.ts
```typescript
// src/app/shared/components/loading-spinner/loading-spinner.component.ts

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="flex items-center justify-center" [style.height.px]="height">
      <div class="animate-spin rounded-full border-t-4 border-b-4"
           [ngClass]="sizeClass"
           [style.border-color]="color">
      </div>
    </div>
  `,
  styles: [`
    .small { width: 24px; height: 24px; }
    .medium { width: 48px; height: 48px; }
    .large { width: 72px; height: 72px; }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = '#1976d2';
  @Input() height: number = 200;

  get sizeClass(): string {
    return this.size;
  }
}
```

---

## 3️⃣ Header Component

### header.component.ts
```typescript
// src/app/shared/components/header/header.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { User } from '@models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  menuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
```

### header.component.html
```html
<!-- src/app/shared/components/header/header.component.html -->

<header class="bg-primary text-white shadow-lg">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      
      <!-- Logo -->
      <div class="flex items-center">
        <a routerLink="/dashboard" class="text-2xl font-bold">
          🎮 Valnor
        </a>
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex space-x-6">
        <a routerLink="/dashboard" routerLinkActive="border-b-2" class="hover:text-gray-200 transition">
          Dashboard
        </a>
        <a routerLink="/characters" routerLinkActive="border-b-2" class="hover:text-gray-200 transition">
          Personajes
        </a>
        <a routerLink="/inventory" routerLinkActive="border-b-2" class="hover:text-gray-200 transition">
          Inventario
        </a>
        <a routerLink="/marketplace" routerLinkActive="border-b-2" class="hover:text-gray-200 transition">
          Marketplace
        </a>
        <a routerLink="/dungeons" routerLinkActive="border-b-2" class="hover:text-gray-200 transition">
          Mazmorras
        </a>
      </nav>

      <!-- User Info -->
      <div class="hidden md:flex items-center space-x-4" *ngIf="user">
        <div class="flex items-center space-x-2">
          <span class="text-yellow-300">💰 {{ user.val }}</span>
          <span class="text-blue-300">🎫 {{ user.boletos }}</span>
        </div>
        <div class="relative">
          <button (click)="toggleMenu()" class="flex items-center space-x-2 hover:text-gray-200">
            <span>{{ user.username }}</span>
            <span>▼</span>
          </button>
          
          <!-- Dropdown Menu -->
          <div *ngIf="menuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <a routerLink="/profile" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
              Perfil
            </a>
            <a routerLink="/settings" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
              Configuración
            </a>
            <button (click)="logout()" class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button (click)="toggleMenu()" class="md:hidden">
        <span class="text-2xl">☰</span>
      </button>
    </div>

    <!-- Mobile Navigation -->
    <nav *ngIf="menuOpen" class="md:hidden pb-4">
      <a routerLink="/dashboard" class="block py-2 hover:text-gray-200">Dashboard</a>
      <a routerLink="/characters" class="block py-2 hover:text-gray-200">Personajes</a>
      <a routerLink="/inventory" class="block py-2 hover:text-gray-200">Inventario</a>
      <a routerLink="/marketplace" class="block py-2 hover:text-gray-200">Marketplace</a>
      <a routerLink="/dungeons" class="block py-2 hover:text-gray-200">Mazmorras</a>
      <button (click)="logout()" class="block w-full text-left py-2 hover:text-gray-200">
        Cerrar Sesión
      </button>
    </nav>
  </div>
</header>
```

---

## 4️⃣ Login Component (Ejemplo completo)

### login.component.ts
```typescript
// src/app/features/auth/pages/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.notification.success('¡Bienvenido!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          const message = error.error?.error || 'Error al iniciar sesión';
          this.notification.error(message);
        }
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
```

### login.component.html
```html
<!-- src/app/features/auth/pages/login/login.component.html -->

<div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-4xl font-bold text-gray-900">🎮 Valnor</h2>
      <p class="mt-2 text-sm text-gray-600">Inicia sesión en tu cuenta</p>
    </div>

    <!-- Form -->
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md">
      
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="tu@email.com">
        <div *ngIf="email?.invalid && email?.touched" class="mt-1 text-sm text-red-600">
          <span *ngIf="email?.hasError('required')">El email es requerido</span>
          <span *ngIf="email?.hasError('email')">Email inválido</span>
        </div>
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
        <div class="relative">
          <input
            id="password"
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="••••••••">
          <button
            type="button"
            (click)="hidePassword = !hidePassword"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {{ hidePassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
        <div *ngIf="password?.invalid && password?.touched" class="mt-1 text-sm text-red-600">
          <span *ngIf="password?.hasError('required')">La contraseña es requerida</span>
          <span *ngIf="password?.hasError('minlength')">Mínimo 6 caracteres</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        [disabled]="loginForm.invalid || loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
        <span *ngIf="!loading">Iniciar Sesión</span>
        <span *ngIf="loading">Cargando...</span>
      </button>

      <!-- Links -->
      <div class="text-center text-sm">
        <a routerLink="/auth/forgot-password" class="text-primary hover:text-primary-dark">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
      <div class="text-center text-sm">
        <span class="text-gray-600">¿No tienes cuenta? </span>
        <a routerLink="/auth/register" class="text-primary hover:text-primary-dark font-medium">
          Regístrate
        </a>
      </div>
    </form>
  </div>
</div>
```

---

## ✅ CHECKLIST DE COMPONENTES

- [ ] Character Card copiado y funcionando
- [ ] Loading Spinner copiado
- [ ] Header copiado
- [ ] Login copiado
- [ ] Todos los componentes sin errores de TypeScript
- [ ] Estilos aplicados correctamente

---

**Siguiente paso:** Ve a `06_CONFIGURACION.md`
