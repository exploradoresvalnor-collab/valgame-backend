# 🏪 Marketplace P2P - Guía Completa

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Marketplace P2P, Listados, Compra/Venta, Historial de Transacciones, Sistema de Comisiones

---

## 📋 Tabla de Contenidos

1. [Arquitectura del Marketplace](#arquitectura-del-marketplace)
2. [Listado de Items](#listado-de-items)
3. [Compra de Items](#compra-de-items)
4. [Historial de Transacciones](#historial-de-transacciones)
5. [Sistema de Comisiones](#sistema-de-comisiones)
6. [Servicios](#servicios)
7. [Endpoints Backend](#endpoints-backend)
8. [Manejo de Errores](#manejo-de-errores)

---

## 🏗️ Arquitectura del Marketplace

### Estructura de Datos

```typescript
// Listado en el Marketplace
interface Listing {
  id: string;
  sellerId: string;                 // ID del vendedor
  sellerName: string;               // Nombre del vendedor
  itemId: string;                   // ID del item
  itemName: string;
  itemRareza: string;
  itemDescription: string;
  itemIcon: string;
  precio: number;                   // Precio en VAL
  precioFinal: number;              // Precio después de comisiones
  cantidad: number;                 // Cantidad disponible
  cantidadVendida: number;          // Items vendidos
  estado: 'activo' | 'agotado' | 'cancelado' | 'expirado';
  createdAt: Date;
  expiresAt: Date;                  // Expira en 30 días
  ultimaOferta?: Date;              // Última vez que alguien intentó comprar
  estadisticas?: {
    totalVisualizaciones: number;
    totalOfertas: number;
    tasaExito: number;
  };
}

// Transacción de compra/venta
interface MarketplaceTransaction {
  id: string;
  listingId: string;
  buyerId: string;                  // Comprador
  buyerName: string;
  sellerId: string;                 // Vendedor
  sellerName: string;
  itemId: string;
  itemName: string;
  precioUnitario: number;
  cantidad: number;
  precioTotal: number;
  comision: number;                 // 5% VAL tax
  valorAlVendedor: number;          // Precio - Comisión
  estado: 'pendiente' | 'completado' | 'cancelado' | 'rechazado';
  metodoPago: 'VAL' | 'BOLETOS';
  createdAt: Date;
  completedAt?: Date;
  razonCancelacion?: string;
}

// Oferta temporal (buyer puede hacer oferta antes de comprar)
interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  precioOfrecido: number;
  cantidad: number;
  mensaje?: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada';
  createdAt: Date;
  expiresAt: Date;                  // Expira en 24 horas
}

// Historial del marketplace para un usuario
interface UserMarketplaceHistory {
  usuarioId: string;
  comprasRealizadas: MarketplaceTransaction[];
  ventasRealizadas: MarketplaceTransaction[];
  listadosActivos: Listing[];
  ofertasEnviadas: Offer[];
  ofertasRecibidas: Offer[];
  estadisticas: {
    totalCompras: number;
    totalVentas: number;
    dineroGastado: number;
    dineroGanado: number;
    calificacionPromedio: number;
    transaccionesExitosas: number;
    transaccionesCanceladas: number;
  };
}
```

---

## 📤 Listado de Items

### 1.1 MarketplaceListComponent - TypeScript

```typescript
// marketplace-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MarketplaceService } from '../../services/marketplace.service';

type SortOption = 'precio_asc' | 'precio_desc' | 'reciente' | 'populares';
type FilterRareza = '' | 'común' | 'raro' | 'épico' | 'legendario' | 'mítico';

interface MarketplaceFilters {
  search: string;
  rareza: FilterRareza;
  precioMin: number;
  precioMax: number;
  sort: SortOption;
  estado: 'activo' | 'todos';
}

@Component({
  selector: 'app-marketplace-list',
  templateUrl: './marketplace-list.component.html',
  styleUrls: ['./marketplace-list.component.scss']
})
export class MarketplaceListComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  listings$!: Observable<any[]>;

  // Filtros
  searchControl = new FormControl('');
  rarezaControl = new FormControl<FilterRareza>('');
  precioMinControl = new FormControl(0);
  precioMaxControl = new FormControl(100000);
  sortControl = new FormControl<SortOption>('reciente');

  rarities: FilterRareza[] = ['', 'común', 'raro', 'épico', 'legendario', 'mítico'];
  sortOptions = [
    { value: 'precio_asc', label: 'Precio: Menor a Mayor' },
    { value: 'precio_desc', label: 'Precio: Mayor a Menor' },
    { value: 'reciente', label: 'Más Reciente' },
    { value: 'populares', label: 'Más Popular' }
  ];

  selectedListing: any = null;
  showDetails = false;

  constructor(private marketplaceService: MarketplaceService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  private loadListings(): void {
    this.listings$ = combineLatest([
      this.marketplaceService.getAllListings(),
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300)
      ),
      this.rarezaControl.valueChanges.pipe(startWith('')),
      this.precioMinControl.valueChanges.pipe(startWith(0)),
      this.precioMaxControl.valueChanges.pipe(startWith(100000)),
      this.sortControl.valueChanges.pipe(startWith('reciente'))
    ]).pipe(
      map(([listings, search, rareza, min, max, sort]) => {
        let filtered = listings.filter(l => l.estado === 'activo');

        // Búsqueda
        if (search) {
          filtered = filtered.filter(l =>
            l.itemName.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Rareza
        if (rareza) {
          filtered = filtered.filter(l => l.itemRareza === rareza);
        }

        // Precio
        filtered = filtered.filter(l => l.precio >= min && l.precio <= max);

        // Ordenar
        filtered = this.sortListings(filtered, sort);

        return filtered;
      })
    );

    this.listings$.subscribe(() => this.loading$.next(false));
  }

  private sortListings(listings: any[], sort: SortOption): any[] {
    const sorted = [...listings];

    switch (sort) {
      case 'precio_asc':
        return sorted.sort((a, b) => a.precio - b.precio);
      case 'precio_desc':
        return sorted.sort((a, b) => b.precio - a.precio);
      case 'reciente':
        return sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'populares':
        return sorted.sort((a, b) =>
          (b.estadisticas?.totalOfertas || 0) - (a.estadisticas?.totalOfertas || 0)
        );
      default:
        return sorted;
    }
  }

  selectListing(listing: any): void {
    this.selectedListing = listing;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedListing = null;
  }

  buyItem(listing: any): void {
    if (confirm(`¿Comprar ${listing.itemName} por ${listing.precio} VAL?`)) {
      this.marketplaceService.buyItem(listing.id, 1).subscribe({
        next: (response) => {
          alert('¡Compra exitosa!');
          this.loadListings();
          this.closeDetails();
        },
        error: (error) => {
          alert('Error: ' + error.message);
        }
      });
    }
  }

  makeOffer(listing: any): void {
    const precioOfrecido = prompt(`Ofrece por ${listing.itemName}:`, listing.precio.toString());
    if (precioOfrecido) {
      this.marketplaceService.makeOffer(listing.id, parseInt(precioOfrecido)).subscribe({
        next: () => {
          alert('Oferta enviada');
          this.closeDetails();
        },
        error: (error) => {
          alert('Error: ' + error.message);
        }
      });
    }
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

  getComisionsInfo(precio: number): { comision: number; alVendedor: number } {
    const comision = Math.floor(precio * 0.05); // 5%
    return {
      comision,
      alVendedor: precio - comision
    };
  }

  trackByListingId(index: number, listing: any): string {
    return listing.id;
  }
}
```

### 1.2 MarketplaceListComponent - HTML Template

```html
<!-- marketplace-list.component.html -->
<div class="marketplace-container">
  
  <!-- HEADER -->
  <div class="marketplace-header">
    <h1>🏪 Marketplace P2P</h1>
    <p>Compra y vende items con otros jugadores</p>
  </div>

  <!-- CONTROLES DE FILTRO -->
  <div class="marketplace-controls">
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
    <div class="filters-row">
      <!-- Rareza -->
      <select [formControl]="rarezaControl" class="filter-select">
        <option value="">Todas las Rarezas</option>
        <option *ngFor="let r of rarities" [value]="r" *ngIf="r">
          {{ r | titlecase }}
        </option>
      </select>

      <!-- Rango de Precio -->
      <div class="price-range">
        <label>Precio Min:</label>
        <input
          type="number"
          [formControl]="precioMinControl"
          class="input-small"
        />
      </div>

      <div class="price-range">
        <label>Precio Max:</label>
        <input
          type="number"
          [formControl]="precioMaxControl"
          class="input-small"
        />
      </div>

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
    <p>Cargando marketplace...</p>
  </div>

  <!-- LISTADOS DISPONIBLES -->
  <div class="listings-grid" *ngIf="!(loading$ | async) && (listings$ | async) as listings">
    <ng-container *ngIf="listings.length > 0; else noListings">
      <div
        *ngFor="let listing of listings; trackBy: trackByListingId"
        class="listing-card"
        [style.border-color]="getRarityColor(listing.itemRareza)"
        (click)="selectListing(listing)"
      >
        <!-- IMAGEN -->
        <div class="listing-image">
          <img [src]="listing.itemIcon" [alt]="listing.itemName" />
          <span class="rareza-badge" [style.background]="getRarityColor(listing.itemRareza)">
            {{ listing.itemRareza | uppercase }}
          </span>
        </div>

        <!-- INFO -->
        <div class="listing-info">
          <h4>{{ listing.itemName }}</h4>
          <p class="seller">Vendedor: <strong>{{ listing.sellerName }}</strong></p>
          
          <!-- Disponibilidad -->
          <p class="availability">
            Disponible: <strong>{{ listing.cantidad - listing.cantidadVendida }}/{{ listing.cantidad }}</strong>
          </p>

          <!-- Precio -->
          <div class="price-section">
            <p class="price">💰 {{ listing.precio | number }} VAL</p>
            <p class="commission-info">
              Comisión: {{ getComisionsInfo(listing.precio).comision }} VAL
            </p>
          </div>

          <!-- Botones -->
          <div class="listing-actions">
            <button class="btn-primary btn-buy" (click)="buyItem(listing); $event.stopPropagation()">
              🛒 Comprar
            </button>
            <button class="btn-secondary btn-offer" (click)="makeOffer(listing); $event.stopPropagation()">
              💬 Oferta
            </button>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #noListings>
      <p class="no-listings">📭 No hay listados disponibles</p>
    </ng-template>
  </div>

  <!-- MODAL DE DETALLES -->
  <div *ngIf="showDetails && selectedListing" class="details-modal">
    <div class="modal-overlay" (click)="closeDetails()"></div>
    <div class="modal-content">
      <button class="btn-close" (click)="closeDetails()">✕</button>

      <div class="details-header">
        <img [src]="selectedListing.itemIcon" [alt]="selectedListing.itemName" />
        <h2>{{ selectedListing.itemName }}</h2>
        <p class="rareza" [style.color]="getRarityColor(selectedListing.itemRareza)">
          ★ {{ selectedListing.itemRareza | uppercase }}
        </p>
      </div>

      <div class="details-body">
        <p class="description">{{ selectedListing.itemDescription }}</p>

        <!-- Info del Vendedor -->
        <div class="seller-info">
          <h3>👤 Vendedor</h3>
          <p><strong>{{ selectedListing.sellerName }}</strong></p>
          <p>Transacciones exitosas: {{ selectedListing.vendedor?.transaccionesExitosas || 0 }}</p>
        </div>

        <!-- Información del Listado -->
        <div class="listing-info-details">
          <div class="info-row">
            <span>Disponibilidad:</span>
            <strong>{{ selectedListing.cantidad - selectedListing.cantidadVendida }}/{{ selectedListing.cantidad }}</strong>
          </div>
          <div class="info-row">
            <span>Precio Unitario:</span>
            <strong>{{ selectedListing.precio | number }} VAL</strong>
          </div>
          <div class="info-row">
            <span>Comisión (5%):</span>
            <strong>{{ getComisionsInfo(selectedListing.precio).comision }} VAL</strong>
          </div>
          <div class="info-row highlight">
            <span>Precio Final:</span>
            <strong>{{ selectedListing.precioFinal | number }} VAL</strong>
          </div>
          <div class="info-row">
            <span>Publicado:</span>
            <strong>{{ selectedListing.createdAt | date:'short' }}</strong>
          </div>
          <div class="info-row">
            <span>Expira:</span>
            <strong>{{ selectedListing.expiresAt | date:'short' }}</strong>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="statistics">
          <h3>📊 Estadísticas</h3>
          <div class="stats-row">
            <span>👁️ Vistas:</span>
            <strong>{{ selectedListing.estadisticas?.totalVisualizaciones || 0 }}</strong>
          </div>
          <div class="stats-row">
            <span>💬 Ofertas:</span>
            <strong>{{ selectedListing.estadisticas?.totalOfertas || 0 }}</strong>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-primary" (click)="buyItem(selectedListing)">
          🛒 Comprar Ahora
        </button>
        <button class="btn-secondary" (click)="makeOffer(selectedListing)">
          💬 Hacer Oferta
        </button>
        <button class="btn-outline" (click)="closeDetails()">
          Cerrar
        </button>
      </div>
    </div>
  </div>

</div>
```

---

## 📥 Compra de Items

### 2.1 Flujo de Compra (Backend - CRÍTICO)

```typescript
// PSEUDOCÓDIGO - BACKEND: marketplace.controller.ts

async buyItem(buyerId: string, listingId: string, cantidad: number) {
  // 1. Validar que el listado existe y está activo
  const listing = await Listing.findById(listingId);
  if (!listing || listing.estado !== 'activo') {
    throw new Error('Listado no disponible');
  }

  // 2. Validar disponibilidad
  const disponible = listing.cantidad - listing.cantidadVendida;
  if (disponible < cantidad) {
    throw new Error('No hay suficiente stock');
  }

  // 3. Validar que no está comprando su propio item
  const buyer = await User.findById(buyerId);
  if (listing.sellerId === buyerId) {
    throw new Error('No puedes comprar tu propio item');
  }

  // 4. Calcular precios
  const precioUnitario = listing.precio;
  const precioTotal = precioUnitario * cantidad;
  const comision = Math.floor(precioTotal * 0.05);  // 5% comisión
  const valorAlVendedor = precioTotal - comision;

  // 5. Validar que buyer tiene suficiente VAL
  if (buyer.valBalance < precioTotal) {
    throw new Error('No tienes suficiente VAL');
  }

  // 6. INICIAR TRANSACCIÓN ATÓMICA
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 7. DÉBITO AL COMPRADOR
    await User.updateOne(
      { _id: buyerId },
      { $inc: { valBalance: -precioTotal } },
      { session }
    );

    // 8. CRÉDITO AL VENDEDOR (sin comisión)
    await User.updateOne(
      { _id: listing.sellerId },
      { $inc: { valBalance: valorAlVendedor } },
      { session }
    );

    // 9. TRANSFERENCIA DE ITEMS AL COMPRADOR
    const seller = await User.findById(listing.sellerId).session(session);
    const equipoVendedor = seller.inventarioEquipamiento;

    for (let i = 0; i < cantidad; i++) {
      const itemParaTransferir = equipoVendedor.find(e => e._id.toString() === listing.itemId);
      
      if (itemParaTransferir) {
        // Remover del vendedor
        seller.inventarioEquipamiento.pull({ _id: itemParaTransferir._id });
        
        // Agregar al comprador
        buyer.inventarioEquipamiento.push({
          ...itemParaTransferir,
          _id: new mongoose.Types.ObjectId(),
          compradoEn: new Date(),
          procedenciaMarketplace: true
        });
      }
    }

    await seller.save({ session });
    await buyer.save({ session });

    // 10. ACTUALIZAR LISTADO
    const nuevaCantidadVendida = listing.cantidadVendida + cantidad;
    if (nuevaCantidadVendida >= listing.cantidad) {
      listing.estado = 'agotado';
    }
    listing.cantidadVendida = nuevaCantidadVendida;
    listing.ultimaOferta = new Date();
    await listing.save({ session });

    // 11. REGISTRAR TRANSACCIÓN
    const transaction = new MarketplaceTransaction({
      listingId,
      buyerId,
      buyerName: buyer.username,
      sellerId: listing.sellerId,
      sellerName: seller.username,
      itemId: listing.itemId,
      itemName: listing.itemName,
      precioUnitario,
      cantidad,
      precioTotal,
      comision,
      valorAlVendedor,
      estado: 'completado',
      metodoPago: 'VAL',
      completedAt: new Date()
    });
    await transaction.save({ session });

    // 12. REGISTRAR EN ACTIVIDAD
    await Activity.create([
      {
        usuarioId: buyerId,
        tipo: 'marketplace_buy',
        descripcion: `Compró ${cantidad}x ${listing.itemName} por ${precioTotal} VAL`,
        detalles: { listingId, transactionId: transaction._id }
      },
      {
        usuarioId: listing.sellerId,
        tipo: 'marketplace_sell',
        descripcion: `Vendió ${cantidad}x ${listing.itemName} por ${valorAlVendedor} VAL (- ${comision} comisión)`,
        detalles: { listingId, transactionId: transaction._id }
      }
    ], { session });

    // 13. COMMIT
    await session.commitTransaction();

    return {
      ok: true,
      transaction: transaction.toJSON(),
      nuevoSaldoComprador: buyer.valBalance - precioTotal,
      message: 'Compra completada exitosamente'
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

## 💬 Historial de Transacciones

### 3.1 TransactionHistoryComponent - TypeScript

```typescript
// transaction-history.component.ts
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MarketplaceService } from '../../services/marketplace.service';

type TransactionTab = 'compras' | 'ventas';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(true);
  transactions$!: Observable<any[]>;
  activeTab$ = new BehaviorSubject<TransactionTab>('compras');

  constructor(private marketplaceService: MarketplaceService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  private loadTransactions(): void {
    this.transactions$ = this.marketplaceService.getTransactionHistory();
    this.transactions$.subscribe(() => this.loading$.next(false));
  }

  getStatusBadge(status: string): { text: string; color: string } {
    const badges: { [key: string]: { text: string; color: string } } = {
      'completado': { text: '✅ Completado', color: '#4ade80' },
      'pendiente': { text: '⏳ Pendiente', color: '#fbbf24' },
      'cancelado': { text: '❌ Cancelado', color: '#ef4444' },
      'rechazado': { text: '🚫 Rechazado', color: '#ef4444' }
    };
    return badges[status] || { text: status, color: '#6b7280' };
  }

  trackByTransactionId(index: number, tx: any): string {
    return tx.id;
  }
}
```

### 3.2 TransactionHistoryComponent - HTML Template

```html
<!-- transaction-history.component.html -->
<div class="history-container">
  
  <h2>📜 Historial de Transacciones</h2>

  <!-- TABS -->
  <div class="tabs">
    <button
      class="tab-button"
      [class.active]="(activeTab$ | async) === 'compras'"
      (click)="activeTab$.next('compras')"
    >
      🛒 Compras
    </button>
    <button
      class="tab-button"
      [class.active]="(activeTab$ | async) === 'ventas'"
      (click)="activeTab$.next('ventas')"
    >
      💰 Ventas
    </button>
  </div>

  <!-- LOADING -->
  <div *ngIf="loading$ | async" class="loading-section">
    <div class="spinner"></div>
    <p>Cargando transacciones...</p>
  </div>

  <!-- TRANSACCIONES -->
  <div class="transactions-list" *ngIf="!(loading$ | async) && (transactions$ | async) as transactions">
    <ng-container *ngIf="transactions.length > 0; else noTransactions">
      <div
        *ngFor="let tx of transactions; trackBy: trackByTransactionId"
        class="transaction-row"
      >
        <div class="transaction-info">
          <p class="item-name">{{ tx.itemName }}</p>
          <p class="details">
            <span *ngIf="(activeTab$ | async) === 'compras'">
              Vendedor: {{ tx.sellerName }}
            </span>
            <span *ngIf="(activeTab$ | async) === 'ventas'">
              Comprador: {{ tx.buyerName }}
            </span>
          </p>
          <p class="date">{{ tx.completedAt | date:'short' }}</p>
        </div>

        <div class="transaction-amount">
          <p class="price">
            <span *ngIf="(activeTab$ | async) === 'compras'">
              -{{ tx.precioTotal | number }} VAL
            </span>
            <span *ngIf="(activeTab$ | async) === 'ventas'">
              +{{ tx.valorAlVendedor | number }} VAL
            </span>
          </p>
          <p class="qty">x{{ tx.cantidad }}</p>
        </div>

        <div class="transaction-status">
          <span 
            class="status-badge"
            [style.color]="getStatusBadge(tx.estado).color"
          >
            {{ getStatusBadge(tx.estado).text }}
          </span>
        </div>
      </div>
    </ng-container>

    <ng-template #noTransactions>
      <p class="no-transactions">📭 No hay transacciones</p>
    </ng-template>
  </div>

</div>
```

---

## 💰 Sistema de Comisiones

### Cálculo de Comisiones

```typescript
// Comisión: 5% de VAL sink (se pierde del juego)
// Ejemplo:
// - Precio del item: 100 VAL
// - Comisión (5%): 5 VAL
// - Cantidad para vendedor: 95 VAL

interface ComisionInfo {
  precioOriginal: number;
  comisionPorcentaje: number;        // 5%
  comisionAbsoluta: number;
  precioFinal: number;               // Lo que paga el comprador
  valorAlVendedor: number;           // Lo que recibe el vendedor
}

function calcularComisiones(precio: number, cantidad: number = 1): ComisionInfo {
  const precioTotal = precio * cantidad;
  const comisionAbsoluta = Math.floor(precioTotal * 0.05);
  const valorAlVendedor = precioTotal - comisionAbsoluta;

  return {
    precioOriginal: precio,
    comisionPorcentaje: 5,
    comisionAbsoluta,
    precioFinal: precioTotal,
    valorAlVendedor
  };
}

// Ejemplo con VAL sink:
// Cuando se realiza una compra de 100 VAL:
// - Comprador paga: 100 VAL
// - Vendedor recibe: 95 VAL
// - Comisión (VAL SINK): 5 VAL
// - Total en circulación: -5 VAL (deflacionario)
```

---

## 🛠️ Servicios

### MarketplaceService Completo

```typescript
// marketplace.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private apiUrl = `${environment.apiUrl}/api/marketplace`;

  constructor(private http: HttpClient) {}

  // Obtener todos los listados
  getAllListings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listings`, {
      withCredentials: true
    });
  }

  // Obtener listados por filtro
  getListingsByFilter(filters: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listings/search`, {
      params: filters,
      withCredentials: true
    });
  }

  // Obtener detalles de un listado
  getListingDetails(listingId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/listings/${listingId}`, {
      withCredentials: true
    });
  }

  // Crear listado (vendedor)
  createListing(itemId: string, cantidad: number, precio: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/listings`, {
      itemId,
      cantidad,
      precio
    }, {
      withCredentials: true
    });
  }

  // Comprar item
  buyItem(listingId: string, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/listings/${listingId}/buy`, {
      cantidad
    }, {
      withCredentials: true
    });
  }

  // Hacer oferta
  makeOffer(listingId: string, precioOfrecido: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/listings/${listingId}/offer`, {
      precioOfrecido
    }, {
      withCredentials: true
    });
  }

  // Aceptar oferta (vendedor)
  acceptOffer(offerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/offers/${offerId}/accept`, {}, {
      withCredentials: true
    });
  }

  // Rechazar oferta (vendedor)
  rejectOffer(offerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/offers/${offerId}/reject`, {}, {
      withCredentials: true
    });
  }

  // Cancelar listado (vendedor)
  cancelListing(listingId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/listings/${listingId}/cancel`, {}, {
      withCredentials: true
    });
  }

  // Obtener mis listados
  getMyListings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-listings`, {
      withCredentials: true
    });
  }

  // Obtener historial de transacciones
  getTransactionHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions/history`, {
      withCredentials: true
    });
  }

  // Obtener mis ofertas (como comprador)
  getMyOffers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-offers`, {
      withCredentials: true
    });
  }

  // Obtener ofertas recibidas (como vendedor)
  getReceivedOffers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/received-offers`, {
      withCredentials: true
    });
  }

  // Estadísticas del marketplace
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, {
      withCredentials: true
    });
  }
}
```

---

## 📡 Endpoints Backend

### GET /api/marketplace/listings

```
GET /api/marketplace/listings
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439030",
      "sellerId": "507f1f77bcf86cd799439001",
      "sellerName": "VendedorPro",
      "itemId": "item_espada_001",
      "itemName": "Espada Legendaria",
      "itemRareza": "legendario",
      "precio": 2500,
      "precioFinal": 2500,
      "cantidad": 5,
      "cantidadVendida": 2,
      "estado": "activo",
      "createdAt": "2025-11-20T10:00:00Z",
      "expiresAt": "2025-12-20T10:00:00Z",
      "estadisticas": {
        "totalVisualizaciones": 156,
        "totalOfertas": 8,
        "tasaExito": 0.40
      }
    }
  ]
}
```

### POST /api/marketplace/listings/:listingId/buy

```
POST /api/marketplace/listings/507f1f77bcf86cd799439030/buy
Authorization: Bearer <token>
Content-Type: application/json

{
  "cantidad": 1
}
```

**Respuesta (200) - TRANSACCIÓN ATÓMICA:**
```json
{
  "ok": true,
  "transaction": {
    "id": "txn_507f1f77bcf86cd799439031",
    "buyerId": "507f1f77bcf86cd799439002",
    "buyerName": "CompradorNuevo",
    "sellerId": "507f1f77bcf86cd799439001",
    "sellerName": "VendedorPro",
    "itemName": "Espada Legendaria",
    "precioUnitario": 2500,
    "cantidad": 1,
    "precioTotal": 2500,
    "comision": 125,
    "valorAlVendedor": 2375,
    "estado": "completado",
    "completedAt": "2025-11-24T15:30:00Z"
  },
  "nuevoSaldoComprador": 97500,
  "message": "Compra completada exitosamente"
}
```

### POST /api/marketplace/listings/:listingId/offer

```
POST /api/marketplace/listings/507f1f77bcf86cd799439030/offer
Authorization: Bearer <token>
Content-Type: application/json

{
  "precioOfrecido": 2200
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "offer": {
    "id": "off_507f1f77bcf86cd799439032",
    "listingId": "507f1f77bcf86cd799439030",
    "buyerId": "507f1f77bcf86cd799439002",
    "precioOfrecido": 2200,
    "cantidad": 1,
    "estado": "pendiente",
    "createdAt": "2025-11-24T15:35:00Z",
    "expiresAt": "2025-11-25T15:35:00Z"
  },
  "message": "Oferta enviada"
}
```

### GET /api/marketplace/transactions/history

```
GET /api/marketplace/transactions/history
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "comprasRealizadas": [
      {
        "id": "txn_001",
        "itemName": "Espada Legendaria",
        "sellerName": "VendedorPro",
        "precioTotal": 2500,
        "cantidad": 1,
        "estado": "completado",
        "completedAt": "2025-11-24T15:30:00Z"
      }
    ],
    "ventasRealizadas": [
      {
        "id": "txn_002",
        "itemName": "Casco Épico",
        "buyerName": "Comprador123",
        "valorAlVendedor": 1900,
        "comision": 100,
        "cantidad": 1,
        "estado": "completado",
        "completedAt": "2025-11-23T10:20:00Z"
      }
    ],
    "estadisticas": {
      "totalCompras": 15,
      "totalVentas": 8,
      "dineroGastado": 45000,
      "dineroGanado": 35200,
      "transaccionesExitosas": 23,
      "transaccionesCanceladas": 0
    }
  }
}
```

---

## 📊 Manejo de Errores

| Escenario | Código | Mensaje |
|-----------|--------|---------|
| Sin VAL | 400 | No tienes suficiente VAL |
| Listado agotado | 400 | Este item está agotado |
| Listado expirado | 400 | Este listado ha expirado |
| Compra propia | 400 | No puedes comprar tu propio item |
| Item no encontrado | 404 | Item no existe en inventory |
| Sin autenticación | 401 | No autorizado |
| Rate limit | 429 | Demasiadas transacciones rápido |
| Error servidor | 500 | Error interno |

---

## 🔄 Integración con Otros Documentos

- **Documento 04**: Items vendibles desde inventario
- **Documento 05**: Items obtenidos de paquetes vendibles
- **Documento 07**: Items de combate vendibles en marketplace
- **Documento 03**: Estadísticas de marketplace en dashboard

---

## 📚 Próximos Documentos

- **07-Combate-Mazmorras.md** - Combate y recompensas
- **08-Rankings-Leaderboards.md** - Rankings y estadísticas

---

**¿Preguntas o cambios?**  
Contacta al equipo de desarrollo de Valgame.
