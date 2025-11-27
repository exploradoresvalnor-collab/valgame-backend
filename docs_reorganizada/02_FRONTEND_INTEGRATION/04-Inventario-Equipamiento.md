# 🎒 Inventario y Equipamiento - Guía Completa

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Inventario, Equipamiento, Consumibles, Gestión de Items

---

## 📋 Tabla de Contenidos

1. [Arquitectura de Inventario](#arquitectura-de-inventario)
2. [Visualización del Inventario](#visualización-del-inventario)
3. [Equipamiento](#equipamiento)
4. [Consumibles](#consumibles)
5. [Gestión de Items](#gestión-de-items)
6. [Servicios](#servicios)
7. [Endpoints Backend](#endpoints-backend)
8. [Manejo de Errores](#manejo-de-errores)

---

## 🏗️ Arquitectura de Inventario

### Estructura de Datos

```typescript
// Inventario del Usuario
interface UserInventory {
  userId: string;
  equipamiento: Equipment[];      // Items equipados y en inventario
  consumibles: Consumible[];      // Pociones, buffs, etc
  capaMaxima: number;             // Máximo de slots (200)
  usados: number;                 // Slots utilizados
}

// Equipamiento (Armas, Armaduras, Accesorios)
interface Equipment {
  id: string;
  nombre: string;
  tipo: 'arma' | 'armadura' | 'accesorio' | 'joya';
  rareza: 'común' | 'raro' | 'épico' | 'legendario' | 'mítico';
  nivel: number;
  estadisticas: {
    ataque?: number;
    defensa?: number;
    vidaMaxima?: number;
    velocidad?: number;
    magia?: number;
  };
  bonusEspecial?: string;
  equippable: boolean;
  equippedOn?: string;            // ID del personaje que lo usa
  comprado: Date;
}

// Consumibles (Pociones, Buffs, etc)
interface Consumible {
  id: string;
  nombre: string;
  tipo: 'pocion' | 'buff' | 'elixir' | 'piedra';
  rareza: 'común' | 'raro' | 'épico';
  efecto: {
    tipo: 'curar' | 'buff' | 'resurrección';
    valor: number;
    duracion?: number;
  };
  usos_maximos: number;           // Usos totales disponibles
  usos_restantes: number;         // Usos actuales
  descripcion: string;
  icono: string;
}

// Item genérico
interface Item {
  id: string;
  nombre: string;
  tipo: 'equipamiento' | 'consumible';
  rareza: string;
  descripcion: string;
  valor_venta: number;
}
```

---

## 📦 Visualización del Inventario

### 1.1 InventoryComponent - TypeScript

```typescript
// inventory.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { InventoryService } from '../../services/inventory.service';

type InventoryTab = 'todo' | 'equipamiento' | 'consumibles';
type SortOption = 'nombre' | 'rareza' | 'fecha' | 'valor';

interface InventoryStats {
  totalItems: number;
  slotsUsados: number;
  slotsMaximos: number;
  espacioLibre: number;
  valorTotalInventario: number;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  // Observables
  loading$ = new BehaviorSubject<boolean>(true);
  inventory$!: Observable<any>;
  stats$!: Observable<InventoryStats>;

  // Controles
  activeTab$ = new BehaviorSubject<InventoryTab>('todo');
  searchControl = new FormControl('');
  sortControl = new FormControl<SortOption>('nombre');
  filterRareza = new FormControl('');

  // Opciones
  rarities = ['común', 'raro', 'épico', 'legendario', 'mítico'];
  sortOptions = [
    { value: 'nombre', label: 'Nombre (A-Z)' },
    { value: 'rareza', label: 'Rareza' },
    { value: 'fecha', label: 'Más Reciente' },
    { value: 'valor', label: 'Valor Venta' }
  ];

  selectedItem: any = null;
  selectedItemDetails: any = null;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  private loadInventory(): void {
    this.loading$.next(true);

    // Combinar datos con filtros
    this.inventory$ = combineLatest([
      this.inventoryService.getAllItems(),
      this.activeTab$,
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300)
      ),
      this.sortControl.valueChanges.pipe(startWith('nombre')),
      this.filterRareza.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([items, tab, search, sort, rareza]) => {
        let filtered = this.filterItemsByTab(items, tab);
        
        // Filtrar por búsqueda
        if (search) {
          filtered = filtered.filter(item =>
            item.nombre.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Filtrar por rareza
        if (rareza) {
          filtered = filtered.filter(item => item.rareza === rareza);
        }

        // Ordenar
        filtered = this.sortItems(filtered, sort);

        return filtered;
      })
    );

    // Estadísticas
    this.stats$ = this.inventoryService.getAllItems().pipe(
      map(items => ({
        totalItems: items.length,
        slotsUsados: items.reduce((acc, item) => acc + (item.slots || 1), 0),
        slotsMaximos: 200,
        espacioLibre: 200 - items.reduce((acc, item) => acc + (item.slots || 1), 0),
        valorTotalInventario: items.reduce((acc, item) => acc + (item.valor_venta || 0), 0)
      }))
    );

    this.loading$.next(false);
  }

  private filterItemsByTab(items: any[], tab: InventoryTab): any[] {
    if (tab === 'equipamiento') {
      return items.filter(item => item.tipo === 'equipamiento');
    }
    if (tab === 'consumibles') {
      return items.filter(item => item.tipo === 'consumible');
    }
    return items;
  }

  private sortItems(items: any[], sort: SortOption): any[] {
    const sorted = [...items];
    
    switch (sort) {
      case 'nombre':
        return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'rareza':
        const rarezaOrder = { 'común': 1, 'raro': 2, 'épico': 3, 'legendario': 4, 'mítico': 5 };
        return sorted.sort((a, b) => (rarezaOrder[b.rareza] || 0) - (rarezaOrder[a.rareza] || 0));
      case 'fecha':
        return sorted.sort((a, b) => new Date(b.comprado).getTime() - new Date(a.comprado).getTime());
      case 'valor':
        return sorted.sort((a, b) => (b.valor_venta || 0) - (a.valor_venta || 0));
      default:
        return sorted;
    }
  }

  selectItem(item: any): void {
    this.selectedItem = item;
    this.inventoryService.getItemDetails(item.id).subscribe(
      details => {
        this.selectedItemDetails = details;
      }
    );
  }

  closeItemDetails(): void {
    this.selectedItem = null;
    this.selectedItemDetails = null;
  }

  useConsumable(itemId: string): void {
    this.inventoryService.useConsumable(itemId).subscribe({
      next: () => {
        this.loadInventory();
        alert('Consumible utilizado');
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }

  equipItem(itemId: string, characterId: string): void {
    this.inventoryService.equipItem(itemId, characterId).subscribe({
      next: () => {
        this.loadInventory();
        alert('Item equipado');
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }

  unequipItem(itemId: string): void {
    this.inventoryService.unequipItem(itemId).subscribe({
      next: () => {
        this.loadInventory();
        alert('Item desequipado');
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }

  sellItem(itemId: string): void {
    if (confirm('¿Vender este item?')) {
      this.inventoryService.sellItem(itemId).subscribe({
        next: (response) => {
          this.loadInventory();
          alert(`Vendido por ${response.valorVenta} VAL`);
        },
        error: (error) => {
          alert('Error: ' + error.message);
        }
      });
    }
  }

  getRarezaColor(rareza: string): string {
    const colors: { [key: string]: string } = {
      'común': '#808080',
      'raro': '#0066ff',
      'épico': '#9933ff',
      'legendario': '#ffaa00',
      'mítico': '#ff0000'
    };
    return colors[rareza] || '#ffffff';
  }

  trackByItemId(index: number, item: any): string {
    return item.id;
  }
}
```

### 1.2 InventoryComponent - HTML Template

```html
<!-- inventory.component.html -->
<div class="inventory-container">
  
  <!-- HEADER -->
  <div class="inventory-header">
    <h1>🎒 Inventario</h1>
  </div>

  <!-- ESTADÍSTICAS -->
  <div class="inventory-stats" *ngIf="stats$ | async as stats">
    <div class="stat-card">
      <span class="stat-label">Slots Usados</span>
      <span class="stat-value">{{ stats.slotsUsados }}/{{ stats.slotsMaximos }}</span>
      <div class="stat-bar">
        <div class="stat-fill" [style.width]="(stats.slotsUsados / stats.slotsMaximos * 100) + '%'"></div>
      </div>
    </div>

    <div class="stat-card">
      <span class="stat-label">Total de Items</span>
      <span class="stat-value">{{ stats.totalItems }}</span>
    </div>

    <div class="stat-card">
      <span class="stat-label">Valor Total</span>
      <span class="stat-value">💰 {{ stats.valorTotalInventario | number }}</span>
    </div>

    <div class="stat-card">
      <span class="stat-label">Espacio Libre</span>
      <span class="stat-value">{{ stats.espacioLibre }}</span>
    </div>
  </div>

  <!-- CONTROLES DE FILTRO Y BÚSQUEDA -->
  <div class="inventory-controls">
    <!-- TABS -->
    <div class="tabs">
      <button
        *ngFor="let tab of ['todo', 'equipamiento', 'consumibles']"
        class="tab-button"
        [class.active]="(activeTab$ | async) === tab"
        (click)="activeTab$.next(tab as InventoryTab)"
      >
        {{ tab === 'todo' ? '📦 Todo' : tab === 'equipamiento' ? '⚔️ Equipamiento' : '🧪 Consumibles' }}
      </button>
    </div>

    <!-- BÚSQUEDA -->
    <div class="search-box">
      <input
        type="text"
        [formControl]="searchControl"
        placeholder="🔍 Buscar item..."
        class="search-input"
      />
    </div>

    <!-- FILTROS -->
    <div class="filters">
      <!-- Filtro por Rareza -->
      <select [formControl]="filterRareza" class="filter-select">
        <option value="">Todas las Rarezas</option>
        <option *ngFor="let rarity of rarities" [value]="rarity">
          {{ rarity | titlecase }}
        </option>
      </select>

      <!-- Ordenar -->
      <select [formControl]="sortControl" class="filter-select">
        <option *ngFor="let option of sortOptions" [value]="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>

  <!-- LOADING -->
  <div *ngIf="loading$ | async" class="loading-section">
    <div class="spinner"></div>
    <p>Cargando inventario...</p>
  </div>

  <!-- LISTA DE ITEMS -->
  <div class="inventory-grid" *ngIf="!(loading$ | async) && (inventory$ | async) as items">
    <ng-container *ngIf="items.length > 0; else noItems">
      <div
        *ngFor="let item of items; trackBy: trackByItemId"
        class="inventory-item"
        [style.border-color]="getRarezaColor(item.rareza)"
        (click)="selectItem(item)"
      >
        <!-- IMAGEN -->
        <div class="item-image">
          <img [src]="item.icono" [alt]="item.nombre" />
          <span class="rareza-badge" [style.background]="getRarezaColor(item.rareza)">
            {{ item.rareza | uppercase }}
          </span>
        </div>

        <!-- INFO -->
        <div class="item-info">
          <h4>{{ item.nombre }}</h4>
          <p class="item-type">{{ item.tipo | titlecase }}</p>
          
          <!-- Consumibles: mostrar usos -->
          <ng-container *ngIf="item.tipo === 'consumible'">
            <p class="item-uses">
              Usos: {{ item.usos_restantes }}/{{ item.usos_maximos }}
            </p>
          </ng-container>

          <!-- Equipamiento: mostrar estadísticas -->
          <ng-container *ngIf="item.tipo === 'equipamiento'">
            <div class="item-stats">
              <span *ngIf="item.estadisticas?.ataque">⚔️ {{ item.estadisticas.ataque }}</span>
              <span *ngIf="item.estadisticas?.defensa">🛡️ {{ item.estadisticas.defensa }}</span>
              <span *ngIf="item.estadisticas?.vidaMaxima">❤️ {{ item.estadisticas.vidaMaxima }}</span>
            </div>
          </ng-container>

          <p class="item-value">Vender: 💰 {{ item.valor_venta | number }}</p>
        </div>

        <!-- ACCIONES -->
        <div class="item-actions">
          <ng-container *ngIf="item.tipo === 'consumible'">
            <button
              class="btn-small btn-use"
              (click)="useConsumable(item.id); $event.stopPropagation()"
              [disabled]="item.usos_restantes === 0"
            >
              Usar
            </button>
          </ng-container>

          <ng-container *ngIf="item.tipo === 'equipamiento'">
            <button
              *ngIf="!item.equippedOn"
              class="btn-small btn-equip"
              (click)="equipItem(item.id, 'characterId'); $event.stopPropagation()"
            >
              Equipar
            </button>
            <button
              *ngIf="item.equippedOn"
              class="btn-small btn-unequip"
              (click)="unequipItem(item.id); $event.stopPropagation()"
            >
              Desequipar
            </button>
          </ng-container>

          <button
            class="btn-small btn-sell"
            (click)="sellItem(item.id); $event.stopPropagation()"
          >
            Vender
          </button>
        </div>
      </div>
    </ng-container>

    <ng-template #noItems>
      <div class="no-items">
        <p>📭 No tienes items en esta categoría</p>
      </div>
    </ng-template>
  </div>

  <!-- DETALLES DEL ITEM SELECCIONADO -->
  <div *ngIf="selectedItem && selectedItemDetails" class="item-details-modal">
    <div class="modal-overlay" (click)="closeItemDetails()"></div>
    <div class="modal-content">
      <button class="btn-close" (click)="closeItemDetails()">✕</button>

      <div class="details-header">
        <img [src]="selectedItem.icono" [alt]="selectedItem.nombre" />
        <div class="details-title">
          <h2>{{ selectedItem.nombre }}</h2>
          <p class="rareza" [style.color]="getRarezaColor(selectedItem.rareza)">
            ★ {{ selectedItem.rareza | uppercase }}
          </p>
        </div>
      </div>

      <div class="details-body">
        <p class="description">{{ selectedItem.descripcion }}</p>

        <!-- Estadísticas para equipamiento -->
        <ng-container *ngIf="selectedItem.tipo === 'equipamiento'">
          <h4>Estadísticas</h4>
          <div class="stats-list">
            <div *ngIf="selectedItem.estadisticas?.ataque" class="stat-row">
              <span>⚔️ Ataque:</span>
              <strong>+{{ selectedItem.estadisticas.ataque }}</strong>
            </div>
            <div *ngIf="selectedItem.estadisticas?.defensa" class="stat-row">
              <span>🛡️ Defensa:</span>
              <strong>+{{ selectedItem.estadisticas.defensa }}</strong>
            </div>
            <div *ngIf="selectedItem.estadisticas?.vidaMaxima" class="stat-row">
              <span>❤️ Vida Máxima:</span>
              <strong>+{{ selectedItem.estadisticas.vidaMaxima }}</strong>
            </div>
          </div>
        </ng-container>

        <!-- Información de venta -->
        <div class="sale-info">
          <p><strong>Valor de Venta:</strong> 💰 {{ selectedItem.valor_venta | number }}</p>
        </div>
      </div>

      <div class="details-footer">
        <button class="btn-primary" (click)="closeItemDetails()">Cerrar</button>
      </div>
    </div>
  </div>

</div>
```

---

## ⚔️ Equipamiento

### 2.1 EquipmentComponent - TypeScript

```typescript
// equipment.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { InventoryService } from '../../services/inventory.service';

interface EquipmentSlot {
  slot: 'arma' | 'armadura' | 'casco' | 'guantes' | 'botas' | 'joya1' | 'joya2';
  nombre: string;
  item?: any;
}

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  equipment$!: Observable<any>;
  equipmentSlots: EquipmentSlot[] = [
    { slot: 'arma', nombre: '⚔️ Arma' },
    { slot: 'armadura', nombre: '🛡️ Armadura' },
    { slot: 'casco', nombre: '👑 Casco' },
    { slot: 'guantes', nombre: '🧤 Guantes' },
    { slot: 'botas', nombre: '👞 Botas' },
    { slot: 'joya1', nombre: '💎 Joya 1' },
    { slot: 'joya2', nombre: '💎 Joya 2' }
  ];

  totalStats = {
    ataque: 0,
    defensa: 0,
    vidaMaxima: 0,
    velocidad: 0,
    magia: 0
  };

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadEquipment();
  }

  private loadEquipment(): void {
    this.equipment$ = this.inventoryService.getEquipment();
    this.equipment$.subscribe(equipment => {
      this.calculateTotalStats(equipment);
      this.loading$.next(false);
    });
  }

  private calculateTotalStats(equipment: any[]): void {
    this.totalStats = {
      ataque: 0,
      defensa: 0,
      vidaMaxima: 0,
      velocidad: 0,
      magia: 0
    };

    equipment.forEach(item => {
      if (item.equippedOn && item.estadisticas) {
        this.totalStats.ataque += item.estadisticas.ataque || 0;
        this.totalStats.defensa += item.estadisticas.defensa || 0;
        this.totalStats.vidaMaxima += item.estadisticas.vidaMaxima || 0;
        this.totalStats.velocidad += item.estadisticas.velocidad || 0;
        this.totalStats.magia += item.estadisticas.magia || 0;
      }
    });
  }

  unequipItem(itemId: string): void {
    this.inventoryService.unequipItem(itemId).subscribe({
      next: () => {
        this.loadEquipment();
        alert('Item desequipado');
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }
}
```

### 2.2 EquipmentComponent - HTML Template

```html
<!-- equipment.component.html -->
<div class="equipment-container">
  
  <h2>⚔️ Equipamiento Actual</h2>

  <div class="equipment-grid" *ngIf="equipment$ | async as equipment">
    <!-- SLOTS DE EQUIPAMIENTO -->
    <div class="equipment-slots">
      <div
        *ngFor="let slot of equipmentSlots"
        class="equipment-slot"
        [class.equipped]="equipment | hasEquippedInSlot: slot.slot"
      >
        <div class="slot-header">{{ slot.nombre }}</div>
        
        <ng-container *ngIf="equipment | getEquippedInSlot: slot.slot as item">
          <div class="equipped-item" *ngIf="item">
            <img [src]="item.icono" [alt]="item.nombre" />
            <p class="item-name">{{ item.nombre }}</p>
            <button class="btn-small" (click)="unequipItem(item.id)">Quitar</button>
          </div>
        </ng-container>

        <div class="empty-slot" *ngIf="!(equipment | getEquippedInSlot: slot.slot)">
          Vacío
        </div>
      </div>
    </div>

    <!-- ESTADÍSTICAS TOTALES -->
    <div class="total-stats">
      <h3>📊 Estadísticas Totales</h3>
      <div class="stats-grid">
        <div class="stat">
          <span>⚔️ Ataque</span>
          <strong>{{ totalStats.ataque }}</strong>
        </div>
        <div class="stat">
          <span>🛡️ Defensa</span>
          <strong>{{ totalStats.defensa }}</strong>
        </div>
        <div class="stat">
          <span>❤️ Vida</span>
          <strong>+{{ totalStats.vidaMaxima }}</strong>
        </div>
        <div class="stat">
          <span>⚡ Velocidad</span>
          <strong>+{{ totalStats.velocidad }}</strong>
        </div>
        <div class="stat">
          <span>🔮 Magia</span>
          <strong>+{{ totalStats.magia }}</strong>
        </div>
      </div>
    </div>
  </div>

</div>
```

---

## 🧪 Consumibles

### 3.1 ConsumablesComponent - TypeScript

```typescript
// consumables.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-consumables',
  templateUrl: './consumables.component.html',
  styleUrls: ['./consumables.component.scss']
})
export class ConsumablesComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  consumables$!: Observable<any[]>;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadConsumables();
  }

  private loadConsumables(): void {
    this.consumables$ = this.inventoryService.getConsumables();
    this.consumables$.subscribe(() => {
      this.loading$.next(false);
    });
  }

  useConsumable(itemId: string): void {
    this.inventoryService.useConsumable(itemId).subscribe({
      next: () => {
        this.loadConsumables();
        alert('Consumible utilizado');
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }

  getEffectIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'curar': '❤️',
      'buff': '⚡',
      'resurrección': '✨'
    };
    return icons[tipo] || '💊';
  }
}
```

### 3.2 ConsumablesComponent - HTML Template

```html
<!-- consumables.component.html -->
<div class="consumables-container">
  
  <h2>🧪 Consumibles</h2>

  <div class="consumables-grid" *ngIf="consumables$ | async as consumibles">
    <ng-container *ngIf="consumibles.length > 0; else noConsumables">
      <div *ngFor="let item of consumibles" class="consumable-card">
        <div class="consumable-image">
          <img [src]="item.icono" [alt]="item.nombre" />
        </div>

        <div class="consumable-info">
          <h4>{{ item.nombre }}</h4>
          <p class="effect">
            {{ getEffectIcon(item.efecto.tipo) }} {{ item.efecto.tipo | titlecase }}: {{ item.efecto.valor }}
          </p>
          <p class="uses">
            Usos: <strong>{{ item.usos_restantes }}/{{ item.usos_maximos }}</strong>
          </p>
          <p class="description">{{ item.descripcion }}</p>
        </div>

        <div class="consumable-actions">
          <button
            class="btn-primary"
            (click)="useConsumable(item.id)"
            [disabled]="item.usos_restantes === 0"
          >
            Usar
          </button>
          <p class="value">Vender: 💰 {{ item.valor_venta }}</p>
        </div>
      </div>
    </ng-container>

    <ng-template #noConsumables>
      <p class="no-items">📭 No tienes consumibles</p>
    </ng-template>
  </div>

</div>
```

---

## 🔧 Gestión de Items

### Vender Items

```typescript
sellItem(itemId: string): void {
  this.inventoryService.sellItem(itemId).subscribe({
    next: (response) => {
      this.loadInventory();
      alert(`Vendido por ${response.valorVenta} VAL`);
    },
    error: (error) => {
      alert('Error: ' + error.message);
    }
  });
}
```

### Descartar Items

```typescript
discardItem(itemId: string): void {
  if (confirm('¿Descartar este item permanentemente?')) {
    this.inventoryService.discardItem(itemId).subscribe({
      next: () => {
        this.loadInventory();
        alert('Item descartado');
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }
}
```

### Comparar Items

```typescript
compareItems(itemId1: string, itemId2: string): void {
  this.inventoryService.compareItems(itemId1, itemId2).subscribe({
    next: (comparison) => {
      console.log(comparison);
      // Mostrar modal de comparación
    }
  });
}
```

---

## 🛠️ Servicios

### InventoryService Completo

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

  // Obtener detalles de un item
  getItemDetails(itemId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/items/${itemId}`, {
      withCredentials: true
    });
  }

  // Obtener conteo de items
  getInventoryCounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/counts`, {
      withCredentials: true
    });
  }

  // Equipar item
  equipItem(itemId: string, characterId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/items/${itemId}/equip`, {
      characterId
    }, {
      withCredentials: true
    });
  }

  // Desequipar item
  unequipItem(itemId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/items/${itemId}/unequip`, {}, {
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

  // Descartar item
  discardItem(itemId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/items/${itemId}/discard`, {}, {
      withCredentials: true
    });
  }

  // Comparar dos items
  compareItems(itemId1: string, itemId2: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/items/compare`, {
      params: {
        item1: itemId1,
        item2: itemId2
      },
      withCredentials: true
    });
  }

  // Mover item (reorganizar)
  moveItem(itemId: string, position: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/items/${itemId}/move`, {
      position
    }, {
      withCredentials: true
    });
  }

  // Obtener items filtrando por rareza
  getItemsByRarity(rareza: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/filter/rarity/${rareza}`, {
      withCredentials: true
    });
  }

  // Obtener items filtrando por tipo
  getItemsByType(tipo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/filter/type/${tipo}`, {
      withCredentials: true
    });
  }
}
```

---

## 📡 Endpoints Backend

### GET /api/inventory

```
GET /api/inventory
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439015",
      "nombre": "Espada Legendaria",
      "tipo": "equipamiento",
      "rareza": "legendario",
      "estadisticas": {
        "ataque": 45,
        "defensa": 10
      },
      "valor_venta": 5000,
      "equippedOn": "507f1f77bcf86cd799439012",
      "comprado": "2025-11-20T10:00:00Z"
    }
  ]
}
```

### GET /api/inventory/equipment

```
GET /api/inventory/equipment
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439015",
      "nombre": "Espada Legendaria",
      "tipo": "equipamiento",
      "rareza": "legendario",
      "estadisticas": {
        "ataque": 45,
        "defensa": 10,
        "vidaMaxima": 20
      },
      "equippedOn": "507f1f77bcf86cd799439012"
    }
  ]
}
```

### GET /api/inventory/consumables

```
GET /api/inventory/consumables
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439016",
      "nombre": "Poción de Curación",
      "tipo": "consumible",
      "rareza": "común",
      "efecto": {
        "tipo": "curar",
        "valor": 50
      },
      "usos_maximos": 3,
      "usos_restantes": 2,
      "descripcion": "Cura 50 puntos de vida",
      "icono": "https://cdn.valgame.com/items/potion.png"
    }
  ]
}
```

### POST /api/inventory/items/:itemId/equip

```
POST /api/inventory/items/507f1f77bcf86cd799439015/equip
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
  "message": "Item equipado correctamente"
}
```

### POST /api/inventory/items/:itemId/sell

```
POST /api/inventory/items/507f1f77bcf86cd799439015/sell
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "valorVenta": 5000,
  "message": "Item vendido por 5000 VAL"
}
```

### POST /api/inventory/consumables/:itemId/use

```
POST /api/inventory/consumables/507f1f77bcf86cd799439016/use
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "message": "Consumible utilizado",
  "effectApplied": {
    "tipo": "curar",
    "valor": 50
  },
  "usosRestantes": 1
}
```

---

## 📊 Manejo de Errores

| Escenario | Código | Mensaje |
|-----------|--------|---------|
| Item no encontrado | 404 | Item no existe |
| Inventario lleno | 400 | No hay espacio suficiente |
| Item no equipable | 400 | Este item no puede ser equipado |
| Sin usos restantes | 400 | Este consumible no tiene usos |
| Item no vendible | 400 | Este item no puede ser vendido |
| Sin autenticación | 401 | No autorizado |
| Error servidor | 500 | Error interno |

---

## 📚 Próximos Documentos

- **05-Tienda-Paquetes.md** - Compra y apertura de paquetes
- **06-Marketplace-P2P.md** - Comercio entre jugadores

---

**¿Preguntas o cambios?**  
Contacta al equipo de desarrollo de Valgame.
