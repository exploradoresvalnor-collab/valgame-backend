# Ejemplo completo: Manejo de ítems, equipamiento y consumibles en Angular/TypeScript

## 1. Servicio para obtener detalles de ítems
```typescript
// item.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ItemService {
  constructor(private http: HttpClient) {}

  getItemById(id: string) {
    return this.http.get(`/api/items/${id}`, { withCredentials: true });
  }

  getItemsByIds(ids: string[]) {
    // Puedes optimizar con un endpoint batch si existe, aquí ejemplo simple:
    return Promise.all(ids.map(id => this.getItemById(id).toPromise()));
  }
}
```

## 2. Componente para mostrar equipamiento normalizado
```typescript
// equipment.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { ItemService } from './item.service';

@Component({
  selector: 'app-equipment',
  template: `
    <div *ngIf="slots">
      <div *ngFor="let slot of slotNames">
        <strong>{{ slot }}:</strong>
        <span *ngIf="slots[slot]">{{ slots[slot].nombre }}</span>
        <span *ngIf="!slots[slot]">Vacío</span>
      </div>
    </div>
  `
})
export class EquipmentComponent implements OnInit {
  @Input() equipamientoIds: string[] = [];
  slots: { [slot: string]: any } = {};
  slotNames = ['arma', 'armadura', 'accesorio'];

  constructor(private itemService: ItemService) {}

  async ngOnInit() {
    const items = await this.itemService.getItemsByIds(this.equipamientoIds);
    for (const item of items) {
      if (item.tipoItem === 'Equipment') {
        this.slots[item.slot] = item;
      }
    }
  }
}
```

## 3. Componente para mostrar consumibles y usarlos
```typescript
// consumables.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { ItemService } from './item.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-consumables',
  template: `
    <div *ngIf="consumibles.length">
      <div *ngFor="let item of consumibles">
        <strong>{{ item.nombre }}</strong>
        <button (click)="usarConsumible(item.id)">Usar</button>
      </div>
    </div>
  `
})
export class ConsumablesComponent implements OnInit {
  @Input() consumibleIds: string[] = [];
  consumibles: any[] = [];

  constructor(private itemService: ItemService, private http: HttpClient) {}

  async ngOnInit() {
    this.consumibles = await this.itemService.getItemsByIds(this.consumibleIds);
  }

  usarConsumible(itemId: string) {
    this.http.post('/api/consumables/use', { itemId }, { withCredentials: true })
      .subscribe(
        res => alert('Consumible usado!'),
        err => alert('Error al usar consumible')
      );
  }
}
```

## 4. Uso en la vista
```html
<!-- Mostrar equipamiento -->
<app-equipment [equipamientoIds]="character.equipamiento"></app-equipment>

<!-- Mostrar consumibles -->
<app-consumables [consumibleIds]="user.inventarioConsumibles"></app-consumables>
```

## 5. Resumen de flujo
- Recibes arrays de IDs del backend.
- Pides los detalles de cada ítem.
- Normalizas equipamiento por slots para la vista.
- Muestras consumibles y puedes usarlos con un botón.

---

Este ejemplo cubre el ciclo completo para ítems, equipamiento y consumibles en Angular/TypeScript, listo para adaptar a tu proyecto.