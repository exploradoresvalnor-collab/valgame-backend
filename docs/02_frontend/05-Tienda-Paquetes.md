# 🛍️ Tienda y Paquetes - Guía Completa

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Tienda, Compra de Paquetes, Apertura de Paquetes, Asignación de Recompensas

---

## 📋 Tabla de Contenidos

1. [Arquitectura de Tienda](#arquitectura-de-tienda)
2. [Catálogo de Paquetes](#catálogo-de-paquetes)
3. [Compra de Paquetes](#compra-de-paquetes)
4. [Apertura de Paquetes](#apertura-de-paquetes)
5. [Sistema de Recompensas](#sistema-de-recompensas)
6. [Servicios](#servicios)
7. [Endpoints Backend](#endpoints-backend)
8. [Manejo de Errores](#manejo-de-errores)

---

## 🏗️ Arquitectura de Tienda

### Estructura de Datos

```typescript
// Paquete disponible en la tienda
interface Package {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  precio: number;
  precioMoneda: 'VAL' | 'BOLETAZO' | 'REAL';  // Moneda
  categoria: 'iniciador' | 'diario' | 'semanal' | 'elite' | 'especial';
  contenido: PackageContent;
  requisitoMinimo?: {
    nivel: number;
    experiencia: number;
  };
  disponibilidad: 'disponible' | 'limitado' | 'seasonal';
  stock?: number;
  duracion?: number;  // Duración en horas si es limitado
  imagenesPreview: string[];
}

// Contenido del paquete (qué hay adentro)
interface PackageContent {
  val: number;                    // Cantidad de VAL
  boletos: number;               // Cantidad de boletos
  evo: number;                   // Tokens EVO
  personajes: string[];          // IDs de personajes base
  items: {
    id: string;
    nombre: string;
    cantidad: number;
    rareza: string;
  }[];
  consumibles: {
    id: string;
    nombre: string;
    cantidad: number;
    usos_maximos: number;
  }[];
  bonusEspecial?: string;        // Bonus único del paquete
  multiplicadorExp?: number;      // Buff EXP temporal
  accesoPaseEspecial?: boolean;   // Acceso a zona especial
}

// Paquete comprado (en inventario del usuario)
interface PurchasedPackage {
  id: string;
  packageId: string;
  usuarioId: string;
  precioCompra: number;
  monedaCompra: 'VAL' | 'BOLETAZO' | 'REAL';
  estado: 'sin_abrir' | 'abierto' | 'reclamado';
  fechaCompra: Date;
  fechaApertura?: Date;
  recompensasReclamadas: RecompensasReclamadas;
}

// Recompensas reclamadas del paquete (CRITICAL)
interface RecompensasReclamadas {
  valRecibido: number;
  boletosRecibidos: number;
  evoRecibido: number;
  personajesDesbloqueados: string[];
  itemsRecibidos: ItemReclamado[];
  consumiblesRecibidos: ConsumibleReclamado[];
  bonusAplicado: string;
  fechaReclamacion: Date;
  historicoAuditoria: {
    evento: string;
    timestamp: Date;
    detalles: any;
  }[];
}

interface ItemReclamado {
  itemId: string;
  nombre: string;
  cantidad: number;
  colocadoEnInventario: boolean;
  posicion?: number;
}

interface ConsumibleReclamado {
  consumibleId: string;
  nombre: string;
  cantidad: number;
  usosMaximos: number;
  agregadoAlInventario: boolean;
}

// Transacción de compra
interface PurchaseTransaction {
  id: string;
  usuarioId: string;
  packageId: string;
  monto: number;
  moneda: 'VAL' | 'BOLETAZO' | 'REAL';
  metodo: 'in_game' | 'stripe' | 'blockchain';
  estado: 'pendiente' | 'completado' | 'fallido' | 'cancelado';
  fechaCreacion: Date;
  fechaCompletacion?: Date;
  razonFallo?: string;
  referenciaExterna?: string;  // ID de Stripe o transacción blockchain
}
```

---

## 🎁 Catálogo de Paquetes

### 1.1 ShopComponent - TypeScript

```typescript
// shop.component.ts
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ShopService } from '../../services/shop.service';
import { AuthService } from '../../services/auth.service';

type PackageCategory = 'todas' | 'iniciador' | 'diario' | 'semanal' | 'elite' | 'especial';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  packages$!: Observable<any[]>;
  selectedCategory$ = new BehaviorSubject<PackageCategory>('todas');
  userResources$!: Observable<any>;

  categories = [
    { id: 'todas', label: '📦 Todos', icon: '📦' },
    { id: 'iniciador', label: '🚀 Iniciador', icon: '🚀' },
    { id: 'diario', label: '📅 Diario', icon: '📅' },
    { id: 'semanal', label: '📊 Semanal', icon: '📊' },
    { id: 'elite', label: '👑 Elite', icon: '👑' },
    { id: 'especial', label: '✨ Especial', icon: '✨' }
  ];

  selectedPackage: any = null;
  showDetails = false;

  constructor(
    private shopService: ShopService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadShop();
  }

  private loadShop(): void {
    // Recursos del usuario
    this.userResources$ = this.authService.getCurrentUser().pipe(
      map(user => ({
        val: user.valBalance,
        boletos: user.boletosBalance,
        nivel: user.level
      }))
    );

    // Paquetes filtrados por categoría
    this.packages$ = combineLatest([
      this.shopService.getAllPackages(),
      this.selectedCategory$
    ]).pipe(
      map(([packages, category]) => {
        if (category === 'todas') {
          return packages;
        }
        return packages.filter(pkg => pkg.categoria === category);
      }),
      tap(() => this.loading$.next(false))
    );
  }

  selectPackage(pkg: any): void {
    this.selectedPackage = pkg;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedPackage = null;
  }

  canAfford(price: number, currency: string, userResources: any): boolean {
    if (currency === 'VAL') {
      return userResources.val >= price;
    }
    if (currency === 'BOLETAZO') {
      return userResources.boletos >= price;
    }
    return true; // REAL se maneja en Stripe
  }

  buyPackage(pkg: any): void {
    if (!confirm(`¿Comprar ${pkg.nombre} por ${pkg.precio} ${pkg.precioMoneda}?`)) {
      return;
    }

    this.shopService.purchasePackage(pkg.id, pkg.precioMoneda).subscribe({
      next: (response) => {
        alert('¡Paquete comprado! Abiéndolo...');
        // Redirigir a mi paquetes o abrir automáticamente
        this.loadShop();
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }

  getRarityColor(rareza: string): string {
    const colors: { [key: string]: string } = {
      'común': '#808080',
      'raro': '#0066ff',
      'épico': '#9933ff',
      'legendario': '#ffaa00',
      'mítico': '#ff0000'
    };
    return colors[rareza] || '#ffffff';
  }

  trackByPackageId(index: number, pkg: any): string {
    return pkg.id;
  }
}
```

### 1.2 ShopComponent - HTML Template

```html
<!-- shop.component.html -->
<div class="shop-container">
  
  <!-- HEADER -->
  <div class="shop-header">
    <h1>🛍️ Tienda</h1>
    <p>Compra paquetes y obtén recursos increíbles</p>
  </div>

  <!-- RECURSOS DEL USUARIO -->
  <div *ngIf="userResources$ | async as resources" class="user-resources">
    <div class="resource-card val">
      <span>💰 VAL</span>
      <strong>{{ resources.val | number }}</strong>
      <button class="btn-small">+Comprar</button>
    </div>
    <div class="resource-card boletos">
      <span>🎫 Boletos</span>
      <strong>{{ resources.boletos }}</strong>
    </div>
    <div class="resource-info">
      <span>📍 Nivel {{ resources.nivel }}</span>
    </div>
  </div>

  <!-- CATEGORÍAS -->
  <div class="categories">
    <button
      *ngFor="let cat of categories"
      class="category-button"
      [class.active]="(selectedCategory$ | async) === cat.id"
      (click)="selectedCategory$.next(cat.id as PackageCategory)"
    >
      {{ cat.icon }} {{ cat.label }}
    </button>
  </div>

  <!-- LOADING -->
  <div *ngIf="loading$ | async" class="loading-section">
    <div class="spinner"></div>
    <p>Cargando tienda...</p>
  </div>

  <!-- CATÁLOGO DE PAQUETES -->
  <div class="packages-grid" *ngIf="!(loading$ | async) && (packages$ | async) as packages">
    <ng-container *ngIf="packages.length > 0; else noPackages">
      <div
        *ngFor="let pkg of packages; trackBy: trackByPackageId"
        class="package-card"
        (click)="selectPackage(pkg)"
      >
        <!-- IMAGEN -->
        <div class="package-image">
          <img [src]="pkg.icono" [alt]="pkg.nombre" />
          <span *ngIf="pkg.disponibilidad === 'limitado'" class="limited-badge">
            ⏰ Limitado
          </span>
          <span *ngIf="pkg.disponibilidad === 'seasonal'" class="seasonal-badge">
            ✨ Seasonal
          </span>
        </div>

        <!-- INFO -->
        <div class="package-info">
          <h4>{{ pkg.nombre }}</h4>
          <p class="description">{{ pkg.descripcion }}</p>
          
          <!-- PREVIEW DE CONTENIDO -->
          <div class="content-preview">
            <span *ngIf="pkg.contenido.val > 0">💰 {{ pkg.contenido.val }} VAL</span>
            <span *ngIf="pkg.contenido.boletos > 0">🎫 {{ pkg.contenido.boletos }} Boletos</span>
            <span *ngIf="pkg.contenido.evo > 0">⚡ {{ pkg.contenido.evo }} EVO</span>
            <span *ngIf="pkg.contenido.personajes?.length > 0">
              🗡️ {{ pkg.contenido.personajes.length }} Personajes
            </span>
            <span *ngIf="pkg.contenido.items?.length > 0">
              ⚔️ {{ pkg.contenido.items.length }} Items
            </span>
          </div>

          <!-- PRECIO -->
          <div class="package-price">
            <p class="price">
              {{ pkg.precio }}
              <span *ngIf="pkg.precioMoneda === 'VAL'">💰</span>
              <span *ngIf="pkg.precioMoneda === 'BOLETAZO'">🎫</span>
              <span *ngIf="pkg.precioMoneda === 'REAL'">💳</span>
            </p>
          </div>

          <!-- BOTÓN COMPRAR -->
          <button class="btn-primary btn-block">
            🛒 Comprar
          </button>
        </div>
      </div>
    </ng-container>

    <ng-template #noPackages>
      <p class="no-packages">📭 No hay paquetes disponibles</p>
    </ng-template>
  </div>

  <!-- MODAL DE DETALLES -->
  <div *ngIf="showDetails && selectedPackage" class="details-modal">
    <div class="modal-overlay" (click)="closeDetails()"></div>
    <div class="modal-content">
      <button class="btn-close" (click)="closeDetails()">✕</button>

      <div class="details-header">
        <img [src]="selectedPackage.icono" [alt]="selectedPackage.nombre" />
        <h2>{{ selectedPackage.nombre }}</h2>
        <p class="category">{{ selectedPackage.categoria | titlecase }}</p>
      </div>

      <!-- CONTENIDO DETALLADO -->
      <div class="details-content">
        <h3>📦 Contenido del Paquete</h3>

        <div class="content-items">
          <!-- Recursos -->
          <div *ngIf="selectedPackage.contenido.val > 0" class="content-item">
            <span>💰 VAL</span>
            <strong>{{ selectedPackage.contenido.val | number }}</strong>
          </div>
          <div *ngIf="selectedPackage.contenido.boletos > 0" class="content-item">
            <span>🎫 Boletos</span>
            <strong>{{ selectedPackage.contenido.boletos }}</strong>
          </div>
          <div *ngIf="selectedPackage.contenido.evo > 0" class="content-item">
            <span>⚡ EVO Tokens</span>
            <strong>{{ selectedPackage.contenido.evo }}</strong>
          </div>

          <!-- Personajes -->
          <div *ngIf="selectedPackage.contenido.personajes?.length > 0" class="content-section">
            <h4>🗡️ Personajes Base</h4>
            <ul>
              <li *ngFor="let char of selectedPackage.contenido.personajes">
                {{ char }}
              </li>
            </ul>
          </div>

          <!-- Items -->
          <div *ngIf="selectedPackage.contenido.items?.length > 0" class="content-section">
            <h4>⚔️ Items Especiales</h4>
            <div class="items-list">
              <div *ngFor="let item of selectedPackage.contenido.items" class="item-row">
                <span class="item-name">{{ item.nombre }}</span>
                <span class="item-rarity" [style.color]="getRarityColor(item.rareza)">
                  ★ {{ item.rareza | uppercase }}
                </span>
                <span class="item-qty">x{{ item.cantidad }}</span>
              </div>
            </div>
          </div>

          <!-- Consumibles -->
          <div *ngIf="selectedPackage.contenido.consumibles?.length > 0" class="content-section">
            <h4>🧪 Consumibles</h4>
            <ul>
              <li *ngFor="let cons of selectedPackage.contenido.consumibles">
                {{ cons.nombre }} (x{{ cons.cantidad }}, {{ cons.usos_maximos }} usos)
              </li>
            </ul>
          </div>

          <!-- Bonus Especial -->
          <div *ngIf="selectedPackage.contenido.bonusEspecial" class="bonus-special">
            <p>✨ <strong>Bonus Especial:</strong> {{ selectedPackage.contenido.bonusEspecial }}</p>
          </div>
        </div>
      </div>

      <!-- REQUISITOS -->
      <div *ngIf="selectedPackage.requisitoMinimo" class="requirements">
        <h3>📋 Requisitos</h3>
        <p>Nivel mínimo: {{ selectedPackage.requisitoMinimo.nivel }}</p>
      </div>

      <!-- BOTÓN DE COMPRA -->
      <div class="modal-footer">
        <button
          class="btn-primary btn-block"
          (click)="buyPackage(selectedPackage)"
        >
          🛒 Comprar por {{ selectedPackage.precio }} {{ selectedPackage.precioMoneda }}
        </button>
      </div>
    </div>
  </div>

</div>
```

---

## 🎉 Apertura de Paquetes

### 2.1 PackageOpenComponent - TypeScript

```typescript
// package-open.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ShopService } from '../../services/shop.service';

interface OpeningState {
  step: 'confirmacion' | 'abriendo' | 'revelando' | 'completado' | 'error';
  rewardsRevealed: any[];
  totalRewards: any;
  animationComplete: boolean;
}

@Component({
  selector: 'app-package-open',
  templateUrl: './package-open.component.html',
  styleUrls: ['./package-open.component.scss']
})
export class PackageOpenComponent implements OnInit {
  packageId: string = '';
  package$!: Observable<any>;
  loading$ = new BehaviorSubject<boolean>(false);

  state: OpeningState = {
    step: 'confirmacion',
    rewardsRevealed: [],
    totalRewards: {},
    animationComplete: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.packageId = params['id'];
      this.package$ = this.shopService.getPackageDetails(this.packageId);
    });
  }

  openPackage(): void {
    this.state.step = 'abriendo';
    this.loading$.next(true);

    // BACKEND: Procesa la apertura y asigna recompensas
    this.shopService.openPackage(this.packageId).subscribe({
      next: (response) => {
        this.loading$.next(false);
        this.state.step = 'revelando';
        
        // Revelar recompensas con animación
        this.revealRewards(response.rewards);
      },
      error: (error) => {
        this.loading$.next(false);
        this.state.step = 'error';
        alert('Error: ' + error.message);
      }
    });
  }

  private revealRewards(rewards: any): void {
    // Revelar cada recompensa con delay para animación
    let delay = 500;

    if (rewards.val > 0) {
      setTimeout(() => {
        this.state.rewardsRevealed.push({
          type: 'val',
          value: rewards.val,
          icon: '💰'
        });
      }, delay);
      delay += 800;
    }

    if (rewards.boletos > 0) {
      setTimeout(() => {
        this.state.rewardsRevealed.push({
          type: 'boletos',
          value: rewards.boletos,
          icon: '🎫'
        });
      }, delay);
      delay += 800;
    }

    if (rewards.evo > 0) {
      setTimeout(() => {
        this.state.rewardsRevealed.push({
          type: 'evo',
          value: rewards.evo,
          icon: '⚡'
        });
      }, delay);
      delay += 800;
    }

    if (rewards.personajes?.length > 0) {
      setTimeout(() => {
        this.state.rewardsRevealed.push({
          type: 'personajes',
          value: rewards.personajes.length,
          items: rewards.personajes,
          icon: '🗡️'
        });
      }, delay);
      delay += 800;
    }

    if (rewards.items?.length > 0) {
      setTimeout(() => {
        this.state.rewardsRevealed.push({
          type: 'items',
          value: rewards.items.length,
          items: rewards.items,
          icon: '⚔️'
        });
      }, delay);
      delay += 800;
    }

    // Completar después de todas las animaciones
    setTimeout(() => {
      this.state.step = 'completado';
      this.state.animationComplete = true;
      this.state.totalRewards = rewards;
    }, delay);
  }

  skipAnimation(): void {
    // Mostrar todas las recompensas de una vez
    this.state.step = 'completado';
    this.state.animationComplete = true;
  }

  goToInventory(): void {
    this.router.navigate(['/inventory']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
```

### 2.2 PackageOpenComponent - HTML Template

```html
<!-- package-open.component.html -->
<div class="package-open-container">
  
  <!-- CONFIRMACIÓN -->
  <div *ngIf="state.step === 'confirmacion'" class="step-section">
    <h1>🎁 Abre tu Paquete</h1>
    <p class="subtitle">¿Estás listo para ver qué hay adentro?</p>

    <div class="package-preview" *ngIf="package$ | async as pkg">
      <img [src]="pkg.icono" [alt]="pkg.nombre" />
      <h2>{{ pkg.nombre }}</h2>
      <p>{{ pkg.descripcion }}</p>
    </div>

    <button class="btn-primary btn-large" (click)="openPackage()">
      🎉 ¡Abrir Paquete!
    </button>
  </div>

  <!-- ABRIENDO (ANIMACIÓN) -->
  <div *ngIf="state.step === 'abriendo'" class="step-section">
    <div class="opening-animation">
      <div class="box-animation">
        <div class="box"></div>
        <p>Abriendo...</p>
      </div>
    </div>
  </div>

  <!-- REVELANDO RECOMPENSAS -->
  <div *ngIf="state.step === 'revelando'" class="step-section">
    <h1>✨ ¡Recompensas Desbloqueadas!</h1>

    <div class="rewards-reveal">
      <div
        *ngFor="let reward of state.rewardsRevealed; trackBy: trackByIndex"
        class="reward-item"
        [@reveal]
      >
        <span class="reward-icon">{{ reward.icon }}</span>
        <div class="reward-details">
          <p class="reward-type">
            {{ reward.type === 'val' ? 'VAL' : 
               reward.type === 'boletos' ? 'Boletos' :
               reward.type === 'evo' ? 'EVO Tokens' :
               reward.type === 'personajes' ? 'Personajes' :
               'Items' }}
          </p>
          <p class="reward-value">{{ reward.value }}</p>
        </div>
      </div>
    </div>

    <button class="btn-secondary" (click)="skipAnimation()">Saltar Animación</button>
  </div>

  <!-- COMPLETADO -->
  <div *ngIf="state.step === 'completado'" class="step-section success">
    <div class="success-header">
      <span class="success-icon">🎉</span>
      <h1>¡Paquete Abierto!</h1>
      <p>Todas tus recompensas han sido añadidas a tu cuenta</p>
    </div>

    <!-- RESUMEN DE RECOMPENSAS -->
    <div class="rewards-summary">
      <h2>📊 Resumen de Recompensas</h2>

      <div class="reward-summary-item" *ngIf="state.totalRewards.val > 0">
        <span class="icon">💰</span>
        <div class="details">
          <p>VAL Ganado</p>
          <strong>{{ state.totalRewards.val | number }}</strong>
        </div>
      </div>

      <div class="reward-summary-item" *ngIf="state.totalRewards.boletos > 0">
        <span class="icon">🎫</span>
        <div class="details">
          <p>Boletos</p>
          <strong>{{ state.totalRewards.boletos }}</strong>
        </div>
      </div>

      <div class="reward-summary-item" *ngIf="state.totalRewards.evo > 0">
        <span class="icon">⚡</span>
        <div class="details">
          <p>EVO Tokens</p>
          <strong>{{ state.totalRewards.evo }}</strong>
        </div>
      </div>

      <!-- Personajes desbloqueados -->
      <div class="reward-summary-item" *ngIf="state.totalRewards.personajes?.length > 0">
        <span class="icon">🗡️</span>
        <div class="details">
          <p>Personajes Desbloqueados</p>
          <div class="item-list">
            <span *ngFor="let char of state.totalRewards.personajes" class="badge">
              {{ char }}
            </span>
          </div>
        </div>
      </div>

      <!-- Items obtenidos -->
      <div class="reward-summary-item" *ngIf="state.totalRewards.items?.length > 0">
        <span class="icon">⚔️</span>
        <div class="details">
          <p>Items Obtenidos</p>
          <div class="item-list">
            <span *ngFor="let item of state.totalRewards.items" class="badge item-badge">
              {{ item.nombre }} <span class="rarity">{{ item.rareza }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ACCIONES -->
    <div class="actions">
      <button class="btn-primary" (click)="goToInventory()">
        🎒 Ver Inventario
      </button>
      <button class="btn-secondary" (click)="goToDashboard()">
        🏠 Ir al Dashboard
      </button>
    </div>

    <!-- NOTA IMPORTANTE -->
    <div class="info-box">
      <p>ℹ️ <strong>Recompensas Automáticas:</strong></p>
      <ul>
        <li>💰 VAL: Añadido a tu saldo inmediatamente</li>
        <li>🎫 Boletos: Disponibles para usar</li>
        <li>⚡ EVO: Listo para evolucionar personajes</li>
        <li>🗡️ Personajes: Desbloqueados en tu cuenta</li>
        <li>⚔️ Items: Agregados a tu inventario</li>
      </ul>
    </div>
  </div>

  <!-- ERROR -->
  <div *ngIf="state.step === 'error'" class="step-section error">
    <div class="error-icon">❌</div>
    <h1>Error al Abrir Paquete</h1>
    <p>Ocurrió un error. Intenta nuevamente.</p>
    <button class="btn-primary" (click)="goToDashboard()">
      Volver al Dashboard
    </button>
  </div>

</div>
```

---

## 💎 Sistema de Recompensas

### Flujo de Asignación de Recompensas (Backend)

```typescript
// PSEUDOCÓDIGO - BACKEND: shop.controller.ts

async openPackage(packageId: string, userId: string) {
  // 1. Validar que el paquete existe y pertenece al usuario
  const purchasedPackage = await PurchasedPackage.findById(packageId);
  if (!purchasedPackage || purchasedPackage.usuarioId !== userId) {
    throw new Error('Paquete no encontrado');
  }

  // 2. Validar que no ha sido abierto
  if (purchasedPackage.estado !== 'sin_abrir') {
    throw new Error('Este paquete ya fue abierto');
  }

  // 3. Obtener plantilla del paquete
  const packageTemplate = await Package.findById(purchasedPackage.packageId);

  // 4. INICIAR TRANSACCIÓN ATÓMICA
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 5. ASIGNAR RECOMPENSAS EN PARALELO (ATOMIC)

    // A) VAL
    if (packageTemplate.contenido.val > 0) {
      await User.updateOne(
        { _id: userId },
        { $inc: { valBalance: packageTemplate.contenido.val } },
        { session }
      );
    }

    // B) BOLETOS
    if (packageTemplate.contenido.boletos > 0) {
      await User.updateOne(
        { _id: userId },
        { $inc: { boletosBalance: packageTemplate.contenido.boletos } },
        { session }
      );
    }

    // C) EVO TOKENS
    if (packageTemplate.contenido.evo > 0) {
      await User.updateOne(
        { _id: userId },
        { $inc: { evoBalance: packageTemplate.contenido.evo } },
        { session }
      );
    }

    // D) PERSONAJES
    const personajesDesbloqueados = [];
    if (packageTemplate.contenido.personajes?.length > 0) {
      for (const characterId of packageTemplate.contenido.personajes) {
        const newCharacter = new Character({
          usuarioId: userId,
          baseTemplate: characterId,
          // ... otros datos
        });
        await newCharacter.save({ session });
        personajesDesbloqueados.push(newCharacter._id);
      }
    }

    // E) ITEMS
    const itemsRecibidos = [];
    if (packageTemplate.contenido.items?.length > 0) {
      for (const itemTemplate of packageTemplate.contenido.items) {
        for (let i = 0; i < itemTemplate.cantidad; i++) {
          const newItem = new UserItem({
            usuarioId: userId,
            itemId: itemTemplate.id,
            rareza: itemTemplate.rareza,
            // ... otros datos
          });
          await newItem.save({ session });
          itemsRecibidos.push(newItem._id);
        }
      }
    }

    // F) CONSUMIBLES
    const consumiblesRecibidos = [];
    if (packageTemplate.contenido.consumibles?.length > 0) {
      for (const consumibleTemplate of packageTemplate.contenido.consumibles) {
        for (let i = 0; i < consumibleTemplate.cantidad; i++) {
          const newConsumible = new UserConsumible({
            usuarioId: userId,
            consumibleId: consumibleTemplate.id,
            usos_maximos: consumibleTemplate.usos_maximos,
            usos_restantes: consumibleTemplate.usos_maximos,
          });
          await newConsumible.save({ session });
          consumiblesRecibidos.push(newConsumible._id);
        }
      }
    }

    // G) MARCAR PAQUETE COMO ABIERTO Y REGISTRAR RECOMPENSAS
    purchasedPackage.estado = 'abierto';
    purchasedPackage.fechaApertura = new Date();
    purchasedPackage.recompensasReclamadas = {
      valRecibido: packageTemplate.contenido.val,
      boletosRecibidos: packageTemplate.contenido.boletos,
      evoRecibido: packageTemplate.contenido.evo,
      personajesDesbloqueados,
      itemsRecibidos,
      consumiblesRecibidos,
      bonusAplicado: packageTemplate.contenido.bonusEspecial,
      fechaReclamacion: new Date(),
      historicoAuditoria: [
        {
          evento: 'PAQUETE_ABIERTO',
          timestamp: new Date(),
          detalles: {
            packageId: packageTemplate._id,
            recompensas: {
              val: packageTemplate.contenido.val,
              boletos: packageTemplate.contenido.boletos,
              evo: packageTemplate.contenido.evo,
              cantPersonajes: personajesDesbloqueados.length,
              cantItems: itemsRecibidos.length,
              cantConsumibles: consumiblesRecibidos.length
            }
          }
        }
      ]
    };
    await purchasedPackage.save({ session });

    // H) REGISTRAR EN ACTIVIDAD DEL USUARIO
    await Activity.create([{
      usuarioId: userId,
      tipo: 'package_opened',
      descripcion: `Abrió paquete ${packageTemplate.nombre}`,
      detalles: {
        packageId,
        recompensas: purchasedPackage.recompensasReclamadas
      }
    }], { session });

    // 9. COMMIT TRANSACCIÓN
    await session.commitTransaction();

    return {
      ok: true,
      rewards: {
        val: packageTemplate.contenido.val,
        boletos: packageTemplate.contenido.boletos,
        evo: packageTemplate.contenido.evo,
        personajes: packageTemplate.contenido.personajes,
        items: packageTemplate.contenido.items,
        consumibles: packageTemplate.contenido.consumibles
      },
      message: 'Paquete abierto exitosamente'
    };

  } catch (error) {
    // ROLLBACK EN CASO DE ERROR
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## 🛠️ Servicios

### ShopService Completo

```typescript
// shop.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = `${environment.apiUrl}/api/shop`;

  constructor(private http: HttpClient) {}

  // Obtener todos los paquetes
  getAllPackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/packages`, {
      withCredentials: true
    });
  }

  // Obtener paquetes por categoría
  getPackagesByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/packages/category/${category}`, {
      withCredentials: true
    });
  }

  // Obtener detalles de un paquete
  getPackageDetails(packageId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/packages/${packageId}`, {
      withCredentials: true
    });
  }

  // Comprar paquete
  purchasePackage(packageId: string, moneda: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/packages/purchase`, {
      packageId,
      moneda
    }, {
      withCredentials: true
    });
  }

  // Abrir paquete (CRITICAL: Asigna recompensas)
  openPackage(packageId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/packages/${packageId}/open`, {}, {
      withCredentials: true
    });
  }

  // Obtener mis paquetes
  getMyPackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-packages`, {
      withCredentials: true
    });
  }

  // Obtener historial de compras
  getPurchaseHistory(limit: number = 20): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/purchase-history`, {
      params: { limit: limit.toString() },
      withCredentials: true
    });
  }

  // Obtener detalles de compra
  getPurchaseDetails(transactionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/purchases/${transactionId}`, {
      withCredentials: true
    });
  }
}
```

---

## 📡 Endpoints Backend

### GET /api/shop/packages

```
GET /api/shop/packages
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439020",
      "nombre": "Paquete Iniciador",
      "descripcion": "Perfecto para comenzar tu aventura",
      "icono": "https://cdn.valgame.com/packages/starter.png",
      "precio": 100,
      "precioMoneda": "VAL",
      "categoria": "iniciador",
      "contenido": {
        "val": 500,
        "boletos": 5,
        "evo": 1,
        "personajes": ["base_warrior"],
        "items": [
          {
            "id": "item_001",
            "nombre": "Espada Iniciador",
            "cantidad": 1,
            "rareza": "común"
          }
        ]
      }
    }
  ]
}
```

### POST /api/shop/packages/purchase

```
POST /api/shop/packages/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageId": "507f1f77bcf86cd799439020",
  "moneda": "VAL"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "purchasedPackageId": "507f1f77bcf86cd799439021",
  "message": "Paquete comprado exitosamente",
  "transaction": {
    "id": "txn_507f1f77bcf86cd799439022",
    "estado": "completado"
  }
}
```

### POST /api/shop/packages/:packageId/open

```
POST /api/shop/packages/507f1f77bcf86cd799439021/open
Authorization: Bearer <token>
```

**Respuesta (200) - CRITICAL: Recompensas Asignadas**
```json
{
  "ok": true,
  "rewards": {
    "val": 500,
    "boletos": 5,
    "evo": 1,
    "personajes": ["base_warrior"],
    "items": [
      {
        "id": "user_item_001",
        "nombre": "Espada Iniciador",
        "cantidad": 1,
        "rareza": "común"
      }
    ],
    "consumibles": []
  },
  "message": "Paquete abierto - Recompensas asignadas",
  "historicoAuditoria": [
    {
      "evento": "PAQUETE_ABIERTO",
      "timestamp": "2025-11-24T15:30:00Z",
      "detalles": {
        "val": 500,
        "boletos": 5,
        "evo": 1
      }
    }
  ]
}
```

---

## 📊 Manejo de Errores

| Escenario | Código | Mensaje |
|-----------|--------|---------|
| Saldo insuficiente | 400 | No tienes suficientes recursos |
| Paquete no disponible | 404 | Paquete no encontrado |
| Ya fue abierto | 400 | Este paquete ya fue abierto |
| No cumple requisitos | 403 | No cumples requisitos (nivel) |
| Sin autenticación | 401 | No autorizado |
| Error servidor | 500 | Error interno |

---

## 🔄 Integración con Otros Documentos

- **Documento 01**: Paquete Pionero entregado en verificación email
- **Documento 03**: Dashboard muestra paquetes sin abrir
- **Documento 04**: Items y consumibles se agregan al inventario
- **Documento 06**: Items pueden ser vendidos en marketplace
- **Documento 07**: Combate otorga paquetes como recompensas

---

## 📚 Próximos Documentos

- **06-Marketplace-P2P.md** - Comercio entre jugadores
- **07-Combate-Mazmorras.md** - Sistema de combate y recompensas

---

**¿Preguntas o cambios?**  
Contacta al equipo de desarrollo de Valgame.
